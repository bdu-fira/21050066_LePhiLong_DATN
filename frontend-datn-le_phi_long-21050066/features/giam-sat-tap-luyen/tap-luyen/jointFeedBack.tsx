'use client';

import React, { useEffect, useRef } from "react";

export type JointAngles = {
  rightShoulder?: number;
};

export function checkShoulderRule(angles?: JointAngles): boolean {
  if (!angles || angles.rightShoulder === undefined) return false;
  return angles.rightShoulder > 65;
}

function speak(msg: string) {
  if (typeof window !== "undefined" && window.speechSynthesis) {
    window.speechSynthesis.cancel();
    const utter = new window.SpeechSynthesisUtterance(msg);
    const voices = window.speechSynthesis.getVoices();
    const viVoice = voices.find(v => v.lang.startsWith("vi"));
    if (viVoice) utter.voice = viVoice;
    utter.lang = "vi-VN";
    window.speechSynthesis.speak(utter);
  }
}

export default function JointFeedback({ angles }: { angles?: JointAngles }) {
  const isWarning = checkShoulderRule(angles);
  const wasWarning = useRef(false);

  useEffect(() => {
    if (isWarning && !wasWarning.current) {
      wasWarning.current = true;
    } else if (!isWarning) {
      wasWarning.current = false;
    }
  }, [isWarning]);

  const feedback = isWarning ? "Cánh tay đang hơi cao" : "Ổn!";

  return (
    <div className="bg-yellow-50 text-yellow-900 rounded-md p-4 my-2 max-w-md shadow font-semibold">
      <div className="mb-2">Đánh giá khớp:</div>
      <div>Góc vai phải: <span className="text-2xl font-mono">{angles?.rightShoulder?.toFixed(1) ?? '--'}°</span></div>
      <div className={`mt-2 ${isWarning ? 'text-red-600' : 'text-green-600'}`}>
        {feedback}
      </div>
    </div>
  );
}
