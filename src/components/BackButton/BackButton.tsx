"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface BackButtonProps {
  source: string | null;
  transmissionId?: string | null;
  categoryId?: string | null;
  transmissionName?: string | null;
  categoryName?: string | null;
  className?: string;
}

export default function BackButton({
  source,
  transmissionId,
  categoryId,
  transmissionName,
  categoryName,
  className,
}: BackButtonProps) {
  if (source !== "transmission" && source !== "products") return null;

  const getBackUrl = () => {
    if (source === "transmission" && transmissionId) {
      return `/catalog/transmissions/${transmissionId}`;
    }

    if (source === "products") {
      const params = new URLSearchParams();
      if (transmissionId) params.append("transmission", transmissionId);
      if (categoryId) params.append("category", categoryId);
      const queryString = params.toString();
      return queryString
        ? `/catalog/products?${queryString}`
        : "/catalog/products";
    }

    return "/catalog/products";
  };

  const getButtonText = () => {
    if (source === "transmission" && transmissionName) {
      return transmissionName;
    }
    if (source === "products" && categoryName) {
      return categoryName;
    }
    if (source === "products" && transmissionName) {
      return transmissionName;
    }
    return "Каталог";
  };

  return (
    <Link
      href={getBackUrl()}
      className={cn(
        "inline-flex items-center gap-1 px-3 py-1.5 border border-[#ef4323] rounded-md text-[#ef4323] text-sm",
        className
      )}
    >
      <ChevronLeft className="w-4 h-4 stroke-[#ef4323]" />
      <span>{getButtonText()}</span>
    </Link>
  );
}
