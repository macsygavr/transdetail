"use client";

import ContentContainer from "@/components/ContentContainer/ContentContainer";
// import LongProductCard from "@/components/LongProductCard/LongProductCard";
import NewDetailsBanner from "@/components/NewDetailsBanner";
import PageTitle from "@/components/PageTitle/PageTitle";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useThrottle } from "@uidotdev/usehooks";
import { useEffect, useMemo, useRef, useState } from "react";
import fuzzysort from "fuzzysort";
import { useI18N } from "@/i18n/hooks/useLocale";
import ProductRow from "@/domain/products/components/ProductRow";
import { useEntityMap } from "@/utils";
import { useCompany } from "@/domain/companies/hooks/use-current-company";
import { useWhoAmIQueryOptions } from "@cms/sdk/auth/hooks/queries";
import { useCategoriesListQueryOptions } from "@cms/sdk/categories/hooks/queries";
import { useManufacturersListQueryOptions } from "@cms/sdk/manufacturers/hooks/queries";
import { useProductSearchQueryOptions } from "@cms/sdk/products/hooks/queries";
import { useTransmissionsListQueryOptions } from "@cms/sdk/transmissions/hooks/queries";

export default function Page() {
  const { t } = useI18N();

  const whoAmIQuery = useQuery(useWhoAmIQueryOptions());
  const currentCompany = useCompany();

  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const qFromUrl = searchParams.get("q") ?? "";

  // Keep input state in sync with URL `?q=`.
  // We avoid overriding typing by only applying URL changes that did not come
  // from our own `router.replace()` calls.
  const lastAppliedUrlQRef = useRef<string | null>(null);
  const [keywords, setKeywords] = useState<string>(qFromUrl);

  useEffect(() => {
    if (qFromUrl === lastAppliedUrlQRef.current) return;
    setKeywords(qFromUrl);
  }, [qFromUrl]);

  const throttledKeywords = useThrottle(keywords, 500);
  // Match navbar search behavior: don't search until we have 3+ chars.
  const isSearchEnabled = throttledKeywords.length >= 3;

  // Persist the throttled value to URL (query param name: `q`).
  useEffect(() => {
    const desiredQ = throttledKeywords;
    const params = new URLSearchParams(searchParams.toString());

    if (desiredQ) {
      params.set("q", desiredQ);
    } else {
      params.delete("q");
    }

    const next = params.toString();
    const nextUrl = next ? `${pathname}?${next}` : pathname;
    const current = searchParams.toString();
    const currentUrl = current ? `${pathname}?${current}` : pathname;

    if (nextUrl === currentUrl) return;

    lastAppliedUrlQRef.current = desiredQ;
    router.replace(nextUrl, { scroll: false });
  }, [pathname, router, searchParams, throttledKeywords]);

  const categoriesQuery = useQuery(
    useCategoriesListQueryOptions({
      params: {
        include_inactive: false,
        parent_id: null,
      },
    })
  );
  const categoriesSearchResult = useMemo(() => {
    if (!isSearchEnabled) return [];

    const result = fuzzysort.go(
      throttledKeywords,
      categoriesQuery.data?.items ?? [],
      {
        keys: ["name.en", "name.ru"],
        threshold: 0.85,
      }
    );
    return result.map((item) => item.obj);
  }, [categoriesQuery.data, isSearchEnabled, throttledKeywords]);

  const transmissionsQuery = useQuery(
    useTransmissionsListQueryOptions({
      params: {
        parentId: "-",
      },
    })
  );
  const transmissionsSearchResult = useMemo(() => {
    if (!isSearchEnabled) return [];

    const result = fuzzysort.go(
      throttledKeywords,
      transmissionsQuery.data?.items ?? [],
      {
        keys: ["name.en", "name.ru", "description.en", "description.ru"],
        threshold: 0.85,
      }
    );
    return result.map((item) => item.obj);
  }, [isSearchEnabled, throttledKeywords, transmissionsQuery.data]);

  const productsQuery = useQuery(
    useProductSearchQueryOptions({
      params: {
        searchParams: {
          q: throttledKeywords,
          company_id: currentCompany.companyId ?? undefined,
          offset: 0,
          limit: 50,
          expand:
            whoAmIQuery.isSuccess && !!whoAmIQuery.data
              ? ["images", "prices", "stock"]
              : ["images"],
        },
      },
      queryOptions: {
        enabled: isSearchEnabled,
        placeholderData: (previousData) => previousData,
      },
    })
  );
  const productsSearchResult = useMemo(() => {
    return productsQuery.data?.items ?? [];
  }, [productsQuery.data]);

  const manufacturersQuery = useQuery(useManufacturersListQueryOptions());
  const manufacturersMap = useEntityMap(manufacturersQuery.data?.items);

  return (
    <ContentContainer>
      <PageTitle>
        Поиск{throttledKeywords ? ` ${throttledKeywords}` : ""}
      </PageTitle>

      <div className="flex flex-col gap-[40px] md:gap-[60px]">
        <div className="grid grid-cols-[auto_1fr] gap-[24px] md:gap-[32px]">
          <h2 className="flex justify-center items-start p-[34px] font-medium text-[16px] md:text-[20px] bg-base-gray rounded-[8px]">
            <span>Категории</span>
          </h2>
          <ul className="flex flex-wrap gap-[8px] md:gap-[12px]">
            {categoriesSearchResult.map((item) => (
              <li key={item.id}>
                <Link
                  href={`/catalog/products?category=${item.id}`}
                  className="flex items-center px-[12px] py-[8px] text-[12px] md:text-[14px] text-main-red border border-main-red rounded-[8px]"
                >
                  <span>{t(item.name)}</span>
                </Link>
              </li>
            ))}
          </ul>

          <Separator className="col-span-2" />

          <h2 className="flex justify-center items-start p-[34px] font-medium text-[16px] md:text-[20px] bg-base-gray rounded-[8px]">
            <span>Трансмиссии</span>
          </h2>
          <ul className="flex flex-wrap gap-[8px] md:gap-[12px]">
            {transmissionsSearchResult.map((item) => (
              <li key={item.id}>
                <Link
                  href={`/catalog/transmissions/${item.id}`}
                  className="flex items-center px-[12px] py-[8px] text-[12px] md:text-[14px] text-text border border-accent-blue rounded-[8px]"
                >
                  <span>{t(item.name)}</span>
                </Link>
              </li>
            ))}
          </ul>

          <Separator className="col-span-2" />

          <h2 className="flex justify-center items-start p-[34px] font-medium text-[16px] md:text-[20px] bg-base-gray rounded-[8px]">
            <span>Товары</span>
          </h2>

          <ul className="flex flex-col gap-[12px] md:gap-[20px] 3xl:grow">
            {productsSearchResult.map((product) => (
              <Link key={product.id} href={`/catalog/products/${product.id}`}>
                <ProductRow
                  as={"li"}
                  product={product}
                  manufacturersMap={manufacturersMap}
                />
              </Link>
            ))}
          </ul>

          {/* <Button variant="tertiary" className="mx-auto">
              Загрузить ещё
            </Button>

            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationLink href="#" isActive>
                    1
                  </PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#">2</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#">3</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#">99</PaginationLink>
                </PaginationItem>
              </PaginationContent>
            </Pagination> */}
        </div>

        <NewDetailsBanner />
      </div>
    </ContentContainer>
  );
}
