"use client";

import { Card, CardContent } from "@/components/ui/card";
import type { Package } from "@/lib/types/package";
import { PackageCard } from "./package-card";
import { PackagePagination } from "./package-pagination";

interface PackageListProps {
  packages: Package[];
  page: number;
  totalPages: number;
  total: number;
  emptyMessage?: string;
}

export function PackageList({
  packages,
  page,
  totalPages,
  total,
  emptyMessage = "Nenhuma encomenda encontrada.",
}: PackageListProps) {
  if (packages.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          {emptyMessage}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3">
        {packages.map((pkg) => (
          <PackageCard key={pkg.id} pkg={pkg} />
        ))}
      </div>
      <PackagePagination page={page} totalPages={totalPages} total={total} />
    </div>
  );
}
