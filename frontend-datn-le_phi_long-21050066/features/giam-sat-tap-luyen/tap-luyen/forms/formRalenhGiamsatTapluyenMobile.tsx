"use client";
import React from "react";

import HeaderPageTapLuyen from "@/features/giam-sat-tap-luyen/tap-luyen/forms/header";
import FooterPageTapLuyen from "@/features/giam-sat-tap-luyen/tap-luyen/forms/footer";
import InputSection from "@/features/giam-sat-tap-luyen/tap-luyen/forms/inputSection";
import PoseViewer3D from "@/features/xem-dong-tac/forms/poseViewer3D";
import RestOverlay from "@/features/giam-sat-tap-luyen/tap-luyen/forms/restOverlay";
import ErrorOverlay from "@/features/giam-sat-tap-luyen/tap-luyen/forms/errorOverlay";
import SummaryOverlay from "@/features/giam-sat-tap-luyen/tap-luyen/forms/summaryOverlay";

import { getExercise } from "../api/getExercise";
import { getFile } from "../../../xem-dong-tac/api/getFile";
import { initPoseExtractor, extractFromVideo, drawPose } from "@/lib/PoseExtractor";
import PoseCls from "@/lib/PoseClassification";
import ExpertTrainer, { calculateJoints, check, feedOrder, resetOrder } from "@/lib/ExpertTrainer";
import { saveStats } from "../api/saveStats";

const REST_SECONDS = 1;
const CONF_THRESHOLD = 0.85;

