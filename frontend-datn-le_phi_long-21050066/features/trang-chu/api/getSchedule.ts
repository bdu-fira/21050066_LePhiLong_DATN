import { GetScheduleResponse, getScheduleResponseSchema } from "../schemas/getScheduleSchema";

/**
 * Gọi API lịch tập hiện tại.
 * - Dùng credentials: 'include' vì backend đang check session/JWT cookie giống các phần khác.
 * - Parse & validate bằng zod để FE luôn nhận đúng shape dữ liệu.
 */
export async function getSchedule(): Promise<GetScheduleResponse> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/schedule/getSchedule`, {
    method: "GET",
    credentials: "include",
  });

  // Nếu BE trả non-JSON, vẫn cố parse -> ném lỗi có ý nghĩa
  let json: unknown;
  try {
    json = await res.json();
  } catch {
    throw new Error("Không đọc được dữ liệu lịch tập từ máy chủ.");
  }

  const parsed = getScheduleResponseSchema.safeParse(json);
  if (!parsed.success) {
    // Bạn có thể log parsed.error để debug khi cần
    throw new Error("Dữ liệu lịch tập không đúng định dạng.");
  }
  return parsed.data;
}
