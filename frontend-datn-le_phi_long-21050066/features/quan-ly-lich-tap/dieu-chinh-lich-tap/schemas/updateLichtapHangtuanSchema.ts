import { z } from 'zod';

/** Đánh giá: -1 = Khó, +1 = Dễ */
export const RATING_VALUES = [-1, 1] as const;

export const updateLichtapHangtuanSchema = z.object({
  rating: z.coerce
    .number({ invalid_type_error: 'Đánh giá không hợp lệ' })
    .refine((v) => RATING_VALUES.includes(v as any), { message: 'Chọn mức đánh giá hợp lệ' }),
});

export type DieuchinhLichtapForm = z.infer<typeof updateLichtapHangtuanSchema>;
