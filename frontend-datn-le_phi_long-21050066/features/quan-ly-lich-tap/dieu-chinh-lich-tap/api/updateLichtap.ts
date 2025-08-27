'use client';
import axios from 'axios';

export type ApiFieldErrors = Record<string, string>;

const ENDPOINT =
  `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/schedule/update`;

export async function updateWeeklySchedule(
  data: any
) {
  try {
    const res = await axios.patch(ENDPOINT, data, {
      withCredentials: true,
    });
    return res.data;
  } catch (error: any) {
    console.log(error)
    if (error?.response?.data) {
      return error.response.data;
    }
    return {
      statusCode: 500,
      message: 'Lỗi hệ thống, vui lòng thử lại sau!',
    };
  }
}
