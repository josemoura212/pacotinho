"use client";

import { Card, CardContent } from "@/components/ui/card";
import type { Package } from "@/lib/types/package";
import { PackageCard } from "./package-card";

export function PackageList({
  packages,
  emptyMessage = "Nenhuma encomenda encontrada.",
}: {
  packages: Package[];
  emptyMessage?: string;
}) {
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
    <div className="grid gap-3">
      {packages.map((pkg) => (
        <PackageCard key={pkg.id} pkg={pkg} />
      ))}
    </div>
  );
}
