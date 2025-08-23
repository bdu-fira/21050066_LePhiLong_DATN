import z from "zod";

// Khớp với entity ExerciseLevel: cột 'rep' và 'set'
export const levelSchema = z.object({
  rep: z.number().int().min(1, 'Rep phải lớn hơn 0').max(100, 'Tối đa 100 rep'),
  set: z.number().int().min(1, 'Set phải lớn hơn 0').max(5, 'Tối đa 5 set'),
});

// Nhãn + ảnh huấn luyện
export const imageLabelSchema = z.object({
  label: z.string().min(1, 'Nhập tên nhãn').max(255, 'Tên nhãn tối đa 255 ký tự'),
  images: z.array(
    z.object({
      file: z.any(),          // Multer file từ FE
      preview: z.string(),    // URL preview
      customName: z.string().optional(),
    })
  )
  .min(10, 'Mỗi nhãn cần ít nhất 10 ảnh')
  .max(50, 'Mỗi nhãn tối đa 50 ảnh'),
});

export const trainSchema = z.object({
  id: z.number().min(1, 'Không thấy ID bài tập'),
  name: z.string().min(1, 'Nhập tên bài tập').max(255, 'Tên bài tập tối đa 255 ký tự'),
  imageLabels: z.array(imageLabelSchema).length(3, 'Cần đúng 3 nhóm label'),
  lastTrainResult: z.number().min(0).max(1).nullable().optional(), // double nullable
});
