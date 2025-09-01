'use client';
import axios from 'axios';

export async function updateCriteria(payload: any) {
  try {
    console.log(payload)
    const res = await axios.patch(
      `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/exercise/updateCriteria`,
      payload,
      { withCredentials: true }
    );
    return res.data as { statusCode: number; message: string; data?: any };
  } catch (error: any) {
    if (error?.response) return error.response.data;
    return { statusCode: 500, message: error?.message || 'Có lỗi xảy ra.' };
  }
}
