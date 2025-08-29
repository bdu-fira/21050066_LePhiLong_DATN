import axios from "axios";

export async function getExercise(data: any) {
  try {
    const res = await axios.post(
      `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/exercise/getExercise`,
      data,
      {
        headers: { "Content-Type": "application/json" },
        withCredentials: true, // cần nếu AuthGuard đọc cookie
      }
    );
    return res.data;
  } catch (error: any) {
    if (error.response) return error.response.data;
    return { statusCode: 500, message: "Lỗi hệ thống, vui lòng thử lại sau!" };
  }
}
