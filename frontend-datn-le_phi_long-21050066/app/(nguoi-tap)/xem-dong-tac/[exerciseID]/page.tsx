"use client";
import FormXemDongtac3D from "@/features/xem-dong-tac/forms/Viewer3D";
import { useEffect, useState } from "react";

export default function PageXemDongtac() {
  const [labels, setLabels] = useState<any[]>([]);
  const [data, setData] = useState<any>({});
  const [idx, setIdx] = useState<number>(0);

  useEffect(() => {
    (async () => {
      const res = await fetch("/models/grouped_pose_keypoints.json");
      const json = await res.json();
      setData(json);
      setLabels(Object.keys(json));
    })();
  }, []);

  const goPrev = () => setIdx((p) => (labels.length ? (p - 1 + labels.length) % labels.length : 0));
  const goNext = () => setIdx((p) => (labels.length ? (p + 1) % labels.length : 0));

  const currentLabel = labels[idx] || "";
  // mỗi label chỉ hiển thị frame đầu tiên
  const currentFrameFlat = currentLabel ? (data[currentLabel]?.[0] || []) : [];

  return (
    <div style={{ height: "100dvh", display: "grid", gridTemplateRows: "auto 1fr" }}>
      <div style={{ padding: 12, display: "flex", gap: 8, alignItems: "center" }}>
        <button onClick={goPrev}>⬅ Trước</button>
        <button onClick={goNext}>Sau ➡</button>
        <div style={{ marginLeft: 8 }}>
          <b>Label:</b> {currentLabel || "(đang tải...)"}
        </div>
      </div>
      <FormXemDongtac3D label={currentLabel} frameFlat={currentFrameFlat} />
    </div>
  );
}
