import { z } from 'zod';

export const capnhatThongTinCaNhanSchema = z.object({
  weight: z
    .number({ invalid_type_error: 'Cân nặng phải là số' })
    .min(20, 'Cân nặng phải >= 20')
    .max(200, 'Cân nặng phải <=200'),
  height: z
    .number({ invalid_type_error: 'Chiều cao phải là số' })
    .min(50, 'Chiều cao phải >= 50')
    .max(250, 'Chiều cao phải <= 250'),
});
