import { z } from 'zod'

function diffInYears(dateString: string) {
  const now = new Date();
  const inputDate = new Date(dateString);

  let years = now.getFullYear() - inputDate.getFullYear();

  if (
    now.getMonth() < inputDate.getMonth() ||
    (now.getMonth() === inputDate.getMonth() &&
      now.getDate() < inputDate.getDate())
  ) {
    years--;
  }

  return years;
}

export const dangkySchema = z.object({
  name: z.string().min(1, 'Tên không được để trống'),
  gender: z.enum(['0', '1'], { required_error: 'Chọn giới tính' }),
  dateOfBirth: 
    z.string().refine(val => !isNaN(Date.parse(val)), {
      message: 'Ngày sinh không hợp lệ',
    })
    .refine(val => diffInYears(val) >= 15, {
      message: 'Tuổi phải >= 15!',
    })
    .refine(val => diffInYears(val) <= 100, {
      message: 'Tuổi phải <= 100!',
    }),
  email: z.string().email('Email không hợp lệ'),
  password: z.string().nonempty('Vui lòng nhập mật khẩu!'),
  confirmPassword: z.string().nonempty('Vui lòng nhập lại mật khẩu!'),
}).refine((data) => data.password === data.confirmPassword, {
  path: ['confirmPassword'],
  message: 'Mật khẩu không khớp',
})
