import React from "react";
import AttendanceClient from "./AttendanceClient";
import { getAttendance } from "../../actions/attendanceActions";
import { getStudents } from "../../actions/studentActions";
import { getInstructors } from "../../actions/instructorActions";
import { getClasses } from "../../actions/classActions";
import { getCurrentSession } from "../../actions/authActions";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";

export const metadata = {
  title: "Attendance Management | Next.js Admin Dashboard",
  description: "Manage daily attendance for students and instructors",
};

export default async function AttendancePage() {
  // Get current session to filter attendance for instructor only
  const session = await getCurrentSession();
  
  // Superadmin sees all attendance, instructor only sees their own
  const instructorId = session?.role === 'instructor' ? session.id : undefined;

  const [attendanceResult, students, instructors, classes] = await Promise.all([
    getAttendance(instructorId, 1, 20),
    getStudents(),
    getInstructors(),
    getClasses()
  ]);

  return (
    <>
      <PageBreadcrumb pageTitle="Attendance" />
      <div className="space-y-6">
        <AttendanceClient 
          initialData={attendanceResult.data} 
          totalRecords={attendanceResult.total}
          students={students} 
          instructors={instructors} 
          classes={classes}
        />
      </div>
    </>
  );
}
