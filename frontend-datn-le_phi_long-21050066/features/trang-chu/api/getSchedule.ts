import { GetScheduleResponse, getScheduleResponseSchema } from "../schemas/getScheduleSchema";

export async function getSchedule(): Promise<GetScheduleResponse> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/schedule/getSchedule`, {
    method: "GET",
    credentials: "include",
  });

  let json: unknown;
  try {
    json = await res.json();
  } catch {
    throw new Error("Không đọc được dữ liệu lịch tập từ máy chủ.");
  }

  const parsed = getScheduleResponseSchema.safeParse(json);
  if (!parsed.success) {
    throw new Error("Dữ liệu lịch tập không đúng định dạng.");
  }
  return parsed.data;
}
