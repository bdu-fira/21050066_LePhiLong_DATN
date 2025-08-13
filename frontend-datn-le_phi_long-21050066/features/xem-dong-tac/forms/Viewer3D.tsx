"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

const EDGES: [number, number][] = [
  [11,12],[11,23],[12,24],[23,24],[11,13],[13,15],[12,14],[14,16],
  [11,7],[12,8],[7,9],[8,10],[9,0],[10,0],
  [23,25],[25,27],[27,29],[29,31],
  [24,26],[26,28],[28,30],[30,32],
];

// ---- Parse frame đa định dạng + map sang hệ trục Three.js ----
function parseFrame(frame: any): THREE.Vector3[] {
  const out: THREE.Vector3[] = [];
  if (!frame) return out;

  const push = (x: number, y: number, z: number) => {
    // MediaPipe: y hướng xuống camera -> lật Y; z dương ra trước -> đảo để nhìn vào màn hình
    const X = Number.isFinite(x) ? x : 0;
    const Y = Number.isFinite(y) ? -y : 0;   // flip Y
    const Z = Number.isFinite(z) ? -z : 0;   // flip Z nhẹ cho trực quan
    out.push(new THREE.Vector3(X, Y, Z));
  };

  if (Array.isArray(frame)) {
    if (typeof frame[0] === "number") {
      for (let i = 0; i + 2 < frame.length; i += 3) push(+frame[i], +frame[i+1], +frame[i+2]);
    } else if (Array.isArray(frame[0])) {
      for (const p of frame) push(+(p?.[0] ?? 0), +(p?.[1] ?? 0), +(p?.[2] ?? 0));
    } else if (typeof frame[0] === "object") {
      for (const p of frame) push(+(p?.x ?? p?.X ?? 0), +(p?.y ?? p?.Y ?? 0), +(p?.z ?? p?.Z ?? 0));
    }
  }
  return out;
}

function centerScale(pts: THREE.Vector3[]) {
  if (!pts.length) return pts;
  // center
  const c = new THREE.Vector3();
  pts.forEach(p => c.add(p));
  c.divideScalar(pts.length);
  let maxR = 0;
  const centered = pts.map(p => {
    const q = p.clone().sub(c);
    maxR = Math.max(maxR, q.length());
    return q;
  });
  // scale vừa khung nhìn
  const s = maxR > 0 ? 1.6 / maxR : 1;
  centered.forEach(p => p.multiplyScalar(s));
  return centered;
}

