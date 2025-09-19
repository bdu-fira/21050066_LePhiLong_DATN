"use client";

import React from "react";
import PoseViewerAR from "./PoseViewerAR";
import PoseViewer3D from "./poseViewer3D";
import { getExamples } from "../api/getExamples";
import { getFile } from "../api/getFile";

type Tab = "3D" | "AR";

export default function PoseSearch() {
  const [items, setItems] = React.useState<any[]>([]);
  const [q, setQ] = React.useState("");
  const [selected, setSelected] = React.useState<any | null>(null);
  const [tab, setTab] = React.useState<Tab>("AR");

  // 3D
  const [src3D, setSrc3D] = React.useState<string | null>(null);
  const [loading3D, setLoading3D] = React.useState(false);
  const urlRef3D = React.useRef<string | null>(null);

  // AR
  const [arPath, setArPath] = React.useState<string | null>(null);

  // detect mobile (set on client to tránh mismatch SSR)
  const [isMobile, setIsMobile] = React.useState(false);
  React.useEffect(() => {
    setIsMobile(/Android|iPhone|iPad|iPod|Mobi/i.test(navigator.userAgent));
  }, []);

  // fetch danh sách
  React.useEffect(() => {
    let mounted = true;
    (async () => {
      const res = await getExamples();
      if (mounted && res?.isSuccess) setItems(res.data || []);
    })();
    return () => { mounted = false; };
  }, []);

  // cleanup 3D url
  React.useEffect(() => {
    return () => { if (urlRef3D.current) URL.revokeObjectURL(urlRef3D.current); };
  }, []);

  const load3D = React.useCallback(async (path: string) => {
    try {
      setLoading3D(true);
      const resp = await getFile({ path });
      const blob =
        resp instanceof Blob
          ? resp
          : (resp as any)?.data instanceof Blob
          ? (resp as any).data
          : typeof (resp as any)?.blob === "function"
          ? await (resp as any).blob()
          : null;

      if (!blob) { setSrc3D(null); return; }
      if (urlRef3D.current) URL.revokeObjectURL(urlRef3D.current);
      const url = URL.createObjectURL(blob);
      urlRef3D.current = url;
      setSrc3D(url);
    } finally {
      setLoading3D(false);
    }
  }, []);

  // chọn item
  const onOpen = (item: any) => {
    setSelected(item);
    if (tab === "AR") {
      setArPath(item?.path || null);
    } else if (item?.path) {
      load3D(item.path);
    }
  };

  const switchTo3D = () => {
    setTab("3D");
    load3D(selected.path || null);
  };
  const switchToAR = () => {
    setTab("AR");
    setArPath(selected?.path || null);
  };

  const filtered = items.filter((x) =>
    String(x.name || "").toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Danh sách + search */}
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
              <div className="font-xs">{it.name}</div>
            </button>
          ))}
        </div>

        {/* Viewer + tabs */}
        <div className="col-span-1 lg:col-span-2 flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-neutral-500">
              {loading3D
                ? "Đang tải mô hình..."
                : selected
                ? `Đang chọn: ${selected?.name || ""}`
                : "Chọn một động tác để xem."}
            </div>
            <div className="flex items-center gap-2">
              <button
                className={`px-3 py-1 text-sm ${tab === "3D" ? "bg-black text-white" : "bg-white"}`}
                onClick={switchTo3D}
                disabled={!selected}
              >
                3D
              </button>
              <button
                className={`px-3 py-1 text-sm ${tab === "AR" ? "bg-black text-white" : "bg-white"}`}
                onClick={switchToAR}
                disabled={!selected}
              >
                AR
              </button>
            </div>
          </div>

          <div className="w-full">
            {tab === "3D" && (
              src3D ? (
                <PoseViewer3D src={src3D} />
              ) : (
                <div className="h-[65vh] grid place-items-center border rounded">
                  <div className="text-sm text-neutral-500">
                    {selected
                      ? (loading3D ? "Đang tải mô hình..." : "Nhấn 3D để tải mô hình.")
                      : "Chọn một động tác để xem."}
                  </div>
                </div>
              )
            )}

            {tab === "AR" && (
              <>
                {isMobile &&
                  <PoseViewerAR path={arPath} height="65vh" />
                }
                {!isMobile && (
                  <div className="mt-2 p-2 rounded border bg-white">
                    <div className="text-sm mb-2">
                      In/hiển thị <b>marker Hiro</b> và đặt trước camera để nhận diện:
                    </div>
                    <a
                      href="https://arprojectsdemo.netlify.app/markers/hiro.png"
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 underline text-sm mb-2 inline-block"
                    >
                      Mở ảnh kích thước lớn
                    </a>
                    <div className="border rounded overflow-hidden">
                      <img
                        src="https://arprojectsdemo.netlify.app/markers/hiro.png"
                        alt="Hiro marker"
                        className="w-full h-auto block max-w-[700px] mx-auto"
                      />
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
