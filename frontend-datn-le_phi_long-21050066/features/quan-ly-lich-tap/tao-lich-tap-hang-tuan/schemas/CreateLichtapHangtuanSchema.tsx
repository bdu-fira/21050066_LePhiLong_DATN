import { z } from 'zod';
import { MUSCLE_GROUPS } from '@/constants';

/** 1=giữ dáng, 2=giảm mỡ, 3=tăng cơ */
export const GOAL_VALUES = [1, 2, 3] as const;

/** Lấy danh sách id hợp lệ từ MUSCLE_GROUPS */
export const MUSCLE_GROUP_IDS = MUSCLE_GROUPS.map(g => g.id);
const MUSCLE_GROUP_ID_SET = new Set(MUSCLE_GROUP_IDS);

export const createLichtapHangtuanSchema = z.object({
  dateOfBirth: z
    .string()
    .min(1, 'Vui lòng chọn ngày sinh')
    .refine((v) => !isNaN(Date.parse(v)), { message: 'Ngày sinh không hợp lệ' }),

  gender: z.enum(['0', '1'], { required_error: 'Chọn giới tính' }),

  height: z.coerce
    .number({ invalid_type_error: 'Chiều cao phải là số' })
    .min(80, 'Chiều cao phải >= 80 cm!')
    .max(250, 'Chiều cao phải <= 250 cm!'),

  weight: z.coerce
    .number({ invalid_type_error: 'Cân nặng phải là số' })
    .min(20, 'Cân nặng phải >= 20 kg!')
    .max(300, 'Cân nặng phải <= 300 kg!'),

  goal: z.coerce
    .number({ invalid_type_error: 'Mục tiêu không hợp lệ' })
    .refine((v) => GOAL_VALUES.includes(v as any), { message: 'Mục tiêu không hợp lệ' }),

  muscles: z
    .array(
      z.coerce
        .number({ invalid_type_error: 'Nhóm cơ không hợp lệ' })
        .refine((v) => MUSCLE_GROUP_ID_SET.has(v), { message: 'Nhóm cơ không hợp lệ' })
    )
    .min(1, 'Chọn ít nhất 1 nhóm cơ')
    .refine((arr) => new Set(arr).size === arr.length, {
      message: 'Danh sách nhóm cơ bị trùng',
    }),

  daysPerWeek: z.coerce
    .number({ invalid_type_error: 'Số ngày/tuần phải là số' })
    .int('Phải là số nguyên')
    .min(1, 'Tối thiểu 1 ngày/tuần')
    .max(7, 'Tối đa 7 ngày/tuần'),
});

export type CreateLichtapHangtuanForm = z.infer<typeof createLichtapHangtuanSchema>;
