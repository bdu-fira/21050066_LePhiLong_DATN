import axios from "axios";

export async function getFile(data: any) {
  try {
    const path = typeof data === "string" ? data : data?.path;
    const res = await axios.get(
      `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/exercise/getFile`,
      {
        params: { path },           
        responseType: "blob",      
        headers: {
          "Content-Type": "application/json",
          Accept: "application/octet-stream",
        },
        withCredentials: true,
      }
    );
    return res.data as Blob;        
  } catch (error: any) {
    if (error.response) return error.response.data;
    return { statusCode: 500, message: "Lỗi hệ thống, vui lòng thử lại sau!" };
  }
}
