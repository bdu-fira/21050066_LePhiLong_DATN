'use client'
import axios from 'axios';

export async function createTaikhoan(data: any) {
  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/user/create`,
      data,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  } catch (error: any) {
    // Xử lý lỗi trả về
    if (error.response) {
      return error.response.data;
    }
    return {
      statusCode: 500,
      message: 'Lỗi hệ thống, vui lòng thử lại sau!'
    };
  }
}
