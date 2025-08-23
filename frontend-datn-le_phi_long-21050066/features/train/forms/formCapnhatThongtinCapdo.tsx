'use client';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { FormCapnhatCapdoSchema } from '../schemas/formCapnhatThongtinBaitapSchema';
import { updateLevel } from '../api/updateLevel';

type FormData = z.infer<typeof FormCapnhatCapdoSchema>;

const LEVEL_LABELS = ['Giữ dáng', 'Giảm mỡ', 'Tăng cơ'] as const;

export default function FormCapnhatThongtinCapdo(props: any) {
  console.log(props)
  const form = useForm<FormData>({
    resolver: zodResolver(FormCapnhatCapdoSchema),
    defaultValues: {
      levels: [
        { set: props.levels[0]?.set || 1, rep: props.levels[0]?.rep || 10 }, // Giữ dáng
        { set: props.levels[1]?.set || 2, rep: props.levels[1]?.rep || 10}, // Giảm mỡ
        { set: props.levels[2]?.set || 3, rep: props.levels[2]?.rep || 10}, // Tăng cơ
      ],
    },
    mode: 'onChange',
  });


  const [msg, setMsg] = useState<string | null>(null);
  const [submitting, setubmitting] = useState(false);

  async function onSubmit(data: FormData) {
    setMsg(null);
    setubmitting(true);
    try {
      const res = await updateLevel({
        id: props.id,
        ...data, 
      });
      if (res.statusCode !== 200) {
        setMsg(res.message || 'Có lỗi xảy ra.');
        return;
      }
      setMsg('Cập nhật cấp độ thành công.');
    } catch (e: any) {
      setMsg(e?.message || 'Có lỗi xảy ra.');
    }
    setubmitting(false);
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <h2 className="text-primary font-bold text-lg underline">Cập nhật thông tin cấp độ</h2>

      {form.watch('levels').map((_, idx) => (
        <div key={idx} className="flex items-center gap-3 border-b pb-3">
          <div className="font-semibold w-28 text-primary">Cấp độ {idx + 1} ({LEVEL_LABELS[idx]})</div>
          <input
            type="number"
            min={1}
            max={5}
            {...form.register(`levels.${idx}.set`, { valueAsNumber: true })}
            className="border rounded p-2 w-24"
            placeholder="Set (1-5)"
            disabled={submitting}
          />
          <input
            type="number"
            min={10}
            max={100}
            {...form.register(`levels.${idx}.rep`, { valueAsNumber: true })}
            className="border rounded p-2 w-28"
            placeholder="Rep (10-100)"
            disabled={submitting}
          />
          <div className="text-destructive text-xs">
            {(form.formState.errors.levels?.[idx] as any)?.set?.message ||
              (form.formState.errors.levels?.[idx] as any)?.rep?.message}
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
        disabled={form.formState.isSubmitting}
      >
        {form.formState.isSubmitting ? 'Đang lưu...' : 'Lưu cấp độ'}
      </button>
    </form>
  );
}
