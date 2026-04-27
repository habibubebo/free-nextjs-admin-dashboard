"use client";

import React from "react";
import { DashboardStats } from "@/app/actions/dashboardActions";

function BarChart({ data }: { data: DashboardStats["attendanceLast7Days"] }) {
  const maxVal = Math.max(...data.map(d => d.studentCount + d.instructorCount), 1);
  const days = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

  return (
    <div className="flex items-end gap-2 h-40 pt-4">
      {data.map((d, i) => {
        const total = d.studentCount + d.instructorCount;
        const heightPct = (total / maxVal) * 100;
        const studentPct = total > 0 ? (d.studentCount / total) * heightPct : 0;
        const instrPct = total > 0 ? (d.instructorCount / total) * heightPct : 0;
        const date = new Date(d.date);
        const dayName = days[date.getDay()];
        const dateLabel = `${date.getDate()}/${date.getMonth() + 1}`;

        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
            <span className="text-xs text-[#434655] opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              {total}
            </span>
            <div className="w-full flex flex-col justify-end" style={{ height: "120px" }}>
              <div
                className="w-full rounded-t-sm bg-[#505f76] transition-all duration-500"
                style={{ height: `${instrPct}%` }}
                title={`Instruktur: ${d.instructorCount}`}
              />
              <div
                className="w-full bg-[#2563eb] transition-all duration-500"
                style={{ height: `${studentPct}%`, borderRadius: instrPct === 0 ? "4px 4px 0 0" : "0" }}
                title={`Siswa: ${d.studentCount}`}
              />
            </div>
            <span className="text-xs font-medium text-[#434655]">{dayName}</span>
            <span className="text-xs text-[#737686]">{dateLabel}</span>
          </div>
        );
      })}
    </div>
  );
}

function DonutChart({
  active, inactive, graduated,
}: { active: number; inactive: number; graduated: number }) {
  const total = active + inactive + graduated || 1;
  const size = 160;
  const strokeWidth = 22;
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;

  const segments = [
    { value: active, color: "#12b76a", label: "Aktif" },
    { value: graduated, color: "#7a5af8", label: "Lulus" },
    { value: inactive, color: "#fb6514", label: "Nonaktif" },
  ];

  let offset = 0;
  const arcs = segments.map(seg => {
    const dash = (seg.value / total) * circ;
    const gap = circ - dash;
    const arc = { ...seg, dash, gap, offset };
    offset += dash;
    return arc;
  });

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2} cy={size / 2} r={r}
            fill="none" stroke="#e0e3e5" strokeWidth={strokeWidth}
          />
          {arcs.map((arc, i) => (
            <circle
              key={i}
              cx={size / 2} cy={size / 2} r={r}
              fill="none"
              stroke={arc.color}
              strokeWidth={strokeWidth}
              strokeDasharray={`${arc.dash} ${arc.gap}`}
              strokeDashoffset={-arc.offset}
              className="transition-all duration-700"
            />
          ))}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-[#191c1e]">{total}</span>
          <span className="text-xs text-[#737686]">Total</span>
        </div>
      </div>
      <div className="flex flex-wrap justify-center gap-3">
        {segments.map((seg, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: seg.color }} />
            <span className="text-xs text-[#434655]">
              {seg.label} <span className="font-semibold text-[#191c1e]">{seg.value}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ClassBar({ name, count, max }: { name: string; count: number; max: number }) {
  const pct = max > 0 ? (count / max) * 100 : 0;
  const colors = [
    "bg-[#2563eb]", "bg-[#0ba5ec]", "bg-[#12b76a]", "bg-[#7a5af8]",
    "bg-[#f79009]", "bg-[#ee46bc]", "bg-[#00b8d9]", "bg-[#f43f5e]",
  ];
  const colorIdx = Math.abs(name.charCodeAt(0)) % colors.length;
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-[#434655] truncate max-w-[70%]" title={name}>{name}</span>
        <span className="font-semibold text-[#191c1e]">{count} siswa</span>
      </div>
      <div className="h-2.5 bg-[#e0e3e5] rounded-full overflow-hidden">
        <div
          className={`h-full ${colors[colorIdx]} rounded-full transition-all duration-700`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function StatCard({
  label, value, icon, color, sub,
}: { label: string; value: number | string; icon: React.ReactNode; color: string; sub?: string }) {
  return (
    <div className={`relative overflow-hidden rounded-2xl p-5 ${color} flex items-start justify-between`}
      style={{ boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.05)" }}>
      <div>
        <p className="text-sm font-medium text-white/80">{label}</p>
        <p className="mt-1 text-3xl font-bold text-white">{value}</p>
        {sub && <p className="mt-1 text-xs text-white/70">{sub}</p>}
      </div>
      <div className="p-3 rounded-xl bg-white/20 text-white">
        {icon}
      </div>
    </div>
  );
}

const IconUsers = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2h5M12 12a4 4 0 100-8 4 4 0 000 8z" />
  </svg>
);
const IconCheck = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
  </svg>
);
const IconGrad = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5zm0 0v6m-4-4h8" />
  </svg>
);
const IconBook = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
  </svg>
);
const IconCalendar = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3M3 11h18M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);
const IconChalkboard = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
  </svg>
);

