// features/train/forms/formTrain.tsx
"use client";

import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { useState, useRef, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "@/lib/utils";
import { trainPoseClassifier } from "@/lib/ModelTrainer";
import { extract, extractFromImages, initPoseExtractor } from "@/lib/PoseExtractor";
import { trainSchema } from "../schemas/formHuanluyenBaitapSchema";
import FormCapnhatTieuchi from "./formCapnhatTieuchi";
import { updateModel } from "../api/updateModel";

export default function FormHuanluyenMohinh(props: any) {
  const form = useForm<any>({
    resolver: zodResolver(trainSchema),
    defaultValues: {
      id: props.id,
      name: props?.exercise?.name || "",
      labelIDs: [props.positions[0].id, props.positions[1].id, props.positions[2].id],
      imageLabels: [
        { label: props.positions[0].name, images: [] },
        { label: props.positions[1].name, images: [] },
        { label: props.positions[2].name, images: [] },
      ],
      lastTrainResult: props?.exercise?.lastTrainResult || null,
      path: null,
    },
    mode: "onChange",
  });

  const { fields: labelFields, update: updateLabel } = useFieldArray({
    control: form.control,
    name: "imageLabels",
  });

  const watchedImageLabels: any[] = useWatch({ control: form.control, name: "imageLabels" });
  const watchedAcc = useWatch({ control: form.control, name: "lastTrainResult" });
  const watchedLabelIDs = useWatch({ control: form.control, name: "labelIDs" });

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

  const [modelWeights, setModelWeights] = useState<any>(null);
  const [modelJson, setModelJson] = useState<any>(null);
  const isTrained = !!modelJson && !!modelWeights;

  // Lưu mô hình (API)
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setPoseExtractor(await initPoseExtractor());
      } catch {
        setFormStatus("Không thể khởi tạo Pose extractor. Hãy tải lại trang.");
      }
    })();
  }, []);

  useEffect(() => {
    setEditingLabels(labelFields.map((l: any) => l.label));
  }, [labelFields]);

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

  async function handleTrain() {
    const data = form.getValues();
    setFormStatus("");
    setTrainResultMsg(null);
    setSaving(false);
    setSaveMsg(null);
    setTraining(true);

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
      const { valAcc, weightsFile, modelJson } = await trainPoseClassifier(poseData);
      console.log(weightsFile)

      // lưu accuracy và trạng thái đã huấn luyện
      form.setValue("lastTrainResult", valAcc, { shouldDirty: true, shouldValidate: true });
      setModelWeights(weightsFile || null);
      setModelJson(modelJson || null);

      if (valAcc < 0.7) {
        setTrainResultMsg(`Độ chính xác thấp: ${(valAcc * 100).toFixed(2)}%. Hãy bổ sung/điều chỉnh dữ liệu.`);
      } else {
        setTrainResultMsg(`Huấn luyện đạt yêu cầu: ${(valAcc * 100).toFixed(2)}%`);
      }
      setFormStatus("Huấn luyện xong!");
    } catch (err: any) {
      setFormStatus("Có lỗi: " + (err?.message || String(err)));
      setTrainResultMsg(null);
      setModelWeights(null);
      setModelJson(null);
    }
    setTraining(false);

    function doneWithError(msg: string) {
      setFormStatus(msg);
      setTraining(false);
    }
  }

  async function handleSave() {
    if (!isTrained) {
      setSaveMsg("Bạn cần huấn luyện mô hình trước khi lưu.");
      return;
    }
    const data = form.getValues();
    setSaveMsg(null);
    setSaving(true);
    try {
      const res = await updateModel({
        id: props.id,
        accuracy: data.lastTrainResult ?? undefined,
        labels: JSON.stringify(watchedLabelIDs.reduce((acc: any, key: any, index: any) => {
          acc[key] = watchedImageLabels[index].label;
          return acc;
        }, {})),
        modelJson: modelJson || undefined,
        modelWeights: modelWeights || undefined,
      });

      setSaveMsg(res.statusCode === 200 ? "Lưu mô hình thành công." : (res.message || "Có lỗi khi lưu mô hình."));
    } catch (e: any) {
      setSaveMsg(e?.message || "Có lỗi khi lưu mô hình.");
    }
    setSaving(false);
  }

  return (
    <div className="w-full flex flex-row bg-white">
      {/* CỘT TRÁI: 3 label cố định + Train */}
      <div className="flex-1 p-4 md:p-6 overflow-auto border-r flex flex-col">
        {/* chặn submit mặc định để Enter không gọi gì cả */}
        <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
          <h2 className="text-primary font-bold text-lg underline">Huấn luyện mô hình</h2>
          <p>Lưu ý:</p>
          <p>- Hãy upload các động tác của bài tập theo thứ tự label.</p>
          <p>- Thứ tự label sẽ giúp hệ chuyên gia quyết định xem người tập đang tập đúng thứ tự các động tác hay không.</p>

          {/* Trạng thái mô hình */}
          <div className="flex items-center gap-3">
            {typeof watchedAcc === "number" && (
              <div className="text-sm text-green-600">
                Accuracy hiện tại: {(watchedAcc * 100).toFixed(2)}%
              </div>
            )}
            <span
              className={cn(
                "text-xs px-2 py-1 rounded",
                isTrained ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
              )}
              title={isTrained ? "Đã huấn luyện trong phiên này" : "Chưa huấn luyện trong phiên này"}
            >
              {isTrained ? "ĐÃ HUẤN LUYỆN" : "CHƯA HUẤN LUYỆN"}
            </span>
          </div>

          <div className="flex flex-col gap-4">
            {labelFields.map((label: any, labelIdx: number) => (
              <div
                key={label.id}
                className={cn(
                  "border rounded-lg p-3",
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
                    disabled={training || saving}
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
                    disabled={training || saving}
                    onClick={(e) => e.stopPropagation()}
                  />
                </label>

                <div className="text-xs text-muted-foreground">Cần từ 10 đến 50 ảnh cho mỗi label.</div>
                <hr />
                <FormCapnhatTieuchi id={props.id} positionID={props.positions[labelIdx].id} evaluationCriteria={props.positions[labelIdx].evaluationCriteria} />
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between mt-4">
            <button
              type="button"
              className="w-fit px-4 mt-2 bg-primary text-white py-2 rounded hover:bg-primary/90 disabled:opacity-50"
              onClick={handleTrain}
              disabled={training || saving}
            >
              {training ? "Đang xử lý..." : "Huấn luyện mô hình"}
            </button>

            <button
              type="button"
              className="w-fit px-4 mt-2 bg-primary text-white py-2 rounded hover:bg-primary/90 disabled:opacity-50"
              onClick={handleSave}
              disabled={!isTrained} // chặn lưu nếu chưa huấn luyện
            >
              {saving ? "Đang lưu..." : "Lưu mô hình"}
            </button>
          </div>
        </form>

        <div className="mt-4 text-destructive">{formStatus}</div>
        {trainResultMsg && <div className="text-green-600 font-semibold mt-2">{trainResultMsg}</div>}
        {saveMsg && <div className="text-primary font-semibold mt-2">{saveMsg}</div>}
      </div>

      {/* CỘT PHẢI */}
      <div className="bg-white p-4 overflow-auto max_h-full border-l h-full flex flex-col">
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