export default function FormRalenhGiamsatTapluyenMobile(props: any) {
  const screen = React.useRef<HTMLDivElement | null>(null);
  const containerRef = React.useRef<HTMLDivElement | null>(null);

  const [exercises, setExercises] = React.useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = React.useState(0);

  const [current, setCurrent] = React.useState<any>({
    id: undefined,
    name: "", set: 0, rep: 0,
    scheduleDetailID: undefined,
    currentPredictModel: undefined,
    currentPoseViewerModel: undefined,
    currentModelJson: undefined,
    currentModelUrl: undefined,
    currentPositions: [],
    currentVoices: []
  });

  const [set, setSet] = React.useState(1);
  const [rep, setRep] = React.useState(0);

  const [error, setError] = React.useState<any>(null);
  const [errors, setErrors] = React.useState<any[]>([]);
  const [errorCount, setErrorCount] = React.useState(0);

  const [isRest, setIsRest] = React.useState(false);
  const [restLeft, setRestLeft] = React.useState(REST_SECONDS);
  const [pendingIndex, setPendingIndex] = React.useState<number | null>(null);
  const [openSummary, setOpenSummary] = React.useState(false);

  const [cameraError, setCameraError] = React.useState<string | null>(null);

  const urlBucketRef = React.useRef<string[]>([]);
  const poseRef = React.useRef<any>(null);

  const [worldLms, setWorldLms] = React.useState<any[] | null>(null);
  const [predResult, setPredResult] = React.useState<any>(null);
  const lastPredRef = React.useRef<string>("");

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

  // Tự tính chiều cao còn lại = 100dvh - header layout (bằng khoảng cách từ top của container đến mép trên viewport)
  React.useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const applyHeight = () => {
      const top = el.getBoundingClientRect().top;
      el.style.height = `calc(100dvh - ${Math.max(0, Math.round(top))}px)`;
    };
    applyHeight();
    const ro = new ResizeObserver(applyHeight);
    ro.observe(document.documentElement);
    window.addEventListener("resize", applyHeight);
    window.addEventListener("orientationchange", applyHeight);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", applyHeight);
      window.removeEventListener("orientationchange", applyHeight);
    };
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
          const voicePaths = ex.voicePaths;

          const rules = ex.positions.map((position: any) => {
            let criteria = position.evaluationCriteria;
            return { ...criteria };
          });
          out.rules = rules;

          try { try { poseRef.current = await initPoseExtractor(); } catch { poseRef.current = null; } } catch {}

          try {
            if (modelPath) {
              const mj: any = await getFile(modelPath);
              out._modelJson = mj;
              out._modelUrl = modelPath;
            }
          } catch {}

          try {
            if (weightPath) {
              const wb: any = await getFile(weightPath);
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
              const ins: any = await getFile(instructionPath);
              if (ins instanceof Blob) {
                const url = URL.createObjectURL(ins);
                out._instructionUrl = url;
                trackUrl(url);
              }
            }
            if (voicePaths) {
              const voices: any[] = [];
              for (const path of voicePaths) {
                const voiceBlob = await getFile(path);
                const url = URL.createObjectURL(voiceBlob);
                const audio = new Audio(url);
                trackUrl(url);
                const audioName = path.split("\\").pop()!.replace(".wav", "").split("-");
                const positionID = Number(audioName[0]);
                const criteriaID = Number(audioName[1]);
                voices.push({ positionID, criteriaID, audio });
              }
              out.voices = voices;
            }
          } catch {}

          return out;
        })
      );

      if (cancelled) return;
      setExercises(preloaded);
      if (preloaded.length > 0) await loadData(0, preloaded);
      else setCurrent({
        id: undefined,
        name: "", set: 0, rep: 0,
        scheduleDetailID: undefined,
        currentPredictModel: undefined,
        currentPoseViewerModel: undefined,
        currentModelJson: undefined,
        currentModelUrl: undefined,
        currentPositions: [],
        currentVoices: []
      });
    })();

    return () => { cancelled = true; revokeAll(); };
  }, [props?.date, checkCamera]);

  const loadData = React.useCallback(async (index: number, source?: any[]) => {
    const list = source || exercises;
    const ex = list[index];
    if (!ex) return;

    setCurrent({
      id: ex?.id,
      name: ex?.name || "",
      set: ex?.set || 0,
      rep: ex?.rep || 0,
      scheduleDetailID: ex.scheduleDetailID,
      currentPredictModel: ex?._weightUrl,
      currentPoseViewerModel: ex?._instructionUrl,
      currentModelJson: ex?._modelJson,
      currentModelUrl: ex?._modelUrl,
      currentPositions: ex?.positions || [],
      currentVoices: ex?.voices || []
    });
    setCurrentIndex(index);

    try { if (ex?._modelJson && ex?._weightBin) await PoseCls.load(ex._modelJson, ex._weightBin); } catch {}
    ExpertTrainer.loadData(ex.rules, ex.voices);
    resetOrder();
    setWorldLms(null);
    setPredResult(null);
    setRep(0);
    lastPredRef.current = "";
  }, [exercises]);

  const onFrame = React.useCallback(async (videoEl: HTMLVideoElement) => {
    if (!poseRef.current || !videoEl || videoEl.readyState < 2) return;
    const r = await extractFromVideo(videoEl, poseRef.current);
    if (Array.isArray(r?.poseWorldLandmarks)) setWorldLms(r.poseWorldLandmarks);
    return r;
  }, [poseRef]);

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
          if (pendingIndex !== null && pendingIndex !== currentIndex) setSet(1);
          if (pendingIndex !== null) { loadData(pendingIndex); setPendingIndex(null); }
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [isRest, pendingIndex, loadData, currentIndex]);

  React.useEffect(() => { poseClassify(); }, [worldLms]);

  const poseClassify = () => {
    if (!worldLms || !PoseCls.ready()) return;
    const out = PoseCls.predictFromLandmarks(worldLms as any);
    if (!out || !Array.isArray(out.probs)) return;
    const bestIdx = out.index;
    const bestProb = (out.probs[bestIdx] as number) ?? 0;
    if (bestProb < CONF_THRESHOLD) return;
    const key = `${bestIdx}:${bestProb.toFixed(3)}`;
    if (lastPredRef.current !== key) { lastPredRef.current = key; setPredResult(out); }
  };

  React.useEffect(() => { if (predResult) response(); }, [predResult, worldLms]);

  const endWorkout = async () => {
    const statsData = { date: props!.date, errors: errors };
    await saveStats(statsData);
    setOpenSummary(true);
  };

  const response = () => {
    if (!predResult || isRest) return;
    const bestIdx = predResult.index;
    const angles = calculateJoints(worldLms);
    const e = check(current.currentPositions[bestIdx].id, angles);
    if (!error && e) setError(e);

    if (feedOrder(bestIdx)) {
      const nextRep = rep + 1;
      setRep(nextRep);

      if (error) {
        setErrorCount(c => c + 1);
        setErrors(list => ([
          ...list,
          {
            scheduleDetailID: current.scheduleDetailID,
            set,
            rep: nextRep,
            jointList: error.jointList,
            positionName: current.currentPositions[bestIdx]?.name || "",
            actualAngle: Math.round(error.actualAngle ?? 0),
            errorMessage: error.errorMessage,
          }
        ]));
      }
      setError(null);
      nextSetOrExercise(nextRep);
    }
  };

  const nextSetOrExercise = (nextRep: number) => {
    const targetReps = current?.rep || 0;
    if (targetReps && nextRep >= targetReps) {
      const totalSets = current?.set || 1;
      const nextSet = set + 1;

      setRestLeft(REST_SECONDS);
      setIsRest(true);

      if (nextSet <= totalSets) {
        setSet(nextSet);
        setPendingIndex(currentIndex);
      } else if (exercises.length - 1 <= currentIndex) {
        endWorkout();
      } else {
        const goto = (currentIndex + 1) % exercises.length;
        setSet(1);
        setPendingIndex(goto);
      }
    }
  };

  const bestIdx = predResult?.index;
  const currentPoseName = typeof bestIdx === "number" && Array.isArray(current?.currentPositions)
    ? (current.currentPositions[bestIdx]?.name || "")
    : "";

  if (openSummary) {
    return (
      <SummaryOverlay
        open={openSummary}
        onBackHome={() => { window.location.href = "/"; }}
        totalErrors={errorCount}
        totalSets={exercises.map((x:any) => x?.set).reduce((a, b) => a + b, 0)}
        totalReps={exercises.map((x:any) => x?.rep * x?.set).reduce((a, b) => a + b, 0)}
        exerciseCount={exercises.length}
        exerciseNames={exercises.map((x:any) => x?.name).filter(Boolean)}
      />
    );
  }

  return (
    <div ref={screen} className="bg-black text-white w-screen max-w-full overflow-hidden">
      <div className="p-3">
        <HeaderPageTapLuyen screen={screen} title={current?.name || exercises[currentIndex]?.name} />
      </div>

      {/* KHUNG CHỨA có chiều cao = 100dvh - header layout (đã tính bằng JS) */}
      <div ref={containerRef} className="relative w-full max-w-full overflow-hidden px-3">
        {/* Vùng nội dung chiếm hết chiều cao khung chứa */}
        <div className="relative h-full pb-20"> {/* pb-20 để không bị footer overlay che viewer */}
          {/* Viewer chia đôi: trên Video / dưới 3D */}
          <div className="grid grid-rows-2 gap-2 h-full">
            <div className="relative rounded-xl overflow-hidden bg-black">
              <InputSection onFrame={onFrame} onDraw={onDraw} />
              <div className="pointer-events-none absolute top-2 right-2 z-10">
                <div className="rounded-lg bg-black/60 backdrop-blur px-3 py-2 text-xs space-y-1">
                  <div className="flex items-center gap-2"><span className="opacity-70">Set</span><span className="font-semibold">{set ?? 0}</span></div>
                  <div className="flex items-center gap-2"><span className="opacity-70">Rep</span><span className="font-semibold">{rep ?? 0}</span></div>
                  <div className="flex items-center gap-2"><span className="opacity-70">Lỗi</span><span className="font-semibold">{errorCount ?? 0}</span></div>
                </div>
              </div>
            </div>

            <div className="relative rounded-xl overflow-hidden bg-black">
              <PoseViewer3D src={current?.currentPoseViewerModel} />
              <div className="absolute left-2 bottom-2 text-xs opacity-70 truncate pointer-events-none">
                {currentPoseName || "—"}
              </div>
            </div>
          </div>

          {/* FOOTER OVERLAY — dính đáy của KHUNG CHỨA (nằm trong khung) */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20">
            <div className="pointer-events-auto bg-gradient-to-t from-black/80 to-black/0 px-0 pt-6 pb-3">
              <FooterPageTapLuyen
                currentIndex={currentIndex}
                total={exercises.length}
                onPrev={onPrev}
                onNext={onNext}
              />
            </div>
          </div>
        </div>
      </div>

      <RestOverlay open={isRest} seconds={restLeft} />
      <ErrorOverlay open={!!cameraError} message={cameraError} onReload={() => window.location.reload()} />
    </div>
  );
}
