"use client";
import React from "react";

export default function SummaryOverlay({
  open,
  onBackHome,
  totalErrors,
  totalSets,
  totalReps,
  exerciseCount,
  exerciseNames = [],
}: any) {
  if (!open) return null;

  const goHome = () => {
    if (typeof onBackHome === "function") onBackHome();
    else window.location.href = "/";
  };

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative z-10 mx-auto max-w-3xl px-4 pt-10">
        <div className="rounded-2xl border border-white/10 bg-black/80 text-white shadow-2xl">
          <div className="p-6 sm:p-8">
            <h2 className="text-2xl font-bold mb-6">Tổng kết buổi tập</h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="rounded-lg bg-white/5 p-4 text-center">
                <div className="text-sm opacity-70">Tổng số lần lỗi</div>
                <div className="text-3xl font-semibold">{totalErrors ?? 0}</div>
              </div>
              <div className="rounded-lg bg-white/5 p-4 text-center">
                <div className="text-sm opacity-70">Số set đã tập</div>
                <div className="text-3xl font-semibold">{totalSets ?? 0}</div>
              </div>
              <div className="rounded-lg bg-white/5 p-4 text-center">
                <div className="text-sm opacity-70">Số rep đã tập</div>
                <div className="text-3xl font-semibold">{totalReps ?? 0}</div>
              </div>
              <div className="rounded-lg bg-white/5 p-4 text-center">
                <div className="text-sm opacity-70">Số bài tập</div>
                <div className="text-3xl font-semibold">{exerciseCount ?? (exerciseNames?.length || 0)}</div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={goHome}
                className="px-5 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition"
              >
                Về trang chủ
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
