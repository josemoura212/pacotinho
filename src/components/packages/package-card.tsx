"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PackageStatusBadge } from "./package-status-badge";
import {
  MapPin,
  Package as PackageIcon,
  Calendar,
  FileText,
  ClipboardEdit,
} from "lucide-react";
import type { Package } from "@/lib/types/package";

export function PackageCard({ pkg, subtitle }: { pkg: Package; subtitle?: string }) {
  const isPending = pkg.status === "REGISTRO_PENDENTE";

  return (
    <Link href={isPending ? `/encomendas/${pkg.id}/completar` : `/encomendas/${pkg.id}`}>
      <Card className="transition-colors hover:bg-accent/50">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">
              {pkg.recipientName || "Destinatário não identificado"}
            </CardTitle>
            <PackageStatusBadge status={pkg.status} />
          </div>
        </CardHeader>
        <CardContent className="space-y-1 text-sm text-muted-foreground">
          {subtitle ? (
            <p>{subtitle}</p>
          ) : (
            <>
              {pkg.apartment && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  Apto {pkg.apartment} - Bloco {pkg.block}
                </div>
              )}
              {pkg.trackingCode && (
                <div className="flex items-center gap-1">
                  <PackageIcon className="h-3 w-3" />
                  Rastreio: {pkg.trackingCode}
                </div>
              )}
              {pkg.notes && (
                <div className="flex items-center gap-1">
                  <FileText className="h-3 w-3" />
                  {pkg.notes}
                </div>
              )}
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {new Date(pkg.createdAt).toLocaleDateString("pt-BR")}
              </div>
            </>
          )}
          {isPending && (
            <Button variant="outline" size="sm" className="mt-2 w-full" asChild>
              <span>
                <ClipboardEdit className="mr-2 h-4 w-4" />
                Completar cadastro
              </span>
            </Button>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
