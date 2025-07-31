import { z } from 'zod';

export const xoaTaikhoanSchema = z.object({
  confirmation: z.string().refine((val: any) => val === 'tôi đã hiểu', {
    message: 'Vui lòng nhập đúng chuỗi xác nhận!',
  }),
});