export default function DashboardClient({ stats }: { stats: DashboardStats }) {
  const maxClassCount = Math.max(...stats.studentsByClass.map(c => c.count), 1);

  const topClasses = [...stats.studentsByClass]
    .filter(c => c.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 7);

  return (
    <div className="space-y-6">
      <div>
        <h1 style={{ fontSize: "24px", fontWeight: 700, lineHeight: "32px", letterSpacing: "-0.02em", color: "#191c1e" }}>
          Dashboard
        </h1>
        <p style={{ fontSize: "14px", fontWeight: 400, lineHeight: "20px", color: "#434655", marginTop: "2px" }}>
          Ringkasan data Lembaga Pelatihan Cendekia Utama
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        <div className="col-span-2 md:col-span-1 lg:col-span-1">
          <StatCard
            label="Total Siswa"
            value={stats.totalStudents}
            icon={<IconUsers />}
            color="bg-gradient-to-br from-[#2563eb] to-[#1d4ed8]"
          />
        </div>
        <div className="col-span-1">
          <StatCard
            label="Aktif"
            value={stats.activeStudents}
            icon={<IconCheck />}
            color="bg-gradient-to-br from-[#12b76a] to-[#039855]"
          />
        </div>
        <div className="col-span-1">
          <StatCard
            label="Nonaktif"
            value={stats.inactiveStudents}
            icon={<IconUsers />}
            color="bg-gradient-to-br from-[#fb6514] to-[#ec4a0a]"
          />
        </div>
        <div className="col-span-1">
          <StatCard
            label="Lulus"
            value={stats.graduatedStudents}
            icon={<IconGrad />}
            color="bg-gradient-to-br from-[#7a5af8] to-[#6d28d9]"
          />
        </div>
        <div className="col-span-1">
          <StatCard
            label="Instruktur"
            value={stats.totalInstructors}
            icon={<IconChalkboard />}
            color="bg-gradient-to-br from-[#0ba5ec] to-[#0086c9]"
          />
        </div>
        <div className="col-span-1">
          <StatCard
            label="Kelas"
            value={stats.totalClasses}
            icon={<IconBook />}
            color="bg-gradient-to-br from-[#ee46bc] to-[#db2777]"
          />
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 md:col-span-4 space-y-4">
          <div className="rounded-2xl border border-[#e0e3e5] bg-white p-5"
            style={{ boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.05)" }}>
            <div className="flex items-center justify-between mb-1">
              <p style={{ fontSize: "14px", fontWeight: 500, color: "#434655" }}>Presensi Hari Ini</p>
              <div className="p-2 rounded-lg bg-[#eff6ff] text-[#2563eb]">
                <IconCalendar />
              </div>
            </div>
            <p style={{ fontSize: "28px", fontWeight: 700, lineHeight: "32px", letterSpacing: "-0.03em", color: "#191c1e" }}>
              {stats.totalAttendanceToday}
            </p>
            <p style={{ fontSize: "12px", color: "#737686", marginTop: "4px" }}>Total kehadiran hari ini</p>
          </div>

          <div className="rounded-2xl border border-[#e0e3e5] bg-white p-5"
            style={{ boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.05)" }}>
            <div className="flex items-center justify-between mb-1">
              <p style={{ fontSize: "14px", fontWeight: 500, color: "#434655" }}>Presensi 7 Hari</p>
              <div className="p-2 rounded-lg bg-[#ecfdf3] text-[#12b76a]">
                <IconCalendar />
              </div>
            </div>
            <p style={{ fontSize: "28px", fontWeight: 700, lineHeight: "32px", letterSpacing: "-0.03em", color: "#191c1e" }}>
              {stats.totalAttendanceThisWeek}
            </p>
            <p style={{ fontSize: "12px", color: "#737686", marginTop: "4px" }}>Total kehadiran minggu ini</p>
          </div>

          <div className="rounded-2xl border border-[#e0e3e5] bg-white p-5"
            style={{ boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.05)" }}>
            <div className="flex items-center justify-between mb-1">
              <p style={{ fontSize: "14px", fontWeight: 500, color: "#434655" }}>Total Lulusan</p>
              <div className="p-2 rounded-lg bg-[#f3e8ff] text-[#7a5af8]">
                <IconGrad />
              </div>
            </div>
            <p style={{ fontSize: "28px", fontWeight: 700, lineHeight: "32px", letterSpacing: "-0.03em", color: "#191c1e" }}>
              {stats.totalGraduates}
            </p>
            <p style={{ fontSize: "12px", color: "#737686", marginTop: "4px" }}>Seluruh lulusan tercatat</p>
          </div>
        </div>

        <div className="col-span-12 md:col-span-4 rounded-2xl border border-[#e0e3e5] bg-white p-6 flex flex-col"
          style={{ boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.05)" }}>
          <h2 style={{ fontSize: "18px", fontWeight: 600, lineHeight: "24px", color: "#191c1e", marginBottom: "16px" }}>
            Status Siswa
          </h2>
          <div className="flex-1 flex items-center justify-center">
            <DonutChart
              active={stats.activeStudents}
              inactive={stats.inactiveStudents}
              graduated={stats.graduatedStudents}
            />
          </div>
        </div>

        <div className="col-span-12 md:col-span-4 rounded-2xl border border-[#e0e3e5] bg-white p-6"
          style={{ boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.05)" }}>
          <div className="flex items-center justify-between mb-4">
            <h2 style={{ fontSize: "18px", fontWeight: 600, lineHeight: "24px", color: "#191c1e" }}>
              Kehadiran 7 Hari
            </h2>
            <div className="flex gap-3 text-xs text-[#737686]">
              <span className="flex items-center gap-1">
                <span className="inline-block w-2.5 h-2.5 rounded-sm bg-[#2563eb]" /> Siswa
              </span>
              <span className="flex items-center gap-1">
                <span className="inline-block w-2.5 h-2.5 rounded-sm bg-[#505f76]" /> Instruktur
              </span>
            </div>
          </div>
          <BarChart data={stats.attendanceLast7Days} />
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 lg:col-span-5 rounded-2xl border border-[#e0e3e5] bg-white p-6"
          style={{ boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.05)" }}>
          <h2 style={{ fontSize: "18px", fontWeight: 600, lineHeight: "24px", color: "#191c1e", marginBottom: "20px" }}>
            Siswa Aktif per Pelatihan
          </h2>
          {topClasses.length === 0 ? (
            <p style={{ fontSize: "14px", color: "#737686", textAlign: "center", paddingTop: "32px", paddingBottom: "32px" }}>
              Belum ada data kelas
            </p>
          ) : (
            <div className="space-y-4">
              {topClasses.map((c, i) => (
                <ClassBar key={i} name={c.className} count={c.count} max={maxClassCount} />
              ))}
            </div>
          )}
        </div>

        <div className="col-span-12 lg:col-span-7 rounded-2xl border border-[#e0e3e5] bg-white p-6"
          style={{ boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.05)" }}>
          <h2 style={{ fontSize: "18px", fontWeight: 600, lineHeight: "24px", color: "#191c1e", marginBottom: "20px" }}>
            Presensi Terbaru
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full" style={{ fontSize: "14px" }}>
              <thead>
                <tr className="border-b border-[#f2f4f6]">
                  <th className="text-left pb-3 text-xs font-semibold text-[#737686] uppercase tracking-wider">Tanggal</th>
                  <th className="text-left pb-3 text-xs font-semibold text-[#737686] uppercase tracking-wider">Nama</th>
                  <th className="text-left pb-3 text-xs font-semibold text-[#737686] uppercase tracking-wider">Tipe</th>
                  <th className="text-left pb-3 text-xs font-semibold text-[#737686] uppercase tracking-wider">Kelas</th>
                  <th className="text-left pb-3 text-xs font-semibold text-[#737686] uppercase tracking-wider">Materi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f2f4f6]">
                {stats.recentAttendance.map((att) => (
                  <tr key={att.id} className="hover:bg-[#f7f9fb] transition-colors">
                    <td className="py-3 pr-4 text-[#434655] whitespace-nowrap">
                      {new Date(att.date).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}
                    </td>
                    <td className="py-3 pr-4 font-medium text-[#191c1e] max-w-[160px] truncate" title={att.name}>
                      {att.name || "-"}
                    </td>
                    <td className="py-3 pr-4">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        att.type === "Siswa"
                          ? "bg-[#ecfdf3] text-[#027a48]"
                          : "bg-[#eff6ff] text-[#1d4ed8]"
                      }`}>
                        {att.type}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-[#434655] max-w-[140px] truncate" title={att.class}>
                      {att.class}
                    </td>
                    <td className="py-3 text-[#737686] max-w-[160px] truncate" title={att.material}>
                      {att.material}
                    </td>
                  </tr>
                ))}
                {stats.recentAttendance.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-[#737686]">Belum ada data presensi</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}