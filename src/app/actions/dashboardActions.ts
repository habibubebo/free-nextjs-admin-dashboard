"use server";
import db from "@/lib/db";

export interface DashboardStats {
  totalStudents: number;
  activeStudents: number;
  inactiveStudents: number;
  graduatedStudents: number;
  totalInstructors: number;
  totalClasses: number;
  totalAttendanceToday: number;
  totalAttendanceThisWeek: number;
  totalGraduates: number;

  // Siswa per kelas
  studentsByClass: { className: string; count: number }[];

  // Presensi 7 hari terakhir
  attendanceLast7Days: { date: string; studentCount: number; instructorCount: number }[];

  // 5 presensi terbaru
  recentAttendance: {
    id: number;
    date: string;
    name: string;
    type: string;
    class: string;
    material: string;
  }[];
}

export async function getDashboardStats(): Promise<DashboardStats> {
  try {
    // 1. Student counts by status
    const [studentCounts]: any = await db.query(`
      SELECT
        COUNT(*) AS total,
        SUM(Status = 1) AS active,
        SUM(Status = 0) AS inactive,
        SUM(Status = 2) AS graduated
      FROM peserta
    `);
    const sc = studentCounts[0];

    // 2. Total instructors
    const [instrCount]: any = await db.query("SELECT COUNT(*) AS total FROM instruktur");

    // 3. Total classes
    const [classCount]: any = await db.query("SELECT COUNT(*) AS total FROM rombel");

    // 4. Total graduates
    const [gradCount]: any = await db.query("SELECT COUNT(*) AS total FROM lulusan");

    // 5. Attendance today
    const [todayAtt]: any = await db.query(`
      SELECT COUNT(*) AS total FROM presensi WHERE DATE(Tgl) = CURDATE()
    `);

    // 6. Attendance this week
    const [weekAtt]: any = await db.query(`
      SELECT COUNT(*) AS total FROM presensi
      WHERE Tgl >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
    `);

    // 7. Students by class
    const [byClass]: any = await db.query(`
      SELECT r.Namarombel AS className, COUNT(p.Id) AS count
      FROM rombel r
      LEFT JOIN peserta p ON p.Jeniskursus = r.Id AND p.Status = 1
      GROUP BY r.Id, r.Namarombel
      ORDER BY count DESC
    `);

    // 8. Attendance last 7 days (student vs instructor)
    const [last7Days]: any = await db.query(`
      SELECT
        DATE(Tgl) AS date,
        SUM(Nipd != 0) AS studentCount,
        SUM(Nipd = 0) AS instructorCount
      FROM presensi
      WHERE Tgl >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
      GROUP BY DATE(Tgl)
      ORDER BY DATE(Tgl) ASC
    `);

    // Generate full 7 days (fill missing dates with 0)
    const today = new Date();
    const attendanceLast7Days: DashboardStats["attendanceLast7Days"] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const found = last7Days.find((r: any) => {
        const rowDate = new Date(r.date).toISOString().split("T")[0];
        return rowDate === dateStr;
      });
      attendanceLast7Days.push({
        date: dateStr,
        studentCount: found ? Number(found.studentCount) : 0,
        instructorCount: found ? Number(found.instructorCount) : 0,
      });
    }

    // 9. Recent 8 attendance records
    const [recent]: any = await db.query(`
      SELECT
        pr.Id,
        pr.Tgl AS date,
        COALESCE(pe.Nama, i.NamaInstruktur) AS name,
        IF(pr.Nipd = 0, 'Pegawai', 'Siswa') AS type,
        COALESCE(r.Namarombel, '-') AS class,
        COALESCE(pr.Materi, '-') AS material
      FROM presensi pr
      LEFT JOIN peserta pe ON pr.Nipd = pe.Nipd AND pr.Nipd != 0
      LEFT JOIN instruktur i ON pr.Instruktur = i.Id AND pr.Nipd = 0
      LEFT JOIN rombel r ON pr.Jeniskursus = r.Id
      ORDER BY pr.Tgl DESC, pr.Id DESC
      LIMIT 8
    `);

    return {
      totalStudents: Number(sc.total) || 0,
      activeStudents: Number(sc.active) || 0,
      inactiveStudents: Number(sc.inactive) || 0,
      graduatedStudents: Number(sc.graduated) || 0,
      totalInstructors: Number(instrCount[0].total) || 0,
      totalClasses: Number(classCount[0].total) || 0,
      totalAttendanceToday: Number(todayAtt[0].total) || 0,
      totalAttendanceThisWeek: Number(weekAtt[0].total) || 0,
      totalGraduates: Number(gradCount[0].total) || 0,
      studentsByClass: byClass.map((r: any) => ({
        className: r.className,
        count: Number(r.count),
      })),
      attendanceLast7Days,
      recentAttendance: recent.map((r: any) => ({
        id: r.Id,
        date: r.date,
        name: r.name,
        type: r.type,
        class: r.class,
        material: r.material,
      })),
    };
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return {
      totalStudents: 0,
      activeStudents: 0,
      inactiveStudents: 0,
      graduatedStudents: 0,
      totalInstructors: 0,
      totalClasses: 0,
      totalAttendanceToday: 0,
      totalAttendanceThisWeek: 0,
      totalGraduates: 0,
      studentsByClass: [],
      attendanceLast7Days: [],
      recentAttendance: [],
    };
  }
}
