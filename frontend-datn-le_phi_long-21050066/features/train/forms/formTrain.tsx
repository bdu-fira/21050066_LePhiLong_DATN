'use client';

import { useForm, useFieldArray, useWatch } from 'react-hook-form';
import { useState, useRef, useEffect } from 'react';
import { any, z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { cn } from '@/lib/utils';
import { trainPoseClassifier } from '@/lib/ModelTrainer';
import { trainSchema } from '../schemas/formTrainSchema';
import { extract, extractFromImages, initPoseExtractor } from '@/lib/PoseExtractor';
import FormExpert from './formExpert';

type FormData = z.infer<typeof trainSchema>;

export default function FormTrain() {
  const form = useForm<FormData>({
    resolver: zodResolver(trainSchema),
    defaultValues: {
      actionName: '',
      levels: [{ reps: 1, sets: 1 }],
      imageLabels: [],
    },
    mode: 'onChange',
  });

  const [poseExtractor, setPoseExtractor] = useState<any>()

  const watchedImageLabels = useWatch({ control: form.control, name: 'imageLabels' });
  const { fields: levelFields, append: addLevel, remove: removeLevel } = useFieldArray({
    control: form.control, name: 'levels',
  });
  const { fields: labelFields, append: addLabel, remove: removeLabel, update: updateLabel } = useFieldArray({
    control: form.control, name: 'imageLabels',
  });

  const [activeLabelIdx, setActiveLabelIdx] = useState(-1);
  const [newLabel, setNewLabel] = useState('');
  const [editingLabels, setEditingLabels] = useState<string[]>([]);
  const labelInputRef = useRef<HTMLInputElement>(null);

  const [selectedImage, setSelectedImage] = useState<{ url: string, label?: string, file?: File } | null>(null);
  const [selectedKeypoints, setSelectedKeypoints] = useState<number[][] | null>(null);
  const [keypointCache, setKeypointCache] = useState<Record<string, number[][]>>({});
  const imgRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [formStatus, setFormStatus] = useState<string>('');
  const [trainResultMsg, setTrainResultMsg] = useState<string | null>(null);
  const [training, setTraining] = useState(false);

  useEffect(() => {
    const init = async () => {
      setPoseExtractor(await initPoseExtractor())
    }
    init()
  }, [])

  useEffect(() => {
    setEditingLabels(labelFields.map(l => l.label));
  }, [labelFields]);

  useEffect(() => {
    if (!selectedImage || !selectedKeypoints || !imgRef.current || !canvasRef.current) return;
    const imgElem = imgRef.current;
    const canvas = canvasRef.current;
    const w = imgElem.clientWidth, h = imgElem.clientHeight;
    canvas.width = w; canvas.height = h;
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, w, h);
    const kp = selectedKeypoints.map(([x, y]) => [x * w, y * h]);
    const connections = [
      [11, 13], [13, 15], [15, 17], [15, 19], [15, 21], [17, 19],
      [12, 14], [14, 16], [16, 18], [16, 20], [16, 22], [18, 20],
      [11, 12], [23, 24], [11, 23], [12, 24], [23, 25], [25, 27],
      [27, 29], [29, 31], [27, 31], [24, 26], [26, 28], [28, 30],
      [30, 32], [28, 32]
    ];
    ctx.lineWidth = 3; ctx.strokeStyle = "#10b981";
    connections.forEach(([i, j]) => {
      if (kp[i] && kp[j]) {
        ctx.beginPath();
        ctx.moveTo(kp[i][0], kp[i][1]);
        ctx.lineTo(kp[j][0], kp[j][1]);
        ctx.stroke();
      }
    });
    kp.forEach(([x, y]) => {
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, 2 * Math.PI);
      ctx.fillStyle = "#ef4444";
      ctx.fill();
    });
  }, [selectedImage, selectedKeypoints]);

  // SỬA ĐOẠN NÀY: dùng extract cho 1 ảnh
  function handleSelectImage(img: any) {
    setSelectedImage({ url: img.preview, label: img.customName, file: img.file });
    if (keypointCache[img.customName]) {
      setSelectedKeypoints(keypointCache[img.customName]);
    } else {
      extract(img.file, poseExtractor)
        .then(kp => {
          if (kp) {
            setKeypointCache(cache => ({ ...cache, [img.customName]: kp }));
            setSelectedKeypoints(kp);
          } else {
            setSelectedKeypoints(null);
          }
        })
        .catch(() => setSelectedKeypoints(null));
    }
  }

  function handleAddLevel() {
    if (levelFields.length < 3) addLevel({ reps: 1, sets: 1 });
  }
  function handleRemoveLevel(idx: number) {
    if (levelFields.length > 1) removeLevel(idx);
  }

  function handleAddLabel() {
    const label = newLabel.trim();
    if (!label) return;
    if (watchedImageLabels.some((l: any) => l.label.trim().toLowerCase() === label.toLowerCase())) {
      setFormStatus('Label đã tồn tại.');
      return;
    }
    addLabel({ label, images: [] });
    setActiveLabelIdx(labelFields.length);
    setNewLabel('');
    setTimeout(() => labelInputRef.current?.focus(), 0);
  }
  function handleRemoveLabel(idx: number) {
    removeLabel(idx);
    setTimeout(() => {
      setActiveLabelIdx(prev => prev === idx ? 0 : prev > idx ? prev - 1 : prev);
    }, 0);
  }

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>, labelIdx: number) {
    const files = e.target.files;
    if (!files?.length) return;
    const now = Date.now();
    const newImages = Array.from(files).map((file, i) => ({
      file, preview: URL.createObjectURL(file), customName: `${now}_${i + 1}`,
    }));
    const currentImages = watchedImageLabels[labelIdx]?.images || [];
    form.setValue(`imageLabels.${labelIdx}.images`, [...currentImages, ...newImages], { shouldDirty: true });
    form.trigger('imageLabels');
    e.target.value = '';
  }
  function handleRemoveImage(imgIdx: number, labelIdx: number) {
    const images = watchedImageLabels[labelIdx]?.images || [];
    const newImages = [...images];
    newImages.splice(imgIdx, 1);
    form.setValue(`imageLabels.${labelIdx}.images`, newImages, { shouldDirty: true });
    form.trigger('imageLabels');
  }

  // SỬA ĐOẠN NÀY: dùng extractFromImages cho nhiều ảnh
  async function handleTrain(data: FormData) {
    setFormStatus('');
    setTraining(true);
    setTrainResultMsg(null);

    const allImages = data.imageLabels.flatMap((g: any) =>
      (g.images || []).map((img: any) => ({
        file: img.file,
        label: g.label,
        customName: img.customName ?? '',
      }))
    );

    if (!data.actionName.trim()) {
      setFormStatus('Bạn cần nhập tên động tác.');
      setTraining(false);
      return;
    }

    if (!allImages.length) {
      setFormStatus('Vui lòng upload ảnh và label.');
      setTraining(false);
      return;
    }

    try {
      setFormStatus('Đang rút trích keypoints từ ảnh...');
      const poseData = await extractFromImages(allImages, poseExtractor); // CHỈ SỬA LẠI DÒNG NÀY

      setFormStatus('Đang huấn luyện model...');
      const { model, labelNames, valAcc } = await trainPoseClassifier(poseData);

      if (valAcc < 0.8) {
        setTrainResultMsg(`Dữ liệu sau huấn luyện có vấn đề: val_accuracy = ${(valAcc * 100).toFixed(2)}%`);
      } else {
        setTrainResultMsg(`Huấn luyện đạt yêu cầu: val_accuracy = ${(valAcc * 100).toFixed(2)}%`);
      }
      setFormStatus('Huấn luyện xong!');
    } catch (err: any) {
      setFormStatus('Có lỗi: ' + (err.message || String(err)));
      setTrainResultMsg(null);
    }
    setTraining(false);
  }


  return (
    <div className="w-full h-screen flex flex-row bg-white overflow-hidden">
      {/* FORM BÊN TRÁI */}
      <div className="flex-1 bg-white rounded-none md:rounded-lg p-4 md:p-6 overflow-auto border-r border-muted-foreground/10 h-full flex flex-col">
        <form onSubmit={form.handleSubmit(handleTrain)} className="space-y-6">
          <h2 className="text-primary font-bold text-lg underline">Tạo động tác huấn luyện</h2>
          {/* Tên động tác */}
          <div>
            <label className="font-semibold block mb-1">Tên động tác</label>
            <input
              {...form.register('actionName')}
              placeholder="VD: Squat, Push-up..."
              className="border rounded p-2 w-full"
              disabled={training}
            />
            {form.formState.errors.actionName &&
              <div className="text-red-600 text-sm mt-1">
                {form.formState.errors.actionName.message}
              </div>}
          </div>

          {/* Cấp độ */}
          <div>
            <label className="font-semibold">Các cấp độ</label>
            <div className="flex flex-col gap-4">
              {levelFields.map((level, idx) => (
                <div key={level.id} className="flex flex-wrap gap-2 items-center border-b pb-2">
                  <div className="font-bold text-primary w-24">Cấp độ {idx + 1}</div>
                  <input
                    type="number" min={1}
                    {...form.register(`levels.${idx}.reps`, { valueAsNumber: true })}
                    placeholder="Số rep"
                    className="border rounded p-2 w-20"
                    disabled={training}
                  />
                  <input
                    type="number" min={1}
                    {...form.register(`levels.${idx}.sets`, { valueAsNumber: true })}
                    placeholder="Số set"
                    className="border rounded p-2 w-20"
                    disabled={training}
                  />
                  {levelFields.length > 1 && (
                    <button
                      type="button"
                      className="text-red-600 px-2 py-1 font-semibold rounded hover:bg-red-100"
                      onClick={() => handleRemoveLevel(idx)}
                      disabled={training}
                    >Xóa</button>
                  )}
                </div>
              ))}
              {levelFields.length < 3 && (
                <button
                  type="button"
                  className="mt-2 border px-3 py-1 rounded bg-primary text-white w-fit"
                  onClick={handleAddLevel}
                  disabled={training}
                >Thêm cấp độ</button>
              )}
            </div>
          </div>

          {/* Quản lý nhóm label */}
          <div>
            <label className="font-semibold">Thêm nhóm label cho ảnh training</label>
            <div className="flex items-center gap-2 mb-4 mt-1">
              <input
                ref={labelInputRef}
                value={newLabel}
                onChange={e => setNewLabel(e.target.value)}
                placeholder="Nhập tên nhóm label, vd: Tay trái"
                className="border rounded p-2 w-[220px]"
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddLabel())}
                disabled={training}
              />
              <button
                type="button"
                className="bg-primary text-white rounded px-3 py-2 hover:bg-primary/90"
                onClick={handleAddLabel}
                disabled={training || !newLabel.trim()}
              >Tạo nhóm label</button>
            </div>
            {form.formState.errors.imageLabels &&
              <div className="text-destructive text-sm mb-2">
                {form.formState.errors.imageLabels.message}
              </div>
            }
            <div className="flex flex-col gap-4">
              {labelFields.map((label, labelIdx) => (
                <div
                  key={label.id}
                  className={cn(
                    "border rounded-lg mb-2 p-3 bg-muted  w-fit",
                    activeLabelIdx === labelIdx && "ring-2 ring-primary"
                  )}
                  tabIndex={0}
                >
                  <div className="flex items-center justify-between mb-2" onClick={e => e.stopPropagation()}>
                    <input
                      type="text"
                      value={editingLabels[labelIdx] || ''}
                      onChange={e => {
                        const value = e.target.value;
                        setEditingLabels(vals => {
                          const next = [...vals]; next[labelIdx] = value; return next;
                        });
                      }}
                      onBlur={() => {
                        updateLabel(labelIdx, {
                          ...labelFields[labelIdx],
                          label: editingLabels[labelIdx] || '',
                        });
                      }}
                      onKeyDown={e => {
                        if (e.key === 'Enter') e.currentTarget.blur();
                      }}
                      placeholder="Nhập tên label"
                      className="border rounded p-1 px-2 text-sm w-44 font-semibold"
                      disabled={training}
                    />
                    <button
                      type="button"
                      className="text-white border bg-primary rounded px-2 py-1 mr-2"
                      onClick={() => setActiveLabelIdx(labelIdx)}
                      disabled={activeLabelIdx === labelIdx}
                      title="Chọn nhóm label này"
                    >Chọn</button>
                    <button
                      type="button"
                      className="text-red-600 text-lg font-bold px-2"
                      onClick={ev => { ev.stopPropagation(); handleRemoveLabel(labelIdx); }}
                      title="Xóa label"
                      disabled={training}
                    >✕</button>
                  </div>
                  <input
                    type="file"
                    multiple accept="image/*"
                    onChange={e => handleImageUpload(e, labelIdx)}
                    className="mb-2"
                    disabled={training}
                    onClick={e => e.stopPropagation()}
                  />
                </div>
              ))}

            </div>
          </div>

          <button
            type="submit"
            className="w-fit px-4 mt-6 bg-primary text-white py-2 rounded hover:bg-primary/90 disabled:opacity-50"
            disabled={training}
          >
            {training ? "Đang xử lý..." : "Tạo động tác & Train"}
          </button>
        </form>
        <div className="mt-4 text-destructive">{formStatus}</div>
        {trainResultMsg && (
          <div className="text-green-600 font-semibold mt-2">
            {trainResultMsg}
          </div>
        )}
      </div>
      <div className="flex-1 bg-white rounded-none md:rounded-lg p-4 md:p-6 overflow-auto border-r border-muted-foreground/10 h-full flex flex-col">
        <FormExpert labels={labelFields.map(l => l.label)}/>
      </div>
      {/* CỘT GIỮA: Ảnh lớn + canvas overlay skeleton */}
      <div className="flex flex-col items-center justify-start min-w-[400px] max-w-[430px] w-[22vw] bg-white h-full border-x border-muted-foreground/10 pt-8 z-[2]">
        <div className="w-full flex items-center justify-center mb-6 min-h-[240px]">
          {selectedImage ? (
            <div className="relative w-[400px] max-w-full">
              <img
                ref={imgRef}
                src={selectedImage.url}
                alt={selectedImage.label}
                className="w-full block rounded-lg bg-gray-200"
              />
              <canvas
                ref={canvasRef}
                className="absolute top-0 left-0 w-full h-full pointer-events-none"
              />
            </div>
          ) : (
            <div className="w-full h-[220px] flex items-center justify-center bg-gray-100 rounded border text-gray-400">
              <span>Chọn ảnh từ bên phải để xem lớn</span>
            </div>
          )}
        </div>
      </div>

      {/* TAB QUẢN LÝ ẢNH */}
      <div className="bg-white rounded-none md:rounded-lg p-4 overflow-auto max-h-full border-l border-muted-foreground/10 h-full flex flex-col">
        <h3 className="font-semibold mb-3">Ảnh của label đã chọn</h3>
        {activeLabelIdx < 0 || !watchedImageLabels?.[activeLabelIdx]
          ? <div className="text-muted-foreground text-sm">Chọn nhóm label ở bên trái để xem hình.</div>
          : (() => {
            const images = watchedImageLabels?.[activeLabelIdx]?.images || [];
            if (images.length === 0) {
              return <div className="text-xs text-muted-foreground">Chưa có hình cho label này.</div>
            }
            return images.map((img: any, imgIdx: number) => (
              <div
                key={imgIdx}
                className="flex items-center gap-3 mb-2 p-2 border rounded group"
              >
                <img src={img.preview}
                  alt={img.customName}
                  className="w-20 object-cover rounded cursor-pointer"
                  onClick={() => handleSelectImage(img)}
                />
                <div className="flex-1">
                  <div className="text-xs font-medium">
                    {img.customName || `${Date.now()}_${imgIdx + 1}`}
                  </div>
                </div>
                <button
                  type="button"
                  className="text-red-600 text-xl font-bold px-2"
                  onClick={() => handleRemoveImage(imgIdx, activeLabelIdx)}
                  title="Xóa ảnh"
                >✕</button>
              </div>
            ));
          })()
        }
      </div>
    </div>
  );
}
