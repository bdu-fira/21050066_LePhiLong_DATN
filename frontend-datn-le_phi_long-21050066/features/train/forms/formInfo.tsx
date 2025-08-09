'use client';

import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Định nghĩa schema đơn giản cho actionName và levels (bạn có thể customize)
const infoSchema = z.object({
  actionName: z.string().min(1, 'Vui lòng nhập tên động tác.'),
  levels: z.array(z.object({
    reps: z.number().min(1, 'Reps phải > 0'),
    sets: z.number().min(1, 'Sets phải > 0'),
  })).min(1, 'Ít nhất 1 cấp độ.').max(3, 'Tối đa 3 cấp độ.'),
});

type InfoFormData = z.infer<typeof infoSchema>;

export default function FormInfo() {
  const form = useForm<InfoFormData>({
    resolver: zodResolver(infoSchema),
    defaultValues: {
      actionName: '',
      levels: [{ reps: 1, sets: 1 }],
    },
    mode: 'onChange',
  });

  const { register, handleSubmit, formState, control } = form;
  const { fields: levelFields, append: addLevel, remove: removeLevel } = useFieldArray({
    control, name: 'levels',
  });

  function onSubmit(data: InfoFormData) {
    // Có thể gọi API, hoặc xử lý dữ liệu tại đây
    alert('Đã lưu thông tin:\n' + JSON.stringify(data, null, 2));
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-lg">
      <h2 className="text-primary font-bold text-lg underline mb-2">Thông tin động tác</h2>

      {/* Tên động tác */}
      <div>
        <label className="font-semibold block mb-1">Tên động tác</label>
        <input
          {...register('actionName')}
          placeholder="VD: Squat, Push-up..."
          className="border rounded p-2 w-full"
        />
        {formState.errors.actionName &&
          <div className="text-red-600 text-sm mt-1">
            {formState.errors.actionName.message}
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
                {...register(`levels.${idx}.reps`, { valueAsNumber: true })}
                placeholder="Số rep"
                className="border rounded p-2 w-20"
              />
              <input
                type="number" min={1}
                {...register(`levels.${idx}.sets`, { valueAsNumber: true })}
                placeholder="Số set"
                className="border rounded p-2 w-20"
              />
              {levelFields.length > 1 && (
                <button
                  type="button"
                  className="text-red-600 px-2 py-1 font-semibold rounded hover:bg-red-100"
                  onClick={() => removeLevel(idx)}
                >Xóa</button>
              )}
            </div>
          ))}
          {levelFields.length < 3 && (
            <button
              type="button"
              className="mt-2 border px-3 py-1 rounded bg-primary text-white w-fit"
              onClick={() => addLevel({ reps: 1, sets: 1 })}
            >Thêm cấp độ</button>
          )}
        </div>
        {formState.errors.levels &&
          <div className="text-red-600 text-sm mt-1">
            {formState.errors.levels.message as string}
          </div>
        }
      </div>

      <button
        type="submit"
        className="w-fit px-4 mt-6 bg-primary text-white py-2 rounded hover:bg-primary/90 disabled:opacity-50"
      >
        Lưu thông tin
      </button>
    </form>
  );
}
