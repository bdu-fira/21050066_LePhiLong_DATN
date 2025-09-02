"use client";

import React from "react";
import PoseViewer3D from "./poseViewer3D";
import PoseViewerAR from "./poseViewerAR";
import { getExamples } from "../api/getExamples";
import { getFile } from "../api/getFile";

type Tab = "3D" | "AR";
type ARFormat = "fbx" | "gltf";

export default function PoseSearch() {
  const [items, setItems] = React.useState<any[]>([]);
  const [q, setQ] = React.useState("");
  const [selected, setSelected] = React.useState<any | null>(null);

  // Nguồn cho viewer 3D (hiện vẫn FBX – giữ nguyên viewer 3D)
  const [src3D, setSrc3D] = React.useState<string | null>(null);

  // Nguồn + định dạng cho AR
  const [srcAR, setSrcAR] = React.useState<string | null>(null);
  const [arFormat, setArFormat] = React.useState<ARFormat>("fbx");
  const [arGltfBase, setArGltfBase] = React.useState<string | null>(null);

  const [tab, setTab] = React.useState<Tab>("3D");
  const [loading3D, setLoading3D] = React.useState(false);
  const [arSessionKey, setArSessionKey] = React.useState(0); // remount AR mỗi lần mở

  const urlRef3D = React.useRef<string | null>(null);
  const urlRefAR = React.useRef<string | null>(null);

  // Load danh sách bài tập
  React.useEffect(() => {
    let mounted = true;
    (async () => {
      const res = await getExamples();
      if (mounted && res?.isSuccess) setItems(res.data || []);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // Cleanup blob URL khi unmount
  React.useEffect(() => {
    return () => {
      if (urlRef3D.current) URL.revokeObjectURL(urlRef3D.current);
      if (urlRefAR.current) URL.revokeObjectURL(urlRefAR.current);
    };
  }, []);

  // Mở một bài tập để xem 3D (FBX như hiện trạng)
  const onOpen = async (item: any) => {
    try {
      setLoading3D(true);
      setSelected(item);
      setTab("3D");

      // reset AR nguồn khi đổi bài tập
      setSrcAR(null);
      setArGltfBase(null);
      if (urlRefAR.current) {
        URL.revokeObjectURL(urlRefAR.current);
        urlRefAR.current = null;
      }

      // Giữ nguyên: ưu tiên lấy FBX từ backend để xem 3D
      const blob = await getFile({ path: item.path });
      if (blob instanceof Blob) {
        if (urlRef3D.current) URL.revokeObjectURL(urlRef3D.current);
        const url = URL.createObjectURL(blob);
        urlRef3D.current = url;
        setSrc3D(url);
      } else {
        setSrc3D(null);
      }
    } finally {
      setLoading3D(false);
    }
  };

  // Vào AR: ưu tiên GLTF (instruction.gltf + .bin), nếu không có thì fallback FBX (dùng blob sẵn có)
  const enterAR = async () => {
    if (!selected) return;

    const API = process.env.NEXT_PUBLIC_BACKEND_API_URL!;
    const uploadsBase = `/uploads/exercise/${selected.id}/`; // <- id của bài tập
        // Chuẩn hoá path → xác định thư mục chứa file
    const original = String(selected.path || "");
    const normalized = original.replace(/\\/g, "/");
    const baseDir = normalized.replace(/\/[^/]*$/, "/"); // bỏ tên file, giữ dấu '/'

    // Thử GLTF: /exercise/getFile?path=<baseDir>/instruction.gltf
    const gltfPath = `${baseDir}instruction.gltf`;
    const gltfUrl = `${API}/exercise/getFile?path=${encodeURIComponent(uploadsBase + "instruction.gltf")}`;
    let hasGLTF = false;
    try {
      const resp = await fetch(gltfUrl, { method: "HEAD", credentials: "include", cache: "no-store" });
      hasGLTF = resp.ok;
      if (!hasGLTF) {
        const r2 = await fetch(gltfUrl, { method: "GET", credentials: "include", cache: "no-store" });
        hasGLTF = r2.ok;
      }
    } catch {
      hasGLTF = false;
    }

    if (hasGLTF) {
      // Dùng GLTF + chỉ cho loader biết base để tải .bin/texture
      setArFormat("gltf");
      setSrcAR(gltfUrl);
      setArGltfBase(uploadsBase); // đổi state tên thành gltfUploadsBase nếu bạn đang lưu
      setArSessionKey((k) => k + 1);
      setTab("AR");
      return;
    }

    // Không có GLTF → fallback FBX: dùng blob 3D
    if (!src3D) return; // chưa có gì để hiển thị
    setArFormat("fbx");
    if (urlRefAR.current) URL.revokeObjectURL(urlRefAR.current);
    const reuse = src3D;
    urlRefAR.current = reuse;
    setSrcAR(reuse);
    setArGltfBase(null);

    setArSessionKey((k) => k + 1);
    setTab("AR");
  };

  const filtered = items.filter((x) =>
    String(x.name || "").toLowerCase().includes(q.toLowerCase())
  );

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
              {loading3D
                ? "Đang tải mô hình..."
                : src3D
                ? `Đang xem: ${selected?.name || ""}`
                : "Chọn một động tác để xem."}
            </div>
            <div className="flex items-center gap-2">
              <button
                className={`px-3 py-1 text-sm ${
                  tab === "3D" ? "bg-black text-white" : "bg-white"
                }`}
                onClick={() => setTab("3D")}
                disabled={!src3D}
              >
                3D
              </button>
              <button
                className={`px-3 py-1 text-sm ${
                  tab === "AR" ? "bg-black text-white" : "bg-white"
                }`}
                onClick={enterAR}
                // Cho phép AR ngay cả khi không có src3D (bài chỉ có GLTF)
                disabled={!selected}
              >
                AR
              </button>
            </div>
          </div>

          <div className="w-full">
            {tab === "3D" && <PoseViewer3D src={src3D} />}

            {tab === "AR" && (
              <PoseViewerAR
                key={arSessionKey}     // remount để không chồng scene/model
                src={srcAR}
                format={arFormat}      // "fbx" hoặc "gltf"
                height="65vh"
                onExit={() => {
                  setTab("3D");
                  setArSessionKey((k) => k + 1); // lần sau vào là scene mới
                }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
