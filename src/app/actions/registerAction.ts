"use server";
import db from "@/lib/db";

export async function registerStudent(formData: FormData) {
  try {
    const data = {
      Nama: formData.get("Nama"),
      Kelamin: formData.get("Kelamin"),
      Nik: formData.get("Nik"),
      Nokk: formData.get("Nokk"),
      Ttl: formData.get("Ttl"), // Tempat, Tanggal Lahir
      Tglmasuk: new Date().toISOString().split("T")[0],
      Status: 0, // 0 = Pending/Unverified
    };
    await db.query(
      "INSERT INTO peserta (Nama, Kelamin, Nik, Nokk, Ttl, Tglmasuk, Status) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [data.Nama, data.Kelamin, data.Nik, data.Nokk, data.Ttl, data.Tglmasuk, data.Status]
    );
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
