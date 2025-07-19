import { z, ZodType } from "zod"; // Add new import

export const DangnhapSchema = z.object({
    email: z.string().nonempty('Vui lòng nhập vào trường này!'),
    password: z.string().nonempty('Vui lòng nhập vào trường này!').min(8, 'Mật khẩu phải có tối thiểu 8 ký tự!')
})

export type TDangnhap = z.infer<typeof DangnhapSchema>;
