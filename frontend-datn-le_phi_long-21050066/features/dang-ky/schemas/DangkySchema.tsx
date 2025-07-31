import { z } from 'zod'

export const dangkySchema = z.object({
  name: z.string().min(1, 'Tên không được để trống'),
  gender: z.enum(['0', '1'], { required_error: 'Chọn giới tính' }),
  dateOfBirth: z.string().refine(val => !isNaN(Date.parse(val)), {
    message: 'Ngày sinh không hợp lệ',
  }),
  email: z.string().email('Email không hợp lệ'),
  password: z.string().nonempty('Vui lòng nhập mật khẩu!'),
  confirmPassword: z.string().nonempty('Vui lòng nhập lại mật khẩu!'),
}).refine((data) => data.password === data.confirmPassword, {
  path: ['confirmPassword'],
  message: 'Mật khẩu không khớp',
})
