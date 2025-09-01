"use client";

import React from "react";
import PoseViewer3D from "./poseViewer3D";
import PoseViewerAR from "./poseViewerAR";
import { getExamples } from "../api/getExamples";
import { getFile } from "../api/getFile";

export default function PoseSearch() {
  const [items, setItems] = React.useState<any[]>([]);
  const [q, setQ] = React.useState("");
  const [src, setSrc] = React.useState<string | null>(null);
  const [selected, setSelected] = React.useState<any | null>(null);
  const urlRef = React.useRef<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [tab, setTab] = React.useState<"3D" | "AR">("3D");

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      const res = await getExamples();
      if (mounted && res?.isSuccess) setItems(res.data || []);
    })();
    return () => { mounted = false; };
  }, []);

  // cleanup objectURL khi đổi model
  React.useEffect(() => {
    return () => {
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
      urlRef.current = null;
    };
  }, []);

  const onOpen = async (item: any) => {
    try {
      setLoading(true);
      setSelected(item);
      // Lấy file pose bằng API hiện có
      const blob = await getFile({ path: item.path });
      if (!(blob instanceof Blob)) return;

      // Tạo blob URL cho viewer/AR
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
      const url = URL.createObjectURL(blob);
      urlRef.current = url;
      setSrc(url);
      setTab("3D"); // mặc định mở ở 3D
    } finally {
      setLoading(false);
    }
  };

  const filtered = items.filter((x) =>
    String(x.name || "").toLowerCase().includes(q.toLowerCase())
  );

  // tiện kiểm tra đuôi file khi render AR
  const ext = String(selected?.path || "").toLowerCase();

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Danh sách bài tập */}
        <div className="col-span-1 border rounded p-3 space-y-2 max-h-[70vh] overflow-auto">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Tìm động tác..."
            className="border rounded px-3 py-2 w-full"
          />
          {filtered.length === 0 && (
            <div className="text-sm text-neutral-500 px-1 py-2">Không có dữ liệu</div>
          )}
          {filtered.map((it) => (
            <button
              key={it.id}
              onClick={() => onOpen(it)}
              className={`w-full text-left px-3 py-2 rounded border mb-1 hover:bg-neutral-100 ${
                selected?.id === it.id ? "bg-neutral-50 border-neutral-400" : ""
              }`}
            >
              <div className="font-medium">{it.name}</div>
              <div className="text-[10px] text-neutral-400 break-all">{it.path}</div>
            </button>
          ))}
        </div>

        {/* Viewer 3D / AR */}
        <div className="col-span-1 lg:col-span-2 flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-neutral-500">
              {loading
                ? "Đang tải mô hình..."
                : src
                ? `Đang xem: ${selected?.name || ""}`
                : "Chọn một động tác để xem."}
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-1 border rounded overflow-hidden">
              <button
                className={`px-3 py-1 text-sm ${tab === "3D" ? "bg-black text-white" : "bg-white"}`}
                onClick={() => setTab("3D")}
                disabled={!src}
              >
                3D
              </button>
              <button
                className={`px-3 py-1 text-sm ${tab === "AR" ? "bg-black text-white" : "bg-white"}`}
                onClick={() => setTab("AR")}
                disabled={!src}
              >
                AR
              </button>
            </div>
          </div>

          <div className="w-full">
            {tab === "3D" && <PoseViewer3D src={src} />}
            {tab === "AR" && (
              <PoseViewerAR
                src={src}
                marker="hiro"
                // Nếu file không phải .glb/.gltf, AR sẽ hiển thị placeholder (box/primitive)
                // Gợi ý chiều cao khung AR linh hoạt trên mobile
                height="65vh"
                scale={ext.endsWith(".glb") || ext.endsWith(".gltf") ? "0.2 0.2 0.2" : "0.5 0.5 0.5"}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
