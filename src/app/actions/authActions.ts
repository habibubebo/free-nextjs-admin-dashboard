"use server";
import db from "@/lib/db";
import { executeQuery } from "@/lib/dbHelper";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import crypto from "crypto";

export interface InstructorSession {
  id: number;
  name: string;
  email: string;
  gender: string;
  birthPlace: string;
  birthDate: string;
  motherName: string;
  address: string;
  username: string;
  role: 'superadmin' | 'instructor';
}

// Hash password using SHA256
function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

// Login instructor using username and password from akun table
export async function loginInstructor(username: string, password: string) {
  try {
    const hashedPassword = hashPassword(password);
    
    // Query akun table with instructor info
    const [rows] = await executeQuery<any>(
      `SELECT a.id, a.username, a.role, i.Id, i.NamaInstruktur, i.Email, i.Kelamin, 
              i.Tempatlahir, i.Tanggallahir, i.Namaibu, i.Alamat
       FROM akun a
       JOIN instruktur i ON a.instructor_id = i.Id
       WHERE a.username = ? AND a.password = ?`,
      [username, hashedPassword]
    );
    
    if (!rows || rows.length === 0) {
      // Log failed login attempt
      const { addLog } = await import("./logActions");
      await addLog(null, "Login Failed", `Failed login attempt with email: ${username}`);
      return { success: false, error: "Username atau password salah" };
    }
    
    const account = rows[0];
    
    const sessionData: InstructorSession = {
      id: account.Id,
      name: account.NamaInstruktur,
      email: account.Email,
      gender: account.Kelamin,
      birthPlace: account.Tempatlahir,
      birthDate: account.Tanggallahir,
      motherName: account.Namaibu,
      address: account.Alamat,
      username: account.username,
      role: account.role || 'instructor',
    };
    
    // Store session in cookie
    const cookieStore = await cookies();
    cookieStore.set("instructor_session", JSON.stringify(sessionData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });
    
    // Log successful login
    const { addLog } = await import("./logActions");
    await addLog(account.Id, "Login", `${account.NamaInstruktur} logged in`);
    
    return { success: true, instructor: sessionData };
  } catch (error: any) {
    console.error(error);
    return { success: false, error: error.message };
  }
}

// Logout instructor
export async function logoutInstructor() {
  try {
    // Get current session to log who is logging out
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("instructor_session");
    let userId: number | null = null;
    let userName = "Unknown";
    
    if (sessionCookie && sessionCookie.value) {
      try {
        const session = JSON.parse(sessionCookie.value) as InstructorSession;
        userId = session.id;
        userName = session.name;
      } catch (e) {
        // Ignore parse errors
      }
    }
    
    cookieStore.delete("instructor_session");
    
    // Log logout
    const { addLog } = await import("./logActions");
    await addLog(userId, "Logout", `${userName} logged out`);
    
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Get current session
export async function getCurrentSession(): Promise<InstructorSession | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("instructor_session");
    
    if (!sessionCookie || !sessionCookie.value) {
      return null;
    }
    
    return JSON.parse(sessionCookie.value) as InstructorSession;
  } catch (error) {
    console.error(error);
    return null;
  }
}

// Update instructor password in akun table
export async function updateInstructorPassword(instructorId: number, newPassword: string) {
  try {
    const hashedPassword = hashPassword(newPassword);
    
    await executeQuery(
      "UPDATE akun SET password = ? WHERE instructor_id = ?",
      [hashedPassword, instructorId]
    );
    
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Check if username exists
export async function checkUsernameExists(username: string, excludeInstructorId?: number) {
  try {
    let query = "SELECT COUNT(*) as count FROM akun WHERE username = ?";
    let params: any[] = [username];
    
    if (excludeInstructorId) {
      query += " AND instructor_id != ?";
      params.push(excludeInstructorId);
    }
    
    const [rows] = await executeQuery<any>(query, params);
    const count = rows[0].count;
    
    return count > 0;
  } catch (error: any) {
    console.error(error);
    return false;
  }
}

// Create account for instructor
export async function createInstructorAccount(instructorId: number, username: string, password: string, nama: string, role: 'superadmin' | 'instructor' = 'instructor') {
  try {
    const hashedPassword = hashPassword(password);
    
    await executeQuery(
      "INSERT INTO akun (instructor_id, username, password, nama, role) VALUES (?, ?, ?, ?, ?)",
      [instructorId, username, hashedPassword, nama, role]
    );
    
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Update account for instructor
export async function updateInstructorAccount(instructorId: number, username: string, password: string | null, nama: string, role: 'superadmin' | 'instructor' = 'instructor') {
  try {
    if (password) {
      const hashedPassword = hashPassword(password);
      await executeQuery(
        "UPDATE akun SET username = ?, password = ?, nama = ?, role = ? WHERE instructor_id = ?",
        [username, hashedPassword, nama, role, instructorId]
      );
    } else {
      await executeQuery(
        "UPDATE akun SET username = ?, nama = ?, role = ? WHERE instructor_id = ?",
        [username, nama, role, instructorId]
      );
    }
    
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Update email in both akun and instruktur tables
export async function updateInstructorEmail(instructorId: number, newEmail: string) {
  try {
    // Update akun table
    await executeQuery(
      "UPDATE akun SET username = ? WHERE instructor_id = ?",
      [newEmail, instructorId]
    );
    
    // Update instruktur table
    await executeQuery(
      "UPDATE instruktur SET Email = ? WHERE Id = ?",
      [newEmail, instructorId]
    );
    
    // Update session cookie
    const session = await getCurrentSession();
    if (session) {
      const { cookies } = await import("next/headers");
      const cookieStore = await cookies();
      const updatedSession = {
        ...session,
        email: newEmail,
      };
      cookieStore.set("instructor_session", JSON.stringify(updatedSession), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7,
      });
    }
    
    revalidatePath("/profile");
    revalidatePath("/account-settings");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Delete account for instructor
export async function deleteInstructorAccount(instructorId: number) {
  try {
    await executeQuery(
      "DELETE FROM akun WHERE instructor_id = ?",
      [instructorId]
    );
    
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
