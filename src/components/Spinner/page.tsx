"use client";

import { LoaderCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Spinner({ className }: { className?: string }) {
  return (
    <LoaderCircle
      className={cn("h-6 w-6 animate-spin text-main-red", className)}
    />
  );
}
