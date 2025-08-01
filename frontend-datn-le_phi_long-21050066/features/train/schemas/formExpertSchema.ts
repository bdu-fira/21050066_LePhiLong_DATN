import z from "zod";

export const formExpertSchema = z.object({
  startAngle: z
    .number({ invalid_type_error: 'Vui lòng chọn góc đứng' })
    .refine(val => [-1, 0, 1].includes(val), { message: 'Chỉ chọn 1 trong 3 giá trị mặc định' }),
  order: z
    .array(z.string())
    .min(1, 'Phải có ít nhất 1 động tác trong thứ tự'),
  criteria: z
    .array(
      z.object({
        jointAngle: z
          .string()
          .refine(
            val => val.split(',').length === 3 && val.split(',').every(s => !!s),
            { message: 'Chọn đúng 1 góc khớp (3 landmark)' }
          ),
        angle: z
          .string()
          .refine(val => {
            const n = Number(val);
            return !isNaN(n) && n > 0 && n <= 180;
          }, { message: 'Góc phải là số > 0 và <= 180' }),
        message: z
          .string()
          .min(1, 'Nhập message'),
      })
    )
    .min(1, 'Phải có ít nhất 1 tiêu chí'),
});
