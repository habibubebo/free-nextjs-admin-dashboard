"use server";
import db from "@/lib/db";
import { revalidatePath } from "next/cache";

export interface Student {
  Id: number;
  Nama: string;
  Kelamin: string;
  Nipd: number;
  Nik: string;
  Nokk: string;
  Jeniskursus: number;
  Kelas: string;
  Tglmasuk: string;
  Ttl: string;
  Status: number;
}

export async function getStudents(): Promise<Student[]> {
  try {
    const [rows] = await db.query("SELECT * FROM peserta ORDER BY Id DESC");
    return rows as Student[];
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function updateStudentStatus(id: number, status: number) {
  try {
    // Get student name before updating
    const [studentData] = await db.query("SELECT Nama FROM peserta WHERE Id=?", [id]);
    const studentName = (studentData as any)?.[0]?.Nama || "Unknown";
    
    const statusNames: { [key: number]: string } = {
      0: "Nonaktif",
      1: "Aktif",
      2: "Lulus"
    };
    
    await db.query("UPDATE peserta SET Status=? WHERE Id=?", [status, id]);
    
    // Log the action
    const { addLog } = await import("./logActions");
    const { getCurrentSession } = await import("./authActions");
    const session = await getCurrentSession();
    await addLog(
      session?.id || null,
      "Update Student Status",
      `Updated ${studentName} status to ${statusNames[status] || "Unknown"} (ID: ${id})`
    );
    
    revalidatePath("/students");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateStudent(id: number, data: Partial<Student>) {
  try {
    await db.query(
      "UPDATE peserta SET Nama=?, Kelamin=?, Nipd=?, Nik=?, Nokk=?, Jeniskursus=?, Kelas=?, Ttl=? WHERE Id=?",
      [data.Nama, data.Kelamin, data.Nipd, data.Nik, data.Nokk, data.Jeniskursus, data.Kelas, data.Ttl, id]
    );
    
    // Log the action
    const { addLog } = await import("./logActions");
    const { getCurrentSession } = await import("./authActions");
    const session = await getCurrentSession();
    await addLog(
      session?.id || null,
      "Update Student",
      `Updated student: ${data.Nama} (ID: ${id})`
    );
    
    revalidatePath("/students");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function addStudent(data: Partial<Student>) {
  try {
    await db.query(
      "INSERT INTO peserta (Nama, Kelamin, Nipd, Nik, Nokk, Jeniskursus, Kelas, Tglmasuk, Ttl, Status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [data.Nama, data.Kelamin, data.Nipd, data.Nik, data.Nokk, data.Jeniskursus || null, data.Kelas, new Date().toISOString().split('T')[0], data.Ttl, 0]
    );
    
    // Log the action
    const { addLog } = await import("./logActions");
    const { getCurrentSession } = await import("./authActions");
    const session = await getCurrentSession();
    await addLog(
      session?.id || null,
      "Create Student",
      `Created student: ${data.Nama} (NIPD: ${data.Nipd})`
    );
    
    revalidatePath("/students");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteStudent(id: number) {
  try {
    // Get student name before deleting
    const [studentData] = await db.query("SELECT Nama FROM peserta WHERE Id=?", [id]);
    const studentName = (studentData as any)?.[0]?.Nama || "Unknown";
    
    await db.query("DELETE FROM peserta WHERE Id=?", [id]);
    
    // Log the action
    const { addLog } = await import("./logActions");
    const { getCurrentSession } = await import("./authActions");
    const session = await getCurrentSession();
    await addLog(
      session?.id || null,
      "Delete Student",
      `Deleted student: ${studentName} (ID: ${id})`
    );
    
    revalidatePath("/students");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
