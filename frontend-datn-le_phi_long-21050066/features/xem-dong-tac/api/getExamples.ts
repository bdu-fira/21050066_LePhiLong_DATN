import axios from "axios";

export async function getExamples() {
  try {
    const res = await axios.get(
      `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/exercise/getExamples`,
      { withCredentials: true }
    );
    return res.data; // { isSuccess, statusCode, message, data: [{id, name, path}] }
  } catch (error: any) {
    if (error.response) return error.response.data;
    return { statusCode: 500, message: "Lỗi hệ thống, vui lòng thử lại sau!" };
  }
}
