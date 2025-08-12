import z from "zod";

export const levelSchema = z.object({
  reps: z.number().min(1, 'Rep phải lớn hơn 0').max(100, 'Tối đa 100 rep'),
  sets: z.number().min(1, 'Set phải lớn hơn 0').max(5, 'Tối đa 5 set'),
});
export const imageLabelSchema = z.object({
  label: z.string().min(1, 'Nhập tên nhãn'),
  images: z.array(z.object({
    file: z.any(),
    preview: z.string(),
    customName: z.string().optional(),
  })),
});
export const trainSchema = z.object({
  actionName: z.string().min(1, 'Nhập tên động tác'),
  imageLabels: z.array(imageLabelSchema).min(3, 'Phải có ít nhất 3 nhóm label'),
});