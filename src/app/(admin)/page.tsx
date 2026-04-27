import type { Metadata } from "next";
import { getDashboardStats } from "@/app/actions/dashboardActions";
import DashboardClient from "./DashboardClient";

export const metadata: Metadata = {
  title: "Dashboard | Lembaga Pelatihan Cendekia Utama",
  description: "Dashboard ringkasan data siswa, instruktur, kehadiran, dan pelatihan",
};

export default async function DashboardPage() {
  const stats = await getDashboardStats();
  return <DashboardClient stats={stats} />;
}