export default function Viewer3D() {
  const mountRef = useRef<HTMLDivElement>(null);
  const initializedRef = useRef(false);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const pointsRef = useRef<THREE.Points | null>(null);
  const linesRef = useRef<THREE.LineSegments | null>(null);

  const [data, setData] = useState<any>(null);
  const [labels, setLabels] = useState<string[]>([]);
  const [labelIdx, setLabelIdx] = useState(0);
  const [frameIdx, setFrameIdx] = useState(0);

  // Load JSON
  useEffect(() => {
    fetch("/models/grouped_pose_keypoints.json")
      .then(r => r.json())
      .then((d:any) => { setData(d); setLabels(Object.keys(d || {})); })
      .catch(console.error);
  }, []);

  // Init ONE canvas (no animation loop)
  useEffect(() => {
    if (initializedRef.current || !mountRef.current) return;
    initializedRef.current = true;

    // clear để chắc chắn không còn canvas cũ (HMR/StrictMode)
    mountRef.current.innerHTML = "";

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x2b2b2b);

    const camera = new THREE.PerspectiveCamera(50, 1, 0.01, 100);
    camera.position.set(0, 0.8, 3);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.display = "block";
    mountRef.current.appendChild(renderer.domElement);

    // Visual refs
    const grid = new THREE.GridHelper(10, 10);
    grid.position.y = -0.8;
    scene.add(grid);
    scene.add(new THREE.AxesHelper(0.6));
    scene.add(new THREE.HemisphereLight(0xffffff, 0x222222, 1.15));

    // Empty geometries (rebuild theo N)
    const pts = new THREE.Points(new THREE.BufferGeometry(), new THREE.PointsMaterial({ size: 0.06 }));
    const lns = new THREE.LineSegments(new THREE.BufferGeometry(), new THREE.LineBasicMaterial());
    scene.add(pts, lns);

    sceneRef.current = scene;
    cameraRef.current = camera;
    rendererRef.current = renderer;
    pointsRef.current = pts;
    linesRef.current = lns;

    // Resize đúng kích thước container
    const resize = () => {
      if (!mountRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = mountRef.current.clientWidth || window.innerWidth;
      const h = mountRef.current.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false); // không override CSS
      renderer.render(scene, camera);
    };

    const ro = new ResizeObserver(resize);
    ro.observe(mountRef.current);
    resize();

    return () => {
      ro.disconnect();
      renderer.dispose();
      mountRef.current?.removeChild(renderer.domElement);
    };
  }, []);

  // Build đúng N
  const ensureGeometry = (N: number) => {
    if (!pointsRef.current || !linesRef.current) return;
    const cur = pointsRef.current.geometry.getAttribute("position")?.count || 0;
    if (cur !== N) {
      const pAttr = new THREE.BufferAttribute(new Float32Array(N * 3), 3);
      const pGeom = new THREE.BufferGeometry();
      pGeom.setAttribute("position", pAttr);
      pointsRef.current.geometry = pGeom;

      const valid = EDGES.filter(([a,b]) => a < N && b < N);
      const lAttr = new THREE.BufferAttribute(new Float32Array(valid.length * 2 * 3), 3);
      const lGeom = new THREE.BufferGeometry();
      lGeom.setAttribute("position", lAttr);
      (linesRef.current as any).__edges = valid;
      linesRef.current.geometry = lGeom;
    }
  };

  // Vẽ 1 frame
  const drawFrame = (raw: any) => {
    if (!pointsRef.current || !linesRef.current) return;
    const vecs = centerScale(parseFrame(raw));
    const N = vecs.length;
    if (!N) return;

    ensureGeometry(N);

    const pPos = pointsRef.current.geometry.getAttribute("position") as THREE.BufferAttribute;
    for (let i = 0; i < N; i++) {
      const v = vecs[i];
      pPos.setXYZ(i, v.x, v.y, v.z);
    }
    pPos.needsUpdate = true;

    const edges: [number,number][] = (linesRef.current as any).__edges || [];
    const lPos = linesRef.current.geometry.getAttribute("position") as THREE.BufferAttribute;
    edges.forEach(([a,b], i) => {
      const va = vecs[a], vb = vecs[b];
      lPos.setXYZ(i*2, va.x, va.y, va.z);
      lPos.setXYZ(i*2+1, vb.x, vb.y, vb.z);
    });
    lPos.needsUpdate = true;

    pointsRef.current.geometry.computeBoundingSphere();
    linesRef.current.geometry.computeBoundingSphere();
  };

  const renderNow = () => {
    if (!rendererRef.current || !sceneRef.current || !cameraRef.current) return;
    rendererRef.current.render(sceneRef.current, cameraRef.current);
  };

  // Đổi label/frame -> vẽ 1 lần & render
  useEffect(() => {
    if (!data || !labels.length) return;
    const frames = data[labels[labelIdx]] || [];
    const idx = Math.min(frameIdx, Math.max(frames.length - 1, 0));
    if (frames[idx]) {
      drawFrame(frames[idx]);
      renderNow();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, labels, labelIdx, frameIdx]);

  // Controls
  const prevLabel = () => { if (!labels.length) return; setLabelIdx(i => (i - 1 + labels.length) % labels.length); setFrameIdx(0); };
  const nextLabel = () => { if (!labels.length) return; setLabelIdx(i => (i + 1) % labels.length); setFrameIdx(0); };
  const prevFrame  = () => setFrameIdx(f => Math.max(0, f - 1));
  const nextFrame  = () => {
    if (!data || !labels.length) return;
    const frames = data[labels[labelIdx]] || [];
    setFrameIdx(f => Math.min(frames.length - 1, f + 1));
  };

  const label = labels[labelIdx] || "-";
  const totalFrames = data?.[label]?.length || 0;

  return (
    <div style={{ height:"100%", width:"100%", position:"relative", background:"#2b2b2b" }}>
      <div ref={mountRef} style={{ position:"absolute", inset:0 }} />
      <div style={{
        position:"absolute", top:12, left:12, display:"flex", gap:8,
        background:"rgba(0,0,0,0.55)", padding:"10px 12px", borderRadius:8, color:"#fff",
        alignItems:"center", fontFamily:"ui-sans-serif, system-ui"
      }}>
        <button onClick={prevLabel} style={{padding:"6px 10px"}}>&larr; Label</button>
        <div style={{minWidth:120, textAlign:"center"}}>Label: <b>{label}</b></div>
        <button onClick={nextLabel} style={{padding:"6px 10px"}}>Label &rarr;</button>
        <div style={{width:1, height:24, background:"rgba(255,255,255,0.2)", margin:"0 6px"}} />
        <button onClick={prevFrame} style={{padding:"6px 10px"}}>&larr; Frame</button>
        <div>Frame: <b>{totalFrames ? (frameIdx+1) : 0}/{totalFrames}</b></div>
        <button onClick={nextFrame} style={{padding:"6px 10px"}}>Frame &rarr;</button>
      </div>
    </div>
  );
}
