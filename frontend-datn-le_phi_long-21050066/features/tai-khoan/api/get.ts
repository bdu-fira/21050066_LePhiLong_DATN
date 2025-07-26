import axios from 'axios';

export async function getTaiKhoan(data: any) {
  try {
    const response = await axios.patch(
      `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/user/findOne`,
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
