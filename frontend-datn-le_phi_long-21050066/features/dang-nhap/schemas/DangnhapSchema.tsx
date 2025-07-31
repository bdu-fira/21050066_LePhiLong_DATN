import { z } from "zod"; // Add new import

export const DangnhapSchema = z.object({
    email: z.string().nonempty('Vui lòng nhập vào trường này!').email('Vui lòng nhập đúng định dạng email!'),
    password: z.string().nonempty('Vui lòng nhập vào trường này!')
})

export type TDangnhap = z.infer<typeof DangnhapSchema>;
