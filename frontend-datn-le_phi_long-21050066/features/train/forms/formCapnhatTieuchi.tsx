'use client';

import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { formCapnhatTieuchiSchema } from '../schemas/formCapnhatTieuchiSchema';
import { z } from 'zod';
import { useState } from 'react';
import { JOINT_ANGLE_OPTIONS } from '@/constants';
import { updateCriteria } from '../api/updateCriteria';

type ExpertFormData = z.infer<typeof formCapnhatTieuchiSchema>;

const OPERATORS = ['<', '>', '=', '<=', '>='] as const;

export default function FormCapnhatTieuchi({ id, positionID, evaluationCriteria }: any) {
  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ExpertFormData>({
    resolver: zodResolver(formCapnhatTieuchiSchema),
    defaultValues: {
      criteria: (evaluationCriteria || []).map((ec: any) => ({
        id: ec?.id ?? undefined,
        jointAngle: Array.isArray(ec?.joints) ? ec.joints.map((j: any) => j.id).join(',') : '',
        operator: ec?.operator ?? '=',
        angle: ec?.angle != null ? String(ec.angle) : '',
        errorMessage: ec?.errorMessage ?? '',
      })),
    },
    mode: 'onChange',
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'criteria' });
  const [msg, setMsg] = useState<string | null>(null);

  const onSubmit = async (data: ExpertFormData) => {
    setMsg(null);

    const payload = {
      id,
      positionID,
      criteria: (data.criteria || []).map((c) => ({
        jointAngle: c.jointAngle ? c.jointAngle.split(',').map(Number) : [],
        operator: c.operator,
        angle: Number(c.angle),
        message: c.errorMessage || '',
      })),
    };

    try {
      const res = await updateCriteria(payload);
      setMsg(res.statusCode === 200 ? 'Cập nhật tiêu chí thành công.' : res.message || 'Có lỗi xảy ra.');
    } catch (e: any) {
      setMsg(e?.message || 'Có lỗi xảy ra.');
    }
  };

  return (
    <div className="bg-white w-full max-w-xl space-y-6">
      <h2 className="font-bold text-lg text-primary underline">Thiết lập tiêu chí chuyên gia</h2>

      <div>
        <label className="font-semibold">Tiêu chí đánh giá động tác</label>

        <div className="flex flex-col gap-3 mt-2">
          {fields.map((field, idx) => {
            const fieldErr = (errors.criteria?.[idx] as any) || null;
            const errText = fieldErr
              ? Object.values(fieldErr)
                .map((v: any) => v?.message)
                .filter(Boolean)
                .join(' | ')
              : '';

            return (
              <div key={field.id} className="border rounded-lg p-3 flex flex-col gap-2 bg-muted">
                <div className="flex flex-wrap items-center gap-2 w-full">
                  {/* jointAngle */}
                  <select
                    {...register(`criteria.${idx}.jointAngle`)}
                    className="border rounded p-1 px-2 min-w-[160px]"
                    disabled={isSubmitting}
                  >
                    <option value="" disabled>Chọn góc khớp</option>
                    {JOINT_ANGLE_OPTIONS.map((opt) => (
                      <option key={opt.label} value={opt.value.join(',')}>
                        {opt.label} ({opt.display})
                      </option>
                    ))}
                  </select>

                  {/* operator */}
                  <select
                    {...register(`criteria.${idx}.operator`)}
                    className="border rounded p-1 px-2"
                    disabled={isSubmitting}
                  >
                    <option value="" disabled>Toán tử</option>
                    {OPERATORS.map((op) => (
                      <option key={op} value={op}>{op}</option>
                    ))}
                  </select>

                  {/* angle */}
                  <input
                    type="number"
                    inputMode="decimal"
                    placeholder="Góc (1–180)"
                    {...register(`criteria.${idx}.angle`)}
                    className="border rounded p-1 px-2 w-24"
                    min={1}
                    max={180}
                    step="any"
                    disabled={isSubmitting}
                  />

                  {/* errorMessage */}
                  <input
                    type="text"
                    placeholder="Thông điệp lỗi"
                    {...register(`criteria.${idx}.errorMessage`)}
                    className="border rounded p-1 px-2 flex-1 min-w-[160px]"
                    disabled={isSubmitting}
                  />

                  <button
                    type="button"
                    className="text-red-600 font-bold text-lg px-2"
                    onClick={() => remove(idx)}
                    disabled={isSubmitting}
                    aria-label="Xóa tiêu chí"
                    title="Xóa tiêu chí"
                  >
                    ✕
                  </button>
                </div>

                {errText && <div className="text-destructive text-xs">{errText}</div>}
              </div>
            );
          })}
        </div>
        <div className='flex justify-between items-center mt-3'>
          <button
            type="button"
            className="mt-3 border px-3 py-2 rounded bg-primary text-white"
            onClick={() => append({ jointAngle: '', operator: '=', angle: '', errorMessage: '' })}
            disabled={isSubmitting}
          >
            Thêm tiêu chí
          </button>

          {errors.criteria && (
            <div className="text-destructive text-sm mt-1">{(errors.criteria as any).message}</div>
          )}

          <button
            type="button"
            className="mt-3 border px-3 py-2 rounded bg-primary text-white"
            onClick={handleSubmit(onSubmit)}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Đang lưu...' : 'Lưu tiêu chí đánh giá'}
          </button>
        </div>
        {msg && <div className="text-primary text-sm">{msg}</div>}

      </div>


    </div>
  );
}
