import { Metadata } from "next";
import { getProfil } from "../../../actions/profilActions";
import InstitutionProfileClient from "./InstitutionProfileClient";

export const metadata: Metadata = {
  title: "Profil Lembaga | Lembaga Pelatihan Cendekia Utama",
  description: "Manage institution profile",
};

export default async function InstitutionProfilePage() {
  const profil = await getProfil();
  
  return (
    <InstitutionProfileClient initialData={profil} />
  );
}