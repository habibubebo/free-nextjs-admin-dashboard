"use server";
import db from "@/lib/db";
import { revalidatePath } from "next/cache";

export interface CourseUnit {
  Id: number;
  Rombel: number;
  Uk1: string;
  Uk2: string;
  Uk3: string;
  Uk4: string;
  Uk5: string;
  Jp1: string;
  Jp2: string;
  Jp3: string;
  Jp4: string;
  Jp5: string;
  Jptotal: string;
  // Joins
  Namarombel?: string;
}

export async function getCourseUnits(): Promise<CourseUnit[]> {
  try {
    const query = `
      SELECT uk.*, r.Namarombel 
      FROM unitkompetensi uk
      LEFT JOIN rombel r ON uk.Rombel = r.Id
      ORDER BY uk.Id DESC
    `;
    const [rows] = await db.query(query);
    return rows as CourseUnit[];
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function addCourseUnit(data: Omit<CourseUnit, "Id" | "Namarombel">) {
  try {
    const result: any = await db.query(
      `INSERT INTO unitkompetensi 
      (Rombel, Uk1, Uk2, Uk3, Uk4, Uk5, Jp1, Jp2, Jp3, Jp4, Jp5, Jptotal) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [data.Rombel, data.Uk1, data.Uk2, data.Uk3, data.Uk4, data.Uk5, data.Jp1, data.Jp2, data.Jp3, data.Jp4, data.Jp5, data.Jptotal]
    );
    revalidatePath("/course-units");
    return { success: true, id: result[0].insertId };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateCourseUnit(id: number, data: Partial<CourseUnit>) {
  try {
    await db.query(
      `UPDATE unitkompetensi 
      SET Rombel=?, Uk1=?, Uk2=?, Uk3=?, Uk4=?, Uk5=?, Jp1=?, Jp2=?, Jp3=?, Jp4=?, Jp5=?, Jptotal=? 
      WHERE Id=?`,
      [data.Rombel, data.Uk1, data.Uk2, data.Uk3, data.Uk4, data.Uk5, data.Jp1, data.Jp2, data.Jp3, data.Jp4, data.Jp5, data.Jptotal, id]
    );
    revalidatePath("/course-units");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteCourseUnit(id: number) {
  try {
    await db.query("DELETE FROM unitkompetensi WHERE Id=?", [id]);
    revalidatePath("/course-units");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
