import { z } from 'zod';

export const capnhatTaiKhoanSchema = z.object({
  name: z.string().min(1, 'Tên không được để trống'),
  gender: z.enum(['0', '1'], { required_error: 'Chọn giới tính' }),
  dateOfBirth: z.string().refine(val => !isNaN(Date.parse(val)), {
    message: 'Ngày sinh không hợp lệ',
  }),
  email: z.string().email('Email không hợp lệ'),
  password: z.string().optional(),
  confirmPassword: z.string().optional(),
}).refine((data) => {
  // Nếu có nhập password thì bắt buộc confirmPassword phải khớp
  if (data.password && data.password.length > 0) {
    return data.password === data.confirmPassword;
  }
  return true; // Không đổi mật khẩu thì bỏ qua
}, {
  path: ["confirmPassword"], // Hiển thị lỗi ở field này
  message: "Mật khẩu nhập lại không khớp!"
});
