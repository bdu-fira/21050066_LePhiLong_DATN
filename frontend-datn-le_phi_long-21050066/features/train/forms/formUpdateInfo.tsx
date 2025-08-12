'use client';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { MUSCLE_GROUPS } from '@/constants';
import { updateInfoSchema } from '../schemas/formUpdateInfoSchema';

type FormData = z.infer<typeof updateInfoSchema>;

export default function FormUpdateInfo({
  defaultValues,
  onSubmit,
}: {
  defaultValues?: Partial<FormData>;
  onSubmit?: (data: FormData) => Promise<void> | void;
}) {
  const form = useForm<FormData>({
    resolver: zodResolver(updateInfoSchema),
    defaultValues: {
      exerciseName: '',
      minAge: 18,
      maxAge: 60,
      // LƯU Ý: giờ là mảng id (number[])
      muscleGroups: [],
      ...(defaultValues || {}),
    },
    mode: 'onChange',
  });

  const [serverMsg, setServerMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(data: FormData) {
    setServerMsg(null);
    setSubmitting(true);
    try {
      await onSubmit?.(data); // gửi data.muscleGroups là mảng id
      setServerMsg('Cập nhật mô tả bài tập thành công.');
    } catch (e: any) {
      setServerMsg(e?.message || 'Có lỗi xảy ra, vui lòng thử lại.');
    }
    setSubmitting(false);
  }

  const selectedIds = form.watch('muscleGroups') || [];

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5">
      <h2 className="text-primary font-bold text-lg underline">Cập nhật mô tả bài tập</h2>

      {/* Tên bài tập */}
      <div>
        <label className="font-semibold block mb-1">Tên bài tập</label>
        <input
          {...form.register('exerciseName')}
          placeholder="VD: Squat, Push-up..."
          className="border rounded p-2 w-full"
          disabled={submitting}
        />
        {form.formState.errors.exerciseName && (
          <div className="text-destructive text-sm mt-1">
            {form.formState.errors.exerciseName.message}
          </div>
        )}
      </div>

      {/* Tuổi */}
      <div className="flex gap-3">
        <div>
          <label className="font-semibold block mb-1">Tuổi tối thiểu</label>
          <input
            type="number"
            {...form.register('minAge', { valueAsNumber: true })}
            className="border rounded p-2 w-28"
            disabled={submitting}
          />
          {form.formState.errors.minAge && (
            <div className="text-destructive text-sm mt-1">
              {form.formState.errors.minAge.message}
            </div>
          )}
        </div>
        <div>
          <label className="font-semibold block mb-1">Tuổi tối đa</label>
          <input
            type="number"
            {...form.register('maxAge', { valueAsNumber: true })}
            className="border rounded p-2 w-28"
            disabled={submitting}
          />
          {form.formState.errors.maxAge && (
            <div className="text-destructive text-sm mt-1">
              {form.formState.errors.maxAge.message}
            </div>
          )}
        </div>
      </div>

      {/* Nhóm cơ: chọn theo id */}
      <div>
        <label className="font-semibold block mb-1">Nhóm cơ (chọn ≥ 1)</label>
        <div className="grid grid-cols-5 gap-2">
          {MUSCLE_GROUPS.map((g) => {
            const id = `mg_${g.id}`;
            const checked = selectedIds.includes(g.id);
            return (
              <label
                key={g.id}
                htmlFor={id}
                className={`px-3 py-1 rounded border cursor-pointer select-none ${
                  checked ? 'bg-green-700 text-white' : 'bg-white'
                }`}
              >
                <input
                  id={id}
                  type="checkbox"
                  className="hidden"
                  checked={checked}
                  onChange={(e) => {
                    const cur = new Set<number>(form.getValues('muscleGroups') || []);
                    e.target.checked ? cur.add(g.id) : cur.delete(g.id);
                    form.setValue('muscleGroups', Array.from(cur), {
                      shouldDirty: true,
                      shouldValidate: true,
                    });
                  }}
                  disabled={submitting}
                />
                {g.name}
              </label>
            );
          })}
        </div>
        {form.formState.errors.muscleGroups && (
          <div className="text-destructive text-sm mt-1">
            {form.formState.errors.muscleGroups.message as string}
          </div>
        )}
      </div>

      {serverMsg && <div className="text-primary text-sm">{serverMsg}</div>}

      <button
        type="submit"
        className="w-fit px-4 bg-primary text-white py-2 rounded hover:bg-primary/90 disabled:opacity-50"
        disabled={submitting}
      >
        {submitting ? 'Đang lưu...' : 'Lưu mô tả'}
      </button>
    </form>
  );
}
