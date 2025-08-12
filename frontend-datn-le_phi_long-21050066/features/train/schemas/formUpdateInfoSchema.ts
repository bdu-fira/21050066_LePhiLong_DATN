import { z } from 'zod';

export const levelInfoSchema = z.object({
  levels: z
    .array(
      z.object({
        sets: z
          .number({ invalid_type_error: 'Set không hợp lệ' })
          .min(1, 'Set tối thiểu 1')
          .max(5, 'Set tối đa 5'),
        reps: z
          .number({ invalid_type_error: 'Rep không hợp lệ' })
          .min(10, 'Rep tối thiểu 10')
          .max(100, 'Rep tối đa 100'),
      })
    )
    .length(3, 'Phải đủ 03 cấp độ'),
});

export const updateInfoSchema = z
  .object({
    exerciseName: z.string().min(1, 'Tên bài tập không được trống').max(255, 'Không quá 255 ký tự'),
    minAge: z.number({ invalid_type_error: 'Tuổi tối thiểu không hợp lệ' })
      .min(15, 'Tối thiểu 15')
      .max(100, 'Tối đa 100'),
    maxAge: z.number({ invalid_type_error: 'Tuổi tối đa không hợp lệ' })
      .min(15, 'Tối thiểu 15')
      .max(100, 'Tối đa 100'),
    // GIỜ: mảng id (number[])
    muscleGroups: z.array(z.number()).min(1, 'Chọn ít nhất 1 nhóm cơ'),
  })
  .refine((d) => d.minAge < d.maxAge, {
    message: 'Tuổi tối thiểu phải nhỏ hơn tuổi tối đa',
    path: ['minAge'],
  });
