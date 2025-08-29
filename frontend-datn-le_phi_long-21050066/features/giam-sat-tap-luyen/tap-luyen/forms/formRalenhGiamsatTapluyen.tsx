"use client";
import React from "react";

import HeaderPageTapLuyen from "@/features/giam-sat-tap-luyen/tap-luyen/forms/header";
import FooterPageTapLuyen from "@/features/giam-sat-tap-luyen/tap-luyen/forms/footer";
import InputSection from "@/features/giam-sat-tap-luyen/tap-luyen/forms/inputSection";
import MonitorSection from "@/features/giam-sat-tap-luyen/tap-luyen/forms/monitorSection";
import PoseViewer3D from "@/features/giam-sat-tap-luyen/tap-luyen/forms/poseViewer3D";
import RestOverlay from "@/features/giam-sat-tap-luyen/tap-luyen/forms/restOverlay";
import ErrorOverlay from "@/features/giam-sat-tap-luyen/tap-luyen/forms/errorOverlay";

import { getExercise } from "../api/getExercise";
import { getModels } from "../api/getModels";
import { initPoseExtractor, extractFromVideo, drawPose } from "@/lib/PoseExtractor";
import PoseCls from "@/lib/PoseClassification";
import { Pose } from "@/public/mediapipe/pose";

const REST_SECONDS = 1;

