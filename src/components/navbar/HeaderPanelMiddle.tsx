"use client";

import { AlignLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import LogoTD from "@/assets/logo-td.svg";
import LogoTDMobile from "@/assets/logo-td-mobile.svg";
import CartsDropdown from "@/domain/carts/components/CartsDropdown";
import { Button } from "@/components/ui/button";

import ContentContainer from "../ContentContainer/ContentContainer";
import { ProfileButton } from "./profile-button";
import { SearchBar } from "./search";

export default function HeaderPanelMiddle() {
  return (
    <div>
      <ContentContainer>
        <div className="flex items-center md:items-stretch py-[12px] 1lg:py-[23px]">
          <Link
            href="/"
            className="w-[48px] h-[48px] mr-[12px] 3sm:mr-[20px] shrink-0 3sm:w-[162px] 3sm:h-[48px]"
          >
            <Image
              className="w-[48px] h-[48px] 3sm:hidden"
              width={48}
              height={48}
              alt="Трансдеталь логотип"
              src={LogoTDMobile.src}
            />
            <Image
              className="hidden 3sm:block 3sm:w-[162px] 3sm:h-[48px]"
              width={48}
              height={48}
              alt="Трансдеталь логотип"
              src={LogoTD.src}
            />
          </Link>

          <Button
            asChild
            className="shrink-0 hidden md:flex md:mr-[10px] md:px-[26px] md:h-[46px] font-bold shadow-[0px_2px_20px_0px_#F53D3F40] rounded-[8px]"
          >
            <Link href="/catalog/products">
              <AlignLeft className="size-[20px]" />
              <span>Каталог</span>
            </Link>
          </Button>

          <SearchBar />

          <div className="hidden md:flex">
            <ProfileButton />
            <CartsDropdown />
          </div>
        </div>
      </ContentContainer>
    </div>
  );
}
