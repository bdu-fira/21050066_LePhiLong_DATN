'use client';

import React, { useEffect, useRef } from 'react';

type Props = {
  src: string | null;             // objectURL do PoseSearch tạo
  height?: string | number;       // mặc định 65vh
};

export default function PoseViewer3D({ src, height = '65vh' }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const initedRef = useRef(false);

  // three refs
  const THREERef = useRef<any>(null);
  const rendererRef = useRef<any>(null);
  const sceneRef = useRef<any>(null);
  const cameraRef = useRef<any>(null);
  const controlsRef = useRef<any>(null);
  const contentRootRef = useRef<any>(null);
  const mixerRef = useRef<any>(null);
  const rafRef = useRef<number>(0);
  const resizeHandlerRef = useRef<() => void>(null);
  const currentLoadId = useRef(0);

  // init once
  useEffect(() => {
    if (initedRef.current) return;
    initedRef.current = true;

    (async () => {
      const THREE = await import('three');
      const { OrbitControls } = await import('three/examples/jsm/controls/OrbitControls.js');
      (window as any).THREE = THREE;
      THREERef.current = THREE;

      const container = containerRef.current!;
      const getSize = () => {
        const w = container.clientWidth || window.innerWidth;
        const h = container.clientHeight || window.innerHeight;
        return { w, h };
      };

      // renderer
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
      } as CSSStyleDeclaration);
      container.appendChild(canvas);
      rendererRef.current = renderer;

      // scene
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x171717);
      sceneRef.current = scene;

      // camera
      const camera = new THREE.PerspectiveCamera(50, w / h, 0.01, 1000);
      camera.position.set(1.5, 1.5, 2.2);
      cameraRef.current = camera;

      // lights
      scene.add(new THREE.AmbientLight(0xffffff, 0.9));
      const key = new THREE.DirectionalLight(0xffffff, 0.8);
      key.position.set(3, 4, 2);
      scene.add(key);
      const rim = new THREE.DirectionalLight(0xffffff, 0.3);
      rim.position.set(-3, 2, -2);
      scene.add(rim);

      // content root
      const contentRoot = new THREE.Group();
      contentRootRef.current = contentRoot;
      scene.add(contentRoot);

      // controls
      const controls = new OrbitControls(camera, canvas);
      controls.enableDamping = true;
      controls.dampingFactor = 0.08;
      controls.target.set(0, 1, 0);
      controls.update();
      controlsRef.current = controls;

      // resize
      const onResize = () => {
        const { w: w2, h: h2 } = getSize();
        renderer.setSize(w2, h2);
        camera.aspect = w2 / h2;
        camera.updateProjectionMatrix();
      };
      window.addEventListener('resize', onResize);
      resizeHandlerRef.current = onResize;

      // loop
      const clock = new THREE.Clock();
      const animate = () => {
        rafRef.current = requestAnimationFrame(animate);
        const dt = clock.getDelta();
        if (mixerRef.current) mixerRef.current.update(dt);
        controls.update();
        renderer.render(scene, camera);
      };
      animate();
    })().catch(console.error);

    return () => {
      try { window.removeEventListener('resize', resizeHandlerRef.current as any); } catch {}
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      try { rendererRef.current?.dispose?.(); } catch {}
      const canvas = rendererRef.current?.domElement as HTMLCanvasElement | undefined;
      if (canvas && canvas.parentElement) canvas.parentElement.removeChild(canvas);
    };
  }, []);

  // load FBX when src changes
  useEffect(() => {
    const THREE = THREERef.current;
    const contentRoot = contentRootRef.current;
    if (!THREE || !contentRoot) return;

    // helper dispose
    const disposeObj = (obj: any) => {
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

    // clear previous model
    while (contentRoot.children.length) {
      const ch = contentRoot.children.pop();
      if (ch) { contentRoot.remove(ch); disposeObj(ch); }
    }
    mixerRef.current = null;
    if (!src) return;

    (async () => {
      const { FBXLoader } = await import('three/examples/jsm/loaders/FBXLoader.js');
      const loader = new FBXLoader();

      const myLoadId = ++currentLoadId.current;

      loader.load(
        src,
        (fbx: any) => {
          // ignore outdated loads (tránh đúp model)
          if (myLoadId !== currentLoadId.current) { disposeObj(fbx); return; }

          fbx.scale.setScalar(0.01);
          // center & floor
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
        }
      );
    })();

  }, [src]);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        width: '100%',
        height: typeof height === 'number' ? `${height}px` : height,
        background: '#111',
        borderRadius: 12,
        overflow: 'hidden',
      }}
    >
      {!src && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'grid',
            placeItems: 'center',
            color: '#bbb',
            fontSize: 14,
          }}
        >
          Chọn một động tác để xem 3D.
        </div>
      )}
    </div>
  );
}
