import { NextResponse } from "next/server";
import { getCurrentSession } from "@/app/actions/authActions";

export async function GET() {
  try {
    const session = await getCurrentSession();
    return NextResponse.json({ session });
  } catch (error) {
    return NextResponse.json({ session: null });
  }
}