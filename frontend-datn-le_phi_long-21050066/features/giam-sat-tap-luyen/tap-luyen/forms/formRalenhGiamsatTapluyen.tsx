"use client";

import React, { useEffect, useRef, useState } from "react";
import FooterPageTapLuyen from "@/features/giam-sat-tap-luyen/tap-luyen/forms/footer";
import HeaderPageTapLuyen from "@/features/giam-sat-tap-luyen/tap-luyen/forms/header";
import InputSection, { PoseState } from "@/features/giam-sat-tap-luyen/tap-luyen/forms/inputSection";
import MonitorSection from "@/features/giam-sat-tap-luyen/tap-luyen/forms/monitorSection";
import { JointAngles } from "@/features/giam-sat-tap-luyen/tap-luyen/forms/jointFeedBack";

const FALLBACK_SEQUENCE: PoseState[] = ["standing", "mid_curl", "full_curl", "mid_curl", "standing"];

export default function FormRalenhGiamsatTapluyen() {
  const screen = useRef<HTMLDivElement | null>(null);
  const stateBufferRef = useRef<PoseState[]>([]);
  const violationBufferRef = useRef<boolean[]>([]);

  const [repCount, setRepCount] = useState(0);
  const [errorCount, setErrorCount] = useState(0);
  const [feedback, setFeedback] = useState<any>("");
  const [exercises, setExercises] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [expertByExercise, setExpertByExercise] = useState<any>({});
  const [modelByExercise, setModelByExercise] = useState<any>({});
  const [fbxByExercise, setFbxByExercise] = useState<any>({});
  const [sequenceByExercise, setSequenceByExercise] = useState<any>({});

  const [isRest, setIsRest] = useState(false);
  const [restLeft, setRestLeft] = useState(30);
  const [pendingIndex, setPendingIndex] = useState<any>(null);

  const getToday = () => {
    const d = new Date();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${d.getFullYear()}-${m}-${day}`;
  };

  // Gọi API POST /exercise/getExercise (tham khảo findExercise.ts)
  const fetchExercises = async (date: string) => {
    try {
      const url = `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/exercise/getExercise`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ date }),
      });

      const json = await res.json();
      if (!json?.isSuccess) return;

      const list = Array.isArray(json.data) ? json.data : [];
      const expertMap: any = {};
      const modelMap: any = {};
      const fbxMap: any = {};
      const seqMap: any = {};

      list.forEach((e: any) => {
        expertMap[e.id] = e.evaluationCriteria || [];
        modelMap[e.id] = e?.model?.weight || "";
        fbxMap[e.id] = e?.model?.instruction || "";
        const seq = (e.positions || e.sequence || [])
          .map((p: any) => p?.name || p?.label)
          .filter(Boolean);
        seqMap[e.id] = seq.length ? seq : FALLBACK_SEQUENCE;
      });

      setExercises(list);
      setExpertByExercise(expertMap);
      setModelByExercise(modelMap);
      setFbxByExercise(fbxMap);
      setSequenceByExercise(seqMap);

      // Reset state khi load danh sách mới
      setCurrentIndex(0);
      setRepCount(0);
      setErrorCount(0);
      setFeedback("");
      stateBufferRef.current = [];
      violationBufferRef.current = [];
    } catch {
      // swallow
    }
  };

  useEffect(() => {
    // Mặc định lấy theo ngày hiện tại, định dạng YYYY-MM-DD
    fetchExercises(getToday());
  }, []);

  const currentExercise = exercises[currentIndex] || null;
  const currentSequence: PoseState[] = currentExercise
    ? sequenceByExercise[currentExercise.id] || FALLBACK_SEQUENCE
    : FALLBACK_SEQUENCE;

  const handlePrediction = (poseState: PoseState, jointAngles: JointAngles, violated: boolean) => {
    if (!poseState) return;

    const lastState = stateBufferRef.current[stateBufferRef.current.length - 1];
    if (poseState !== lastState) {
      stateBufferRef.current.push(poseState);
      violationBufferRef.current.push(violated);

      if (stateBufferRef.current.length > currentSequence.length) {
        stateBufferRef.current.shift();
        violationBufferRef.current.shift();
      }

      if (stateBufferRef.current.length === currentSequence.length) {
        if (stateBufferRef.current.join(",") === currentSequence.join(",") && !violationBufferRef.current.includes(true)) {
          setRepCount((v) => v + 1);
          setFeedback("Hoàn thành 1 rep ĐÚNG!");
        } else {
          setErrorCount((v) => v + 1);
          setFeedback("Động tác sai thứ tự hoặc có lỗi khớp.");
        }
        stateBufferRef.current = [];
        violationBufferRef.current = [];
      }
    }
  };

  const startRest = (nextIndex: any) => {
    if (exercises.length === 0) return;
    if (nextIndex < 0 || nextIndex > exercises.length - 1) return;
    setPendingIndex(nextIndex);
    setRestLeft(30);
    setIsRest(true);
  };

  useEffect(() => {
    if (!isRest) return;
    const t = setInterval(() => {
      setRestLeft((s) => {
        if (s <= 1) {
          clearInterval(t);
          setIsRest(false);
          if (pendingIndex !== null) {
            setCurrentIndex(pendingIndex);
            // reset đếm khi qua bài mới
            setRepCount(0);
            setErrorCount(0);
            setFeedback("");
            stateBufferRef.current = [];
            violationBufferRef.current = [];
            setPendingIndex(null);
          }
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [isRest, pendingIndex]);

  return (
    <div ref={screen} className="bg-black text-white w-screen flex flex-col gap-8 p-10">
      <HeaderPageTapLuyen screen={screen} />

      <div className="flex justify-between px-4 flex-1">
        <InputSection onPrediction={handlePrediction} />
        <div className="flex flex-col gap-6 items-end">
          <div className="text-right">
            <div className="text-xl">{currentExercise?.name || "---"}</div>
            <div className="opacity-70">
              Set: {currentExercise?.set ?? "-"} | Rep: {currentExercise?.rep ?? "-"}
            </div>
          </div>

          <MonitorSection reps={repCount} errors={errorCount} feedback={feedback} />

          <div className="text-sm opacity-70">
            <div>Model: {currentExercise ? modelByExercise[currentExercise.id] : ""}</div>
            <div>3D: {currentExercise ? fbxByExercise[currentExercise.id] : ""}</div>
            <div>Sequence: {currentSequence.join(" → ")}</div>
          </div>
        </div>
      </div>

      <FooterPageTapLuyen
        onPrev={() => startRest(currentIndex - 1)}
        onNext={() => startRest(currentIndex + 1)}
        onRest={() => startRest(currentIndex)}
      />

      {isRest && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center">
          <div className="bg-white text-black rounded-xl p-10 w-[420px] text-center space-y-4">
            <div className="text-2xl font-semibold">Nghỉ ngơi</div>
            <div className="text-6xl font-bold">{restLeft}s</div>
            <div className="text-sm opacity-70">Sẽ tự chuyển bài tập</div>
          </div>
        </div>
      )}
    </div>
  );
}
