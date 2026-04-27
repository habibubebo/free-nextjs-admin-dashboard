import React from "react";
import CourseClient from "./CourseClient";
import { getCourseUnits } from "../../actions/courseActions";
import { getClasses } from "../../actions/classActions";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";

export const metadata = {
  title: "Course Units | Next.js Admin Dashboard",
  description: "Manage course competency units",
};

export default async function CoursesPage() {
  const [courseUnits, classes] = await Promise.all([
    getCourseUnits(),
    getClasses()
  ]);

  return (
    <>
      <PageBreadcrumb pageTitle="Course Units" />
      <div className="space-y-6">
        <CourseClient initialData={courseUnits} classes={classes} />
      </div>
    </>
  );
}
