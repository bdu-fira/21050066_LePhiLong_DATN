// features/train/forms/FormExpert.tsx
'use client';

import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { formExpertSchema } from '../schemas/formExpertSchema';
import { z } from 'zod';
import { useState, useEffect } from 'react';
import { JOINT_ANGLE_OPTIONS } from '@/constants';

type ExpertFormData = z.infer<typeof formExpertSchema>;

export default function FormExpert({ labels }: { labels: string[] }) {
  const form = useForm<ExpertFormData>({
    resolver: zodResolver(formExpertSchema),
    defaultValues: { startAngle: 0, order: [], criteria: [] },
    mode: 'onChange',
  });

  const { fields: criteriaFields, append, remove } = useFieldArray({
    control: form.control,
    name: 'criteria',
  });

  const [ruleResult, setRuleResult] = useState<string | null>(null);

  useEffect(() => {
    form.setValue('order', labels || [], { shouldDirty: true });
  }, [labels]);

  const moveLabel = (idx: number, dir: 'up' | 'down') => {
    const order = form.getValues('order');
    const swap = dir === 'up' ? idx - 1 : idx + 1;
    if (swap < 0 || swap >= order.length) return;
    [order[idx], order[swap]] = [order[swap], order[idx]];
    form.setValue('order', [...order], { shouldDirty: true });
  };

  const onSubmit = (data: ExpertFormData) => {
    const formatted = {
      ...data,
      criteria: data.criteria.map((c) => ({
        ...c,
        jointAngle: c.jointAngle ? c.jointAngle.split(',') : [],
        angle: Number(c.angle),
      })),
    };
    setRuleResult(JSON.stringify(formatted, null, 2));
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="bg-white w-full max-w-xl space-y-6">
      <h2 className="font-bold text-lg text-primary underline">Thiết lập tiêu chí chuyên gia</h2>

      {/* Thứ tự */}
      <div>
        <label className="font-semibold">Thứ tự động tác</label>
        <div className="flex flex-col gap-2 mt-2">
          {form.watch('order').map((lbl, idx) => (
            <div key={lbl + idx} className="bg-blue-50 border rounded px-3 py-1 flex items-center gap-2">
              <span className="text-sm">{idx + 1}. {lbl}</span>
              <button type="button" className="px-1" onClick={() => moveLabel(idx, 'up')} disabled={idx === 0}>↑</button>
              <button type="button" className="px-1" onClick={() => moveLabel(idx, 'down')} disabled={idx === form.watch('order').length - 1}>↓</button>
              <button type="button" className="text-red-500 px-1" onClick={() => {
                const order = form.getValues('order'); order.splice(idx, 1);
                form.setValue('order', [...order], { shouldDirty: true });
              }}>✕</button>
            </div>
          ))}
        </div>
        {form.formState.errors.order && (
          <div className="text-destructive text-sm mt-1">{form.formState.errors.order.message as string}</div>
        )}
      </div>

      {/* Tiêu chí */}
      <div>
        <label className="font-semibold">Tiêu chí đánh giá động tác</label>
        <div className="flex flex-col gap-3 mt-2">
          {criteriaFields.map((crit, idx) => (
            <div key={crit.id} className="border rounded-lg p-3 flex flex-col gap-2 bg-muted">
              <div className="flex flex-wrap items-center gap-2 w-full">
                <select {...form.register(`criteria.${idx}.jointAngle`)} className="border rounded p-1 px-2 min-w-[140px]" defaultValue="">
                  <option value="" disabled>Chọn góc khớp</option>
                  {JOINT_ANGLE_OPTIONS.map((opt) => (
                    <option key={opt.label} value={opt.value.join(',')}>
                      {opt.label} ({opt.display})
                    </option>
                  ))}
                </select>
                <input type="text" placeholder="Giá trị" {...form.register(`criteria.${idx}.angle`)} className="border rounded p-1 px-2 flex-1 min-w-[100px]" />
                <input type="text" placeholder="Thông điệp lỗi" {...form.register(`criteria.${idx}.message`)} className="border rounded p-1 px-2 flex-1 min-w-[140px]" />
                <button type="button" className="text-red-600 font-bold text-lg px-2" onClick={() => remove(idx)}>✕</button>
              </div>
              {(form.formState.errors.criteria?.[idx] as any) && (
                <div className="text-destructive text-xs">
                  {Object.values(form.formState.errors.criteria?.[idx] as any).map((v: any) => v?.message || v || '').join(' | ')}
                </div>
              )}
            </div>
          ))}
        </div>
        <button type="button" className="mt-3 border px-3 py-1 rounded bg-primary text-white" onClick={() => append({ jointAngle: '', angle: '', message: '' })}>
          Thêm tiêu chí
        </button>
        {form.formState.errors.criteria && (
          <div className="text-destructive text-sm mt-1">{(form.formState.errors.criteria as any).message}</div>
        )}
      </div>

      <button type="submit" className="w-fit px-4 mt-5 bg-primary text-white py-2 rounded hover:bg-primary/90">
        Lưu tiêu chí đánh giá
      </button>

      {ruleResult && (
        <div className="mt-5">
          <label className="font-semibold">Kết quả JSON:</label>
          <pre className="bg-gray-100 rounded p-3 text-xs">{ruleResult}</pre>
        </div>
      )}
    </form>
  );
}
