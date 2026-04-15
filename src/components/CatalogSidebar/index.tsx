"use client";

import Link from "next/link";
import { Grip } from "lucide-react";
import { Fragment } from "react";
import { useI18N } from "@/i18n/hooks/useLocale";
import { useSearchParams } from "next/navigation";
import { useCategoriesListQueryOptions as getCategoriesListQueryOptions } from "@cms/sdk/categories/hooks/queries";
import { useQuery } from "@tanstack/react-query";
import { useProductSearchQueryOptions as getProductSearchQueryOptions } from "@cms/sdk/products/hooks/queries";

type Props = {
  className?: string;
  isClientRoute?: boolean;
};

export default function CatalogSidebar({
  className = "",
  isClientRoute,
}: Props) {
  const { t } = useI18N();
  const searchParams = useSearchParams();
  const activeCategoryId = searchParams.get("category");
  const selectedTransmission = searchParams.get("transmission");

  const { data: categories } = useQuery(
    getCategoriesListQueryOptions({
      params: {
        include_inactive: false,
        parent_id: null,
      },
    })
  );

  const productsQuery = useQuery(
    getProductSearchQueryOptions({
      params: {
        searchParams: {
          transmission: selectedTransmission
            ? [selectedTransmission]
            : undefined,
          offset: 0,
          limit: 0,
          facets: ["category"],
        },
      },
      queryOptions: {
        staleTime: Infinity,
      },
    })
  );

  const createCategoryLink = (categoryId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("category", categoryId);
    return `/catalog/products?${params.toString()}`;
  };

  const handleCategoryClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    categoryId: string,
    productCount: number
  ) => {
    if (productCount === 0) {
      e.preventDefault();
      return;
    }

    if (isClientRoute) {
      e.preventDefault();
      window.history.pushState(null, "", createCategoryLink(categoryId));
    }
  };

  const getCategoryProductCount = (categoryId: string): number => {
    return productsQuery.data?.facets?.category_id?.[categoryId] ?? 0;
  };

  return (
    <div
      className={`shrink-0 w-full py-[24px] px-[16px] shadow-(--gray-deep-shadow) rounded-[12px] ${className}`}
    >
      <h2 className="flex items-center gap-x-[10px] mb-[16px] font-medium text-[16px] md:text-[20px]">
        <Grip />
        <span>Каталог товаров</span>
      </h2>

      <div className="flex flex-wrap 1lg:flex-col gap-[12px] md:gap-[16px] 1lg:gap-[10px] text-[12px] md:text-[14px] text-(--color-text)">
        {categories?.items
          .filter((item) => !item.parent_id)
          .map((category, index, array) => {
            const productCount = getCategoryProductCount(category.id);
            const hasProducts = productCount > 0;
            const isActive = category.id === activeCategoryId;

            return (
              <Fragment key={category.id}>
                <Link
                  onClick={(e) =>
                    handleCategoryClick(e, category.id, productCount)
                  }
                  href={createCategoryLink(category.id)}
                  className={`
                    block w-full leading-tight
                    ${!hasProducts ? "text-[#E2E2E2] cursor-not-allowed" : "hover:text-main-red active:opacity-60"}
                    ${isActive && hasProducts ? "!text-main-red font-semibold" : ""}
                    ${isActive && !hasProducts ? "!text-[#E2E2E2]" : ""}
                  `}
                  aria-disabled={!hasProducts}
                  tabIndex={!hasProducts ? -1 : undefined}
                  style={{
                    wordBreak: "keep-all",
                    overflowWrap: "break-word",
                  }}
                >
                  {t(category.name)}
                  {productsQuery.data && (
                    <span className="ml-1 whitespace-nowrap">
                      ({productCount})
                    </span>
                  )}
                </Link>
                {index < array.length - 1 && (
                  <div className="h-px w-full bg-[#E2E2E2]" />
                )}
              </Fragment>
            );
          })}
      </div>
    </div>
  );
}