export default function FormRalenhGiamsatTapluyen(props: any) {
  const screen = React.useRef<HTMLDivElement | null>(null);

  const [exercises, setExercises] = React.useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [current, setCurrent] = React.useState<any>({
    name: "", set: 0, rep: 0,
    currentPredictModel: undefined,
    currentPoseViewerModel: undefined,
    currentModelJson: undefined,
    currentModelUrl: undefined,
  });

  const [isRest, setIsRest] = React.useState(false);
  const [restLeft, setRestLeft] = React.useState(REST_SECONDS);
  const [pendingIndex, setPendingIndex] = React.useState<number | null>(null);

  const [cameraError, setCameraError] = React.useState<string | null>(null);

  const urlBucketRef = React.useRef<string[]>([]);
  const poseRef = React.useRef<any>(null);

  const [worldLms, setWorldLms] = React.useState<any[] | null>(null);

  const trackUrl = (u: any) => { if (typeof u === "string" && u.startsWith("blob:")) urlBucketRef.current.push(u); };
  const revokeAll = () => { try { urlBucketRef.current.forEach((u) => { try { URL.revokeObjectURL(u); } catch {} }); } finally { urlBucketRef.current = []; } };

  const checkCamera = React.useCallback(async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: false });
      s.getTracks().forEach((t) => t.stop());
      setCameraError(null);
    } catch (e: any) {
      const m = e?.name === "NotAllowedError" ? "Bạn đã từ chối quyền camera. Hãy cấp quyền và tải lại trang."
        : e?.name === "NotFoundError" ? "Không tìm thấy thiết bị camera."
        : "Không truy cập được camera.";
      setCameraError(m);
    }
  }, []);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      await checkCamera();
      await PoseCls.init();

      const res = await getExercise({ date: props?.date });
      const list = Array.isArray(res?.data) ? res.data : [];

      const preloaded = await Promise.all(
        list.map(async (ex: any) => {
          const out: any = { ...ex };

          const modelPath = ex?.model?.model;
          const weightPath = ex?.model?.weight;
          const instructionPath = ex?.model?.instruction;

          try {
            if (modelPath) {
              const mj: any = await getModels(modelPath);
              out._modelJson = mj;
              out._modelUrl = modelPath;
            }
          } catch {}
          try {
            if (weightPath) {
              const wb: any = await getModels(weightPath);
              if (wb instanceof Blob) {
                out._weightBin = wb;
                const url = URL.createObjectURL(wb);
                out._weightUrl = url;
                trackUrl(url);
              }
            }
          } catch {}
          try {
            if (instructionPath) {
              const ins: any = await getModels(instructionPath);
              if (ins instanceof Blob) {
                const url = URL.createObjectURL(ins);
                out._instructionUrl = url;
                trackUrl(url);
              }
            }
          } catch {}

          return out;
        })
      );

      if (cancelled) return;
      setExercises(preloaded);
      if (preloaded.length > 0) await loadData(0, preloaded);
      else setCurrent({ name: "", set: 0, rep: 0, currentPredictModel: undefined, currentPoseViewerModel: undefined, currentModelJson: undefined, currentModelUrl: undefined });
    })();

    return () => { cancelled = true; revokeAll(); };
  }, [props?.date, checkCamera]);

  const loadData = React.useCallback(async (index: number, source?: any[]) => {
    const list = source || exercises;
    const ex = list[index];
    if (!ex) return;

    setCurrent({
      name: ex?.name || "",
      set: ex?.set || 0,
      rep: ex?.rep || 0,
      currentPredictModel: ex?._weightUrl,
      currentPoseViewerModel: ex?._instructionUrl,
      currentModelJson: ex?._modelJson,
      currentModelUrl: ex?._modelUrl,
    });
    setCurrentIndex(index);

    poseRef.current = await initPoseExtractor(); 
    await PoseCls.load(ex?._modelJson, ex?._weightBin)
    setWorldLms(null);
  }, [exercises]);

  // onFrame TỐI GIẢN: chỉ extract -> nếu có landmarks thì lưu state
  const onFrame = React.useCallback(async (videoEl: HTMLVideoElement) => {
    if (!poseRef.current || !videoEl || videoEl.readyState < 2) return
    const r = await extractFromVideo(videoEl, poseRef.current)
    if (Array.isArray(r?.poseWorldLandmarks)) setWorldLms(r.poseWorldLandmarks)
    return r
  }, [poseRef])

  const onDraw = React.useCallback((canvasEl: HTMLCanvasElement, result: any, videoEl: HTMLVideoElement) => {
    if (!result?.keypoints?.length) return;
    try { drawPose({ canvas: canvasEl, image: videoEl, keypoints: result.keypoints }); } catch {}
  }, []);

  const onPrev = () => {
    if (!exercises.length) return;
    const next = (currentIndex - 1 + exercises.length) % exercises.length;
    setPendingIndex(next); setRestLeft(REST_SECONDS); setIsRest(true);
  };
  const onNext = () => {
    if (!exercises.length) return;
    const next = (currentIndex + 1) % exercises.length;
    setPendingIndex(next); setRestLeft(REST_SECONDS); setIsRest(true);
  };

  React.useEffect(() => {
    if (!isRest) return;
    const t = setInterval(() => {
      setRestLeft((s) => {
        if (s <= 1) {
          clearInterval(t);
          setIsRest(false);
          if (pendingIndex !== null) { loadData(pendingIndex); setPendingIndex(null); }
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [isRest, pendingIndex, loadData]);

  const predict = () => {
    const v = Array.isArray(worldLms) ? worldLms.flatMap((p: any) => [p.x, p.y, p.z]) : []
    const out = PoseCls.predictFromLandmarks(v)
    return out
  }

  React.useEffect(() => {
    predict()
  }, [worldLms])

  return (
    <div ref={screen} className="bg-black text-white w-screen flex flex-col gap-8 p-10">
      <HeaderPageTapLuyen screen={screen} title={current?.name || exercises[currentIndex]?.name} />

      <div className="flex justify-between px-4 flex-1">
        <div className="w-full">
          <div className="grid grid-cols-2 gap-4">
            <InputSection onFrame={onFrame} onDraw={onDraw} />
            <PoseViewer3D src={current?.currentPoseViewerModel} />
          </div>
        </div>
      </div>

      <div className="flex">
        <MonitorSection reps={0} errors={0} />
      </div>

      <FooterPageTapLuyen currentIndex={currentIndex} total={exercises.length} onPrev={onPrev} onNext={onNext} />
      <RestOverlay open={isRest} seconds={restLeft} />
      <ErrorOverlay open={!!cameraError} message={cameraError} onReload={() => window.location.reload()} />
    </div>
  );
}
