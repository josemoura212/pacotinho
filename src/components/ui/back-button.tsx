"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface BackButtonProps {
  fallbackHref?: string;
}

export function BackButton({ fallbackHref }: BackButtonProps) {
  const router = useRouter();

  return (
    <Button
      variant="ghost"
      size="sm"
      className="gap-1"
      onClick={() => {
        if (fallbackHref && window.history.length <= 1) {
          router.push(fallbackHref);
        } else {
          router.back();
        }
      }}
    >
      <ArrowLeft className="h-4 w-4" />
      Voltar
    </Button>
  );
}
