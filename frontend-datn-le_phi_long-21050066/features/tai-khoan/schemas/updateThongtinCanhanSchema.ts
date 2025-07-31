import { z } from 'zod';

export const capnhatThongTinCaNhanSchema = z.object({
  weight: z
    .number({ invalid_type_error: 'Cân nặng phải là số' })
    .min(1, 'Cân nặng phải lớn hơn 0'),
  height: z
    .number({ invalid_type_error: 'Chiều cao phải là số' })
    .min(1, 'Chiều cao phải lớn hơn 0'),
});
