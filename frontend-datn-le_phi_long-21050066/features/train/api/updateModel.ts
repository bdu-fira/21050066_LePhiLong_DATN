'use client';
import axios from 'axios';

export async function updateModel(payload: any) {
  try {
    const formData = new FormData();
    formData.append('id', String(payload.id));
    formData.append('accuracy', String(payload.accuracy));
    formData.append('labels', payload.labels);

    const models = [payload.modelJson, payload.modelWeights];
    formData.append('file[]', models[0]);
    formData.append('file[]', models[1]);

    const res = await axios.patch(
      `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/exercise/updateModel`,
      formData,
      { withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' }
       }
    );

    return res.data as { statusCode: number; message: string; data?: any };
  } catch (error: any) {
    if (error?.response) return error.response.data;
    console.log(error);
    return { statusCode: 500, message: 'Lỗi hệ thống, vui lòng thử lại sau.' };
  }
}