"use client";

import { useEffect, useState } from "react";
import { InstructorSession } from "@/app/actions/authActions";

/**
 * Hook to get current session from API
 */
export function useSession() {
  const [session, setSession] = useState<InstructorSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSession() {
      try {
        const response = await fetch("/api/session");
        const data = await response.json();
        setSession(data.session);
      } catch (error) {
        console.error("Failed to fetch session:", error);
        setSession(null);
      } finally {
        setLoading(false);
      }
    }

    fetchSession();
  }, []);

  return { session, loading };
}
