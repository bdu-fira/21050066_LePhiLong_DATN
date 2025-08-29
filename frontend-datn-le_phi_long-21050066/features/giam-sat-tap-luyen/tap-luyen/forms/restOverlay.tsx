"use client";
import React from "react";

export default function RestOverlay({ open, seconds, title }: any) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-40">
      <div className="bg-white text-black rounded-xl p-10 w-[420px] text-center space-y-4">
        <div className="text-2xl font-semibold">{title || "Nghỉ ngơi"}</div>
        <div className="text-6xl font-bold">{seconds}s</div>
        <div className="text-sm opacity-70">Sẽ tự chuyển bài tập</div>
      </div>
    </div>
  );
}
