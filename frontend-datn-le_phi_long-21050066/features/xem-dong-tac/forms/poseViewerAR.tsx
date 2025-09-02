"use client";

import React from "react";
import * as THREE from "three";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

// BẮT BUỘC: đưa THREE lên global trước khi nạp AR.js
if (typeof window !== "undefined") {
  (window as any).THREE = (window as any).THREE || THREE;
}

declare global {
  interface Window {
    THREEx: any;
  }
}

type ARFormat = "fbx" | "gltf";

type Props = {
  src: string | null;                 // URL FBX/GLTF (qua API getFile)
  format?: ARFormat;                  // "fbx" | "gltf"
  height?: string | number;           // ví dụ "65vh"
  onExit?: () => void;
  marker?: {
    patternUrl?: string;              // override Hiro nếu muốn
    size?: number;                    // mét; 1.0 = cạnh marker 1m
  };
  /** ĐƯỜNG THƯ MỤC TRONG MÁY CHỦ để map resource tương đối của GLTF,
   *  ví dụ: "/uploads/exercise/123/". (Không phải URL; KHÔNG để origin.)
   *  Component sẽ tự gắn vào API:  {origin}/api/exercise/getFile?path=<...>
   */
  gltfUploadsBase?: string;
};

// Ứng viên URL (ưu tiên file trong /public, fallback CDN)
const CAMERA_CANDIDATES = [
  "/camera_para.dat",
  "/ar/camera_para.dat",
  "https://rawcdn.githack.com/AR-js-org/AR.js/master/three.js/data/data/camera_para.dat",
];

const HIRO_CANDIDATES = [
  "/pattern-hiro.patt",
  "/markers/patt.hiro",
  "/ar/patterns/patt.hiro",
  "https://rawcdn.githack.com/AR-js-org/AR.js/master/three.js/data/data/patt.hiro",
];

// Nạp AR.js (three.js build)
function loadARJs(): Promise<void> {
  if (typeof window !== "undefined" && (window as any).THREEx) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const existed = document.querySelector<HTMLScriptElement>('script[data-arjs="1"]');
    if (existed) {
      existed.addEventListener("load", () => resolve());
      existed.addEventListener("error", () => reject(new Error("Failed to load AR.js")));
      if ((window as any).THREEx) resolve();
      return;
    }
    const s = document.createElement("script");
    s.async = true;
    s.setAttribute("data-arjs", "1");
    s.src = "https://cdn.jsdelivr.net/npm/@ar-js-org/ar.js@3.4.5/three.js/build/ar-threex.js";
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Failed to load AR.js"));
    document.head.appendChild(s);
  });
}

// Chọn URL đầu tiên truy cập được
async function pickReachableUrl(candidates: string[]): Promise<string> {
  for (const url of candidates) {
    try {
      let ok = false;
      try {
        const h = await fetch(url, { method: "HEAD", cache: "no-store" });
        ok = h.ok;
      } catch {}
      if (!ok) {
        const g = await fetch(url, { method: "GET", cache: "no-store" });
        ok = g.ok;
      }
      if (ok) return url;
    } catch {}
  }
  return candidates[candidates.length - 1];
}

// Đợi điều kiện (tiện cho idPatt)
function waitFor(cond: () => boolean, timeoutMs = 6000, intervalMs = 40): Promise<boolean> {
  return new Promise((resolve) => {
    const t0 = Date.now();
    const it = setInterval(() => {
      if (cond()) {
        clearInterval(it);
        resolve(true);
      } else if (Date.now() - t0 > timeoutMs) {
        clearInterval(it);
        resolve(false);
      }
    }, intervalMs);
  });
}

