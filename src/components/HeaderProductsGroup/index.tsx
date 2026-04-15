"use client";

import { ChevronRight, Flame, Star, Tag, TrendingDown } from "lucide-react";
import Link from "next/link";

export const HeaderVariants = {
  flame: {
    icon: Flame,
    bgColorClass: "bg-rose",
    iconColorClass: "text-main-red",
  },
  star: {
    icon: Star,
    bgColorClass: "bg-focus-blue-light",
    iconColorClass: "text-focus-blue",
  },
  tag: {
    icon: Tag,
    bgColorClass: "bg-rose",
    iconColorClass: "text-main-red",
  },
  trendingDown: {
    icon: TrendingDown,
    bgColorClass: "bg-yellow-promo-light",
    iconColorClass: "text-yellow-promo",
  },
};

export enum Variants {
  Flame = "flame",
  Star = "star",
  Tag = "tag",
  TrendingDown = "trendingDown",
}

export default function HeaderProductsGroup({
  variant,
  title,
  linkText,
  linkAddress = "/",
  onClick,
}: {
  variant: Variants;
  title: string;
  linkText?: string;
  linkAddress?: string;
  onClick?: () => void;
}) {
  const { icon: Icon, bgColorClass, iconColorClass } = HeaderVariants[variant];

  return (
    <div className="flex justify-between items-center gap-x-[10px] mb-[16px] md:mb-[20px]">
      <h2 className="flex items-center gap-x-[8px] md:gap-x-[16px] text-text font-medium leading-[100%] text-[20px] md:text-[30px]">
        <div
          className={`flex items-center justify-center w-[23px] h-[23px] md:w-[34px] md:h-[34px] rounded-[6px] ${bgColorClass}`}
        >
          <Icon
            className={`w-[17px] h-[17px] md:w-[22px] md:h-[22px] ${iconColorClass}`}
          />
        </div>

        {title}
      </h2>

      <Link
        href={linkAddress}
        onClick={onClick}
        className={`
          flex items-center gap-x-[4px]

          text-main-red hover:underline font-medium text-[12px] leading-[14px] md:text-[14px] md:leading-[16px]
        `}
      >
        <span>{linkText}</span>
        <ChevronRight className="mt-[2px]" size={14} />
      </Link>
    </div>
  );
}
