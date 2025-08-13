"use client";

import { useEffect, useRef } from "react";

/* ------------------------- Constants & Types ------------------------- */

const CONNECTIONS: [number, number][] = [
  [11, 13],
  [13, 15],
  [15, 17],
  [15, 19],
  [15, 21],
  [17, 19],
  [12, 14],
  [14, 16],
  [16, 18],
  [16, 20],
  [16, 22],
  [18, 20],
  [11, 12],
  [23, 24],
  [11, 23],
  [12, 24],
  [23, 25],
  [25, 27],
  [27, 29],
  [29, 31],
  [27, 31],
  [24, 26],
  [26, 28],
  [28, 30],
  [30, 32],
  [28, 32],
];

type Props = {
  /** Mảng 33 điểm, mỗi điểm [x,y,z] từ poseWorldLandmarks */
  points?: number[][];
  height?: number;
};

/* --------------------- Upright Normalization (optional) ---------------------
   Input: worldLandmarks = number[33][3] (đơn vị ~ mét, hệ camera)
   Output: mảng điểm đã tịnh tiến & xoay về hệ “đứng thẳng” (X=ngang, Y=đứng, Z=trước/sau)
--------------------------------------------------------------------------- */

export function normalizePoseToUpright(worldLandmarks: number[][]): number[][] {
  if (!worldLandmarks || worldLandmarks.length < 25) return worldLandmarks || [];

  // Indices theo MediaPipe
  const L_SHOULDER = 11;
  const R_SHOULDER = 12;
  const L_HIP = 23;
  const R_HIP = 24;
  const NOSE = 0;

  const ls = worldLandmarks[L_SHOULDER];
  const rs = worldLandmarks[R_SHOULDER];
  const lh = worldLandmarks[L_HIP];
  const rh = worldLandmarks[R_HIP];

  if (!ls || !rs || !lh || !rh) return worldLandmarks;

  // 1) Gốc toạ độ = tâm hông
  const hipC: [number, number, number] = [
    (lh[0] + rh[0]) * 0.5,
    (lh[1] + rh[1]) * 0.5,
    (lh[2] + rh[2]) * 0.5,
  ];

  // 2) Véc-tơ chuẩn
  const shoulderC: [number, number, number] = [
    (ls[0] + rs[0]) * 0.5,
    (ls[1] + rs[1]) * 0.5,
    (ls[2] + rs[2]) * 0.5,
  ];

  // up ≈ từ hông → vai
  let up = sub(shoulderC, hipC);

  // right ≈ vai phải - vai trái (X dương: trái → phải theo ảnh)
  let right = sub(rs, ls);

  // Nếu up hoặc right gần 0 → bỏ normalize
  if (length(up) < 1e-6 || length(right) < 1e-6) return worldLandmarks;

  up = norm(up);
  right = norm(right);

  // forward = right × up  (quy tắc tay phải)
  let forward = cross(right, up);
  if (length(forward) < 1e-6) return worldLandmarks;
  forward = norm(forward);

  // Orthonormal hoá lại (Gram–Schmidt nhẹ)
  right = norm(cross(up, forward));
  forward = norm(cross(right, up));

  // Đảm bảo "mặt" hướng +Z dựa vào mũi (nếu có)
  const nose = worldLandmarks[NOSE];
  if (nose) {
    const noseVec = sub(sub(nose, hipC), project(sub(nose, hipC), up)); // bỏ thành phần dọc up
    const sign = dot(noseVec, forward);
    if (sign < 0) {
      // quay 180° quanh up: đổi chiều forward & right
      forward = mul(forward, -1);
      right = mul(right, -1);
    }
  }

  // 3) Ma trận quay R có các cột là (right, up, forward)
  //    p' = R^T * (p - hipC)
  const Rt = [
    [right[0], right[1], right[2]],
    [up[0], up[1], up[2]],
    [forward[0], forward[1], forward[2]],
  ];

  // 4) Áp dụng
  const out: number[][] = worldLandmarks.map((p) => {
    const v = sub(p, hipC);
    return [dot3(Rt[0], v), dot3(Rt[1], v), dot3(Rt[2], v)];
  });

  // 5) Scale tuỳ chọn để kích thước nhất quán (dựa trên bề ngang vai)
  const shoulderWidth = length(sub(rs, ls)) || 1;
  const s = 1 / shoulderWidth;
  return out.map(([x, y, z]) => [x * s, y * s, z * s]);
}

/* ------------------------------ Vec helpers ------------------------------ */

function sub(a: number[], b: number[]) {
  return [a[0] - b[0], a[1] - b[1], a[2] - b[2]] as [number, number, number];
}

