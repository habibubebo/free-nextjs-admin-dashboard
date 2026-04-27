import React from "react";
import ScheduleClient from "./ScheduleClient";
import { getAttendance } from "../../actions/attendanceActions";
import { getCurrentSession } from "../../actions/authActions";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";

export const metadata = {
  title: "Training Schedule | Next.js Admin Dashboard",
  description: "Manage training schedules and sessions",
};

export default async function SchedulePage() {
  const session = await getCurrentSession();
  const instructorId = session?.role === 'instructor' ? session.id : undefined;
  const result = await getAttendance(instructorId, 1, 100);

  return (
    <>
      <PageBreadcrumb pageTitle="Training Schedule" />
      <div className="bg-white rounded-xl border border-gray-200 dark:border-white/[0.05] dark:bg-white/[0.03]">
        <ScheduleClient 
          initialData={result.data} 
          totalRecords={result.total}
        />
      </div>
    </>
  );
}