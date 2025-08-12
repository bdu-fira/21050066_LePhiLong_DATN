"use client";
import { useEffect, useRef } from "react";

export default function FormXemDongtac3D(props: any) {
  const { label, frameFlat } = props;
  const canvasRef = useRef<any>(null);
  const ref = useRef<any>({ inited: false, ready: false, lastLandmarks: null });

  // flat -> [[x,y,z], ...]
  const toXYZ = (flat: any) => {
    const out: any[] = [];
    for (let i = 0; i < (flat?.length || 0); i += 3) out.push([flat[i], flat[i + 1], flat[i + 2]]);
    return out;
  };

  // index Mediapipe dùng để lấy các khớp chính
  const MP: any = { L_SHOULDER:11, R_SHOULDER:12, L_ELBOW:13, R_ELBOW:14, L_WRIST:15, R_WRIST:16, L_HIP:23, R_HIP:24, L_KNEE:25, R_KNEE:26, L_ANKLE:27, R_ANKLE:28 };

  // tên xương Mixamo bạn gửi
  const BONE: any = {
    HIPS:"Hips", SPINE:"Spine", SPINE1:"Spine1", SPINE2:"Spine2", NECK:"Neck", HEAD:"Head",
    L_SHOULDER:"LeftShoulder", L_UPPER_ARM:"LeftArm", L_LOWER_ARM:"LeftForeArm", L_HAND:"LeftHand",
    R_SHOULDER:"RightShoulder", R_UPPER_ARM:"RightArm", R_LOWER_ARM:"RightForeArm", R_HAND:"RightHand",
    L_UP_LEG:"LeftUpLeg", L_LOWER_LEG:"LeftLeg", L_FOOT:"LeftFoot",
    R_UP_LEG:"RightUpLeg", R_LOWER_LEG:"RightLeg", R_FOOT:"RightFoot",
  };

  const strip = (n: any) => (n || "").replace(/^mixamorig:/i, "");
  const keyize = (n: any) => strip(n).toLowerCase();

  // helper quay bone theo hướng from->to (world-space, đơn giản cho pose tĩnh)
  const setBoneDir = (THREE: any, bone: any, from: any, to: any) => {
    if (!bone) return;
    const dir = to.clone().sub(from);
    if (dir.length() < 1e-6) return;
    dir.normalize();
    const zAxis = new THREE.Vector3(0, 0, 1);
    const q = new THREE.Quaternion().setFromUnitVectors(zAxis, dir);
    bone.quaternion.copy(q);
    bone.updateMatrixWorld(true);
  };

  useEffect(() => {
    if (!canvasRef.current || ref.current.inited) return;
    ref.current.inited = true;

    const init = async () => {
      const THREE = await import("three");
      const { FBXLoader } = await import("three/examples/jsm/loaders/FBXLoader.js");
      const { OrbitControls } = await import("three/examples/jsm/controls/OrbitControls.js");

      // scene / camera / renderer
      const scene: any = new THREE.Scene();
      scene.background = new THREE.Color(0x161718);

      const camera: any = new THREE.PerspectiveCamera(45, 1, 0.1, 4000);
      camera.position.set(0, 1.6, 3);

      const renderer: any = new THREE.WebGLRenderer({ canvas: canvasRef.current, antialias: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      const resize = () => {
        const w = canvasRef.current?.clientWidth || window.innerWidth;
        const h = canvasRef.current?.clientHeight || window.innerHeight;
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
      };
      window.addEventListener("resize", resize);
      resize();

      // lights + ground
      scene.add(new THREE.AmbientLight(0xffffff, 0.8));
      const dir = new THREE.DirectionalLight(0xffffff, 0.9);
      dir.position.set(5, 8, 6);
      scene.add(dir);
      scene.add(new THREE.GridHelper(10, 10));

      // controls
      const controls: any = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;

      // fallback cube
      const fallback = new THREE.Mesh(new THREE.BoxGeometry(0.2,0.2,0.2), new THREE.MeshStandardMaterial());
      fallback.position.set(0,1,0);
      scene.add(fallback);

      // load FBX (giữ nguyên scale gốc)
      let fbx: any = null;
      let boneByName: any = {};

      // helper thu thập bones từ FBX (cả tree và skeleton của skinned mesh)
      const collectBones = (root: any) => {
        const found: any[] = [];
        root.traverse((o: any) => {
          if (o.isBone) found.push(o);
          if (o.isSkinnedMesh && o.skeleton && Array.isArray(o.skeleton.bones)) {
            o.skeleton.bones.forEach((b: any) => found.push(b));
          }
        });
        // unique theo id
        const uniq = Array.from(new Map(found.map((b: any) => [b.id, b])).values());
        // map theo nhiều key
        uniq.forEach((b: any) => {
          const name = b.name || "";
          boneByName[name] = b;
          boneByName["mixamorig:" + strip(name)] = b; // phòng khi bạn truyền tên chưa có prefix
          boneByName[strip(name)] = b;
          boneByName[keyize(name)] = b;
          boneByName[keyize("mixamorig:" + strip(name))] = b;
        });
        // log danh sách để đối chiếu
        const available = uniq.map((b: any) => b.name);
        console.log("[Bones available]", available);
      };

      try {
        const loader = new FBXLoader();
        fbx = await loader.loadAsync("/character/char.fbx"); // trong /public
        scene.add(fbx);

        // reset bind pose nếu có
        fbx.traverse((o:any) => { if (o.isSkinnedMesh) o.skeleton?.pose(); });

        // căn camera theo bbox (không đổi scale)
        const meshes: any[] = [];
        fbx.traverse((o:any)=>{ if (o.isMesh) meshes.push(o); });
        if (meshes.length) {
          const box = meshes.reduce((acc:any, m:any)=> acc.expandByObject(m), new THREE.Box3());
          const size = new THREE.Vector3(); box.getSize(size);
          const center = new THREE.Vector3(); box.getCenter(center);
          fbx.position.sub(center);

          const maxDim = Math.max(size.x, size.y, size.z);
          const dist = maxDim * 1.5 + 1;
          camera.position.set(0, size.y * 0.5, dist);
          camera.lookAt(0, size.y * 0.5, 0);
          resize();
        }

        // thu thập bones (QUAN TRỌNG)
        collectBones(fbx);

        // kiểm tra đủ các bone chính chưa
        const need = [
          "Hips","Spine","Spine1","Spine2","Neck","Head",
          "LeftShoulder","LeftArm","LeftForeArm","LeftHand",
          "RightShoulder","RightArm","RightForeArm","RightHand",
          "LeftUpLeg","LeftLeg","LeftFoot","RightUpLeg","RightLeg","RightFoot"
        ];
        const missing = need.filter((n:any)=> !boneByName[n] && !boneByName["mixamorig:"+n] && !boneByName[keyize(n)]);
        if (missing.length) console.warn("[Bones missing]", missing);

        // đã có model -> bỏ cube
        scene.remove(fallback);
      } catch (e) {
        console.error("[FBX] Load error:", e);
      }

      const v3 = (x:any,y:any,z:any)=> new THREE.Vector3(x,y,z);
      const bn = (n:any)=> boneByName[n] || boneByName["mixamorig:"+n] || boneByName[keyize(n)];

      // ——— áp pose từ landmarks
      const applyPose = (landmarks:any[]) => {
        if (!landmarks?.length || !fbx) return;

        const S = 1.4; // chuyển hệ toạ độ mediapipe -> world
        const toV = (p:any)=> v3((p[0]-0.5)*S, (1-p[1])*S*1.4, (p[2]||0)*S*0.6);

        const vHipL = toV(landmarks[MP.L_HIP]);
        const vHipR = toV(landmarks[MP.R_HIP]);
        const vShL  = toV(landmarks[MP.L_SHOULDER]);
        const vShR  = toV(landmarks[MP.R_SHOULDER]);
        const vElL  = toV(landmarks[MP.L_ELBOW]);
        const vElR  = toV(landmarks[MP.R_ELBOW]);
        const vWrL  = toV(landmarks[MP.L_WRIST]);
        const vWrR  = toV(landmarks[MP.R_WRIST]);
        const vKnL  = toV(landmarks[MP.L_KNEE]);
        const vKnR  = toV(landmarks[MP.R_KNEE]);
        const vAnL  = toV(landmarks[MP.L_ANKLE]);
        const vAnR  = toV(landmarks[MP.R_ANKLE]);

        const hipsMid = vHipL.clone().add(vHipR).multiplyScalar(0.5);
        const shouldersMid = vShL.clone().add(vShR).multiplyScalar(0.5);

        const hips = bn(BONE.HIPS);
        if (hips) { hips.position.copy(hipsMid); hips.updateMatrixWorld(true); }

        // Torso
        setBoneDir(THREE, bn(BONE.SPINE),  hipsMid, shouldersMid);
        setBoneDir(THREE, bn(BONE.SPINE1), hipsMid, shouldersMid);
        setBoneDir(THREE, bn(BONE.SPINE2), hipsMid, shouldersMid);
        setBoneDir(THREE, bn(BONE.NECK),   shouldersMid, shouldersMid.clone().add(v3(0,0.2,0)));
        setBoneDir(THREE, bn(BONE.HEAD),   shouldersMid.clone().add(v3(0,0.2,0)), shouldersMid.clone().add(v3(0,0.4,0)));

        // Tay trái
        setBoneDir(THREE, bn(BONE.L_SHOULDER),  shouldersMid, vShL);
        setBoneDir(THREE, bn(BONE.L_UPPER_ARM), vShL, vElL);
        setBoneDir(THREE, bn(BONE.L_LOWER_ARM), vElL, vWrL);
        setBoneDir(THREE, bn(BONE.L_HAND),      vElL, vWrL);

        // Tay phải
        setBoneDir(THREE, bn(BONE.R_SHOULDER),  shouldersMid, vShR);
        setBoneDir(THREE, bn(BONE.R_UPPER_ARM), vShR, vElR);
        setBoneDir(THREE, bn(BONE.R_LOWER_ARM), vElR, vWrR);
        setBoneDir(THREE, bn(BONE.R_HAND),      vElR, vWrR);

        // Chân trái
        setBoneDir(THREE, bn(BONE.L_UP_LEG),    hipsMid, vKnL);
        setBoneDir(THREE, bn(BONE.L_LOWER_LEG), vKnL,    vAnL);
        setBoneDir(THREE, bn(BONE.L_FOOT),      vAnL,    vAnL.clone().add(v3(0.2,0,0.2)));

        // Chân phải
        setBoneDir(THREE, bn(BONE.R_UP_LEG),    hipsMid, vKnR);
        setBoneDir(THREE, bn(BONE.R_LOWER_LEG), vKnR,    vAnR);
        setBoneDir(THREE, bn(BONE.R_FOOT),      vAnR,    vAnR.clone().add(v3(0.2,0,0.2)));

        fbx.updateMatrixWorld(true);
      };

      // lưu mọi thứ vào ref
      ref.current = {
        ...ref.current,
        THREE, scene, camera, renderer, controls,
        applyPose, resize, ready: true,
      };

      // nếu trước đó đã có label/frame → áp luôn
      if (ref.current.lastLandmarks) applyPose(ref.current.lastLandmarks);

      // render loop
      const tick = () => {
        ref.current.controls?.update?.();
        ref.current.renderer?.render?.(ref.current.scene, ref.current.camera);
        ref.current.raf = requestAnimationFrame(tick);
      };
      tick();
    };

    init();

    return () => {
      try {
        cancelAnimationFrame(ref.current.raf);
        window.removeEventListener("resize", ref.current.resize);
        ref.current.renderer?.dispose?.();
      } catch {}
    };
  }, []);

  // đổi label/frame → lưu và áp nếu ready
  useEffect(() => {
    const lm = toXYZ(frameFlat);
    ref.current.lastLandmarks = lm;
    if (ref.current.ready && ref.current.applyPose) ref.current.applyPose(lm);
  }, [label, frameFlat]);

  return <canvas ref={canvasRef} style={{ width: "100%", height: "100%", minHeight: 400, display: "block" }} />;
}