function dot(a: number[], b: number[]) {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

function cross(a: number[], b: number[]) {
  return [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
  ] as [number, number, number];
}

function length(a: number[]) {
  return Math.hypot(a[0], a[1], a[2]);
}

function norm(a: number[]) {
  const L = length(a) || 1;
  return [a[0] / L, a[1] / L, a[2] / L] as [number, number, number];
}

function mul(a: number[], k: number) {
  return [a[0] * k, a[1] * k, a[2] * k] as [number, number, number];
}

function dot3(r: number[], v: number[]) {
  return r[0] * v[0] + r[1] * v[1] + r[2] * v[2];
}

/** Chiếu v lên trục n (n đã chuẩn hoá) */
function project(v: number[], n: number[]) {
  const k = dot(v, n);
  return [n[0] * k, n[1] * k, n[2] * k] as [number, number, number];
}

/* ------------------------------ 3D Viewer ------------------------------ */

export default function Pose3DViewer({ points, height = 280 }: Props) {
  const hostRef = useRef<HTMLDivElement | null>(null);

  // Lưu các instance + THREE để dùng lại
  const threeRef = useRef<{
    THREE: typeof import("three");
    renderer: import("three").WebGLRenderer;
    camera: import("three").PerspectiveCamera;
    group: import("three").Group;
    linePos: Float32Array;
    line: import("three").LineSegments;
    joints: import("three").InstancedMesh;
    raf: number;
    ro: ResizeObserver;
  } | null>(null);

  // load(): khởi tạo renderer/scene/camera + mesh xương/khớp
  useEffect(() => {
    let mounted = true;

    (async () => {
      const THREE = await import("three");
      if (!mounted || !hostRef.current) return;

      const el = hostRef.current;

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(el.clientWidth, el.clientHeight);
      el.appendChild(renderer.domElement);

      const scene = new THREE.Scene();

      const camera = new THREE.PerspectiveCamera(
        45,
        el.clientWidth / el.clientHeight,
        0.01,
        1000
      );
      camera.position.set(0, 0, 2.2);

      const group = new THREE.Group();
      scene.add(group);

      const linePos = new Float32Array(CONNECTIONS.length * 2 * 3);
      const lineGeom = new THREE.BufferGeometry();
      lineGeom.setAttribute("position", new THREE.BufferAttribute(linePos, 3));

      const line = new THREE.LineSegments(
        lineGeom,
        new THREE.LineBasicMaterial({ color: 0x10b981 })
      );
      group.add(line);

      const JOINTS = 33;
      const joints = new THREE.InstancedMesh(
        new THREE.SphereGeometry(0.02, 12, 12),
        new THREE.MeshStandardMaterial({ color: 0xef4444 }),
        JOINTS
      );
      group.add(joints);

      scene.add(new THREE.AmbientLight(0xffffff, 0.9));

      // Drag xoay, wheel zoom
      let drag = false;
      let lx = 0;
      let ly = 0;

      const dom = renderer.domElement;
      dom.style.cursor = "grab";

      dom.addEventListener("mousedown", (e) => {
        drag = true;
        lx = e.clientX;
        ly = e.clientY;
      });

      window.addEventListener("mouseup", () => (drag = false));

      window.addEventListener("mousemove", (e) => {
        if (!drag) return;
        group.rotation.y += (e.clientX - lx) * 0.005;
        group.rotation.x += (e.clientY - ly) * 0.005;
        lx = e.clientX;
        ly = e.clientY;
      });

      dom.addEventListener(
        "wheel",
        (e) => {
          camera.position.z = Math.min(
            10,
            Math.max(0.3, camera.position.z + e.deltaY * 0.0015)
          );
        },
        { passive: true }
      );

      // Resize
      const ro = new ResizeObserver(() => {
        if (!hostRef.current) return;
        const w = hostRef.current.clientWidth;
        const h = hostRef.current.clientHeight;
        renderer.setSize(w, h);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
      });
      ro.observe(el);

      // Render loop
      let raf = 0;
      const tick = () => {
        raf = requestAnimationFrame(tick);
        renderer.render(scene, camera);
      };
      tick();

      threeRef.current = { THREE, renderer, camera, group, linePos, line, joints, raf, ro };
    })();

    return () => {
      mounted = false;
      // Dọn tài nguyên nếu đã khởi tạo
      const api = threeRef.current;
      if (!api) return;
      const { renderer, line, joints, ro, raf } = api;

      cancelAnimationFrame(raf);
      ro.disconnect();
      renderer.dispose();
      line.geometry.dispose();
      (line.material as any).dispose?.();
      joints.geometry.dispose();
      (joints.material as any).dispose?.();
      if (renderer.domElement.parentElement) {
        renderer.domElement.parentElement.removeChild(renderer.domElement);
      }
      threeRef.current = null;
    };
  }, []);

  // show(points): cập nhật geometry mỗi khi có dữ liệu
  useEffect(() => {
    const api = threeRef.current;
    if (!api || !points || !points.length) return;

    const { THREE, camera, group, linePos, line, joints } = api;

    // Vẽ line (đảo trục Y để trực quan)
    let o = 0;
    for (const [i, j] of CONNECTIONS) {
      const a = points[i];
      const b = points[j];
      const ax = a?.[0] ?? 0;
      const ay = -(a?.[1] ?? 0);
      const az = a?.[2] ?? 0;
      const bx = b?.[0] ?? 0;
      const by = -(b?.[1] ?? 0);
      const bz = b?.[2] ?? 0;

      linePos[o++] = ax;
      linePos[o++] = ay;
      linePos[o++] = az;
      linePos[o++] = bx;
      linePos[o++] = by;
      linePos[o++] = bz;
    }
    (line.geometry.attributes.position as any).needsUpdate = true;

    // Vẽ joints
    const dummy = new THREE.Object3D();
    for (let i = 0; i < 33; i++) {
      const p = points[i] || [0, 0, 0];
      dummy.position.set(p[0], -p[1], p[2]);
      dummy.scale.setScalar(0.02);
      dummy.updateMatrix();
      joints.setMatrixAt(i, dummy.matrix);
    }
    joints.instanceMatrix.needsUpdate = true;

    // Fit đơn giản
    const box = new THREE.Box3();
    for (const [x, y, z] of points) {
      box.expandByPoint(new THREE.Vector3(x, -y, z));
    }
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);

    group.position.set(-center.x, center.y, -center.z);

    const maxDim = Math.max(size.x, size.y, size.z) || 0.5;
    camera.position.z = Math.max(1.6, 2.2 * maxDim);
  }, [points]);

  return (
    <div
      ref={hostRef}
      className="w-full border rounded"
      style={{ height }}
      aria-label="Pose3D"
      title="Kéo để xoay, lăn để zoom"
    />
  );
}
