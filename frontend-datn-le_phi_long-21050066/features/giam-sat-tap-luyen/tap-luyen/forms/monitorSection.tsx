'use client';
import React from 'react';

export default function MonitorSection({ reps, errors }: any) {
  return (
    <div className="w-[480px] rounded-xl border p-6 bg-white/5">
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="rounded-lg bg-black/30 p-4 text-center">
          <div className="text-sm opacity-70">Rep</div>
          <div className="text-4xl font-bold">{reps ?? 0}</div>
        </div>
        <div className="rounded-lg bg-black/30 p-4 text-center">
          <div className="text-sm opacity-70">Lỗi</div>
          <div className="text-4xl font-bold">{errors ?? 0}</div>
        </div>
      </div>
    </div>
  );
}
