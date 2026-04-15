"use client";

import { cn } from "@/lib/utils";

export default function Sorting() {
  const isActiveMethod = true;

  return (
    <p className="flex gap-x-[8px] md:gap-x-[16px] p-[12px] md:py-[16px] md:px-[20px] text-[12px] leading-[18px] bg-base-gray rounded-[8px]">
      <span className="text-neutral-gray">Сортировка:</span>
      <button
        className={cn("text-main-red cursor-pointer hover:underline", {
          "font-medium": isActiveMethod,
        })}
      >
        По дате добавления
      </button>
      <button className="text-accent-blue cursor-pointer hover:underline">
        По цене
      </button>
    </p>
  );
}
