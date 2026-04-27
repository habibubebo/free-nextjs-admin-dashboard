import { Metadata } from "next";
import { getCurrentSession } from "@/app/actions/authActions";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ProfileClient from "./ProfileClient";

export const metadata: Metadata = {
  title: "Profile | Lembaga Pelatihan Cendekia Utama",
  description: "Profile page for logged-in instructor",
};

export default async function Profile() {
  const session = await getCurrentSession();
  
  return (
    <>
      <PageBreadcrumb pageTitle="Profile" />
      <ProfileClient session={session} />
    </>
  );
}