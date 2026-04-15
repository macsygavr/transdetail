"use client";

import Separator from "@/components/Separator/Separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import PageTitle from "@/components/PageTitle/PageTitle";
import ContentContainer from "@/components/ContentContainer/ContentContainer";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import ProductRow from "@/domain/products/components/ProductRow";
import { useEntityMap } from "@/utils";
import { useWhoAmIQueryOptions } from "@cms/sdk/auth/hooks/queries";
import { useManufacturersListQueryOptions } from "@cms/sdk/manufacturers/hooks/queries";
import { ProductFilter } from "@cms/sdk/products/api";
import { useProductListQueryOptions } from "@cms/sdk/products/hooks/queries";
import { Query } from "@cms/sdk/common/entities";

export default function Page() {
  const whoAmIQuery = useQuery(useWhoAmIQueryOptions());
  const userId = whoAmIQuery.data?.id;

  const manufacturersQuery = useQuery(useManufacturersListQueryOptions());
  const manufacturersMap = useEntityMap(manufacturersQuery.data?.items);

  const productQuery = useMemo<Query<ProductFilter>>(() => {
    if (!userId) return {};
    return { $filter: { favorites_user_id: userId } };
  }, [userId]);

  const favoritesProductsQuery = useQuery(
    useProductListQueryOptions({
      params: {
        filter: productQuery,
        listParams: {
          limit: 1000,
          expand:
            whoAmIQuery.isSuccess && !!whoAmIQuery.data
              ? ["images", "prices", "stock"]
              : ["images"],
        },
      },
      queryOptions: {
        enabled: !!userId,
      },
    })
  );

  const favoriteProducts = favoritesProductsQuery.data?.items ?? [];

  return (
    <ContentContainer>
      <Breadcrumb className="mb-4 md:mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/" className="text-[#ef4323] hover:text-[#ef4323]">
                Главная
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link
                href="/account"
                className="text-[#ef4323] hover:text-[#ef4323]"
              >
                Личный кабинет
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="text-neutral-gray">
              Избранное
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <PageTitle>Избранное</PageTitle>

      <div className="grid gap-[24px] md:gap-[30px]">
        <div className="grid gap-y-[12px] md:gap-y-[20px]">
          {/* <Sorting /> */}

          <ul className="grid gap-[8px]">
            {whoAmIQuery.isLoading ? (
              <li className="text-neutral-gray text-[12px] md:text-[14px]">
                Загрузка профиля...
              </li>
            ) : !userId ? (
              <li className="text-neutral-gray text-[12px] md:text-[14px]">
                Необходимо{" "}
                <Link
                  href="/auth/login"
                  className="text-main-red hover:underline"
                >
                  авторизоваться
                </Link>
              </li>
            ) : favoritesProductsQuery.isLoading ? (
              <li className="text-neutral-gray text-[12px] md:text-[14px]">
                Загрузка избранного...
              </li>
            ) : favoritesProductsQuery.isError ? (
              <li className="text-neutral-gray text-[12px] md:text-[14px]">
                Не удалось загрузить избранное
              </li>
            ) : favoriteProducts.length === 0 ? (
              <li className="text-neutral-gray text-[12px] md:text-[14px]">
                В избранном нет товаров
              </li>
            ) : (
              favoriteProducts.map((product) => (
                <li key={product.id}>
                  <Link
                    href={`/catalog/products/${product.id}`}
                    className="block"
                  >
                    <ProductRow
                      as={"div"}
                      product={product}
                      manufacturersMap={manufacturersMap}
                    />
                  </Link>
                </li>
              ))
            )}
          </ul>
        </div>

        {/* <div className="grid gap-y-[12px] md:gap-y-[20px]">
          <p className="flex items-center gap-[6px] p-[12px] text-[12px] leading-[18px] text-neutral-gray bg-neutral-gray-light rounded-[8px]">
            <Info className="w-[14px] h-[14px] md:w-[17px] md:h-[17px]" />
            <span>Этих товаров нет в наличии</span>
          </p>

          <ul className="grid gap-[8px]">
            <ProductCard />
          </ul>
        </div> */}

        <Separator />

        <div className="flex items-start 3sm:items-center gap-[20px] md:gap-[30px]">
          <Label className="flex gap-x-[6px]">
            <Checkbox disabled />
            <span>Выбрать все</span>
          </Label>

          <div className="flex flex-wrap gap-[8px] md:gap-[20px]">
            <Select>
              <SelectTrigger disabled>
                <SelectValue placeholder="Корзина №2" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Корзина №1">Корзина №1</SelectItem>
                <SelectItem value="Корзина №3">Корзина №3</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="tertiary" disabled>
              Перенести в корзину
            </Button>
            <Button variant="outline" disabled>
              Удалить
            </Button>
          </div>
        </div>
      </div>
    </ContentContainer>
  );
}
