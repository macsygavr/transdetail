"use client";

import { useEffect, useState } from "react";
import { ChevronDown, MapPin, Phone } from "lucide-react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import type { MenuItem } from "@cms/sdk/menus/entities";
import { useMenusListQueryOptions } from "@cms/sdk/menus/hooks/queries";
import { useI18N } from "@/i18n/hooks/useLocale";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ContentContainer from "../ContentContainer/ContentContainer";

function MenuListItem({ item }: { item: MenuItem }) {
  const { t } = useI18N();
  return (
    <Link href={item.url} className="w-full cursor-pointer active:opacity-60">
      {t(item.name)}
    </Link>
  );
}

function WorkTimeLink() {
  return (
    <Link href="/" className="cursor-pointer active:opacity-60 block w-full">
      График работ
    </Link>
  );
}

function WorkTimeButton({ className }: { className?: string }) {
  return (
    <Button
      className={`font-normal border-neutral-gray ${className}`}
      variant="outline"
      asChild
    >
      <Link href="/">График работ</Link>
    </Button>
  );
}

export default function HeaderPanelTop() {
  const [isDropdownMenuOpen, setIsDropdownMenuOpen] = useState(false);
  const { t } = useI18N();
  const menusListQuery = useQuery(
    useMenusListQueryOptions({
      params: { include_inactive: false },
      queryOptions: { staleTime: Infinity },
    })
  );

  const headerMenuItems: MenuItem[] =
    menusListQuery.data?.items
      .filter((menu) => menu.position === "header" && menu.is_active)
      .sort((left, right) => left.sort_order - right.sort_order)
      .flatMap((menu) => menu.items.filter((item) => item.is_active)) ?? [];

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024 && isDropdownMenuOpen) {
        setIsDropdownMenuOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isDropdownMenuOpen]);

  return (
    <div className="flex justify-center items-center bg-gray-deep">
      <ContentContainer>
        <div className="flex items-center justify-between w-full py-[4px] text-white gap-x-[8px] md:gap-x-[16px]">
          <div className="flex items-center flex-wrap gap-y-[6px]">
            <div className="flex items-center shrink-0 h-[22px] md:h-[28px] mr-[8px] md:mr-[16px] py-[2px] px-[5px] md:py-[5px] md:px-[9px] font-normal text-main-red border border-main-red-deep rounded-[6px] cursor-default gap-x-[4px]">
              <MapPin className="w-[12px] h-[12px] text-main-red shrink-0" />
              <span className="mt-[-2px] text-[11px] md:text-[14px] whitespace-nowrap">
                Москва
              </span>
            </div>

            <div className="flex gap-x-[4px] items-center">
              <Phone className="w-[14px] h-[14px] shrink-0" />
              <div className="flex gap-x-[4px] md:gap-x-[8px]">
                <Link
                  href="tel:84957967996"
                  className="cursor-pointer active:opacity-60 text-[11px] md:text-[14px]"
                >
                  +7 495 796-79-96
                </Link>
                <Link
                  href="tel:84957477224"
                  className="cursor-pointer active:opacity-60 text-[11px] md:text-[14px]"
                >
                  +7 495 747-72-24
                </Link>
              </div>
            </div>

            <div className="hidden md:flex md:ml-[16px]">
              <WorkTimeButton className="shrink-0 md:h-[28px] py-[2px] px-[5px] md:py-[5px] md:px-[12px] text-white" />
            </div>
          </div>

          <div className="flex items-center gap-x-[8px] md:gap-x-[16px] shrink-0">
            <div className="hidden lg:block">
              <ul className="flex gap-x-[16px] lg:gap-x-[20px] xl:gap-x-[24px]">
                {headerMenuItems.map((item) => (
                  <li key={`${item.url}:${t(item.name)}`} className="shrink-0">
                    <MenuListItem item={item} />
                  </li>
                ))}
              </ul>
            </div>

            <div className="lg:hidden">
              <DropdownMenu
                open={isDropdownMenuOpen}
                onOpenChange={setIsDropdownMenuOpen}
              >
                <DropdownMenuTrigger className="flex items-center gap-x-[4px] cursor-pointer">
                  <span className="text-[11px] md:text-[14px]">Меню</span>
                  <ChevronDown size={14} />
                </DropdownMenuTrigger>

                <DropdownMenuPortal>
                  <DropdownMenuContent
                    align="end"
                    className="grid gap-y-[10px] p-[16px] md:p-[20px] min-w-[160px]"
                  >
                    <DropdownMenuGroup>
                      <DropdownMenuItem asChild className="p-0">
                        <WorkTimeLink />
                      </DropdownMenuItem>
                      {headerMenuItems.map((item) => (
                        <DropdownMenuItem
                          key={`${item.url}:${t(item.name)}`}
                          className="p-0"
                        >
                          <MenuListItem item={item} />
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenuPortal>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </ContentContainer>
    </div>
  );
}
