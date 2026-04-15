"use client";

import Link from "next/link";
import type { Menu } from "@cms/sdk/menus/entities";

import { useI18N } from "@/i18n/hooks/useLocale";

type FooterMenusProps = {
  menus: Menu[];
};

function FooterNavLink({ href, children }: { href: string; children: string }) {
  return (
    <Link
      className="text-[12px] md:text-[14px] text-white hover:text-main-red focus:text-main-red active:opacity-60"
      href={href}
    >
      {children}
    </Link>
  );
}

function FooterTitle({ children }: { children: string }) {
  return (
    <h2 className="mb-[8px] text-[14px] md:text-[16px] text-white opacity-60 uppercase">
      {children}
    </h2>
  );
}

export default function FooterMenus({ menus }: FooterMenusProps) {
  const { t } = useI18N();

  return (
    <div className="flex flex-wrap sm:grow 3sm:justify-around gap-x-[50px] gap-y-[24px]">
      {menus.map((menu) => (
        <section key={menu.id ?? `${menu.position}:${menu.sort_order}`}>
          <FooterTitle>{t(menu.name)}</FooterTitle>
          <ul className="space-y-[8px]">
            {menu.items.map((item) => (
              <li key={`${menu.id ?? menu.position}:${item.url}:${t(item.name)}`}>
                <FooterNavLink href={item.url}>{t(item.name)}</FooterNavLink>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
