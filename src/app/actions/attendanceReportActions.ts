"use server";
import db from "@/lib/db";
import { formatDateWithDay } from "@/lib/dateUtils";

export interface AttendanceReport {
  id: number;
  name: string;
  type: "student" | "instructor";
  totalSessions: number;
  attendanceDates: string[];
  instructors: string[];
  materials: string[];
  status?: string;
  certificateStatus?: string;
}

export interface InstructorMonthlyReport {
  id: number;
  name: string;
  type: "instructor";
  monthlyData: {
    month: string;
    year: number;
    totalSessions: number;
    students: {
      studentId: number;
      studentName: string;
      sessions: {
        date: string;
        material: string;
      }[];
      totalSessions: number;
    }[];
  }[];
  totalSessionsAllTime: number;
  lastMonthCalendar?: {
    month: string;
    year: number;
    days: {
      dayOfWeek: string;
      date: string;
      dayNumber: number;
      sessions: {
        time: string;
        sessionNumber: number;
        totalSessions: number;
        students: {
          name: string;
          number: number;
        }[];
      }[];
    }[];
  };
}

export async function getStudentAttendanceReport(studentId: number): Promise<AttendanceReport | null> {
  try {
    // Get student info
    const [studentRows] = await db.query(
      "SELECT * FROM peserta WHERE Id = ?",
      [studentId]
    );
    
    if (!studentRows || (studentRows as any[]).length === 0) {
      return null;
    }
    
    const student = (studentRows as any[])[0];
    
    // Get attendance records
    const [attendanceRows] = await db.query(
      `SELECT DISTINCT 
        pr.Tgl, 
        pr.Instruktur, 
        pr.Materi,
        i.NamaInstruktur
      FROM presensi pr
      LEFT JOIN instruktur i ON pr.Instruktur = i.Id
      WHERE pr.Nipd = ? AND pr.Nipd != 0
      ORDER BY pr.Tgl ASC`,
      [student.Nipd]
    );
    
    const attendance = (attendanceRows as any[]) || [];
    
    // Get graduation info
    const [graduateRows] = await db.query(
      "SELECT * FROM lulusan WHERE Nipd = ?",
      [student.Nipd]
    );
    
    const graduate = (graduateRows as any[])?.[0];
    
    return {
      id: student.Id,
      name: student.Nama,
      type: "student",
      totalSessions: attendance.length,
      attendanceDates: attendance.map((a: any) => formatDateWithDay(a.Tgl)),
      instructors: [...new Set(attendance.map((a: any) => a.NamaInstruktur).filter(Boolean))],
      materials: [...new Set(attendance.map((a: any) => a.Materi).filter(Boolean))],
      status: student.Status === 1 ? "Aktif" : student.Status === 2 ? "Lulus" : "Nonaktif",
      certificateStatus: graduate ? (graduate.Tglcetak ? "Sudah Cetak" : "Belum Cetak") : "Belum Lulus"
    };
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function getInstructorAttendanceReport(instructorId: number): Promise<InstructorMonthlyReport | null> {
  try {
    // Get instructor info
    const [instructorRows] = await db.query(
      "SELECT * FROM instruktur WHERE Id = ?",
      [instructorId]
    );
    
    if (!instructorRows || (instructorRows as any[]).length === 0) {
      return null;
    }
    
    const instructor = (instructorRows as any[])[0];
    
    // Get all attendance records for this instructor (both student and instructor attendance)
    const [attendanceRows] = await db.query(
      `SELECT 
        pr.Tgl,
        pr.Nipd,
        pr.Materi,
        pe.Nama as StudentName,
        MONTH(pr.Tgl) as Month,
        YEAR(pr.Tgl) as Year
      FROM presensi pr
      LEFT JOIN peserta pe ON pr.Nipd = pe.Nipd AND pr.Nipd != 0
      WHERE pr.Instruktur = ?
      ORDER BY pr.Tgl DESC`,
      [instructorId]
    );
    
    const attendance = (attendanceRows as any[]) || [];
    
    // Group by month and year
    const monthlyMap = new Map<string, any>();
    
    attendance.forEach((record: any) => {
      const monthKey = `${record.Year}-${String(record.Month).padStart(2, '0')}`;
      
      if (!monthlyMap.has(monthKey)) {
        monthlyMap.set(monthKey, {
          month: monthKey,
          year: record.Year,
          monthNumber: record.Month,
          students: new Map<number, any>(),
          totalSessions: 0
        });
      }
      
      const monthData = monthlyMap.get(monthKey);
      monthData.totalSessions++;
      
      // Only add student data if it's a student attendance (Nipd != 0)
      if (record.Nipd !== 0 && record.StudentName) {
        if (!monthData.students.has(record.Nipd)) {
          monthData.students.set(record.Nipd, {
            studentId: record.Nipd,
            studentName: record.StudentName,
            sessions: [],
            totalSessions: 0
          });
        }
        
        const studentData = monthData.students.get(record.Nipd);
        studentData.sessions.push({
          date: formatDateWithDay(record.Tgl),
          material: record.Materi || "-"
        });
        studentData.totalSessions++;
      }
    });
    
    // Convert to array and sort by month descending
    const monthlyData = Array.from(monthlyMap.values())
      .map(m => ({
        month: getMonthName(m.monthNumber),
        year: m.year,
        totalSessions: m.totalSessions,
        students: Array.from(m.students.values()) as any[]
      }))
      .sort((a, b) => {
        const dateA = new Date(`${a.year}-${getMonthNumber(a.month)}`);
        const dateB = new Date(`${b.year}-${getMonthNumber(b.month)}`);
        return dateB.getTime() - dateA.getTime();
      });
    
    const totalSessionsAllTime = attendance.length;
    
    // Build calendar for last month
    const lastMonthCalendar = buildLastMonthCalendar(attendance);
    
    return {
      id: instructor.Id,
      name: instructor.NamaInstruktur,
      type: "instructor",
      monthlyData,
      totalSessionsAllTime,
      lastMonthCalendar
    };
  } catch (error) {
    console.error(error);
    return null;
  }
}

function buildLastMonthCalendar(attendance: any[]): any {
  if (attendance.length === 0) return null;
  
  // Get the last month from attendance data
  const dates = attendance.map((a: any) => new Date(a.Tgl));
  const latestDate = new Date(Math.max(...dates.map(d => d.getTime())));
  
  const year = latestDate.getFullYear();
  const month = latestDate.getMonth() + 1;
  
  // Get first and last day of month
  const firstDay = new Date(year, month - 1, 1);
  const lastDay = new Date(year, month, 0);
  
  // Filter attendance for this month
  const monthAttendance = attendance.filter((a: any) => {
    const date = new Date(a.Tgl);
    return date.getFullYear() === year && date.getMonth() + 1 === month;
  });
  
  // Group by day
  const dayMap = new Map<number, any>();
  
  monthAttendance.forEach((record: any) => {
    const date = new Date(record.Tgl);
    const dayNumber = date.getDate();
    const timeStr = date.toTimeString().slice(0, 5);
    
    if (!dayMap.has(dayNumber)) {
      dayMap.set(dayNumber, {
        dayNumber,
        date: formatDateWithDay(record.Tgl),
        dayOfWeek: getDayOfWeekIndonesian(date.getDay()),
        timeRecords: [] // Store full records with time for merging
      });
    }
    
    const dayData = dayMap.get(dayNumber);
    dayData.timeRecords.push({
      time: timeStr,
      timeMinutes: date.getHours() * 60 + date.getMinutes(),
      studentName: record.StudentName
    });
  });
  
  // Convert to array format and merge sessions within 15 minutes
  const days = Array.from(dayMap.values())
    .map(d => {
      // Sort by time
      d.timeRecords.sort((a: any, b: any) => a.timeMinutes - b.timeMinutes);
      
      // Merge sessions within 15 minutes
      const mergedSessions = new Map<string, Set<string>>();
      let currentSessionKey = "";
      let lastTime = -999;
      
      d.timeRecords.forEach((record: any) => {
        const timeDiff = record.timeMinutes - lastTime;
        
        // If more than 15 minutes from last record, create new session
        if (timeDiff > 15 || currentSessionKey === "") {
          currentSessionKey = record.time;
          lastTime = record.timeMinutes;
        }
        
        if (!mergedSessions.has(currentSessionKey)) {
          mergedSessions.set(currentSessionKey, new Set());
        }
        
        const sessionSet = mergedSessions.get(currentSessionKey);
        if (record.studentName && sessionSet) {
          sessionSet.add(record.studentName);
        }
      });
      
      return {
        dayOfWeek: d.dayOfWeek,
        date: d.date,
        dayNumber: d.dayNumber,
        sessions: Array.from(mergedSessions.entries()).map((entry: any, idx: number) => {
          const [time, students] = entry;
          return {
            time,
            sessionNumber: idx + 1,
            totalSessions: mergedSessions.size,
            students: Array.from(students as Set<string>).map((name: any, studentIdx: number) => ({
              name,
              number: studentIdx + 1
            }))
          };
        })
      };
    })
    .sort((a, b) => a.dayNumber - b.dayNumber);
  
  return {
    month: getMonthName(month),
    year,
    days
  };
}

function getDayOfWeekIndonesian(dayIndex: number): string {
  const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  return days[dayIndex];
}

function getMonthName(monthNumber: number): string {
  const months = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];
  return months[monthNumber - 1] || "";
}

function getMonthNumber(monthName: string): string {
  const months: Record<string, string> = {
    "Januari": "01", "Februari": "02", "Maret": "03", "April": "04",
    "Mei": "05", "Juni": "06", "Juli": "07", "Agustus": "08",
    "September": "09", "Oktober": "10", "November": "11", "Desember": "12"
  };
  return months[monthName] || "01";
}

export async function getAllStudents() {
  try {
    const [rows] = await db.query(
      "SELECT Id, Nama, Status FROM peserta WHERE Status IN (1, 2) ORDER BY Nama ASC"
    );
    return rows as any[];
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function getAllInstructors() {
  try {
    const [rows] = await db.query(
      "SELECT Id, NamaInstruktur FROM instruktur ORDER BY NamaInstruktur ASC"
    );
    return rows as any[];
  } catch (error) {
    console.error(error);
    return [];
  }
}
