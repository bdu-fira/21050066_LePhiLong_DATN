import { z } from 'zod';

export const caiDatTaiKhoanSchema = z.object({
  name: z.string().min(1, 'Tên không được để trống'),
  gender: z.enum(['0', '1'], { required_error: 'Chọn giới tính' }),
  dateOfBirth: z.string().refine(val => !isNaN(Date.parse(val)), {
    message: 'Ngày sinh không hợp lệ',
  }),
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự')
});
