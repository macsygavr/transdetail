"use client";

import CatalogSidebar from "@/components/CatalogSidebar";
import ContentContainer from "@/components/ContentContainer/ContentContainer";
import PageTitle from "@/components/PageTitle/PageTitle";
import SchemesList from "@/components/SchemesList/SchemesList";
import { Button } from "@/components/ui/button";
import { useMemo, useState } from "react";
import { dehydrate, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEntityMap } from "@/utils";
import Link from "next/link";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import TransmissionSelector from "@/components/TransmissionSelector/page";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useI18N } from "@/i18n/hooks/useLocale";
import ProductRow from "@/domain/products/components/ProductRow";
import { useCompany } from "@/domain/companies/hooks/use-current-company";
import { useWhoAmIQueryOptions } from "@cms/sdk/auth/hooks/queries";
import { useManufacturersListQueryOptions } from "@cms/sdk/manufacturers/hooks/queries";
import { useProductSearchQueryOptions } from "@cms/sdk/products/hooks/queries";
import { useTransmissionsListQueryOptions } from "@cms/sdk/transmissions/hooks/queries";
import { useCategoriesListQueryOptions } from "@cms/sdk/categories/hooks/queries";

const PAGE_SIZE = 24;

export default function ProductsContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { t } = useI18N();

  const whoAmIQuery = useQuery(useWhoAmIQueryOptions());

  const currentCompany = useCompany();

  const selectedTransmission = searchParams.get("transmission");
  const selectedCategory = searchParams.get("category");

  const manufacturersQuery = useQuery(
    useManufacturersListQueryOptions({
      queryOptions: {
        retry: false,
      },
    })
  );

  const transmissionsQuery = useQuery(
    useTransmissionsListQueryOptions({
      params: {
        parentId: null,
        include_inactive: false,
      },
      queryOptions: {
        retry: false,
      },
    })
  );

  const categoriesQuery = useQuery(useCategoriesListQueryOptions());

  const manufacturersMap = useEntityMap(manufacturersQuery.data?.items);

  const transmissionsMap = useMemo(() => {
    const map = new Map();
    transmissionsQuery.data?.items?.forEach((transmission) => {
      map.set(transmission.id, transmission);
    });
    return map;
  }, [transmissionsQuery.data?.items]);

  const categoriesMap = useMemo(() => {
    const map = new Map();
    categoriesQuery.data?.items?.forEach((category) => {
      map.set(category.id, category);
    });
    return map;
  }, [categoriesQuery.data?.items]);

  const [limit, setLimit] = useState(PAGE_SIZE);

  const productSearchQueryOptions = useProductSearchQueryOptions({
    params: {
      searchParams: {
        company_id: currentCompany.companyId ?? undefined,
        category: selectedCategory ? [selectedCategory] : undefined,
        transmission: selectedTransmission ? [selectedTransmission] : undefined,
        offset: 0,
        limit: limit,
        expand: !!whoAmIQuery.data ? ["images", "prices", "stock"] : ["images"],
      },
    },
    queryOptions: {
      enabled: whoAmIQuery.isFetched,
      retry: false,
      staleTime: Infinity,
    },
  });

  const productsQuery = useQuery(productSearchQueryOptions);

  const products = productsQuery.data?.items || [];
  const totalCount = productsQuery.data?.count || 0;

  const handleTransmissionChange = (transmissionId: string | null) => {
    const params = new URLSearchParams(searchParams.toString());

    if (transmissionId) params.set("transmission", transmissionId);
    else params.delete("transmission");

    if (selectedCategory) params.set("category", selectedCategory);

    window.history.pushState(null, "", `${pathname}?${params.toString()}`);
  };

  const handleLoadMore = () => setLimit((prev) => prev + PAGE_SIZE);

  const transmissionName = useMemo(
    () =>
      selectedTransmission
        ? (t(transmissionsMap.get(selectedTransmission)?.name) ??
          `Трансмиссия ${selectedTransmission}`)
        : null,
    [selectedTransmission, transmissionsMap, t]
  );

  const categoryName = useMemo(
    () =>
      selectedCategory
        ? (t(categoriesMap.get(selectedCategory)?.name) ??
          `Категория ${selectedCategory}`)
        : null,
    [selectedCategory, categoriesMap, t]
  );

  const catalogUrl = useMemo(() => "/catalog/products", []);

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
                href={catalogUrl}
                className="text-[#ef4323] hover:text-[#ef4323]"
              >
                Каталог
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>

          {selectedCategory && categoryName && (
            <>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link
                    href={`/catalog/products?category=${selectedCategory}`}
                    className="text-[#ef4323] hover:text-[#ef4323]"
                  >
                    {categoryName}
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
            </>
          )}

          {selectedTransmission && transmissionName && (
            <>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-neutral-gray">
                  {transmissionName}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </>
          )}
        </BreadcrumbList>
      </Breadcrumb>

      <PageTitle>Каталог</PageTitle>

      <div className="flex flex-col 1lg:flex-row 1lg:grid 1lg:grid-cols-[18rem_1fr] 3xl:grid-cols-[22rem_1fr] gap-[30px] md:gap-[40px] 1lg:gap-[30px]">
        <div className="flex flex-col gap-[20px] md:gap-[30px]">
          <div className="w-full p-[16px_12px] md:p-[24px_16px] shadow-(--gray-deep-shadow) rounded-[12px]">
            <TransmissionSelector
              key={`transmission-${selectedTransmission}-${selectedCategory}`}
              selectedTransmission={selectedTransmission}
              onTransmissionChange={handleTransmissionChange}
              className="w-full"
            />
          </div>

          <CatalogSidebar isClientRoute />
        </div>

        <div>
          {selectedTransmission && (
            <div className="grid 3sm:grid-cols-[1fr_auto] 3sm:gap-x-[16px] md:gap-x-[24px] p-[16px] md:px-[24px] mb-[30px] bg-base-gray rounded-[8px]">
              <div className="pb-[12px] mb-[12px] 3sm:pb-0 3sm:mb-0 border-b 3sm:border-b-0 3sm:border-r border-neutral-gray-deep overflow-hidden">
                <div className="pr-[12px] md:pr-[16px]">
                  <SchemesList
                    transmissionId={selectedTransmission}
                    backUrl={`${pathname}?${searchParams.toString()}`}
                  />
                </div>
              </div>

              <div className="self-start pt-[12px] 3sm:pt-0">
                <p className="mb-[6px] md:mb-[8px] text-neutral-gray text-[12px] md:text-[14px]">
                  Выберите вид отображения
                </p>

                <div className="flex overflow-hidden w-max text-[12px] md:text-[14px] border border-main-red rounded-[8px]">
                  <Link
                    href={`/catalog/transmissions/${selectedTransmission}`}
                    className="px-[13px] pt-[6px] pb-[7px] text-main-red bg-white hover:bg-gray-50"
                  >
                    Первый режим
                  </Link>
                  <button className="px-[13px] pt-[6px] pb-[7px] text-white bg-main-red cursor-default">
                    Второй режим
                  </button>
                </div>
              </div>
            </div>
          )}

          <div>
            <div className="grid gap-[20px] md:gap-[24px]">
              {productsQuery.isLoading && (
                <div className="text-center py-8 text-gray-500">
                  Загрузка продуктов...
                </div>
              )}

              <ul className="grid gap-[12px] md:gap-[20px]">
                {products.map((product) => (
                  <Link
                    key={product.id}
                    href={`/catalog/products/${product.id}?source=products${selectedTransmission ? `&transmission=${selectedTransmission}` : ""}${selectedCategory ? `&category=${selectedCategory}` : ""}`}
                  >
                    <ProductRow
                      as={"li"}
                      product={product}
                      manufacturersMap={manufacturersMap}
                    />
                  </Link>
                ))}
              </ul>

              {selectedTransmission &&
                products.length === 0 &&
                !productsQuery.isLoading && (
                  <div className="text-center py-8 text-gray-500">
                    Нет деталей для выбранной трансмиссии
                  </div>
                )}

              {products.length > 0 && products.length < totalCount && (
                <Button
                  variant="tertiary"
                  className="mx-auto"
                  onClick={handleLoadMore}
                  disabled={productsQuery.isFetching}
                >
                  {productsQuery.isFetching ? "Загрузка..." : "Загрузить ещё"}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </ContentContainer>
  );
}
