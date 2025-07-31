'use client'
import axios from 'axios';

export async function updateThongtinCanhan(data: { weight: number, height: number }) {
  try {
    const response = await axios.patch(
      `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/trainee/update`,
      data,
      {
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true,
      }
    );
    return response.data;
  } catch (error: any) {
    if (error.response) {
      return error.response.data;
    }
    return {
      statusCode: 500,
      message: 'Lỗi hệ thống, vui lòng thử lại sau!'
    };
  }
}
