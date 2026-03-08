"use client";

import { useCallback, useEffect, useState } from "react";
import type { ApiResponse } from "@/lib/types/api";
import type { UserWithoutPassword } from "@/lib/types/user";

export function useUsers() {
  const [users, setUsers] = useState<UserWithoutPassword[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const response = await fetch("/api/users");
    const result: ApiResponse<UserWithoutPassword[]> = await response.json();

    if (result.success && result.data) {
      setUsers(result.data);
    } else {
      setError(result.error ?? "Erro ao carregar usuários");
    }

    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return { users, isLoading, error, refetch: fetchUsers };
}
