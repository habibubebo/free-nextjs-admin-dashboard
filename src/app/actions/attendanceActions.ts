"use server";
import db from "@/lib/db";
import { revalidatePath } from "next/cache";

export interface Attendance {
  Id: number;
  Tgl: string;
  Nipd: number;
  Jeniskursus: string | null;
  Instruktur: number;
  Materi: string;
  // Joins
  NamaSiswa?: string;
  NamaInstruktur?: string;
  NamaRombel?: string;
}

export async function getAttendance(instructorId?: number, page: number = 1, limit: number = 20): Promise<{ data: Attendance[], total: number }> {
  try {
    const offset = (page - 1) * limit;
    
    let whereClause = "";
    if (instructorId) {
      whereClause = ` WHERE pr.Instruktur = ${instructorId}`;
    }
    
    // Get total count
    const countQuery = `SELECT COUNT(*) as total FROM presensi pr${whereClause}`;
    const countResult = await db.query(countQuery) as any;
    const total = countResult[0]?.[0]?.total || 0;
    
    // Get paginated data
    let query = `
      SELECT 
        pr.*,
        CASE 
          WHEN pr.Nipd = 0 THEN i.NamaInstruktur
          ELSE pe.Nama
        END as NamaSiswa,
        i.NamaInstruktur,
        CASE 
          WHEN pr.Nipd = 0 THEN 'Kehadiran Pegawai'
          ELSE r.Namarombel
        END as NamaRombel
      FROM presensi pr
      LEFT JOIN peserta pe ON pr.Nipd = pe.Nipd AND pr.Nipd != 0
      LEFT JOIN instruktur i ON pr.Instruktur = i.Id
      LEFT JOIN rombel r ON pr.Jeniskursus = r.Id
      ${whereClause}
      ORDER BY pr.Tgl DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
    
    const [rows] = await db.query(query) as any;
    return { data: rows as Attendance[], total };
  } catch (error) {
    console.error(error);
    return { data: [], total: 0 };
  }
}

export async function getAttendanceByPage(instructorId: number | undefined, page: number): Promise<Attendance[]> {
  const result = await getAttendance(instructorId, page, 20);
  return result.data;
}

export async function getAttendanceTotal(instructorId?: number): Promise<number> {
  try {
    let whereClause = "";
    if (instructorId) {
      whereClause = ` WHERE Instruktur = ${instructorId}`;
    }
    const countResult = await db.query(`SELECT COUNT(*) as total FROM presensi pr${whereClause}`) as any;
    return countResult[0]?.[0]?.total || 0;
  } catch (error) {
    console.error(error);
    return 0;
  }
}

export async function fetchAttendancePage(instructorId: number | undefined, page: number): Promise<{ data: Attendance[], total: number }> {
  return getAttendance(instructorId, page, 20);
}

export async function addStudentAttendanceBulk(data: {
  date: string;
  time: string;
  courseType: string;
  instructorId: number;
  material: string;
  studentNipds: number[];
}) {
  try {
    // Combine date and time into datetime
    const datetime = `${data.date} ${data.time}:00`;
    
    const values = data.studentNipds.map(nipd => [
      datetime, nipd, data.courseType, data.instructorId, data.material
    ]);
    
    if (values.length > 0) {
      await db.query(
        "INSERT INTO presensi (Tgl, Nipd, Jeniskursus, Instruktur, Materi) VALUES ?",
        [values]
      );
      
      // Log the action
      const { addLog } = await import("./logActions");
      const { getCurrentSession } = await import("./authActions");
      const session = await getCurrentSession();
      await addLog(
        session?.id || null,
        "Record Student Attendance",
        `Recorded attendance for ${data.studentNipds.length} students on ${datetime}, Material: ${data.material}`
      );
      
      revalidatePath("/attendance");
    }
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function addInstructorAttendanceBulk(data: {
  date: string;
  time: string;
  instructorIds: number[];
}) {
  try {
    // Combine date and time into datetime
    const datetime = `${data.date} ${data.time}:00`;
    
    // For instructor attendance, Nipd is 0 and Jeniskursus is NULL
    const values = data.instructorIds.map(id => [
      datetime, 0, null, id, ""
    ]);
    
    if (values.length > 0) {
      await db.query(
        "INSERT INTO presensi (Tgl, Nipd, Jeniskursus, Instruktur, Materi) VALUES ?",
        [values]
      );
      
      // Log the action
      const { addLog } = await import("./logActions");
      const { getCurrentSession } = await import("./authActions");
      const session = await getCurrentSession();
      await addLog(
        session?.id || null,
        "Record Instructor Attendance",
        `Recorded attendance for ${data.instructorIds.length} instructors on ${datetime}`
      );
      
      revalidatePath("/attendance");
    }
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateAttendance(id: number, data: { Tgl: string, Jam: string, Jeniskursus: string | null, Materi: string }) {
  try {
    // Combine date and time into datetime
    const datetime = `${data.Tgl} ${data.Jam}:00`;
    
    await db.query("UPDATE presensi SET Tgl=?, Jeniskursus=?, Materi=? WHERE Id=?", 
      [datetime, data.Jeniskursus, data.Materi, id]
    );
    
    // Log the action
    const { addLog } = await import("./logActions");
    const { getCurrentSession } = await import("./authActions");
    const session = await getCurrentSession();
    await addLog(
      session?.id || null,
      "Update Attendance",
      `Updated attendance record (ID: ${id}) on ${datetime}, Material: ${data.Materi}`
    );
    
    revalidatePath("/attendance");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteAttendance(id: number) {
  try {
    await db.query("DELETE FROM presensi WHERE Id=?", [id]);
    
    // Log the action
    const { addLog } = await import("./logActions");
    const { getCurrentSession } = await import("./authActions");
    const session = await getCurrentSession();
    await addLog(
      session?.id || null,
      "Delete Attendance",
      `Deleted attendance record (ID: ${id})`
    );
    
    revalidatePath("/attendance");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
