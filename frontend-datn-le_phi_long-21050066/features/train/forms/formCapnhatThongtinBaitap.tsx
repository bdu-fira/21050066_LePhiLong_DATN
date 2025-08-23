'use client';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { MUSCLE_GROUPS } from '@/constants';
import { updateInfo } from '../api/updateInfo';
import { FormCapnhatThongtinSchema } from '../schemas/formCapnhatThongtinBaitapSchema';

type FormData = z.infer<typeof FormCapnhatThongtinSchema>;

function toMuscleIds(input: any): number[] {
  if (!Array.isArray(input)) return [];
  return input
    .map((x) => (typeof x === 'number' ? x : Number(x?.id)))
    .filter((n) => Number.isInteger(n));
}

export default function FormCapnhatThongtin(props: any) {
  const FALLBACK_MUSCLES = [1, 2, 3];
  const incoming = toMuscleIds(props.muscles);
  const initialMuscles = incoming.length ? incoming : FALLBACK_MUSCLES;

  const form = useForm<FormData>({
    resolver: zodResolver(FormCapnhatThongtinSchema),
    defaultValues: {
      name: props.name ?? '',
      minAge: props.minAge ?? 18,
      maxAge: props.maxAge ?? 60,
      calo: props.calo ?? 0.1,
      muscles: initialMuscles, // ✅ mặc định [1,2,3] nếu không có từ props
      fbxFile: undefined,
    },
    mode: 'onChange',
  });

  // Reset khi props đổi; nếu không có muscles từ backend thì dùng [1,2,3]
  useEffect(() => {
    const ids = toMuscleIds(props.muscles);
    form.reset({
      name: props.name ?? '',
      minAge: Number(props.minAge ?? 18),
      maxAge: Number(props.maxAge ?? 60),
      calo: Number(props.calo ?? 0.1),
      muscles: ids.length ? ids : FALLBACK_MUSCLES,
      fbxFile: undefined,
    });
  }, [props.name, props.minAge, props.maxAge, props.calo, props.muscles, form]);

  const [serverMsg, setServerMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (data: FormData) => {
    setServerMsg(null);
    setSubmitting(true);
    const res = await updateInfo({
      id: props.id,
      ...data, 
    });
    setServerMsg(res.message || (res.statusCode === 200 ? 'Cập nhật thành công.' : 'Không thể cập nhật.'));
    setSubmitting(false);
  };

  const selectedIds: number[] = Array.isArray(form.watch('muscles')) ? (form.watch('muscles') as number[]) : [];

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
      <h2 className="text-primary font-bold text-lg underline">Cập nhật mô tả bài tập</h2>

      {/* Tên bài tập */}
      <div>
        <label className="font-semibold block mb-1">Tên bài tập</label>
        <input
          {...form.register('name')}
          placeholder="VD: Squat, Push-up..."
          className="border rounded p-2 w-full"
          disabled={submitting}
        />
        {form.formState.errors.name && (
          <div className="text-destructive text-sm mt-1">{form.formState.errors.name.message}</div>
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
            <div className="text-destructive text-sm mt-1">{form.formState.errors.minAge.message}</div>
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
            <div className="text-destructive text-sm mt-1">{form.formState.errors.maxAge.message}</div>
          )}
        </div>
      </div>

      {/* Calo */}
      <div className="flex gap-3">
        <div>
          <label className="font-semibold block mb-1">Calo</label>
          <input
            type="number"
            step="0.01"
            min={0.01}
            max={1}
            {...form.register('calo', { valueAsNumber: true })}
            className="border rounded p-2 w-28"
            disabled={submitting}
          />
          {form.formState.errors.calo && (
            <div className="text-destructive text-sm mt-1">{form.formState.errors.calo.message}</div>
          )}
        </div>
      </div>

      {/* Nhóm cơ: vẫn click chọn/hủy như cũ */}
      <div>
        <label className="font-semibold block mb-1">Nhóm cơ (chọn ≥ 1)</label>
        <div className="grid grid-cols-3 gap-2">
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
                    const cur = new Set<number>(form.getValues('muscles') || []);
                    e.target.checked ? cur.add(g.id) : cur.delete(g.id);
                    form.setValue('muscles', Array.from(cur), {
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
        {form.formState.errors.muscles && (
          <div className="text-destructive text-sm mt-1">
            {form.formState.errors.muscles.message as string}
          </div>
        )}
      </div>

      {/* File FBX Upload */}
      <div>
        <label className="font-semibold block mb-1">File FBX (tùy chọn)</label>
        <input
          type="file"
          accept=".fbx"
          onChange={(e) => {
            const file = e.target.files?.[0];
            form.setValue('fbxFile', file, {
              shouldDirty: true,
              shouldValidate: true,
            });
          }}
          className="border rounded p-2 w-full file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/90"
          disabled={submitting}
        />
        <div className="text-sm text-gray-600 mt-1">
          Chỉ chấp nhận file .fbx, tối đa 50MB
        </div>
        {form.formState.errors.fbxFile && (
          <div className="text-destructive text-sm mt-1">{form.formState.errors.fbxFile.message}</div>
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
