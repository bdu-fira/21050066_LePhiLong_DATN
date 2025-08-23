import { z } from 'zod';

export const FormCapnhatCapdoSchema = z.object({
  levels: z
    .array(
      z.object({
        set: z
          .number({ invalid_type_error: 'Set không hợp lệ' })
          .min(1, 'Set tối thiểu 1')
          .max(5, 'Set tối đa 5'),
        rep: z
          .number({ invalid_type_error: 'Rep không hợp lệ' })
          .min(10, 'Rep tối thiểu 10')
          .max(100, 'Rep tối đa 100'),
      })
    )
    .length(3, 'Phải đủ 03 cấp độ'),
});

export const FormCapnhatThongtinSchema = z
  .object({
    name: z.string().min(1, 'Tên bài tập không được trống').max(255, 'Không quá 255 ký tự'),
    minAge: z.number({ invalid_type_error: 'Tuổi tối thiểu không hợp lệ' })
      .min(15, 'Tối thiểu 15')
      .max(100, 'Tối đa 100'),
    maxAge: z.number({ invalid_type_error: 'Tuổi tối đa không hợp lệ' })
      .min(15, 'Tối thiểu 15')
      .max(100, 'Tối đa 100'),
    calo: z
      .number({ invalid_type_error: 'Calo phải là số' })
      .min(0.01, 'Calo tối thiểu 0.01')
      .max(1, 'Calo tối đa 1'),    
    muscles: z.array(z.number()).min(1, 'Chọn ít nhất 1 nhóm cơ'),
    fbxFile: z
      .instanceof(File, { message: 'Vui lòng chọn file FBX' })
      .refine((file) => file.type === 'application/octet-stream' || file.name.toLowerCase().endsWith('.fbx'), {
        message: 'File phải có định dạng .fbx',
      })
      .refine((file) => file.size <= 50 * 1024 * 1024, {
        message: 'File không được vượt quá 50MB',
      })
      .optional(),
  })
  .refine((d) => d.minAge < d.maxAge, {
    message: 'Tuổi tối thiểu phải nhỏ hơn tuổi tối đa',
    path: ['minAge'],
  });
