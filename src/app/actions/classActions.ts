"use server";
import db from "@/lib/db";
import { revalidatePath } from "next/cache";

export interface ClassRoom {
  Id: number;
  Namarombel: string;
  Kelas: string;
  Jumlahpeserta: string;
  Ruangan: string;
}

export async function getClasses(): Promise<ClassRoom[]> {
  try {
    const [rows] = await db.query("SELECT * FROM rombel ORDER BY Id DESC");
    return rows as ClassRoom[];
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function addClass(data: Omit<ClassRoom, "Id">) {
  try {
    const result: any = await db.query(
      "INSERT INTO rombel (Namarombel, Kelas, Jumlahpeserta, Ruangan) VALUES (?, ?, ?, ?)",
      [data.Namarombel, data.Kelas, data.Jumlahpeserta, data.Ruangan]
    );
    revalidatePath("/classes");
    return { success: true, id: result[0].insertId };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateClass(id: number, data: Omit<ClassRoom, "Id">) {
  try {
    await db.query(
      "UPDATE rombel SET Namarombel=?, Kelas=?, Jumlahpeserta=?, Ruangan=? WHERE Id=?",
      [data.Namarombel, data.Kelas, data.Jumlahpeserta, data.Ruangan, id]
    );
    revalidatePath("/classes");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteClass(id: number) {
  try {
    await db.query("DELETE FROM rombel WHERE Id=?", [id]);
    revalidatePath("/classes");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
