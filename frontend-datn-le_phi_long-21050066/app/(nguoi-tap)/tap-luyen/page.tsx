'use client';
import React, { useRef, useState } from 'react';
import FooterPageTapLuyen from '@/features/tap-luyen/footer';
import HeaderPageTapLuyen from '@/features/tap-luyen/header';
import InputSection, { PoseState } from '@/features/tap-luyen/inputSection';
import MonitorSection from '@/features/tap-luyen/monitorSection';
import { JointAngles } from '@/features/tap-luyen/jointFeedBack';

const RIGHT_SEQUENCE: PoseState[] = ["standing", "mid_curl", "full_curl", "mid_curl", "standing"];

function speak(msg: string) {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  let voices = window.speechSynthesis.getVoices();
  if (!voices.length) {
    window.speechSynthesis.onvoiceschanged = () => {
      voices = window.speechSynthesis.getVoices();
      _speak(msg, voices);
    };
  } else {
    _speak(msg, voices);
  }
}
function _speak(msg: string, voices: SpeechSynthesisVoice[]) {
  const utter = new window.SpeechSynthesisUtterance(msg);
  utter.lang = "en-US";
  window.speechSynthesis.speak(utter);
}

const PageTapLuyen = () => {
  const screen = useRef(null);
  const stateBufferRef = useRef<PoseState[]>([]);
  const violationBufferRef = useRef<boolean[]>([]);
  const [repCount, setRepCount] = useState(0);
  const [errorCount, setErrorCount] = useState(0);
  const [feedback, setFeedback] = useState<string>("");
  const repJustCountedRef = useRef(false);
  const lastSpokenError = useRef<string>("");

  const handlePrediction = (
    poseState: PoseState,
    jointAngles: JointAngles,
    violated: boolean
  ) => {
    if (!poseState) return;

    const lastState = stateBufferRef.current[stateBufferRef.current.length - 1];
    if (poseState !== lastState) {
      stateBufferRef.current.push(poseState);
      violationBufferRef.current.push(violated);

      if (stateBufferRef.current.length > RIGHT_SEQUENCE.length) {
        stateBufferRef.current.shift();
        violationBufferRef.current.shift();
      }

      // ĐÚNG rep
      if (
        stateBufferRef.current.length === RIGHT_SEQUENCE.length &&
        stateBufferRef.current.join(",") === RIGHT_SEQUENCE.join(",")
      ) {
        if (!violationBufferRef.current.includes(true) && !repJustCountedRef.current) {
          setRepCount((prev) => prev + 1);
          setFeedback("Hoàn thành 1 rep ĐÚNG!");
          repJustCountedRef.current = true;
          lastSpokenError.current = "";
        } else if (violationBufferRef.current.includes(true)) {
          setErrorCount((prev) => prev + 1);
          setFeedback("Có lỗi khớp khi thực hiện động tác.");
          if (lastSpokenError.current !== "arm") {
            speak("Your arm is too high. Please lower your arm.");
            lastSpokenError.current = "arm";
          }
          repJustCountedRef.current = false;
        }
        // Reset buffer sau 1 rep (bất kể đúng/sai)
        stateBufferRef.current = [];
        violationBufferRef.current = [];
      }
      // Lỗi sai thứ tự: chỉ báo khi buffer đủ và về standing
      else if (
        stateBufferRef.current.length === RIGHT_SEQUENCE.length &&
        stateBufferRef.current.join(",") !== RIGHT_SEQUENCE.join(",") &&
        stateBufferRef.current[stateBufferRef.current.length - 1] === "standing"
      ) {
        setErrorCount((prev) => prev + 1);
        setFeedback("Động tác đi sai thứ tự.");
        if (lastSpokenError.current !== "sequence") {
          speak("Please turn sideways so your right arm is visible.");
          lastSpokenError.current = "sequence";
        }
        repJustCountedRef.current = false;
        stateBufferRef.current = [];
        violationBufferRef.current = [];
      } else {
        // Reset error speech nếu user đang tập đúng lại
        lastSpokenError.current = "";
      }

      if (poseState !== "standing") {
        repJustCountedRef.current = false;
      }
    }
  };

  return (
    <div
      ref={screen}
      className="bg-black text-white w-screen flex flex-col gap-8 p-10"
    >
      <HeaderPageTapLuyen screen={screen} />
      <div className="flex justify-between px-4 flex-1">
        <InputSection onPrediction={handlePrediction} />
        <MonitorSection reps={repCount} errors={errorCount} feedback={feedback} />
      </div>
      <FooterPageTapLuyen />
    </div>
  );
};

export default PageTapLuyen;
