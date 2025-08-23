// features/train/api/updateModel.ts
'use client';
import axios from 'axios';

export type UpdateModelPayload = {
  id: number;
  accuracy?: number;
  modelFile?: File; // file weights (model.weights)
};

export async function updateModel(payload: UpdateModelPayload) {
  try {
    const formData = new FormData();
    formData.append('id', String(payload.id));
    if (typeof payload.accuracy === 'number') {
      formData.append('accuracy', String(payload.accuracy));
    }
    if (payload.modelFile) {
      formData.append('file', payload.modelFile, 'model.weights');
    }

    const res = await axios.patch(
      `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/exercise/updateModel`,
      formData,
      { withCredentials: true }
    );

    return res.data as { statusCode: number; message: string; data?: any };
  } catch (error: any) {
    if (error?.response) return error.response.data;
    return { statusCode: 500, message: 'Lỗi hệ thống, vui lòng thử lại sau.' };
  }
}
