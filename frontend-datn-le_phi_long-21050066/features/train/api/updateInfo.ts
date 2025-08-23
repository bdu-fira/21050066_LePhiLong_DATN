'use client';
import axios from 'axios';

export type UpdateExercisePayload = {
  id: number;
  name?: string;
  minAge?: number;
  maxAge?: number;
  muscles?: number[];
  fbxFile?: File; // thêm file nếu cần
};

export async function updateInfo(payload: UpdateExercisePayload) {
  try {
    const formData = new FormData();

    // append các field khác
    formData.append('id', String(payload.id));
    if (payload.name) formData.append('name', payload.name);
    if (payload.minAge !== undefined) formData.append('minAge', String(payload.minAge));
    if (payload.maxAge !== undefined) formData.append('maxAge', String(payload.maxAge));
    if (Array.isArray(payload.muscles)) {
      payload.muscles.forEach((m) => formData.append('muscles', String(m)));
    }

    if (payload.fbxFile) {
      formData.append('file', payload.fbxFile);
    }

    const res = await axios.patch(
      `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/exercise/updateInfo`,
      formData,
      {
        withCredentials: true,
      }
    );

    return res.data as { statusCode: number; message: string; data?: any };
  } catch (error: any) {
    console.log(error)
    if (error?.response) return error.response.data;
    return { statusCode: 500, message: 'Lỗi hệ thống, vui lòng thử lại sau.' };
  }
}
