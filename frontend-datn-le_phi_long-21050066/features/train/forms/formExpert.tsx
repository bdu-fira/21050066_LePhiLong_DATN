'use client';

import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { formExpertSchema } from '../schemas/formExpertSchema';
import { z } from 'zod';
import { useState, useEffect } from 'react';
import { JOINT_ANGLE_OPTIONS, LOOKING_ANGLE } from '@/constants';

type ExpertFormData = z.infer<typeof formExpertSchema>;

export default function FormExpertSchema({ labels }: { labels: string[] }) {
    const form = useForm<ExpertFormData>({
      resolver: zodResolver(formExpertSchema),
      defaultValues: {
        startAngle: 0,
        order: [],
        criteria: [],
      },
      mode: 'onChange',
    });
  
    const { fields: criteriaFields, append, remove } = useFieldArray({
      control: form.control,
      name: 'criteria',
    });
  
    const [ruleResult, setRuleResult] = useState<string | null>(null);
  
    // Đặt thứ tự mặc định khi load lần đầu
    useEffect(() => {
      form.setValue('order', labels, { shouldDirty: true });
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [labels]);
  
    // Xóa label khỏi order
    const handleRemoveLabelFromOrder = (idx: number) => {
      const order = form.getValues('order');
      const newOrder = [...order];
      newOrder.splice(idx, 1);
      form.setValue('order', newOrder, { shouldDirty: true });
    };
  
    // Đổi vị trí lên/xuống
    const moveLabel = (idx: number, direction: 'up' | 'down') => {
      const order = form.getValues('order');
      const newOrder = [...order];
      const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
      if (swapIdx < 0 || swapIdx >= newOrder.length) return;
      [newOrder[idx], newOrder[swapIdx]] = [newOrder[swapIdx], newOrder[idx]];
      form.setValue('order', newOrder, { shouldDirty: true });
    };
  
    const onSubmit = (data: ExpertFormData) => {
      // Convert jointAngle string value về array trước khi gửi đi backend nếu cần
      const formatted = {
        ...data,
        criteria: data.criteria.map(crit => ({
          ...crit,
          jointAngle: crit.jointAngle ? crit.jointAngle.split(',') : [],
          angle: Number(crit.angle),
        })),
      };
      setRuleResult(JSON.stringify(formatted, null, 2));
    };
  
    return (
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="bg-white w-full max-w-xl space-y-6"
      >
        <h2 className="font-bold text-lg text-primary underline">Thiết lập tiêu chí chuyên gia</h2>
  
        {/* Vị trí khởi đầu */}
        <div>
            <label className="block font-semibold mb-1">Góc đứng so với camera</label>
            <select
                {...form.register('startAngle', { valueAsNumber: true })}
                className="border rounded p-2 w-48"
                defaultValue={0}
            >
                {LOOKING_ANGLE.map(opt => (
                <option key={opt.value} value={opt.value}>
                    {opt.display}
                </option>
                ))}
            </select>
            {form.formState.errors.startAngle && (
                <div className="text-red-600 text-sm mt-1">
                {form.formState.errors.startAngle.message}
                </div>
            )}
        </div>

        {/* Thứ tự động tác */}
        <div>
          <label className="font-semibold">Thứ tự động tác (bấm lên/xuống để sắp xếp, hoặc xóa nếu cần)</label>
          <div className="flex flex-col gap-2 mt-2">
            {form.watch('order').map((lbl, idx) => (
              <div key={lbl + idx} className="bg-blue-50 border rounded px-3 py-1 flex items-center gap-2">
                <span className="text-sm">{idx + 1}. {lbl}</span>
                <button
                  type="button"
                  className="text-gray-500 px-1"
                  title="Di chuyển lên"
                  onClick={() => moveLabel(idx, 'up')}
                  disabled={idx === 0}
                >↑</button>
                <button
                  type="button"
                  className="text-gray-500 px-1"
                  title="Di chuyển xuống"
                  onClick={() => moveLabel(idx, 'down')}
                  disabled={idx === form.watch('order').length - 1}
                >↓</button>
                <button
                  type="button"
                  className="text-red-500 px-1"
                  title="Xóa khỏi thứ tự"
                  onClick={() => handleRemoveLabelFromOrder(idx)}
                >✕</button>
              </div>
            ))}
          </div>
          {form.formState.errors.order && (
            <div className="text-red-600 text-sm mt-1">{form.formState.errors.order.message as string}</div>
          )}
        </div>
  
        {/* Tiêu chí đánh giá động tác */}
        <div>
          <label className="font-semibold">Tiêu chí đánh giá động tác</label>
          <div className="flex flex-col gap-3 mt-2">
            {criteriaFields.map((crit, idx) => (
              <div
                key={crit.id}
                className="border rounded-lg p-3 flex flex-col gap-2 bg-muted relative"
              >
                <div className="flex flex-wrap items-center gap-2 w-full">
                  <select
                    {...form.register(`criteria.${idx}.jointAngle`)}
                    className="border rounded p-1 px-2 min-w-[140px]"
                    defaultValue=""
                  >
                    <option value="" disabled>Chọn góc khớp</option>
                    {JOINT_ANGLE_OPTIONS.map(opt => (
                      <option key={opt.label} value={opt.value.join(',')}>
                        {opt.label} ({opt.display})
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    placeholder="Giá trị"
                    {...form.register(`criteria.${idx}.angle`)}
                    className="border rounded p-1 px-2 flex-1 min-w-[100px]"
                  />
                  <input
                    type="text"
                    placeholder="Thông điệp lỗi"
                    {...form.register(`criteria.${idx}.message`)}
                    className="border rounded p-1 px-2 flex-1 min-w-[140px]"
                  />
                  <button
                    type="button"
                    className="text-red-600 font-bold text-lg px-2"
                    onClick={() => remove(idx)}
                    title="Xóa tiêu chí"
                  >✕</button>
                </div>
                {(form.formState.errors.criteria?.[idx] as any) &&
                  <div className="text-red-600 text-xs">
                    {Object.values(form.formState.errors.criteria?.[idx] as any).map((v: any, i: number) => v.message || v || '').join(' | ')}
                  </div>
                }
              </div>
            ))}
          </div>
          <button
            type="button"
            className="mt-3 border px-3 py-1 rounded bg-primary text-white"
            onClick={() => append({ jointAngle: '', angle: '', message: '' })}
          >
            Thêm tiêu chí
          </button>
          {form.formState.errors.criteria &&
            <div className="text-red-600 text-sm mt-1">
              {(form.formState.errors.criteria as any).message}
            </div>
          }
        </div>
  
        <button
          type="submit"
          className="w-fit px-4 mt-5 bg-primary text-white py-2 rounded hover:bg-primary/90 disabled:opacity-50"
        >
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