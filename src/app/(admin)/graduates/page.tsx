import React from "react";
import GraduateClient from "./GraduateClient";
import { getGraduates, getEligibleStudents } from "../../actions/graduateActions";
import { getInstructors } from "../../actions/instructorActions";
import { getProfil } from "../../actions/profilActions";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";

export const metadata = {
  title: "Graduates Management | Next.js Admin Dashboard",
  description: "Manage and export certificates for graduates",
};

export default async function GraduatesPage() {
  const [graduates, eligibleStudents, instructors, profil] = await Promise.all([
    getGraduates(),
    getEligibleStudents(),
    getInstructors(),
    getProfil(),
  ]);

  return (
    <>
      <PageBreadcrumb pageTitle="Graduates" />
      <div className="space-y-6">
        <GraduateClient
          initialData={graduates}
          eligibleStudents={eligibleStudents}
          instructors={instructors}
          profil={profil}
        />
      </div>
    </>
  );
}
