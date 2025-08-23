'use client';
import axios from "axios";

export interface ExerciseListItem {
  id: number;
  name: string;
  path?: string;
}

export async function findExercises(payload: any) {
  try {
    const res = await axios.get(
      `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/exercise/findAll`, // đổi sang /exercises/find nếu BE đã đổi
      {
        params: {
          name: payload.name,
          muscleGroupId: payload.muscleGroupId, // số
        },
        withCredentials: true,
      }
    );
    return res.data as {
      statusCode: number;
      message: string;
      data: ExerciseListItem[];
    };
  } catch (error: any) {
    if (error.response) return error.response.data;
    return { statusCode: 500, message: "Lỗi hệ thống", data: [] as ExerciseListItem[] };
  }
}
