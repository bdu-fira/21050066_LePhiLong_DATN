'use client';
import axios from "axios";

export async function deleteExercise(payload: any) {
  try {
    console.log(payload)
    const res = await axios.delete(
      `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/exercise/delete`,
      {
        data: payload, 
        withCredentials: true      
      }
    );
    return res.data as { statusCode: number; message: string; data?: any };
  } catch (error: any) {
    if (error.response) return error.response.data;
    return { statusCode: 500, message: "Lỗi hệ thống, vui lòng thử lại sau!" };
  }
}
