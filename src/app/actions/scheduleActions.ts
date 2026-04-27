export interface Schedule {
  Id: number;
  Tanggal: string;
  JamMulai: string;
  JamSelesai: string;
  NamaInstruktur: string;
  Namarombel: string;
  Jeniskursus: string;
  Ruangan: string;
  Materi: string;
  Status: "scheduled" | "ongoing" | "completed" | "cancelled";
}

export interface ScheduleWithPagination {
  data: Schedule[];
  total: number;
}

export async function getSchedules(
  instructorId?: number,
  page: number = 1,
  limit: number = 20
): Promise<ScheduleWithPagination> {
  try {
    const params = new URLSearchParams();
    if (instructorId) params.set("instructorId", instructorId.toString());
    params.set("page", page.toString());
    params.set("limit", limit.toString());

    const res = await fetch(`/api/attendance?${params.toString()}`, {
      cache: "no-store",
    });

    if (!res.ok) throw new Error("Failed to fetch schedules");

    const data = await res.json();
    return {
      data: data.data || [],
      total: data.total || 0,
    };
  } catch (error) {
    console.error("Error fetching schedules:", error);
    return { data: [], total: 0 };
  }
}

export async function getScheduleByPage(
  instructorId: number | undefined,
  page: number
): Promise<Schedule[]> {
  try {
    const params = new URLSearchParams();
    if (instructorId) params.set("instructorId", instructorId.toString());
    params.set("page", page.toString());

    const res = await fetch(`/api/attendance?${params.toString()}`, {
      cache: "no-store",
    });

    if (!res.ok) throw new Error("Failed to fetch schedules");

    const data = await res.json();
    return data.data || [];
  } catch (error) {
    console.error("Error fetching schedules:", error);
    return [];
  }
}