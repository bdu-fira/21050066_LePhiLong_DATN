'use client';

import { useForm, useFieldArray } from 'react-hook-form';
import { useState, useRef, useEffect } from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { cn } from '@/lib/utils';

// --- SCHEMA mới ---
const levelSchema = z.object({
  reps: z.number().min(1, 'Rep phải lớn hơn 0').max(100,'Tối đa 3 rep'),
  sets: z.number().min(1, 'Set phải lớn hơn 0').max(5, 'Tối đa 5 set'),
});
const imageLabelSchema = z.object({
  label: z.string().min(1, 'Nhập tên nhãn'),
  images: z.array(z.object({
    file: z.any(),
    preview: z.string(),
  })),
});
const trainSchema = z.object({
  actionName: z.string().min(1, 'Nhập tên động tác'),
  levels: z.array(levelSchema).min(1, 'Phải có ít nhất 1 cấp độ').max(3, 'Tối đa 3 cấp độ'),
  imageLabels: z.array(imageLabelSchema),
});
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

  const { fields: levelFields, append: appendLevel, remove: removeLevel, replace: replaceLevel } = useFieldArray({
    control: form.control,
    name: 'levels',
  });

  const { fields: labelFields, append: appendLabel, remove: removeLabel, update: updateLabel } = useFieldArray({
    control: form.control,
    name: 'imageLabels',
  });

  const [activeLabelTab, setActiveLabelTab] = useState(0);
  const [newLabel, setNewLabel] = useState('');
  const labelInputRef = useRef<HTMLInputElement>(null);
  const [selectedImage, setSelectedImage] = useState<{ url: string, label?: string } | null>(null);

  // Sắp xếp lại cấp độ khi xóa, để luôn là 1->N (không nhảy số)
  useEffect(() => {

  }, [levelFields.length]);

  const handleAddLevel = () => {
    if (levelFields.length >= 5) return;
    appendLevel({ reps: 1, sets: 1 });
  };

  const handleRemoveLevel = (idx: number) => {
    if (levelFields.length <= 1) return;
    removeLevel(idx);
  };

  const addNewLabel = () => {
    const label = newLabel.trim();
    if (!label) return;
    if (form.getValues('imageLabels').some(l => l.label.trim().toLowerCase() === label.toLowerCase())) {
      alert('Label đã tồn tại.');
      return;
    }
    appendLabel({ label, images: [] });
    setActiveLabelTab(labelFields.length);
    setNewLabel('');
    labelInputRef.current?.focus();
  };
  const editLabel = (idx: number) => {
    const currentLabel = form.getValues(`imageLabels.${idx}.label`);
    const newName = prompt('Nhập tên mới cho label:', currentLabel);
    if (newName && newName.trim() !== '') {
      updateLabel(idx, { ...labelFields[idx], label: newName.trim() });
    }
  };
  const removeLabelConfirm = (idx: number) => {
    if (window.confirm('Bạn chắc chắn muốn xóa nhóm label này và toàn bộ ảnh của nó?')) {
      removeLabel(idx);
      setTimeout(() => {
        setActiveLabelTab(prev =>
          prev === idx
            ? 0
            : prev > idx
              ? prev - 1
              : prev
        );
      }, 0);
    }
  };
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, labelIdx: number) => {
    const files = e.target.files;
    if (files && files.length) {
      const fileArr = Array.from(files).map(file => ({
        file,
        preview: URL.createObjectURL(file),
      }));
      const currentImages = form.getValues(`imageLabels.${labelIdx}.images`) || [];
      form.setValue(`imageLabels.${labelIdx}.images`, [...currentImages, ...fileArr], { shouldDirty: true });
      form.trigger('imageLabels');
      e.target.value = '';
    }
  };
  const handleDragStart = (e: any, imgIdx: number, labelIdx: number) => {
    e.dataTransfer.setData('dragIndex', imgIdx);
    e.dataTransfer.setData('labelIndex', labelIdx);
  };
  const handleDrop = (e: any, imgIdx: number, labelIdx: number) => {
    const dragIdx = Number(e.dataTransfer.getData('dragIndex'));
    const lIdx = Number(e.dataTransfer.getData('labelIndex'));
    if (lIdx !== labelIdx) return;
    const images = form.getValues(`imageLabels.${labelIdx}.images`) || [];
    const newImages = [...images];
    const dragged = newImages.splice(dragIdx, 1)[0];
    newImages.splice(imgIdx, 0, dragged);
    form.setValue(`imageLabels.${labelIdx}.images`, newImages, { shouldDirty: true });
    form.trigger('imageLabels');
  };
  const handleRemoveImage = (imgIdx: number, labelIdx: number) => {
    const images = form.getValues(`imageLabels.${labelIdx}.images`) || [];
    const newImages = [...images];
    newImages.splice(imgIdx, 1);
    form.setValue(`imageLabels.${labelIdx}.images`, newImages, { shouldDirty: true });
    form.trigger('imageLabels');
  };

  const watchedImageLabels = form.watch('imageLabels');

  return (
    <div className="w-full h-screen flex flex-row bg-white overflow-hidden">
      {/* FORM BÊN TRÁI */}
      <div className="flex-[1.2] min-w-0 bg-white dark:bg-muted rounded-none md:rounded-lg p-4 md:p-6 overflow-auto border-r border-muted-foreground/10 h-full flex flex-col">
        <form onSubmit={form.handleSubmit((data) => {
          alert('Bạn cần tích hợp mediapipe.js để extract pose. Code này chỉ demo UI.');
        })} className="space-y-6">
          <h2 className="text-primary font-bold text-lg underline">Tạo động tác huấn luyện</h2>
          {/* Tên động tác */}
          <div>
            <label className="font-semibold block mb-1">Tên động tác</label>
            <input
              {...form.register('actionName')}
              placeholder="VD: Squat, Push-up..."
              className="border rounded p-2 w-full"
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
                <div key={level.id} className="flex flex-wrap gap-2 items-end border-b pb-2">
                  <div className="font-bold text-primary w-24">Cấp độ {idx + 1}</div>
                  <input
                    type="number"
                    min={1}
                    {...form.register(`levels.${idx}.reps`, { valueAsNumber: true })}
                    placeholder="Số rep"
                    className="border rounded p-2 w-20"
                  />
                  <input
                    type="number"
                    min={1}
                    {...form.register(`levels.${idx}.sets`, { valueAsNumber: true })}
                    placeholder="Số set"
                    className="border rounded p-2 w-20"
                  />
                  {levelFields.length > 1 && (
                    <button
                      type="button"
                      className="text-red-600 px-2 py-1 font-semibold rounded hover:bg-red-100"
                      onClick={() => handleRemoveLevel(idx)}>Xóa</button>
                  )}
                </div>
              ))}
              {/* Thêm cấp độ */}
              {levelFields.length < 3 && (
                <button
                  type="button"
                  className="mt-2 border px-3 py-1 rounded hover:bg-primary/10"
                  onClick={handleAddLevel}
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
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addNewLabel())}
              />
              <button
                type="button"
                className="bg-primary text-white rounded px-3 py-2 hover:bg-primary/90"
                onClick={addNewLabel}
              >Tạo nhóm label</button>
            </div>
            <div className="flex flex-col gap-4">
              {labelFields.map((label, labelIdx) => (
                <div key={label.id} className={cn(
                  "border rounded-lg mb-2 p-3 bg-muted",
                  activeLabelTab === labelIdx && "ring-2 ring-primary"
                )}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-semibold text-sm flex items-center gap-1">
                      <span>{watchedImageLabels?.[labelIdx]?.label || ''}</span>
                      <button
                        type="button"
                        className="ml-1 text-primary underline hover:text-primary/80"
                        title="Sửa tên label"
                        onClick={() => editLabel(labelIdx)}>
                        ✎
                      </button>
                    </div>
                    <button
                      type="button"
                      className="text-red-600 text-lg font-bold px-2"
                      onClick={() => removeLabelConfirm(labelIdx)}
                      title="Xóa label"
                    >✕</button>
                  </div>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={e => handleImageUpload(e, labelIdx)}
                    className="mb-2"
                  />
                </div>
              ))}
            </div>
          </div>

          <button
            type="button"
            className="w-full mt-6 bg-primary text-white py-2 rounded hover:bg-primary/90"
          >
            Tạo động tác
          </button>
        </form>
      </div>

      {/* CỘT GIỮA: Hình lớn và render 3D */}
      <div className="flex flex-col items-center justify-start min-w-[350px] max-w-[430px] w-[22vw] bg-white h-full border-x border-muted-foreground/10 pt-8"
        style={{ zIndex: 2 }}>
        {/* Hình lớn */}
        <div className="w-full flex items-center justify-center mb-6" style={{ minHeight: 240 }}>
          {selectedImage ? (
            <div className="relative max-w-[350px] w-full flex flex-col items-center">
              <img
                src={selectedImage.url}
                alt={selectedImage.label}
                className="rounded border w-full max-h-[280px] object-contain bg-gray-100"
                style={{ background: "#eee" }}
              />
              <span className="absolute left-2 bottom-2 text-sm bg-black/60 text-white px-2 py-1 rounded">
                {selectedImage.label}
              </span>
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute right-2 top-2 bg-black/80 rounded-full w-7 h-7 flex items-center justify-center text-white z-10"
                title="Đóng"
              >✕</button>
            </div>
          ) : (
            <div className="w-full h-[220px] flex items-center justify-center bg-gray-100 rounded border text-gray-400">
              <span>Chọn ảnh từ bên phải để xem lớn</span>
            </div>
          )}
        </div>

        {/* Box render 3D nhân vật */}
        <div className="w-full h-[240px] bg-gray-100 flex items-center justify-center border rounded-lg">
          <span className="text-muted-foreground text-center">
            [Nơi render nhân vật 3D từ mediapipe.js hoặc Three.js]
          </span>
        </div>
      </div>

      {/* TAB QUẢN LÝ ẢNH */}
      <div className="flex-1 min-w-[320px] w-full bg-white dark:bg-muted rounded-none md:rounded-lg p-4 overflow-auto max-h-full border-l border-muted-foreground/10 h-full flex flex-col">
        <h3 className="font-semibold mb-3">Ảnh đã upload theo label</h3>
        {labelFields.length === 0 ? (
          <div className="text-muted-foreground text-sm">Chưa có nhóm label nào.</div>
        ) : (
          <>
            <div className="flex gap-2 border-b mb-4 overflow-x-auto">
              {labelFields.map((label, labelIdx) => {
                const labelName = watchedImageLabels?.[labelIdx]?.label || `Label ${labelIdx + 1}`;
                return (
                  <button
                    key={label.id}
                    className={cn(
                      "px-3 py-1 rounded-t font-medium",
                      activeLabelTab === labelIdx
                        ? "bg-primary text-white"
                        : "bg-muted text-primary hover:bg-primary/20"
                    )}
                    onClick={() => setActiveLabelTab(labelIdx)}
                    type="button"
                  >
                    {labelName}
                  </button>
                );
              })}
            </div>
            <div>
              {(() => {
                const images = watchedImageLabels?.[activeLabelTab]?.images || [];
                const labelName = watchedImageLabels?.[activeLabelTab]?.label || `Label ${activeLabelTab + 1}`;
                if (images.length === 0) {
                  return <div className="text-xs text-muted-foreground">Chưa có hình cho label này.</div>
                }
                return images.map((img: any, imgIdx: number) => (
                  <div
                    key={imgIdx}
                    className={cn(
                      "flex items-center gap-3 mb-2 p-2 border rounded group cursor-move",
                      "hover:bg-muted-foreground/5"
                    )}
                    draggable
                    onDragStart={e => handleDragStart(e, imgIdx, activeLabelTab)}
                    onDrop={e => handleDrop(e, imgIdx, activeLabelTab)}
                    onDragOver={e => e.preventDefault()}
                  >
                    <img src={img.preview}
                      alt={labelName}
                      className="w-14 h-14 object-cover rounded cursor-pointer"
                      onClick={() => setSelectedImage({ url: img.preview, label: labelName })}
                    />
                    <div className="flex-1">
                      <div className="text-xs font-medium">{labelName}</div>
                    </div>
                    <button
                      type="button"
                      className="text-red-600 text-xl font-bold px-2"
                      onClick={() => handleRemoveImage(imgIdx, activeLabelTab)}
                      title="Xóa ảnh"
                    >✕</button>
                  </div>
                ));
              })()}
            </div>
            <div className="mt-3 text-xs text-muted-foreground">
              Kéo thả để sắp xếp lại thứ tự. Có thể xóa ảnh tại đây.
            </div>
          </>
        )}
      </div>
    </div>
  );
}
