import { z, ZodType } from "zod"; // Add new import

export const DangnhapSchema = z.object({
    email: z.string().nonempty('Vui lòng nhập vào trường này!').email('Vui lòng nhập đúng định dạng email!'),
    password: z.string().nonempty('Vui lòng nhập vào trường này!').min(6, 'Mật khẩu phải có tối thiểu 6 ký tự!')
})

export type TDangnhap = z.infer<typeof DangnhapSchema>;
