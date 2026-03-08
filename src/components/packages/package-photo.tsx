"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

export function PackagePhoto({ src }: { src: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <img
        src={src}
        alt="Foto da encomenda"
        className="mt-2 max-h-64 cursor-pointer rounded-lg object-contain transition-opacity hover:opacity-80"
        onClick={() => setOpen(true)}
      />
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] p-2 sm:max-w-3xl">
          <DialogTitle className="sr-only">Foto da encomenda</DialogTitle>
          <img
            src={src}
            alt="Foto da encomenda"
            className="max-h-[85vh] w-full rounded object-contain"
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
