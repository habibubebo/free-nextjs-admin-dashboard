import React from "react";
import StudentClient from "./StudentClient";
import { getStudents } from "../../actions/studentActions";
import { getClasses } from "../../actions/classActions";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";

export const metadata = {
  title: "Students Management | Next.js Admin Dashboard",
  description: "Manage active students and verify new registrations",
};

export default async function StudentsPage() {
  const [students, classes] = await Promise.all([
    getStudents(),
    getClasses()
  ]);

  return (
    <>
      <PageBreadcrumb pageTitle="Students" />
      <div className="space-y-6">
        <StudentClient initialData={students} classes={classes} />
      </div>
    </>
  );
}
