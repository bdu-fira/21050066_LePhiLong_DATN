'use client'
import axios from 'axios';

export async function logout() {
  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/user/logout`,
      {},
      {
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true, 
      }
    );
    console.log(response.data)
    localStorage.clear()
    window.location.replace('dang-nhap')
  } catch (error: any) {
    console.log(error)
  }
}
