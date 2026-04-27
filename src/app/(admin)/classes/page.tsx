import React from "react";
import ClassClient from "./ClassClient";
import { getClasses } from "../../actions/classActions";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";

export const metadata = {
  title: "Classes Management | Next.js Admin Dashboard",
  description: "Manage training classes and study groups",
};

export default async function ClassesPage() {
  const classes = await getClasses();

  return (
    <>
      <PageBreadcrumb pageTitle="Classes" />
      <div className="space-y-6">
        <ClassClient initialData={classes} />
      </div>
    </>
  );
}
