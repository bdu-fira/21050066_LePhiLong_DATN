// features/.../forms/jointFeedBack.tsx
"use client";
import React from "react";

/**
 * Quy tắc đơn giản: cảnh báo nếu góc vai phải > 65°
 * Trả về true nếu VI PHẠM (để Form cộng lỗi), ngược lại false.
 * Dùng kiểu any theo yêu cầu để code gọn và chạy được.
 */
export function checkShoulderRule(angles: any): boolean {
  const rs = Number(angles?.rightShoulder ?? 0);
  return rs > 65;
}

/**
 * Component hiển thị phản hồi khớp (đơn giản, dùng any).
 * Nhận props: { jointAngles?: any }
 * - Nếu phát hiện vi phạm vai phải > 65°, hiển thị cảnh báo.
 * - Hiển thị một vài góc cơ bản nếu có (vai trái/phải, khuỷu tay...).
 */
export default function JointFeedback(props: any) {
  const a = props?.jointAngles || {};
  const lShoulder = Number.isFinite(a?.leftShoulder) ? Math.round(a.leftShoulder) : null;
  const rShoulder = Number.isFinite(a?.rightShoulder) ? Math.round(a.rightShoulder) : null;
  const lElbow = Number.isFinite(a?.leftElbow) ? Math.round(a.leftElbow) : null;
  const rElbow = Number.isFinite(a?.rightElbow) ? Math.round(a.rightElbow) : null;

  const violated = checkShoulderRule(a);

  return (
    <div className="w-full rounded-lg border border-white/10 bg-white/5 p-4 text-sm">
      <div className="font-semibold mb-2">Phản hồi khớp</div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-1 opacity-90">
        <div>Vai trái: <b>{lShoulder !== null ? `${lShoulder}°` : "-"}</b></div>
        <div>Vai phải: <b>{rShoulder !== null ? `${rShoulder}°` : "-"}</b></div>
        <div>Khuỷu trái: <b>{lElbow !== null ? `${lElbow}°` : "-"}</b></div>
        <div>Khuỷu phải: <b>{rElbow !== null ? `${rElbow}°` : "-"}</b></div>
      </div>

      {violated ? (
        <div className="mt-3 rounded-md bg-yellow-500/15 text-yellow-300 px-3 py-2">
          Cánh tay đang hơi cao, hãy hạ vai/phần cánh tay xuống một chút để giữ dáng đúng.
        </div>
      ) : (
        <div className="mt-3 rounded-md bg-emerald-500/15 text-emerald-300 px-3 py-2">
          Tư thế vai ổn định.
        </div>
      )}
    </div>
  );
}
