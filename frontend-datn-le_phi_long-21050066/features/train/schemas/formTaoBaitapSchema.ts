import { z } from "zod";

export const formTaoBaitapSchema = z.object({
  name: z
    .string({ required_error: "Tên bài tập không được trống" })
    .trim()
    .min(1, "Tên bài tập không được trống")
    .max(255, "Tên bài tập tối đa 255 ký tự"),

  minAge: z
    .coerce.number({ required_error: "Tuổi tối thiểu không được trống" })
    .int("Tuổi tối thiểu phải là số nguyên")
    .min(15, "Tuổi tối thiểu phải ≥ 15")
    .max(100, "Tuổi tối thiểu phải ≤ 100"),

  maxAge: z
    .coerce.number({ required_error: "Tuổi tối đa không được trống" })
    .int("Tuổi tối đa phải là số nguyên")
    .min(15, "Tuổi tối đa phải ≥ 15")
    .max(100, "Tuổi tối đa phải ≤ 100"),

  calo: z
    .coerce.number({ required_error: "Calo không được trống" })
    .min(0.01, "Calo tối thiểu 0.01")
    .max(1, "Calo tối đa 1"),
    
  muscles: z.array(z.number()).min(1, "Chọn ít nhất 1 nhóm cơ"),
}).refine((val) => val.minAge < val.maxAge, {
  path: ["minAge"],
  message: "Tuổi tối thiểu phải nhỏ hơn tuổi tối đa",
});

export type CreateExerciseFormValues = z.infer<typeof formTaoBaitapSchema>;
