import React from "react";
import AttendanceReportClient from "./AttendanceReportClient";
import { getAllStudents, getAllInstructors } from "../../actions/attendanceReportActions";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";

export const metadata = {
  title: "Attendance Report | Next.js Admin Dashboard",
  description: "View attendance reports for students and instructors",
};

export default async function AttendanceReportPage() {
  const [students, instructors] = await Promise.all([
    getAllStudents(),
    getAllInstructors()
  ]);

  return (
    <>
      <PageBreadcrumb pageTitle="Attendance Report" />
      <div className="space-y-6">
        <AttendanceReportClient students={students} instructors={instructors} />
      </div>
    </>
  );
}
