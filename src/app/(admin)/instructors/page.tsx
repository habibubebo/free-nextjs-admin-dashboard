import React from "react";
import InstructorClient from "./InstructorClient";
import { getInstructors } from "../../actions/instructorActions";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";

export const metadata = {
  title: "Instructors Management | Next.js Admin Dashboard",
  description: "Manage instructors in the system",
};

export default async function InstructorsPage() {
  const instructors = await getInstructors();

  return (
    <>
      <PageBreadcrumb pageTitle="Instructors" />
      <div className="space-y-6">
        <InstructorClient initialData={instructors} />
      </div>
    </>
  );
}
