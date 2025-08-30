"use client";
import React from "react";

export default function ErrorOverlay({ open, message, onReload }: any) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-white text-black rounded-xl p-8 w-[520px] text-center space-y-5">
        <div className="text-xl font-semibold">Có lỗi xảy ra.</div>
        <div className="text-sm opacity-80">{message}</div>
        <button onClick={onReload} className="px-4 py-2 rounded-md bg-black text-white hover:opacity-90">Tải lại trang</button>
      </div>
    </div>
  );
}
