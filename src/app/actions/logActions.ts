"use server";
import { executeQuery } from "@/lib/dbHelper";

export interface LogEntry {
  id: number;
  user_id: number | null;
  action: string;
  description: string | null;
  timestamp: string;
  ip_address: string | null;
}

/**
 * Get the latest 10 log entries
 */
export async function getLatestLogs(): Promise<LogEntry[]> {
  try {
    const [rows] = await executeQuery<LogEntry>(
      `SELECT id, user_id, action, description, timestamp, ip_address
       FROM log
       ORDER BY timestamp DESC
       LIMIT 10`,
      []
    );

    return rows || [];
  } catch (error: any) {
    console.error("Failed to fetch logs:", error);
    return [];
  }
}

/**
 * Add a new log entry
 */
export async function addLog(
  userId: number | null,
  action: string,
  description: string | null = null,
  ipAddress: string | null = null
) {
  try {
    await executeQuery(
      `INSERT INTO log (user_id, action, description, ip_address)
       VALUES (?, ?, ?, ?)`,
      [userId, action, description, ipAddress]
    );

    return { success: true };
  } catch (error: any) {
    console.error("Failed to add log:", error);
    return { success: false, error: error.message };
  }
}
