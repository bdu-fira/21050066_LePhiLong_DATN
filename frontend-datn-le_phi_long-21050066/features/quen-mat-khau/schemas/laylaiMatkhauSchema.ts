import { z } from 'zod'

export const laylaiMatkhauSchema = z.object({
  token: z.string().readonly(),
  password: z.string().nonempty('Vui lòng nhập mật khẩu!'),
  confirmPassword: z.string().nonempty('Vui lòng nhập lại mật khẩu!'),
}).refine((data) => data.password === data.confirmPassword, {
  path: ['confirmPassword'],
  message: 'Mật khẩu không khớp',
})
