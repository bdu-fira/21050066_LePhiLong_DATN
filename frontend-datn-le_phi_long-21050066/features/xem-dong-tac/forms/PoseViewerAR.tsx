'use client';

import React, { useEffect, useRef, useState } from 'react';
import { getFile } from '@/features/xem-dong-tac/api/getFile';

declare global {
  interface Window {
    THREEx: any;
    THREE: any;
  }
}

type Props = {
  /** Đường dẫn file FBX trên backend (ví dụ: /uploads/exercise/27/instruction.fbx) */
  path: string | null | undefined;
  /** Chiều cao khung viewer khi nhúng trong layout (ví dụ: "65vh"). Nếu bỏ trống: full màn. */
  height?: string | number;
};

export default function PoseViewerAR({ path, height = '65vh' }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const initedRef   = useRef(false);

  // Three/AR refs
  const THREERef        = useRef<any>(null);
  const rendererRef     = useRef<any>(null);
  const sceneRef        = useRef<any>(null);
  const cameraRef       = useRef<any>(null);
  const arSourceRef     = useRef<any>(null);
  const arCtxRef        = useRef<any>(null);
  const markerRootRef   = useRef<any>(null);
  const contentRootRef  = useRef<any>(null);
  const mixerRef        = useRef<any>(null);
  const rafRef          = useRef<number>(0);
  const videoElRef      = useRef<HTMLVideoElement | null>(null);
  const modelUrlRef     = useRef<string | null>(null);

  // Fullscreen
  const [isFs, setIsFs] = useState(false);

  // ====== Gesture state ======
  const pointers = useRef<Map<number, { x: number; y: number }>>(new Map());
  const isInteracting = useRef(false);
  let lastX = 0, lastY = 0;
  let twoStartDist = 0, twoStartScale = 1, twoLastCentroidY = 0;
  let velYaw = 0, velPitch = 0;
  let lastTapTime = 0, lastTapPos = { x: 0, y: 0 };

  // Tuning
  const YAW_SPEED   = Math.PI;     // rad cho 1 chiều viewport
  const PITCH_SPEED = Math.PI;
  const DAMPING     = 0.92;        // quán tính
  const EPS_VEL     = 1e-3;
  const PITCH_MIN   = -Math.PI / 2 + 0.05;
  const PITCH_MAX   =  Math.PI / 2 - 0.05;
  const SCALE_MIN   = 0.2;
  const SCALE_MAX   = 5;

  // ---------- Fullscreen ----------
  useEffect(() => {
    const onFs = () => setIsFs(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onFs);
    return () => document.removeEventListener('fullscreenchange', onFs);
  }, []);
  const enterFullscreen = () => containerRef.current?.requestFullscreen?.().catch(() => {});
  const exitFullscreen  = () => document.fullscreenElement && document.exitFullscreen?.().catch(() => {});

  // ---------- Init AR scene (once) ----------
  useEffect(() => {
    if (initedRef.current) return;
    initedRef.current = true;

    const loadScript = (src: string) =>
      new Promise<void>((resolve, reject) => {
        const s = document.createElement('script');
        s.src = src;
        s.async = true;
        s.onload = () => resolve();
        s.onerror = () => reject(new Error(`Failed to load ${src}`));
        document.head.appendChild(s);
      });

    (async () => {
      const THREE = await import('three');
      (window as any).THREE = THREE;
      THREERef.current = THREE;

      if (!window.THREEx?.ArToolkitContext) {
        await loadScript('https://cdn.jsdelivr.net/npm/@ar-js-org/ar.js-threejs@0.3.2/dist/ar.js');
      }

      const container = containerRef.current!;
      const getSize = () => {
        const w = container.clientWidth || window.innerWidth;
        const h = container.clientHeight || window.innerHeight;
        return { w, h };
      };

      // Renderer
      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(window.devicePixelRatio);
      const { w, h } = getSize();
      renderer.setSize(w, h);
      const canvas = renderer.domElement as HTMLCanvasElement;
      Object.assign(canvas.style, {
        position: 'absolute',
        inset: '0',
        width: '100%',
        height: '100%',
        zIndex: '1',
        touchAction: 'none',
        cursor: 'grab',
      } as CSSStyleDeclaration);
      container.appendChild(canvas);
      rendererRef.current = renderer;

      // Scene + Camera
      const scene  = new THREE.Scene();
      const camera = new THREE.Camera();
      scene.add(camera);
      sceneRef.current  = scene;
      cameraRef.current = camera;

      // Light
      scene.add(new THREE.AmbientLight(0xffffff, 0.9));
      const dir = new THREE.DirectionalLight(0xffffff, 0.6);
      dir.position.set(1, 2, 1);
      scene.add(dir);

      // AR source (webcam) — để AR.js tự quản kích thước video, mình không gán displayWidth/Height thủ công
      const arSource = new window.THREEx.ArToolkitSource({ sourceType: 'webcam' });
      arSourceRef.current = arSource;

      // Lớp camera nền (video)
      const mountCameraLayer = () => {
        const videoEl = arSource.domElement as HTMLVideoElement;
        if (!videoEl) return;
        try {
          videoEl.setAttribute('playsinline', 'true');
          videoEl.setAttribute('webkit-playsinline', 'true');
          videoEl.muted = true;
          videoEl.autoplay = true;
        } catch {}
        Object.assign(videoEl.style, {
          position: 'absolute',
          inset: '0',
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          zIndex: '0',
          pointerEvents: 'none',
        } as CSSStyleDeclaration);
        if (videoEl.parentElement !== container) container.insertBefore(videoEl, canvas);
        videoElRef.current = videoEl;
      };

      // Resize đồng bộ container ↔ video ↔ canvas
      const onResize = () => {
        const { w: w2, h: h2 } = getSize();
        renderer.setSize(w2, h2);              // ép canvas khít container
        arSource.onResize();                   // API chuẩn của AR.js
        arSource.copyElementSizeTo(canvas);
        const arCtx = arCtxRef.current;
        if (arCtx && arCtx.arController) {
          arSource.copyElementSizeTo(arCtx.arController.canvas);
        }
      };

      arSource.init(() => {
        mountCameraLayer();
        onResize();
        // 1 nhịp sau để video ổn định trên mobile (tránh viền đen)
        setTimeout(onResize, 60);
      });
      window.addEventListener('resize', onResize);
      window.addEventListener('orientationchange', onResize);
      document.addEventListener('fullscreenchange', onResize);

      // AR context
      const arCtx = new window.THREEx.ArToolkitContext({
        cameraParametersUrl: 'https://cdn.jsdelivr.net/npm/@ar-js-org/ar.js-threejs@0.3.2/data/camera_para.dat',
        detectionMode: 'mono',
        canvasWidth: 640,
        canvasHeight: 480,
      });
      arCtxRef.current = arCtx;

      await new Promise<void>((res) =>
        arCtx.init(() => {
          camera.projectionMatrix.copy(arCtx.getProjectionMatrix());
          res();
        })
      );

      // Marker + content root (chỉ tạo 1 lần)
      const markerRoot = new THREE.Group();
      scene.add(markerRoot);
      new window.THREEx.ArMarkerControls(arCtx, markerRoot, {
        type: 'pattern',
        patternUrl: 'https://cdn.jsdelivr.net/npm/@ar-js-org/ar.js-threejs@0.3.2/data/patt.hiro',
      });
      markerRootRef.current = markerRoot;

      const contentRoot = new THREE.Group();
      contentRoot.rotation.order = 'YXZ';
      markerRoot.add(contentRoot);
      contentRootRef.current = contentRoot;

      // ===== Pointer Events (yaw/pitch 1 ngón, pinch zoom 2 ngón, inertia) =====
      const pointersMap = pointers.current;
      const viewport = () => {
        const cw = container.clientWidth || 1;
        const ch = container.clientHeight || 1;
        return { w: cw, h: ch };
      };
      let lastMoveT = performance.now();

      const onPointerDown = (e: PointerEvent) => {
        // double-tap reset
        if (pointersMap.size === 0 && contentRootRef.current) {
          const now = performance.now();
          const dt  = now - lastTapTime;
          const dx  = e.clientX - lastTapPos.x;
          const dy  = e.clientY - lastTapPos.y;
          if (dt < 300 && dx * dx + dy * dy < 12 * 12) {
            const cr = contentRootRef.current;
            cr.rotation.set(0, 0, 0);
            cr.scale.set(1, 1, 1);
            velYaw = 0; velPitch = 0;
          }
          lastTapTime = now;
          lastTapPos = { x: e.clientX, y: e.clientY };
        }
        (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
        pointersMap.set(e.pointerId, { x: e.clientX, y: e.clientY });
        isInteracting.current = true;

        if (pointersMap.size === 1) {
          lastX = e.clientX; lastY = e.clientY;
          (e.currentTarget as HTMLElement).style.cursor = 'grabbing';
        } else if (pointersMap.size === 2 && contentRootRef.current) {
          const [p1, p2] = Array.from(pointersMap.values());
          twoStartDist = Math.hypot(p1.x - p2.x, p1.y - p2.y);
          twoStartScale = contentRootRef.current.scale.x;
          twoLastCentroidY = (p1.y + p2.y) / 2;
        }
        lastMoveT = performance.now();
      };

      const onPointerMove = (e: PointerEvent) => {
        if (!pointersMap.has(e.pointerId)) return;
        pointersMap.set(e.pointerId, { x: e.clientX, y: e.clientY });
        e.preventDefault();

        const cr = contentRootRef.current;
        if (!cr) return;

        const now = performance.now();
        const dt = Math.max(0.001, (now - lastMoveT) / 1000);
        lastMoveT = now;

        const { w: vw, h: vh } = viewport();

        if (pointersMap.size === 1) {
          const dx = e.clientX - lastX; lastX = e.clientX;
          const dy = e.clientY - lastY; lastY = e.clientY;

          const deltaYaw   = (dx / Math.max(1, vw)) * YAW_SPEED;
          const deltaPitch = (dy / Math.max(1, vh)) * PITCH_SPEED;

          cr.rotation.y += deltaYaw;
          cr.rotation.x  = Math.max(PITCH_MIN, Math.min(PITCH_MAX, cr.rotation.x + deltaPitch));

          velYaw   = deltaYaw / dt;
          velPitch = deltaPitch / dt;
        } else if (pointersMap.size >= 2) {
          const [p1, p2] = Array.from(pointersMap.values());
          const dist = Math.hypot(p1.x - p2.x, p1.y - p2.y);

          if (twoStartDist > 0) {
            const factor = dist / twoStartDist;
            const s = Math.max(SCALE_MIN, Math.min(SCALE_MAX, twoStartScale * factor));
            cr.scale.set(s, s, s);
          }

          const cy = (p1.y + p2.y) / 2;
          const dy = cy - twoLastCentroidY;
          twoLastCentroidY = cy;

          const deltaPitch = (dy / Math.max(1, vh)) * PITCH_SPEED;
          cr.rotation.x = Math.max(PITCH_MIN, Math.min(PITCH_MAX, cr.rotation.x + deltaPitch));
          velPitch = deltaPitch / dt;
        }
      };

      const onPointerUp = (e: PointerEvent) => {
        pointersMap.delete(e.pointerId);
        if (pointersMap.size === 0) {
          isInteracting.current = false;
          canvas.style.cursor = 'grab';
        } else if (pointersMap.size === 1) {
          const only = Array.from(pointersMap.values())[0];
          lastX = only.x; lastY = only.y;
        }
      };

      canvas.addEventListener('pointerdown', onPointerDown);
      canvas.addEventListener('pointermove', onPointerMove, { passive: false });
      canvas.addEventListener('pointerup', onPointerUp);
      canvas.addEventListener('pointercancel', onPointerUp);
      canvas.addEventListener('lostpointercapture', onPointerUp);

      // Render loop
      const clock = new THREE.Clock();
      const animate = () => {
        rafRef.current = requestAnimationFrame(animate);

        if (arSource?.ready) arCtx.update(arSource.domElement);

        const dt = clock.getDelta();
        if (!isInteracting.current && contentRootRef.current) {
          const cr = contentRootRef.current;
          cr.rotation.y += velYaw * dt;
          cr.rotation.x  = Math.max(PITCH_MIN, Math.min(PITCH_MAX, cr.rotation.x + velPitch * dt));
          const damp = Math.pow(DAMPING, dt * 60);
          velYaw *= damp; velPitch *= damp;
          if (Math.abs(velYaw)   < EPS_VEL) velYaw = 0;
          if (Math.abs(velPitch) < EPS_VEL) velPitch = 0;
        }
        if (mixerRef.current) mixerRef.current.update(dt);
        renderer.render(scene, camera);
      };
      animate();
    })().catch((err) => {
      console.error(err);
      alert('Khởi tạo AR thất bại. Kiểm tra Console để xem lỗi chi tiết.');
    });

    // Cleanup
    return () => {
      window.removeEventListener('resize', noop);
      window.removeEventListener('orientationchange', noop);
      document.removeEventListener('fullscreenchange', noop);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      try { rendererRef.current?.dispose?.(); } catch {}
      // gỡ video
      const video = videoElRef.current;
      if (video && video.parentElement === containerRef.current) {
        try { /* @ts-ignore */ if (video.srcObject) video.srcObject = null; } catch {}
        containerRef.current?.removeChild(video);
      }
      // gỡ canvas
      const canvas = rendererRef.current?.domElement as HTMLCanvasElement | undefined;
      if (canvas && canvas.parentElement) canvas.parentElement.removeChild(canvas);
      // revoke blob url model
      if (modelUrlRef.current) { URL.revokeObjectURL(modelUrlRef.current); modelUrlRef.current = null; }
    };

    function noop() {}
  }, []);

  // ---------- Load / replace FBX khi path đổi ----------
  useEffect(() => {
    const THREE = THREERef.current;
    const contentRoot = contentRootRef.current;
    if (!THREE || !contentRoot) return;

    // clear model cũ
    const disposeModel = (obj: any) => {
      try {
        obj.traverse?.((n: any) => {
          if (n.isMesh) {
            n.geometry?.dispose?.();
            const m = n.material;
            if (Array.isArray(m)) m.forEach((mm: any) => mm?.dispose?.());
            else m?.dispose?.();
          }
        });
      } catch {}
    };
    while (contentRoot.children.length) {
      const ch = contentRoot.children.pop();
      if (ch) { contentRoot.remove(ch); disposeModel(ch); }
    }
    mixerRef.current = null;

    if (!path) return;

    (async () => {
      const { FBXLoader } = await import('three/examples/jsm/loaders/FBXLoader.js');
      const loader = new FBXLoader();

      let urlToLoad: string | null = null;
      try {
        // getFile({ path }) -> Blob
        const blobOrResp: any = await getFile({ path });
        const blob: Blob =
          blobOrResp instanceof Blob
            ? blobOrResp
            : blobOrResp?.data instanceof Blob
            ? blobOrResp.data
            : typeof blobOrResp?.blob === 'function'
            ? await blobOrResp.blob()
            : null;

        if (blob) {
          if (modelUrlRef.current) URL.revokeObjectURL(modelUrlRef.current);
          urlToLoad = URL.createObjectURL(blob);
          modelUrlRef.current = urlToLoad;
        }
      } catch {
        // bỏ qua, sẽ fallback
      }
      if (!urlToLoad) urlToLoad = path; // fallback: đường dẫn public

      loader.load(
        urlToLoad!,
        (fbx: any) => {
          fbx.scale.setScalar(0.01);
          const box = new THREE.Box3().setFromObject(fbx);
          const center = box.getCenter(new THREE.Vector3());
          const min = box.min.clone();
          fbx.position.x -= center.x;
          fbx.position.z -= center.z;
          fbx.position.y -= min.y;

          contentRoot.add(fbx);

          if (fbx.animations?.length) {
            const mixer = new THREE.AnimationMixer(fbx);
            fbx.animations.forEach((clip: any) => mixer.clipAction(clip).play());
            mixerRef.current = mixer;
          }
        },
        undefined,
        (err) => {
          console.error('FBX load failed:', err);
          alert('Không tải được model FBX.');
        }
      );
    })();
  }, [path]);

  return (
    <div
      ref={containerRef}
      style={{
        position: height ? 'relative' : 'fixed',
        inset: height ? undefined : 0,
        width: '100%',
        height: typeof height === 'number' ? `${height}px` : height,
        background: '#000',
        borderRadius: height ? 12 : 0,
        overflow: 'hidden',
      }}
    >
      {/* Nút Toàn màn hình / Thoát toàn màn hình */}
      {!isFs ? (
        <button
          onClick={enterFullscreen}
          style={btnStyle}
          title="Toàn màn hình"
        >
          Toàn màn hình
        </button>
      ) : (
        <button
          onClick={exitFullscreen}
          style={btnStyle}
          title="Thoát toàn màn hình"
        >
          Thoát toàn màn hình
        </button>
      )}

      {!path && (
        <div style={overlayStyle}>Chọn một động tác để xem ở chế độ AR.</div>
      )}
    </div>
  );
}

// ---- styles nhỏ gọn ----
const btnStyle: React.CSSProperties = {
  position: 'absolute',
  top: 8,
  right: 8,
  zIndex: 2,
  padding: '6px 10px',
  borderRadius: 8,
  background: 'rgba(0,0,0,0.55)',
  color: '#fff',
  fontSize: 12,
  border: '1px solid rgba(255,255,255,0.2)',
  backdropFilter: 'blur(2px)',
};

const overlayStyle: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  zIndex: 3,
  display: 'grid',
  placeItems: 'center',
  color: '#bbb',
  fontSize: 14,
};
