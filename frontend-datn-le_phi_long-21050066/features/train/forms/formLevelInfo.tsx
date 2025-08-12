'use client';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { levelInfoSchema } from '../schemas/formUpdateInfoSchema';

type FormData = z.infer<typeof levelInfoSchema>;

const LEVEL_LABELS = ['Giữ dáng', 'Giảm mỡ', 'Tăng cơ'] as const;

export default function FormLevelInfo({
  defaultValues,
  onSubmit,
}: {
  defaultValues?: Partial<FormData>;
  onSubmit?: (data: FormData) => Promise<void> | void;
}) {
  const form = useForm<FormData>({
    resolver: zodResolver(levelInfoSchema),
    defaultValues: {
      levels: [
        { sets: 1, reps: 10 }, // Giữ dáng
        { sets: 1, reps: 10 }, // Giảm mỡ
        { sets: 1, reps: 10 }, // Tăng cơ
      ],
      ...(defaultValues || {}),
    },
    mode: 'onChange',
  });

  const [msg, setMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(data: FormData) {
    setMsg(null);
    setSubmitting(true);
    try {
      await onSubmit?.(data);
      setMsg('Cập nhật cấp độ thành công.');
    } catch (e: any) {
      setMsg(e?.message || 'Có lỗi xảy ra.');
    }
    setSubmitting(false);
  }

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
      <h2 className="text-primary font-bold text-lg underline">Cập nhật thông tin cấp độ</h2>

      {form.watch('levels').map((_, idx) => (
        <div key={idx} className="flex items-center gap-3 border-b pb-3">
          <div className="font-semibold w-28 text-primary">Cấp độ {idx + 1} ({LEVEL_LABELS[idx]})</div>
          <input
            type="number"
            min={1}
            max={5}
            {...form.register(`levels.${idx}.sets`, { valueAsNumber: true })}
            className="border rounded p-2 w-24"
            placeholder="Set (1-5)"
            disabled={submitting}
          />
          <input
            type="number"
            min={10}
            max={100}
            {...form.register(`levels.${idx}.reps`, { valueAsNumber: true })}
            className="border rounded p-2 w-28"
            placeholder="Rep (10-100)"
            disabled={submitting}
          />
          <div className="text-destructive text-xs">
            {(form.formState.errors.levels?.[idx] as any)?.sets?.message ||
              (form.formState.errors.levels?.[idx] as any)?.reps?.message}
          </div>
        </div>
      ))}

      {form.formState.errors.levels && (
        <div className="text-destructive text-sm">
          {(form.formState.errors.levels as any).message}
        </div>
      )}

      {msg && <div className="text-primary text-sm">{msg}</div>}

      <button
        type="submit"
        className="w-fit px-4 bg-primary text-white py-2 rounded hover:bg-primary/90 disabled:opacity-50"
        disabled={submitting}
      >
        {submitting ? 'Đang lưu...' : 'Lưu cấp độ'}
      </button>
    </form>
  );
}
