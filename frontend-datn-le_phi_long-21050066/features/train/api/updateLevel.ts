'use client';
import axios from 'axios';

export async function updateLevel(payload: any) {
  try {    
    const res = await axios.patch(
      `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/exercise/updateLevel`,
      payload,
      {
        withCredentials: true,
      }
    );

    return res.data as { statusCode: number; message: string; data?: any };
  } catch (error: any) {
    console.log(error.message)
    if (error?.response) return error.response.data;
    return { statusCode: 500, message: error.message };
  }
}
