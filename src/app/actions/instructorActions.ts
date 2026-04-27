"use server";
import db from "@/lib/db";
import { executeQuery } from "@/lib/dbHelper";
import { revalidatePath } from "next/cache";
import crypto from "crypto";
import { createInstructorAccount, updateInstructorAccount, deleteInstructorAccount, getCurrentSession } from "./authActions";

export interface Instructor {
  Id: number;
  NamaInstruktur: string;
  Kelamin: string;
  Tempatlahir: string;
  Tanggallahir: string;
  Namaibu: string;
  Alamat: string;
  Email: string;
  username?: string;
  password?: string;
  role?: 'superadmin' | 'instructor';
}

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

export async function getInstructors(): Promise<Instructor[]> {
  try {
    const [rows] = await executeQuery<Instructor>(
      `SELECT i.Id, i.NamaInstruktur, i.Kelamin, i.Tempatlahir, i.Tanggallahir, 
              i.Namaibu, i.Alamat, i.Email, a.username, a.role
       FROM instruktur i
       LEFT JOIN akun a ON i.Id = a.instructor_id
       ORDER BY i.NamaInstruktur ASC`
    );
    return rows;
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function addInstructor(data: Omit<Instructor, "Id">) {
  try {
    // Insert into instruktur table
    const [result] = await executeQuery<any>(
      "INSERT INTO instruktur (NamaInstruktur, Kelamin, Tempatlahir, Tanggallahir, Namaibu, Alamat, Email) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [data.NamaInstruktur, data.Kelamin, data.Tempatlahir, data.Tanggallahir, data.Namaibu, data.Alamat, data.Email]
    );
    
    const instructorId = (result as any).insertId;
    
    // Create account in akun table if email and password provided
    if (data.Email && data.password) {
      const accountResult = await createInstructorAccount(
        instructorId,
        data.Email, // Use email as username
        data.password,
        data.NamaInstruktur,
        data.role || 'instructor'
      );
      
      if (!accountResult.success) {
        // Delete instructor if account creation fails
        await executeQuery("DELETE FROM instruktur WHERE Id = ?", [instructorId]);
        return { success: false, error: "Gagal membuat akun login" };
      }
    }
    
    // Log the action
    const { addLog } = await import("./logActions");
    const { getCurrentSession } = await import("./authActions");
    const session = await getCurrentSession();
    await addLog(
      session?.id || null,
      "Create Instructor",
      `Created instructor: ${data.NamaInstruktur} (Email: ${data.Email})`
    );
    
    revalidatePath("/instructors");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateInstructor(id: number, data: Omit<Instructor, "Id">) {
  try {
    // Update instruktur table
    await executeQuery(
      "UPDATE instruktur SET NamaInstruktur=?, Kelamin=?, Tempatlahir=?, Tanggallahir=?, Namaibu=?, Alamat=?, Email=? WHERE Id=?",
      [data.NamaInstruktur, data.Kelamin, data.Tempatlahir, data.Tanggallahir, data.Namaibu, data.Alamat, data.Email, id]
    );
    
    // Update or create account in akun table if email (username) provided
    if (data.Email) {
      // Check if account already exists
      const [existingAccount] = await executeQuery<any>(
        "SELECT id FROM akun WHERE instructor_id = ?",
        [id]
      );
      
      if (existingAccount && existingAccount.length > 0) {
        // Account exists, update it
        const accountResult = await updateInstructorAccount(
          id,
          data.Email, // Use email as username
          data.password || null,
          data.NamaInstruktur,
          data.role || 'instructor'
        );
        
        if (!accountResult.success) {
          return { success: false, error: "Gagal mengupdate akun login" };
        }
      } else {
        // Account doesn't exist, create it
        // Password is required when creating new account
        if (!data.password) {
          return { success: false, error: "Password harus diisi untuk membuat akun baru" };
        }
        
        const accountResult = await createInstructorAccount(
          id,
          data.Email, // Use email as username
          data.password,
          data.NamaInstruktur,
          data.role || 'instructor'
        );
        
        if (!accountResult.success) {
          return { success: false, error: "Gagal membuat akun login" };
        }
      }
    }
    
    // Log the action
    const { addLog } = await import("./logActions");
    const session = await getCurrentSession();
    await addLog(
      session?.id || null,
      "Update Instructor",
      `Updated instructor: ${data.NamaInstruktur} (ID: ${id})`
    );
    
    // Update session cookie with new data
    if (session) {
      const { cookies } = await import("next/headers");
      const cookieStore = await cookies();
      const updatedSession = {
        ...session,
        name: data.NamaInstruktur,
        email: data.Email,
        gender: data.Kelamin,
        birthPlace: data.Tempatlahir,
        birthDate: data.Tanggallahir,
        motherName: data.Namaibu,
        address: data.Alamat,
      };
      cookieStore.set("instructor_session", JSON.stringify(updatedSession), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7,
      });
    }
    
    revalidatePath("/instructors");
    revalidatePath("/profile");
    revalidatePath("/account-settings");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteInstructor(id: number) {
  try {
    // Get instructor name before deleting
    const [instructorData] = await executeQuery<any>(
      "SELECT NamaInstruktur FROM instruktur WHERE Id = ?",
      [id]
    );
    const instructorName = instructorData?.[0]?.NamaInstruktur || "Unknown";
    
    // Delete account from akun table first (due to foreign key)
    await deleteInstructorAccount(id);
    
    // Delete from instruktur table
    await executeQuery("DELETE FROM instruktur WHERE Id=?", [id]);
    
    // Log the action
    const { addLog } = await import("./logActions");
    const { getCurrentSession } = await import("./authActions");
    const session = await getCurrentSession();
    await addLog(
      session?.id || null,
      "Delete Instructor",
      `Deleted instructor: ${instructorName} (ID: ${id})`
    );
    
    revalidatePath("/instructors");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
