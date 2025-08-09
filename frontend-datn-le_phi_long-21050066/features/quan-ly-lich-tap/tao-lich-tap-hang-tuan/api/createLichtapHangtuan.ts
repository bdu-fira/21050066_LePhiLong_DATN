'use client';
import axios from 'axios';

export type ApiFieldErrors = Record<string, string>;

/** TODO: Chỉnh endpoint này cho khớp backend của bạn */
const ENDPOINT =
  `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/lich-tap/create`;

export async function createLichtapHangtuan(
  data: any
) {
  try {
    const res = await axios.post(ENDPOINT, data, {
      headers: { 'Content-Type': 'application/json' },
      withCredentials: true,
    });
    return res.data;
  } catch (error: any) {
    if (error?.response?.data) {
      return error.response.data;
    }
    return {
      statusCode: 500,
      message: 'Lỗi hệ thống, vui lòng thử lại sau!',
    };
  }
}
