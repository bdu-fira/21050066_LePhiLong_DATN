'use client';
import React from 'react';

export default function MonitorSection({ sets, reps, totalSets, totalReps, errors, pose, poseProb }: any) {
  const pct = typeof poseProb === 'number' ? `${Math.round(poseProb * 100)}%` : '—';
  return (
    <div className="w-full col-span-1 rounded-xl border p-6 bg-white/5 space-y-3">
      <div className="rounded-lg bg-black/30 p-4 text-center">
          <div className="text-sm opacity-70">Set</div>
          <div className="text-4xl font-bold">{sets ?? 0} / {totalSets ?? 0}</div>
      </div>
      <div className="rounded-lg bg-black/30 p-4 text-center">
          <div className="text-sm opacity-70">Rep</div>
          <div className="text-4xl font-bold">{reps ?? 0} / {totalReps ?? 0}</div>
      </div>
      <div className="rounded-lg bg-black/30 p-4 text-center">
          <div className="text-sm opacity-70">Lỗi</div>
          <div className="text-4xl font-bold">{errors ?? 0}</div>
      </div>
      <div className="rounded-lg bg-black/30 p-4 text-center">
        <div className="text-sm opacity-70">Tư thế hiện tại</div>
        <div className="text-xl font-semibold truncate">{pose || '—'}</div>
      </div>
      <div className="rounded-lg bg-black/30 p-4 text-center">
        <div className="text-sm opacity-70">Độ tin cậy</div>
        <div className="text-xl font-semibold">{pct}</div>
      </div>
    </div>
  );
}
