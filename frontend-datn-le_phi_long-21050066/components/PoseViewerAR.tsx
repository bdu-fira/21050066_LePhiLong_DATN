'use client';

import React, { useEffect, useRef } from 'react';
// Nếu bạn đang lấy file bằng API riêng, giữ import này.
import { getFile } from '@/features/xem-dong-tac/api/getFile';

declare global {
  interface Window {
    THREEx: any;
    THREE: any;
  }
}

export default function PoseViewerAR() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const initedRef = useRef(false);

  useEffect(() => {
    if (initedRef.current) return;
    initedRef.current = true;

    let renderer: any;
    let scene: any;
    let camera: any;
    let arToolkitSource: any;
    let arToolkitContext: any;
    let markerRoot: any;
    let contentRoot: any;
    let mixer: any;
    let animId = 0;
    let handleResize: () => void;

    // ====== Gesture state ======
    const pointers = new Map<number, { x: number; y: number }>();
    let isInteracting = false;

    let lastX = 0;
    let lastY = 0;

    // Hai ngón (pinch + pitch)
    let twoStartDist = 0;
    let twoStartScale = 1;
    let twoLastCentroidY = 0;

    // Vận tốc góc để làm inertia
    let velYaw = 0;   // rad/s (quay Y)
    let velPitch = 0; // rad/s (nghiêng X)

    // Double-tap
    let lastTapTime = 0;
    let lastTapPos = { x: 0, y: 0 };

    // Hằng số tinh chỉnh
    const YAW_SPEED = Math.PI;    // rad cho 1 chiều viewport
    const PITCH_SPEED = Math.PI;  // rad cho 1 chiều viewport
    const DAMPING = 0.92;         // quán tính tắt dần (mỗi ~16ms)
    const EPS_VEL = 1e-3;
    const PITCH_MIN = -Math.PI / 2 + 0.05;
    const PITCH_MAX =  Math.PI / 2 - 0.05;
    const SCALE_MIN = 0.2;
    const SCALE_MAX = 5;

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

      if (!window.THREEx?.ArToolkitContext) {
        await loadScript('https://cdn.jsdelivr.net/npm/@ar-js-org/ar.js-threejs@0.3.2/dist/ar.js');
      }

      // Renderer
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(window.innerWidth, window.innerHeight);
      const canvas = renderer.domElement as HTMLCanvasElement;
      canvas.style.position = 'absolute';
      canvas.style.top = '0';
      canvas.style.left = '0';
      canvas.style.touchAction = 'none';   // rất quan trọng để nhận full cử chỉ
      canvas.style.cursor = 'grab';
      containerRef.current?.appendChild(canvas);

      // Scene + Camera
      scene = new THREE.Scene();
      camera = new THREE.Camera();
      scene.add(camera);

      // Light
      scene.add(new THREE.AmbientLight(0xffffff, 0.9));
      const dir = new THREE.DirectionalLight(0xffffff, 0.6);
      dir.position.set(1, 2, 1);
      scene.add(dir);

      // AR source
      arToolkitSource = new window.THREEx.ArToolkitSource({
        sourceType: 'webcam',
        sourceWidth: 640,
        sourceHeight: 480,
        displayWidth: window.innerWidth,
        displayHeight: window.innerHeight,
      });

      handleResize = () => {
        arToolkitSource.onResizeElement();
        arToolkitSource.copyElementSizeTo(canvas);
        if (arToolkitContext && arToolkitContext.arController) {
          arToolkitSource.copyElementSizeTo(arToolkitContext.arController.canvas);
        }
      };
      arToolkitSource.init(() => {
        handleResize();
        // Đảm bảo video được thêm vào containerRef nếu chưa có
        if (containerRef.current && arToolkitSource.domElement && !containerRef.current.contains(arToolkitSource.domElement)) {
            containerRef.current.prepend(arToolkitSource.domElement);
        }
      });
      window.addEventListener('resize', handleResize);

      // AR context
      arToolkitContext = new window.THREEx.ArToolkitContext({
        cameraParametersUrl: 'https://cdn.jsdelivr.net/npm/@ar-js-org/ar.js-threejs@0.3.2/data/camera_para.dat',
        detectionMode: 'mono',
        canvasWidth: 640,
        canvasHeight: 480,
      });
      await new Promise<void>((res) =>
        arToolkitContext.init(() => {
          camera.projectionMatrix.copy(arToolkitContext.getProjectionMatrix());
          res();
        })
      );

      // Marker + content root
      markerRoot = new THREE.Group();
      scene.add(markerRoot);
      new window.THREEx.ArMarkerControls(arToolkitContext, markerRoot, {
        type: 'pattern',
        patternUrl: 'https://cdn.jsdelivr.net/npm/@ar-js-org/ar.js-threejs@0.3.2/data/patt.hiro',
      });

      contentRoot = new THREE.Group();
      contentRoot.rotation.order = 'YXZ'; 
      markerRoot.add(contentRoot);
      contentRoot = new THREE.Group();

      // ====== LOAD FBX ======
      const { FBXLoader } = await import('three/examples/jsm/loaders/FBXLoader.js');
      const loader = new FBXLoader();

      let fbxUrl: string;
      try {
        const blob = await getFile('uploads/exercise/27/instruction.fbx');
        fbxUrl = URL.createObjectURL(blob);
      } catch (e) {
        fbxUrl = '/ar/test.fbx';
      }

      loader.load(
        fbxUrl,
        (fbx: any) => {
          // if (fbxUrl.startsWith('blob:')) URL.revokeObjectURL(fbxUrl);

          fbx.scale.setScalar(0.01); // chỉnh theo model của bạn

          // căn đáy + cân giữa XZ
          const box = new (window as any).THREE.Box3().setFromObject(fbx);
          const center = box.getCenter(new (window as any).THREE.Vector3());
          const min = box.min.clone();
          fbx.position.x -= center.x;
          fbx.position.z -= center.z;
          fbx.position.y -= min.y;

          contentRoot.add(fbx);

          if (fbx.animations?.length) {
            mixer = new (window as any).THREE.AnimationMixer(fbx);
            fbx.animations.forEach((clip: any) => mixer.clipAction(clip).play());
          }
        },
        undefined,
        (err) => {
          console.error('FBX load failed:', err);
          alert('Không tải được model FBX.');
        }
      );

      // ====== Helpers ======
      const viewport = () => {
        // tránh đọc layout nhiều lần
        const w = canvas.clientWidth || window.innerWidth;
        const h = canvas.clientHeight || window.innerHeight;
        return { w, h };
      };

      let lastMoveT = performance.now();

      // ====== Pointer Events (đơn giản & mượt) ======
      const onPointerDown = (e: PointerEvent) => {
        // Double tap to reset (khi chưa có ngón nào khác)
        if (pointers.size === 0) {
          const now = performance.now();
          const dt = now - lastTapTime;
          const dx = e.clientX - lastTapPos.x;
          const dy = e.clientY - lastTapPos.y;
          const dist2 = dx * dx + dy * dy;
          if (dt < 300 && dist2 < 12 * 12 && contentRoot) {
            // reset
            contentRoot.rotation.set(0, 0, 0);
            contentRoot.scale.set(1, 1, 1);
            velYaw = 0; velPitch = 0;
          }
          lastTapTime = now;
          lastTapPos = { x: e.clientX, y: e.clientY };
        }

        (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
        pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
        isInteracting = true;

        if (pointers.size === 1) {
          lastX = e.clientX;
          lastY = e.clientY;
          canvas.style.cursor = 'grabbing';
        } else if (pointers.size === 2 && contentRoot) {
          const [p1, p2] = Array.from(pointers.values());
          twoStartDist = Math.hypot(p1.x - p2.x, p1.y - p2.y);
          twoStartScale = contentRoot.scale.x;
          twoLastCentroidY = (p1.y + p2.y) / 2;
        }
        lastMoveT = performance.now();
      };

      const onPointerMove = (e: PointerEvent) => {
        if (!pointers.has(e.pointerId)) return;
        pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
        e.preventDefault();

        if (!contentRoot) return;

        const now = performance.now();
        const dt = Math.max(0.001, (now - lastMoveT) / 1000);
        lastMoveT = now;

        const { w, h } = viewport();

        if (pointers.size === 1) {
          // yaw (ngang)
          const dx = e.clientX - lastX;
          lastX = e.clientX;
          const deltaYaw = (dx / Math.max(1, w)) * YAW_SPEED;
          contentRoot.rotation.y += deltaYaw;
          velYaw = deltaYaw / dt;
        
          // NEW: pitch (dọc)
          const dy = e.clientY - lastY;
          lastY = e.clientY;
          const deltaPitch = (dy / Math.max(1, h)) * PITCH_SPEED;
          contentRoot.rotation.x = Math.max(
            PITCH_MIN,
            Math.min(PITCH_MAX, contentRoot.rotation.x + deltaPitch)
          );
          velPitch = deltaPitch / dt;
        } else if (pointers.size >= 2) {
          // 2 ngón: pinch (scale) + kéo dọc (pitch)
          const [p1, p2] = Array.from(pointers.values());
          const dist = Math.hypot(p1.x - p2.x, p1.y - p2.y);

          if (twoStartDist > 0) {
            const factor = dist / twoStartDist;
            const s = Math.max(SCALE_MIN, Math.min(SCALE_MAX, twoStartScale * factor));
            contentRoot.scale.set(s, s, s);
          }

          const cy = (p1.y + p2.y) / 2;
          const dy = cy - twoLastCentroidY;
          twoLastCentroidY = cy;

          const deltaPitch = (dy / Math.max(1, h)) * PITCH_SPEED; // rad
          contentRoot.rotation.x = Math.max(
            PITCH_MIN,
            Math.min(PITCH_MAX, contentRoot.rotation.x + deltaPitch)
          );
          velPitch = deltaPitch / dt; // rad/s
        }
      };

      const onPointerUp = (e: PointerEvent) => {
        pointers.delete(e.pointerId);
        if (pointers.size === 0) {
          isInteracting = false;
          canvas.style.cursor = 'grab';
        } else if (pointers.size === 1) {
          // còn lại 1 ngón → reset mốc cho yaw
          const only = Array.from(pointers.values())[0];
          lastX = only.x;
        }
      };

      canvas.addEventListener('pointerdown', onPointerDown);
      canvas.addEventListener('pointermove', onPointerMove, { passive: false });
      canvas.addEventListener('pointerup', onPointerUp);
      canvas.addEventListener('pointercancel', onPointerUp);
      canvas.addEventListener('lostpointercapture', onPointerUp);

      // ====== Loop ======
      const clock = new (window as any).THREE.Clock();
      const animate = () => {
        animId = requestAnimationFrame(animate);

        if (arToolkitSource?.ready) {
          arToolkitContext.update(arToolkitSource.domElement);
        }

        const dt = clock.getDelta();

        // inertia chỉ khi không chạm
        if (!isInteracting && contentRoot) {
          contentRoot.rotation.y += velYaw * dt;
          contentRoot.rotation.x = Math.max(
            PITCH_MIN,
            Math.min(PITCH_MAX, contentRoot.rotation.x + velPitch * dt)
          );

          // tắt dần
          const damp = Math.pow(DAMPING, dt * 60);
          velYaw *= damp;
          velPitch *= damp;

          if (Math.abs(velYaw) < EPS_VEL) velYaw = 0;
          if (Math.abs(velPitch) < EPS_VEL) velPitch = 0;
        }

        if (mixer) mixer.update(dt);
        renderer.render(scene, camera);
      };
      animate();
    })().catch((err) => {
      console.error(err);
      alert('Khởi tạo AR thất bại. Mở DevTools để xem lỗi chi tiết.');
    });

    // Cleanup
    return () => {
      try {
        window.removeEventListener('resize', handleResize as any);
      } catch {}
      if (animId) cancelAnimationFrame(animId);
      try {
        renderer?.dispose?.();
      } catch {}
      if (containerRef.current && (renderer as any)?.domElement) {
        const el = (renderer as any).domElement as HTMLCanvasElement;
        el.replaceWith(el.cloneNode(false)); // gỡ mọi listener còn bám
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        inset: 0,
        overflow: 'hidden',
        background: '#000',
      }}
    />
  );
}
