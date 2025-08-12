"use client";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

type AnyObj = any;

// ====== Mediapipe (33) -> Bones (53) ======
// Một số bone không có trực tiếp trong Mediapipe, mình suy luận điểm "phụ" (ví dụ midShoulders, midHips).
// Dùng index âm cho điểm phụ:  -1: midShoulders, -2: midHips, -3: neckApprox, -4: chestApprox
const mediapipeToModel: Record<number, string[]> = {
  // Đầu/mặt: dồn về head
  0: ["head"], 1: ["head"], 2: ["head"], 3: ["head"],
  4: ["head"], 5: ["head"], 6: ["head"], 7: ["head"],
  8: ["head"], 9: ["head"], 10: ["head"],

  // Vai, khuỷu, cổ tay
  11: ["upperarmL"], 12: ["upperarmR"],
  13: ["lowerarmL"], 14: ["lowerarmR"],
  15: ["handL"],     16: ["handR"],

  // Ngón tay (Mediapipe không chi tiết ngón → tạm gán về đầu ngón chính)
  17: ["lowerfinger4L"], 18: ["lowerfinger4R"],   // pinky
  19: ["lowerfingerL"],  20: ["lowerfingerR"],    // index (ngón trỏ)
  21: ["lowerfinger2L"], 22: ["lowerfinger2R"],   // thumb (ngón cái)

  // Hông, gối, cổ chân
  23: ["upperlegL"], 24: ["upperlegR"],
  25: ["lowerlegL"], 26: ["lowerlegR"],
  27: ["footL"],     28: ["footR"],

  // Gót chân, mũi chân
  29: ["hellikkL"], 30: ["hellikkR"],
  31: ["tooseL"],   32: ["tooseR"],
};

// Điểm phụ (derived) để đặt spine/neck/chest/hip/waist
const derivedPointsToBones: { idx: number; bones: string[] }[] = [
  { idx: -2, bones: ["hip", "wiest"] },                                     // midHips ~ gốc
  { idx: -4, bones: ["chest"] },                                            // chest xấp xỉ
  { idx: -3, bones: ["neck"] },                                             // cổ xấp xỉ
];

