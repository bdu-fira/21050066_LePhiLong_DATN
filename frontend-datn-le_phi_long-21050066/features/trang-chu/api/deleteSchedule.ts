export async function deleteSchedule() {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/schedule/delete`, {
        method: "DELETE",
        credentials: "include",
    });
    return await res.json()
  }
  