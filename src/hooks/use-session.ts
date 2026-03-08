"use client";

import { useSession as useNextAuthSession } from "next-auth/react";
import type { UserRole } from "@/lib/types/user";

export function useAppSession() {
  const { data: session, status } = useNextAuthSession();

  return {
    session,
    status,
    isLoading: status === "loading",
    isAuthenticated: status === "authenticated",
    user: session?.user as
      | {
          id: string;
          name: string;
          email: string;
          role: UserRole;
          apartment: string | null;
          block: string | null;
        }
      | undefined,
  };
}
