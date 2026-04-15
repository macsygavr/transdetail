"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState, useEffect } from "react";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { useI18N } from "@/i18n/hooks/useLocale";
import { useTransmissionsListQueryOptions } from "@cms/sdk/transmissions/hooks/queries";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useQuery } from "@tanstack/react-query";

interface SchemesListProps {
  transmissionId?: string | null;
  backUrl?: string;
}

export default function SchemesList({
  transmissionId,
  backUrl,
}: SchemesListProps) {
  const { t } = useI18N();
  const { data: schemes, isLoading } = useQuery(
    useTransmissionsListQueryOptions({
      params: {
        parentId: transmissionId,
        include_inactive: false,
      },
    })
  );
  const containerRef = useRef<HTMLDivElement>(null);
  const [showArrowRight, setShowArrowRight] = useState(false);
  const [showArrowLeft, setShowArrowLeft] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scrollElement = container.querySelector(
      "[data-radix-scroll-area-viewport]"
    );
    if (!scrollElement) return;

    const checkScroll = () => {
      const { scrollLeft, scrollWidth, clientWidth } = scrollElement;
      const canScrollRight =
        scrollWidth > clientWidth && scrollLeft + clientWidth < scrollWidth - 5;
      const canScrollLeft = scrollWidth > clientWidth && scrollLeft > 5;

      setShowArrowRight(canScrollRight);
      setShowArrowLeft(canScrollLeft);
    };

    checkScroll();

    scrollElement.addEventListener("scroll", checkScroll);
    window.addEventListener("resize", checkScroll);

    return () => {
      scrollElement.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [schemes]);

  if (!transmissionId) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-text text-[12px] md:text-[14px] shrink-0">
          Схемы:
        </span>
        <div className="text-gray-400 text-xs">Загрузка...</div>
      </div>
    );
  }

  if (!schemes?.items || schemes.items.length === 0) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-text text-[12px] md:text-[14px] shrink-0">
          Схемы:
        </span>
        <div className="text-gray-400 text-xs">Нет схем</div>
      </div>
    );
  }

  const scroll = (direction: "left" | "right") => {
    const scrollElement = containerRef.current?.querySelector(
      "[data-radix-scroll-area-viewport]"
    );
    if (!scrollElement) return;

    const { clientWidth } = scrollElement;
    const scrollAmount = direction === "right" ? clientWidth : -clientWidth;

    scrollElement.scrollBy({
      left: scrollAmount,
      behavior: "smooth",
    });
  };

  return (
    <div className="max-w-full overflow-hidden">
      <div className="flex items-center gap-2 md:gap-3" ref={containerRef}>
        <span className="text-text text-[12px] md:text-[14px] shrink-0">
          Схемы:
        </span>

        <div className="relative flex-1 min-w-0">
          <ScrollArea className="w-full rounded-md whitespace-nowrap">
            <div className="flex w-max space-x-2 md:space-x-3 p-1">
              {schemes.items.map((scheme) => (
                <div
                  key={scheme.id}
                  className="flex items-center shrink-0 w-[48px] h-[48px] md:w-[68px] md:h-[68px] rounded-[6px] border border-accent-blue bg-white overflow-hidden hover:border-accent-blue-dark transition-colors"
                >
                  <Link
                    href={`/catalog/transmissions/${transmissionId}/schemes/${scheme.id}${
                      backUrl ? `?backUrl=${encodeURIComponent(backUrl)}` : ""
                    }`}
                    className="w-full h-full"
                  >
                    {scheme.image ? (
                      <Image
                        width={120}
                        height={120}
                        src={`/media/${scheme.image}/thumbnail.webp`}
                        alt={t(scheme.name)}
                        className="object-center object-contain w-full h-full"
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100 text-xs text-gray-400 text-center p-1">
                        No Img
                      </div>
                    )}
                  </Link>
                </div>
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>

          {showArrowLeft && (
            <button
              onClick={() => scroll("left")}
              className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-6 flex items-center justify-center pointer-events-auto z-10 bg-white/80 hover:bg-white rounded-r-md border border-gray-200 shadow-sm transition-colors"
              type="button"
            >
              <ArrowLeft className="shrink-0 text-main-red" size={30} />
            </button>
          )}

          {showArrowRight && (
            <button
              onClick={() => scroll("right")}
              className="absolute right-0 top-1/2 -translate-y-1/2 h-8 w-6 flex items-center justify-center pointer-events-auto z-10 bg-white/80 hover:bg-white rounded-l-md border border-gray-200 shadow-sm transition-colors"
              type="button"
            >
              <ArrowRight className="shrink-0 text-main-red" size={30} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