export default function PoseViewerAR({
  src,
  format = "fbx",
  height = "65vh",
  onExit,
  marker,
  gltfUploadsBase,
}: Props) {
  const wrapRef = React.useRef<HTMLDivElement | null>(null);
  const rendererRef = React.useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef   = React.useRef<THREE.Scene | null>(null);
  const cameraRef  = React.useRef<THREE.Camera | null>(null);

  const markerRootRef     = React.useRef<THREE.Group | null>(null);
  const markerControlsRef = React.useRef<any>(null);

  const mixerRef = React.useRef<THREE.AnimationMixer | null>(null);
  const modelRef = React.useRef<THREE.Object3D | null>(null);

  const arSourceRef  = React.useRef<any>(null);
  const arContextRef = React.useRef<any>(null);

  const clockRef = React.useRef(new THREE.Clock());
  const rafRef   = React.useRef<number | null>(null);
  const resizeHandlerRef = React.useRef<(() => void) | null>(null);
  const loopStartedRef   = React.useRef(false);

  // ---------- utils ----------
  const disposeModel = React.useCallback((obj?: THREE.Object3D | null) => {
    const target = obj ?? modelRef.current;
    if (!target) return;
    try {
      target.traverse?.((n: any) => {
        if (n.isMesh) {
          n.geometry?.dispose?.();
          const m = n.material;
          if (Array.isArray(m)) m.forEach((mm) => mm?.dispose?.());
          else m?.dispose?.();
        }
      });
    } catch {}
  }, []);

  const fitModelToMarker = (obj: THREE.Object3D, markerSize = 1) => {
    const box  = new THREE.Box3().setFromObject(obj);
    const size = new THREE.Vector3();
    box.getSize(size);
    const maxDim = Math.max(size.x, size.y, size.z) || 1;
    const target = markerSize * 0.75; // phủ ~75% cạnh marker
    const s = target / maxDim;
    obj.scale.setScalar(s);

    const center = new THREE.Vector3();
    box.getCenter(center);
    obj.position.sub(center);
    obj.position.y += (size.y * s) / 2;
  };

  // ---------- model loader ----------
  const loadModel = React.useCallback(
    (url: string, fmt: ARFormat, markerSize = 1) => {
      if (!markerRootRef.current) return;

      if (mixerRef.current) {
        try { mixerRef.current.stopAllAction?.(); } catch {}
        mixerRef.current = null;
      }
      if (modelRef.current) {
        markerRootRef.current.remove(modelRef.current);
        disposeModel(modelRef.current);
        modelRef.current = null;
      }

      const onLoaded = (root: THREE.Object3D, animations?: THREE.AnimationClip[]) => {
        markerRootRef.current!.add(root);
        modelRef.current = root;
        fitModelToMarker(root, markerSize);

        if (animations && animations.length) {
          const mixer = new THREE.AnimationMixer(root);
          const action = mixer.clipAction(animations[0]);
          action.play();
          mixerRef.current = mixer;
        }
        console.log("[PoseViewerAR] Model loaded:", { fmt, anims: animations?.length || 0 });
      };

      if (fmt === "fbx") {
        const loader = new FBXLoader();
        (loader as any).setCrossOrigin?.("anonymous");
        loader.load(
          url,
          (obj: any) => onLoaded(obj, obj.animations),
          undefined,
          (err) => console.warn("[PoseViewerAR] FBX load error:", err)
        );
      } else {
        // ====== GLTF với URLModifier: map mọi resource tương đối sang API getFile + /uploads/exercise/{id}/ ======
        const srcUrl = new URL(url);
        const apiBase = `${srcUrl.origin}${srcUrl.pathname}`; // .../api/exercise/getFile

        const manager = new THREE.LoadingManager();
        manager.setURLModifier((resUrl: string) => {
          // dữ liệu tuyệt đối/inline thì giữ nguyên
          if (/^(data:|blob:|https?:\/\/)/i.test(resUrl)) return resUrl;

          // loại bỏ "./"
          const clean = resUrl.replace(/^\.\//, "");

          // chọn base thư mục (ưu tiên prop)
          let baseDir = gltfUploadsBase;
          if (!baseDir) {
            // Thử suy ra từ query 'path'; nếu là Windows path thì ít nhất vẫn dùng được (fallback)
            const p = srcUrl.searchParams.get("path") || "";
            const norm = p.replace(/\\/g, "/");
            baseDir = norm.replace(/\/[^/]*$/, "/");
          }
          if (!baseDir) baseDir = "/uploads/"; // fallback an toàn

          // chuẩn hóa baseDir
          if (!baseDir.endsWith("/")) baseDir += "/";

          const finalPath = baseDir + clean;
          const finalUrl = `${apiBase}?path=${encodeURIComponent(finalPath)}`;
          return finalUrl;
        });

        const loader = new GLTFLoader(manager);
        (loader as any).setWithCredentials?.(true);
        (loader as any).setCrossOrigin?.("use-credentials");

        loader.load(
          url,
          (gltf) =>
            onLoaded(
              gltf.scene || (gltf as any).scenes?.[0] || (gltf as unknown as THREE.Object3D),
              gltf.animations
            ),
          undefined,
          (err) => console.warn("[PoseViewerAR] GLTF load error:", err)
        );
      }
    },
    [disposeModel, gltfUploadsBase]
  );

  // ---------- render loop ----------
  const startLoop = React.useCallback(() => {
    if (loopStartedRef.current) return;
    loopStartedRef.current = true;

    const loop = () => {
      rafRef.current = requestAnimationFrame(loop);
      try {
        const arSource  = arSourceRef.current;
        const arContext = arContextRef.current;
        if (arSource?.ready && arContext) arContext.update(arSource.domElement);
      } catch {}
      const dt = clockRef.current.getDelta?.() ?? 0.016;
      if (mixerRef.current) mixerRef.current.update(dt);
      if (rendererRef.current && cameraRef.current && sceneRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };
    loop();
  }, []);

  // ---------- init ----------
  const init = React.useCallback(async () => {
    const el = wrapRef.current;
    if (!el) return;

    await loadARJs();

    const patternUrlToUse = marker?.patternUrl || (await pickReachableUrl(HIRO_CANDIDATES));
    const cameraParamsUrl = await pickReachableUrl(CAMERA_CANDIDATES);
    console.log("[PoseViewerAR] Using marker:", patternUrlToUse);
    console.log("[PoseViewerAR] Using camera param:", cameraParamsUrl);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio || 1);
    renderer.setSize(el.clientWidth || 640, el.clientHeight || 360);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.domElement.style.position = "absolute";
    renderer.domElement.style.top = "0";
    renderer.domElement.style.left = "0";
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    rendererRef.current = renderer;

    // Scene + Camera
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.Camera(); // AR.js dùng THREE.Camera
    scene.add(camera);
    cameraRef.current = camera;

    // Ánh sáng
    scene.add(new THREE.AmbientLight(0xffffff, 1.0));
    const dir = new THREE.DirectionalLight(0xffffff, 1.0);
    dir.position.set(1, 2, 3);
    scene.add(dir);

    // Video source
    const THREEx = (window as any).THREEx;
    const arSource = new THREEx.ArToolkitSource({ sourceType: "webcam" });
    arSourceRef.current = arSource;

    const onResize = () => {
      if (typeof arSource.onResizeElement === "function") {
        arSource.onResizeElement();
        arSource.copyElementSizeTo(renderer.domElement);
        if (arContextRef.current?.arController) {
          arSource.copyElementSizeTo(arContextRef.current.arController.canvas);
        }
      } else {
        arSource.onResize();
        arSource.copySizeTo(renderer.domElement);
        if (arContextRef.current?.arController) {
          arSource.copySizeTo(arContextRef.current.arController.canvas);
        }
      }
    };
    resizeHandlerRef.current = onResize;

    await new Promise<void>((resolve) => {
      arSource.init(() => {
        try {
          const v = arSource.domElement as HTMLVideoElement;
          if (v && !v.parentElement) {
            v.setAttribute("playsinline", "");
            v.style.position = "absolute";
            v.style.top = "0";
            v.style.left = "0";
            v.style.width = "100%";
            v.style.height = "100%";
            v.style.objectFit = "cover";
            el.appendChild(v); // video dưới
          }
        } catch {}
        onResize();
        resolve();
      });
    });

    el.appendChild(renderer.domElement); // canvas trên
    window.addEventListener("resize", onResize);

    // AR context
    const arContext = new THREEx.ArToolkitContext({
      cameraParametersUrl: cameraParamsUrl,
      detectionMode: "mono",
      maxDetectionRate: 30,
      canvasWidth: 640,
      canvasHeight: 480,
    });
    arContextRef.current = arContext;

    await new Promise<void>((resolve) => {
      arContext.init(() => {
        camera.projectionMatrix.copy(arContext.getProjectionMatrix());
        resolve();
      });
    });

    // Monkey patch: lọc phần tử null trong _arMarkersControls (giảm lỗi idPatt khi HMR)
    const originalUpdate = arContext.update.bind(arContext);
    arContext.update = function (srcEl: any) {
      try {
        if (Array.isArray((this as any)._arMarkersControls)) {
          (this as any)._arMarkersControls = (this as any)._arMarkersControls.filter(Boolean);
        }
        return originalUpdate(srcEl);
      } catch {
        return;
      }
    };

    // Marker
    const markerRoot = new THREE.Group();
    markerRoot.matrixAutoUpdate = false; // AR.js set matrix trực tiếp
    scene.add(markerRoot);
    markerRootRef.current = markerRoot;

    const controls = new THREEx.ArMarkerControls(arContext, markerRoot, {
      type: "pattern",
      patternUrl: patternUrlToUse,
      size: marker?.size ?? 1.0,
    });
    markerControlsRef.current = controls;

    // Debug: trục nhỏ
    const axes = new THREE.AxesHelper((marker?.size ?? 1.0) * 0.2);
    markerRoot.add(axes);

    // Chờ idPatt sẵn sàng rồi mới chạy loop
    const ready = await waitFor(
      () => typeof (controls as any)?.idPatt === "number" && (controls as any).idPatt >= 0,
      6000,
      40
    );
    if (!ready) {
      console.warn("[PoseViewerAR] marker idPatt chưa sẵn sàng — vẫn khởi động loop với try/catch để tránh crash.");
    }
    startLoop();
  }, [marker, startLoop]);

  // ---------- effects ----------
  React.useEffect(() => {
    let disposed = false;
    (async () => {
      await init();
      if (!disposed && src) {
        const size = marker?.size ?? 1.0;
        loadModel(src, (format as ARFormat) || "fbx", size);
      }
    })();

    return () => {
      disposed = true;

      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      loopStartedRef.current = false;

      if (mixerRef.current) {
        try { mixerRef.current.stopAllAction?.(); } catch {}
        mixerRef.current = null;
      }

      disposeModel();

      if (resizeHandlerRef.current) {
        window.removeEventListener("resize", resizeHandlerRef.current);
        resizeHandlerRef.current = null;
      }

      // Gỡ marker controls khỏi context để tránh phần tử rỗng còn sót
      try {
        const ctx  = arContextRef.current;
        const ctrl = markerControlsRef.current;
        if (ctx?._arMarkersControls && ctrl) {
          ctx._arMarkersControls = ctx._arMarkersControls.filter((x: any) => x && x !== ctrl);
        }
      } catch {}
      markerControlsRef.current = null;

      const r = rendererRef.current;
      if (r) {
        try {
          r.dispose();
          const canvas = r.domElement;
          if (canvas && canvas.parentElement) canvas.parentElement.removeChild(canvas);
        } catch {}
      }
      rendererRef.current = null;

      sceneRef.current = null;
      cameraRef.current = null;
      markerRootRef.current = null;

      // Tắt webcam
      try {
        const srcObj = arSourceRef.current;
        if (srcObj?.domElement && srcObj.domElement.srcObject) {
          const tracks: MediaStreamTrack[] = srcObj.domElement.srcObject.getTracks?.() || [];
          tracks.forEach((t) => t.stop?.());
        }
      } catch {}
      arSourceRef.current = null;
      arContextRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    if (!src) return;
    const size = marker?.size ?? 1.0;
    loadModel(src, (format as ARFormat) || "fbx", size);
  }, [src, format, marker?.size, loadModel]);

  return (
    <div
      ref={wrapRef}
      className="relative w-full rounded-xl overflow-hidden bg-black"
      style={{ height }}
    >
      {/* Overlay hướng dẫn + thoát */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-3 py-2 text-white/90 text-sm pointer-events-none">
        <div className="pointer-events-none">
          Đưa camera tới marker <span className="font-semibold">Hiro</span>.
        </div>
        {onExit && (
          <button
            onClick={onExit}
            className="pointer-events-auto px-3 py-1 rounded bg-white/10 hover:bg-white/20 backdrop-blur border border-white/20"
          >
            Thoát AR
          </button>
        )}
      </div>
    </div>
  );
}
