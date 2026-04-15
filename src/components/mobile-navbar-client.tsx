"use client";

import { useWhoAmIQueryOptions } from "@cms/sdk/auth/hooks/queries";
import { useQuery } from "@tanstack/react-query";
import { Grid2x2, Heart, ShoppingCart, UserRound } from "lucide-react";
import Link from "next/link";

export default function MobileNavbarClient() {
  const whoAmIQuery = useQuery(useWhoAmIQueryOptions());

  const user = whoAmIQuery.data;

  return (
    <nav className="fixed bottom-0 inset-x-0 z-2 bg-white md:hidden">
      <ul className="flex justify-center gap-7.5 p-3 3sm:gap-10">
        <li>
          <Link href="/catalog/products" className="flex flex-col items-center">
            <Grid2x2 className="size-5.5 text-main-red" />
            <span className="text-xxs">Каталог</span>
          </Link>
        </li>
        {user ? (
          <li>
            <Link href="/account" className="flex flex-col items-center">
              <UserRound className="size-5.5 text-main-red" />
              <span className="text-xxs">Профиль</span>
            </Link>
          </li>
        ) : (
          <li>
            <Link href="/auth/login" className="flex flex-col items-center">
              <UserRound className="size-5.5 text-main-red" />
              <span className="text-xxs">Войти</span>
            </Link>
          </li>
        )}
        {user ? (
          <li>
            <Link
              href="/account/favorites"
              className="flex flex-col items-center"
            >
              <Heart className="size-5.5 text-main-red" />
              <span className="text-xxs">Избранное</span>
            </Link>
          </li>
        ) : (
          <li>
            <button
              role="button"
              className="flex flex-col items-center opacity-35"
              disabled
            >
              <Heart className="size-5.5 text-gray-500" />
              <span className="text-xxs">Избранное</span>
            </button>
          </li>
        )}
        {user ? (
          <li>
            <Link href="/carts" className="flex flex-col items-center">
              <ShoppingCart className="size-5.5 text-main-red" />
              <span className="text-xxs">Корзина</span>
            </Link>
          </li>
        ) : (
          <li>
            <button
              role="button"
              className="flex flex-col items-center opacity-35"
              disabled
            >
              <ShoppingCart className="size-5.5 text-gray-500" />
              <span className="text-xxs">Корзина</span>
            </button>
          </li>
        )}
      </ul>
    </nav>
  );
}
