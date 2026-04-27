import { getCurrentSession } from "../actions/authActions";
import { redirect } from "next/navigation";
import InstructorDashboardClient from "./InstructorDashboardClient";

export default async function InstructorDashboardPage() {
  const session = await getCurrentSession();

  if (!session) {
    redirect("/instructor-login");
  }

  return <InstructorDashboardClient session={session} />;
}
