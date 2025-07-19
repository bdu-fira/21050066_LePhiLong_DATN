'use client';

import React from "react";

// Nếu chưa có, định nghĩa lại type góc khớp:
export type JointAngles = {
  rightShoulder?: number; // chính là góc cần rule
  // các góc khác bỏ qua
};

export default function JointFeedback({ angles }: { angles?: JointAngles }) {
  if (!angles) return null;

  const shoulderAngle = angles.rightShoulder;
  let feedback: string;
  if (shoulderAngle !== undefined && shoulderAngle > 65) {
    feedback = "Cánh tay đang hơi cao";
  } else {
    feedback = "Ổn!";
  }

  return (
    <div className="bg-yellow-50 text-yellow-900 rounded-md p-4 my-2 max-w-md shadow font-semibold">
      <div className="mb-2">Đánh giá khớp:</div>
      <div>Góc vai phải: <span className="text-8xl">{shoulderAngle?.toFixed(1) ?? '--'}°</span></div>
      <div className={`mt-2 ${shoulderAngle !== undefined && shoulderAngle > 65 ? 'text-red-600' : 'text-green-600'}`}>
        {feedback}
      </div>
    </div>
  );
}
