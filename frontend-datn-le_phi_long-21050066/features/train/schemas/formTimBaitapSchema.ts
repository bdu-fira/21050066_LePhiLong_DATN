import { z } from "zod";

export const formTimBaitapSchema = z.object({
  // Tên bài tập: optional, nếu có thì validate độ dài
  name: z
    .string()
    .trim()
    .optional()
    .refine((s) => !s || (s.length >= 1 && s.length <= 255), {
      message: "Tên động tác không hợp lệ",
    }),

  // Nhóm cơ: optional, nếu có thì phải là số
  muscleGroupId: z
    .string()
    .trim()
    .optional()
    .refine((s) => !s || /^\d+$/.test(s), {
      message: "Nhóm cơ không hợp lệ",
    }),
});

export type FindExerciseFormValues = z.infer<typeof formTimBaitapSchema>;
// -> { name?: string; muscleGroupId?: string }