// ====== Component ======
export default function PoseViewer() {
  const containerRef = useRef<HTMLDivElement>(null);
  const skeletonRef = useRef<THREE.Skeleton | null>(null);
  const modelRef = useRef<THREE.Object3D | null>(null);

  const [poseData, setPoseData] = useState<AnyObj>(null);
  const [groupNames, setGroupNames] = useState<string[]>([]);
  const [groupIdx, setGroupIdx] = useState(0);
  const [poseIdx, setPoseIdx] = useState(0);

  // scale/offset đơn giản để dễ “fit” pose vào rig (có thể chỉnh nếu cần)
  const SCALE = 1.0;

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene/camera/renderer
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf4f6f8);

    const camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    containerRef.current.appendChild(renderer.domElement);

    // Lights
    scene.add(new THREE.HemisphereLight(0xffffff, 0x444444, 1.2));
    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(5, 10, 7.5);
    scene.add(dirLight);

    // Load model
    const loader = new GLTFLoader();
    loader.load("/character/test.glb", (gltf) => {
      const model = gltf.scene;
      modelRef.current = model;
      scene.add(model);

      // Fit camera
      const box = new THREE.Box3().setFromObject(model);
      const size = new THREE.Vector3();
      const center = new THREE.Vector3();
      box.getSize(size);
      box.getCenter(center);
      const maxDim = Math.max(size.x, size.y, size.z);
      const fov = camera.fov * (Math.PI / 180);
      let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2));
      cameraZ *= 1.6;
      camera.position.set(center.x, center.y + size.y * 0.1, cameraZ);
      camera.lookAt(center);
      model.position.sub(center);

      // Grab skeleton
      model.traverse((obj: AnyObj) => {
        if (obj.isSkinnedMesh) {
          skeletonRef.current = obj.skeleton;
        }
      });

      if (!skeletonRef.current) {
        console.warn("No skeleton found on model.");
      } else {
        console.log("Bones:", skeletonRef.current.bones.map((b) => b.name));
      }
    });

    // Load poses JSON
    fetch("/models/grouped_pose_keypoints.json")
      .then((r) => r.json())
      .then((data) => {
        setPoseData(data);
        const groups = Object.keys(data);
        setGroupNames(groups);
        setGroupIdx(0);
        setPoseIdx(0);

        // auto-apply frame đầu tiên nếu có
        if (groups.length && data[groups[0]]?.length) {
          const first = data[groups[0]][0] as number[][];
          tryApply(first);
        }
      });

    // Loop
    const animate = () => {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    // Resize
    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // ====== Helpers ======
  function tryApply(landmarks: number[][]) {
    if (!skeletonRef.current || !landmarks || landmarks.length < 33) return;
    applyMediapipePose(skeletonRef.current, landmarks, SCALE);
  }

  function nextPose(step: number) {
    if (!poseData || !groupNames.length) return;
    const g = groupNames[groupIdx];
    const frames = poseData[g] || [];
    if (!frames.length) return;
    const next = (poseIdx + step + frames.length) % frames.length;
    setPoseIdx(next);
    tryApply(frames[next]);
  }

  function nextGroup(step: number) {
    if (!poseData || !groupNames.length) return;
    const nextG = (groupIdx + step + groupNames.length) % groupNames.length;
    setGroupIdx(nextG);
    setPoseIdx(0);
    const frames = poseData[groupNames[nextG]] || [];
    if (frames.length) tryApply(frames[0]);
  }

  // ====== Core: apply pose (position-based, nhanh để test) ======
  function applyMediapipePose(
    skeleton: THREE.Skeleton,
    landmarks: number[][],
    scale = 1
  ) {
    // 1) Tính một số điểm phụ để đặt spine/hip/neck
    const v = (i: number) => new THREE.Vector3().fromArray(landmarks[i] || [0, 0, 0]);
    const mid = (a: THREE.Vector3, b: THREE.Vector3) =>
      new THREE.Vector3().addVectors(a, b).multiplyScalar(0.5);

    const LShoulder = v(11), RShoulder = v(12);
    const LHip = v(23), RHip = v(24);
    const Nose = v(0);

    const midShoulders = mid(LShoulder, RShoulder); // -1
    const midHips = mid(LHip, RHip);                 // -2
    const neckApprox = mid(midShoulders, Nose);      // -3
    const chestApprox = mid(midShoulders, midHips);  // -4

    // 2) Chuẩn hóa: dịch toàn bộ pose về gốc (midHips) để hạn chế “đi lạc”
    const root = midHips.clone();
    const norm = (p: THREE.Vector3) =>
      p.clone().sub(root).multiplyScalar(scale);

    // 3) Gán các điểm phụ
    const derived: Record<number, THREE.Vector3> = {
      [-1]: norm(midShoulders),
      [-2]: norm(midHips),
      [-3]: norm(neckApprox),
      [-4]: norm(chestApprox),
    };

    // 4) Gán tất cả xương từ landmarks
    //    (nếu một key mediapipe map tới nhiều bone -> cùng set vị trí giống nhau để “kéo” theo cha)
    const setBone = (boneName: string, p: THREE.Vector3) => {
      const bone = skeleton.bones.find((b) => b.name === boneName);
      if (bone) {
        bone.position.copy(p);
      }
    };

    // Landmarks thực
    for (let i = 0; i < 33; i++) {
      const names = mediapipeToModel[i];
      if (!names) continue;
      const pos = norm(v(i));
      names.forEach((bn) => setBone(bn, pos));
    }

    // Điểm phụ
    for (const d of derivedPointsToBones) {
      const pos = derived[d.idx];
      if (!pos) continue;
      d.bones.forEach((bn) => setBone(bn, pos));
    }
  }

  // ====== UI ======
  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <div ref={containerRef} style={{ width: "100%", height: "100%" }} />
      <div
        style={{
          position: "absolute",
          bottom: 16,
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          gap: 8,
          background: "rgba(255,255,255,0.9)",
          borderRadius: 8,
          padding: "8px 12px",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <button onClick={() => nextPose(-1)}>Pose ⟨</button>
        <button onClick={() => nextPose(1)}>Pose ⟩</button>
        <button onClick={() => nextGroup(-1)}>Group ⟨</button>
        <button onClick={() => nextGroup(1)}>Group ⟩</button>
        <div style={{ marginLeft: 8, fontSize: 12, opacity: 0.8 }}>
          {groupNames.length ? `${groupNames[groupIdx]} [${poseIdx + 1}/${(poseData?.[groupNames[groupIdx]]?.length || 0)}]` : "loading…"}
        </div>
      </div>
    </div>
  );
}
