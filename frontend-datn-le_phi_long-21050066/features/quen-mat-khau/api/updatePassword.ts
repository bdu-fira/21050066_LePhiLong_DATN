'use client'
import axios from 'axios';

export async function updatePassword(data: any) {
  try {
    console.log(data)
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/user/update-password`,
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
