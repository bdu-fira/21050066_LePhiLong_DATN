import { id } from "date-fns/locale";
import z from "zod";

export const formCapnhatTieuchiSchema = z.object({
  criteria: z
    .array(
      z.object({
        id: z.number().optional(),
        jointAngle: z
          .string()
          .refine(
            val => val.split(',').length === 3 && val.split(',').every(s => !!s) && val.split(',').every(s => !isNaN(Number(s))),
            { message: 'Chọn đúng 1 góc khớp (3 landmark)' }
          ),
        operator: z.enum(["<", ">", "=", "<=", ">="], {
            required_error: "Phải chọn toán tử",
            invalid_type_error: "Toán tử không hợp lệ",
          }),
        angle: z
          .string()
          .refine(val => {
            const n = Number(val);
            return !isNaN(n) && n > 0 && n <= 180;
          }, { message: 'Góc phải là số > 0 và <= 180' }),
        errorMessage: z
          .string()
          .min(1, 'Nhập message'),
      })
    )
    .min(1, 'Phải có ít nhất 1 tiêu chí'),
});
