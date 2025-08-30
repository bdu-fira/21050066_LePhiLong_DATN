// features/.../forms/poseViewer3D.tsx
"use client";
import React from "react";
import * as THREE from "three";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

export default function PoseViewer3D({ src }: any) {
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const rendererRef = React.useRef<any>(null);
  const sceneRef = React.useRef<any>(null);
  const cameraRef = React.useRef<any>(null);
  const controlsRef = React.useRef<any>(null);
  const modelRef = React.useRef<any>(null);
  const mixerRef = React.useRef<any>(null);
  const clockRef = React.useRef<any>(new THREE.Clock());
  const rafRef = React.useRef<number | null>(null);

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

  const init = React.useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const w = el.clientWidth || 640;
    const h = el.clientHeight || 360;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio || 1);
    renderer.setSize(w, h);
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    const scene = new THREE.Scene();
    scene.background = null;

    const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 5000);
    camera.position.set(0, 1, 3);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.autoRotate = false;
    controls.enablePan = false;

    const amb = new THREE.AmbientLight(0xffffff, 1.0);
    scene.add(amb);
    const dir1 = new THREE.DirectionalLight(0xffffff, 1.2);
    dir1.position.set(2, 3, 4);
    scene.add(dir1);
    const dir2 = new THREE.DirectionalLight(0xffffff, 0.8);
    dir2.position.set(-3, 2, -2);
    scene.add(dir2);

    el.appendChild(renderer.domElement);
    rendererRef.current = renderer;
    sceneRef.current = scene;
    cameraRef.current = camera;
    controlsRef.current = controls;

    const onResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
      const w2 = containerRef.current.clientWidth || 1;
      const h2 = containerRef.current.clientHeight || 1;
      rendererRef.current.setSize(w2, h2);
      cameraRef.current.aspect = w2 / h2;
      cameraRef.current.updateProjectionMatrix();
    };
    window.addEventListener("resize", onResize);

    const loop = () => {
      rafRef.current = requestAnimationFrame(loop);
      const delta = clockRef.current.getDelta?.() ?? 0.016;
      if (mixerRef.current) mixerRef.current.update(delta);
      controls.update();
      renderer.render(scene, camera);
    };
    loop();

    return () => {
      window.removeEventListener("resize", onResize);
    };
  }, []);

  const fitAndCenter = (obj: any) => {
    if (!cameraRef.current || !controlsRef.current) return;
    const camera = cameraRef.current;
    const controls = controlsRef.current;

    const box = new THREE.Box3().setFromObject(obj);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);

    obj.position.sub(center);

    const maxDim = Math.max(size.x, size.y, size.z);
    const fov = camera.fov * (Math.PI / 180);
    const dist = maxDim / (2 * Math.tan(fov / 2));
    camera.position.set(0, size.y * 0.5, dist * 2.0);
    camera.near = dist / 100;
    camera.far = dist * 100;
    camera.updateProjectionMatrix();

    controls.target.set(0, size.y * 0.5 * 0.5, 0);
    controls.update();
  };

  const loadFBX = React.useCallback((url: string) => {
    if (!sceneRef.current) return;

    if (modelRef.current) {
      sceneRef.current.remove(modelRef.current);
      disposeModel(modelRef.current);
      modelRef.current = null;
    }
    mixerRef.current = null;

    const loader = new FBXLoader();
    loader.setCrossOrigin?.("anonymous" as any);
    loader.load(
      url,
      (obj: any) => {
        sceneRef.current.add(obj);
        modelRef.current = obj;
        fitAndCenter(obj);
        if (obj.animations && obj.animations[0]) {
          const mixer = new THREE.AnimationMixer(obj);
          mixer.clipAction(obj.animations[0]).play();
          mixerRef.current = mixer;
        }
      },
      undefined,
      () => {}
    );
  }, []);

  React.useEffect(() => {
    init();
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (controlsRef.current) controlsRef.current.dispose();
      if (rendererRef.current) rendererRef.current.dispose();
      if (modelRef.current) disposeModel(modelRef.current);
      const el = rendererRef.current?.domElement;
      if (el && el.parentElement) el.parentElement.removeChild(el);
      rendererRef.current = null;
      sceneRef.current = null;
      cameraRef.current = null;
      controlsRef.current = null;
      modelRef.current = null;
      mixerRef.current = null;
    };
  }, [init]);

  React.useEffect(() => {
    if (src) loadFBX(src);
  }, [src, loadFBX]);

  return (
    <div
      ref={containerRef}
      className="h-full relative w-full aspect-video bg-neutral-900 rounded-xl overflow-hidden"
    />
  );
}
