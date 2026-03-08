"use client";

import { useState, useEffect, useCallback } from "react";
import type { Package, PackageStatus } from "@/lib/types/package";
import type { ApiResponse } from "@/lib/types/api";

export function usePackages(status?: PackageStatus) {
  const [packages, setPackages] = useState<Package[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPackages = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const params = new URLSearchParams();
    if (status) params.set("status", status);

    const response = await fetch(`/api/packages?${params.toString()}`);
    const result: ApiResponse<Package[]> = await response.json();

    if (result.success && result.data) {
      setPackages(result.data);
    } else {
      setError(result.error ?? "Erro ao carregar encomendas");
    }

    setIsLoading(false);
  }, [status]);

  useEffect(() => {
    fetchPackages();
  }, [fetchPackages]);

  return { packages, isLoading, error, refetch: fetchPackages };
}
