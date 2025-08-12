// features/train/forms/formTrain.tsx
"use client";

import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { useState, useRef, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "@/lib/utils";
import { trainPoseClassifier } from "@/lib/ModelTrainer";
import { extract, extractFromImages, initPoseExtractor } from "@/lib/PoseExtractor";
import { trainSchema } from "../schemas/formTrainSchema";

export default function FormTrain() {
  // Dùng any cho form data để đơn giản hóa
  const form = useForm<any>({
    resolver: zodResolver(trainSchema),
    defaultValues: {
      actionName: "train",
      imageLabels: [
        { label: "Label 1", images: [] },
        { label: "Label 2", images: [] },
        { label: "Label 3", images: [] },
      ],
    },
    mode: "onChange",
  });

  const { fields: labelFields, update: updateLabel } = useFieldArray({
    control: form.control,
    name: "imageLabels",
  });

  const watchedImageLabels: any[] = useWatch({ control: form.control, name: "imageLabels" });

  const [poseExtractor, setPoseExtractor] = useState<any>();
  const [activeLabelIdx, setActiveLabelIdx] = useState(0);
  const [editingLabels, setEditingLabels] = useState<any[]>([]);
  const imgRef = useRef<any>(null);
  const canvasRef = useRef<any>(null);

  const [selectedImage, setSelectedImage] = useState<any>(null);
  const [selectedKeypoints, setSelectedKeypoints] = useState<any>(null);
  const [keypointCache, setKeypointCache] = useState<any>({});
  const [formStatus, setFormStatus] = useState<string>("");
  const [trainResultMsg, setTrainResultMsg] = useState<string | null>(null);
  const [training, setTraining] = useState(false);

  console.log(form.formState.errors)

  // Khởi tạo PoseExtractor
  useEffect(() => {
    (async () => {
      try {
        setPoseExtractor(await initPoseExtractor());
      } catch {
        setFormStatus("Không thể khởi tạo Pose extractor. Hãy tải lại trang.");
      }
    })();
  }, []);

  // Sync tên label vào state chỉnh sửa
  useEffect(() => {
    setEditingLabels(labelFields.map((l: any) => l.label));
  }, [labelFields]);

  // Vẽ skeleton overlay
  useEffect(() => {
    if (!selectedImage || !selectedKeypoints || !imgRef.current || !canvasRef.current) return;
    const imgElem = imgRef.current as HTMLImageElement;
    const canvas = canvasRef.current as HTMLCanvasElement;
    const w = imgElem.clientWidth;
    const h = imgElem.clientHeight;
    canvas.width = w;
    canvas.height = h;

    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, w, h);
    const kp = selectedKeypoints.map(([x, y]: any) => [x * w, y * h]);

    const connections = [
      [11, 13], [13, 15], [15, 17], [15, 19], [15, 21], [17, 19],
      [12, 14], [14, 16], [16, 18], [16, 20], [16, 22], [18, 20],
      [11, 12], [23, 24], [11, 23], [12, 24], [23, 25], [25, 27],
      [27, 29], [29, 31], [27, 31], [24, 26], [26, 28], [28, 30],
      [30, 32], [28, 32],
    ];

    ctx.lineWidth = 3;
    ctx.strokeStyle = "#10b981";
    connections.forEach(([i, j]) => {
      if (kp[i] && kp[j]) {
        ctx.beginPath();
        ctx.moveTo(kp[i][0], kp[i][1]);
        ctx.lineTo(kp[j][0], kp[j][1]);
        ctx.stroke();
      }
    });
    kp.forEach(([x, y]: any) => {
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, 2 * Math.PI);
      ctx.fillStyle = "#ef4444";
      ctx.fill();
    });
  }, [selectedImage, selectedKeypoints]);

  // Chọn ảnh + rút trích 1 ảnh (cache)
  function handleSelectImage(img: any) {
    setSelectedImage({ url: img.preview, label: img.customName, file: img.file });
    if (keypointCache[img.customName]) {
      setSelectedKeypoints(keypointCache[img.customName]);
    } else {
      extract(img.file, poseExtractor)
        .then((kp: any) => {
          if (kp) {
            setKeypointCache((c: any) => ({ ...c, [img.customName]: kp }));
            setSelectedKeypoints(kp);
          } else {
            setSelectedKeypoints(null);
          }
        })
        .catch(() => setSelectedKeypoints(null));
    }
  }

  // Upload ảnh cho 1 label
  function handleImageUpload(e: any, labelIdx: number) {
    const files = e.target.files;
    if (!files?.length) return;

    const existing = watchedImageLabels[labelIdx]?.images || [];
    const remaining = 50 - existing.length;
    const incoming = Array.from(files).slice(0, Math.max(0, remaining));

    const now = Date.now();
    const newImages = incoming.map((file: any, i: number) => ({
      file,
      preview: URL.createObjectURL(file),
      customName: `${now}_${i + 1}`,
    }));

    form.setValue(`imageLabels.${labelIdx}.images`, [...existing, ...newImages], {
      shouldDirty: true,
      shouldValidate: true,
    });

    if (files.length > incoming.length) {
      setFormStatus("Mỗi label tối đa 50 ảnh. Một số ảnh đã không được thêm.");
    }
    e.target.value = "";
  }

  function handleRemoveImage(imgIdx: number, labelIdx: number) {
    const images = watchedImageLabels[labelIdx]?.images || [];
    const next = [...images];
    next.splice(imgIdx, 1);
    form.setValue(`imageLabels.${labelIdx}.images`, next, { shouldDirty: true, shouldValidate: true });
  }

  // Train – chỉ gọi lại extractFromImages + trainPoseClassifier
  async function handleTrain(data: any) {
    setFormStatus("");
    setTrainResultMsg(null);
    setTraining(true);

    // Ràng buộc runtime theo use case: đúng 3 label, 10–50 ảnh mỗi label, tên label hợp lệ
    const groups = data.imageLabels || [];
    if (groups.length !== 3) {
      setFormStatus("Cần có đúng 03 label để huấn luyện.");
      setTraining(false);
      return;
    }
    for (const g of groups) {
      const name = (g.label || "").trim();
      const count = (g.images || []).length;
      if (!name) return doneWithError("Tên label không được trống.");
      if (name.length > 255) return doneWithError("Tên label không quá 255 ký tự.");
      if (count < 10 || count > 50) return doneWithError(`Label "${name}" cần từ 10 đến 50 ảnh (hiện ${count}).`);
    }

    const allImages = groups.flatMap((g: any) =>
      (g.images || []).map((img: any) => ({ file: img.file, label: g.label }))
    );

    try {
      setFormStatus("Đang rút trích keypoints từ ảnh...");
      const poseData = await extractFromImages(allImages, poseExtractor);

      setFormStatus("Đang huấn luyện model...");
      const { valAcc } = await trainPoseClassifier(poseData);

      if (valAcc < 0.7) {
        setTrainResultMsg(`Độ chính xác thấp: ${(valAcc * 100).toFixed(2)}%. Hãy bổ sung/điều chỉnh dữ liệu.`);
      } else {
        setTrainResultMsg(`Huấn luyện đạt yêu cầu: ${(valAcc * 100).toFixed(2)}%`);
      }
      setFormStatus("Huấn luyện xong!");
    } catch (err: any) {
      setFormStatus("Có lỗi: " + (err?.message || String(err)));
      setTrainResultMsg(null);
    }
    setTraining(false);

    function doneWithError(msg: string) {
      setFormStatus(msg);
      setTraining(false);
    }
  }

  return (
    <div className="w-full h-full flex flex-row bg-white overflow-hidden">
      {/* CỘT TRÁI: 3 label cố định + Train */}
      <div className="flex-1 p-4 md:p-6 overflow-auto border-r h-full flex flex-col">
        <form onSubmit={form.handleSubmit(handleTrain)} className="space-y-6">
          <h2 className="text-primary font-bold text-lg underline">Huấn luyện mô hình</h2>

          <div className="flex flex-col gap-4">
            {labelFields.map((label: any, labelIdx: number) => (
              <div
                key={label.id}
                className={cn(
                  "border rounded-lg p-3 bg-muted w-fit",
                  activeLabelIdx === labelIdx && "ring-2 ring-primary"
                )}
                tabIndex={0}
              >
                <div className="flex items-center justify-between mb-2" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="text"
                    value={editingLabels[labelIdx] ?? ""}
                    onChange={(e) => {
                      const value = e.target.value;
                      setEditingLabels((vals) => {
                        const next = [...vals];
                        next[labelIdx] = value;
                        return next;
                      });
                    }}
                    onBlur={() => {
                      updateLabel(labelIdx, { ...labelFields[labelIdx], label: editingLabels[labelIdx] ?? "" });
                    }}
                    onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
                    placeholder={`Tên label ${labelIdx + 1}`}
                    className="border rounded p-1 px-2 text-sm w-44 font-semibold"
                    disabled={training}
                  />
                  <button
                    type="button"
                    className="text-white border bg-primary rounded px-2 py-1 ml-2"
                    onClick={() => setActiveLabelIdx(labelIdx)}
                    disabled={activeLabelIdx === labelIdx}
                    title="Chọn label này"
                  >
                    Chọn
                  </button>
                </div>
                <label className="bg-green-700 p-2 rounded text-white mb-2 w-fit block">
                  Tải hình lên
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, labelIdx)}
                    className="mb-2 hidden"
                    disabled={training}
                    onClick={(e) => e.stopPropagation()}
                  />
                </label>

                <div className="text-xs text-muted-foreground">Cần từ 10 đến 50 ảnh cho mỗi label.</div>
              </div>
            ))}
          </div>

          <button
            type="submit"
            className="w-fit px-4 mt-2 bg-primary text-white py-2 rounded hover:bg-primary/90 disabled:opacity-50"
            disabled={training}
          >
            {training ? "Đang xử lý..." : "Huấn luyện mô hình"}
          </button>
        </form>

        <div className="mt-4 text-destructive">{formStatus}</div>
        {trainResultMsg && <div className="text-green-600 font-semibold mt-2">{trainResultMsg}</div>}
      </div>

      {/* CỘT GIỮA: Ảnh lớn + canvas overlay skeleton */}
      <div className="flex flex-col items-center justify-start min-w-[400px] max-w-[430px] w-[22vw] h-full border-x pt-8">
        <div className="w-full flex items-center justify-center mb-6 min-h-[240px]">
          {selectedImage ? (
            <div className="relative w-[400px] max-w-full">
              <img ref={imgRef} src={selectedImage.url} alt={selectedImage.label} className="w-full block rounded-lg bg-gray-200" />
              <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full pointer-events-none" />
            </div>
          ) : (
            <div className="w-full h-[220px] flex items-center justify-center bg-gray-100 rounded border text-gray-400">
              <span>Chọn ảnh để xem lớn</span>
            </div>
          )}
        </div>
      </div>

      {/* CỘT PHẢI: Danh sách ảnh của label đang chọn */}
      <div className="bg-white p-4 overflow-auto max-h-full border-l h-full flex flex-col">
        <h3 className="font-semibold mb-3">Ảnh của label đã chọn</h3>
        {activeLabelIdx < 0 || !watchedImageLabels?.[activeLabelIdx] ? (
          <div className="text-muted-foreground text-sm">Chọn label ở bên trái để xem hình.</div>
        ) : (() => {
          const images = watchedImageLabels?.[activeLabelIdx]?.images || [];
          if (images.length === 0) return <div className="text-xs text-muted-foreground">Chưa có hình cho label này.</div>;
          return images.map((img: any, imgIdx: number) => (
            <div key={imgIdx} className="flex items-center gap-3 mb-2 p-2 border rounded group">
              <img
                src={img.preview}
                alt={img.customName}
                className="w-20 object-cover rounded cursor-pointer"
                onClick={() => handleSelectImage(img)}
              />
              <div className="flex-1">
                <div className="text-xs font-medium">{img.customName}</div>
              </div>
              <button
                type="button"
                className="text-red-600 text-xl font-bold px-2"
                onClick={() => handleRemoveImage(imgIdx, activeLabelIdx)}
                title="Xóa ảnh"
              >
                ✕
              </button>
            </div>
          ));
        })()}
      </div>
    </div>
  );
}
