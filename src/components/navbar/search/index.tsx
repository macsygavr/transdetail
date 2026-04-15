"use client";

import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { type ReactNode, useMemo, useState } from "react";
import { useThrottle } from "@uidotdev/usehooks";
import fuzzysort from "fuzzysort";
import { useQuery } from "@tanstack/react-query";
import { useI18N } from "@/i18n/hooks/useLocale";
import Link from "next/link";
import Image from "next/image";
import { getProductImageSrc } from "@/utils/index";
import { useRouter } from "next/navigation";
import { useCategoriesListQueryOptions } from "@cms/sdk/categories/hooks/queries";
import { useProductSearchQueryOptions } from "@cms/sdk/products/hooks/queries";
import { useTransmissionsListQueryOptions } from "@cms/sdk/transmissions/hooks/queries";

export function SearchBar() {
  const { t } = useI18N();
  const router = useRouter();
  const [keywords, setKeywords] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const throttledKeywords = useThrottle(keywords, 500);

  function handleCloseSearchResults() {
    setIsFocused(false);
  }

  const isSearchResultsShown = isFocused && throttledKeywords.length >= 3;

  function handleSubmit() {
    if (keywords.length < 3) return;

    handleCloseSearchResults();
    const q = encodeURIComponent(keywords);
    router.push(`/search?q=${q}`);
  }

  const transmissionsQuery = useQuery(
    useTransmissionsListQueryOptions({
      params: {
        parentId: "-",
        include_inactive: false,
      },
      queryOptions: {
        staleTime: Infinity,
      },
    })
  );

  const transmissionsSearchResult = useMemo(() => {
    const result = fuzzysort.go(
      throttledKeywords,
      transmissionsQuery.data?.items ?? [],
      {
        keys: ["name.en", "name.ru", "description.en", "description.ru"],
        limit: 5,
        threshold: 0.85,
      }
    );
    return result.map((item) => item.obj);
  }, [throttledKeywords, transmissionsQuery.data]);

  const productsQuery = useQuery(
    useProductSearchQueryOptions({
      params: {
        searchParams: {
          q: throttledKeywords,
          offset: 0,
          limit: 5,
          expand: ["images"],
        },
      },
      queryOptions: {
        enabled: isSearchResultsShown,
        placeholderData: (previousData) => previousData,
      },
    })
  );

  const productsSearchResult = useMemo(() => {
    return productsQuery.data?.items ?? [];
  }, [productsQuery.data]);

  const categoriesQuery = useQuery(
    useCategoriesListQueryOptions({
      params: {
        include_inactive: false,
        parent_id: null,
      },
    })
  );

  const categoriesSearchResult = useMemo(() => {
    const result = fuzzysort.go(
      throttledKeywords,
      categoriesQuery.data?.items ?? [],
      {
        keys: ["name.en", "name.ru"],
        limit: 5,
      }
    );
    return result.map((item) => item.obj);
  }, [throttledKeywords, categoriesQuery.data]);

  return (
    <form
      className="relative flex flex-grow md:mr-5 h-9.5 md:h-[46px]"
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit();
      }}
    >
      <Input
        type="text"
        placeholder="Поиск товара"
        value={keywords}
        onChange={(event) => setKeywords(event.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => {
          setTimeout(handleCloseSearchResults, 100);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            handleSubmit();
          }
        }}
        className="
          grow pl-4 pr-7.5 h-9.5 md:h-11.5
          text-sm md:text-base text-text
         placeholder:text-[#A8A8BE]
        "
      />

      <button
        type="submit"
        aria-label="Search"
        className="absolute right-0 top-0 h-full px-3"
        onClick={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
      >
        <Search className="size-3.5 text-main-red" />
      </button>

      {isSearchResultsShown && (
        <div
          className='
          absolute z-50 top-11.5 md:top-13.5
          flex flex-col gap-2
          px-1 py-6

        bg-white shadow-(--gray-deep-shadow) rounded-lg inset-x-0

          [&>div]:not-last:pb-2.75
          [&>div]:not-last:relative
          [&>div]:not-last:after:content-[""]
          [&>div]:not-last:after:absolute
          [&>div]:not-last:after:bottom-0
          [&>div]:not-last:after:block
          [&>div]:not-last:after:h-px
          [&>div]:not-last:after:right-5
          [&>div]:not-last:after:left-5
          [&>div]:not-last:after:bg-border-gray
        '
        >
          {categoriesSearchResult.length === 0 &&
            productsSearchResult.length === 0 &&
            transmissionsSearchResult.length === 0 && (
              <p className="text-text line-clam">Не найдено</p>
            )}

          {categoriesSearchResult.length > 0 && (
            <div>
              <SearchBlockTitle>Категории</SearchBlockTitle>
              <ul className="space-y-1">
                {categoriesSearchResult.map((item) => (
                  <li key={item.id}>
                    <SearchBlockLink
                      href={`/catalog/products?category=${item.id}`}
                      onClick={handleCloseSearchResults}
                    >
                      {t(item.name)}
                    </SearchBlockLink>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {productsSearchResult.length > 0 && (
            <div>
              <SearchBlockTitle>Товары</SearchBlockTitle>
              <ul className="space-y-1">
                {productsSearchResult.map((item) => (
                  <li key={item.id}>
                    <SearchBlockLink
                      href={`/catalog/products/${item.id}`}
                      onClick={handleCloseSearchResults}
                    >
                      <div className="flex items-center gap-2.5">
                        {item.images.length ? (
                          <div className="shrink-0 size-10">
                            <Image
                              src={getProductImageSrc(
                                item.images[0],
                                "thumbnail.webp"
                              )}
                              width="40"
                              height="40"
                              alt={t(item.name)}
                            />
                          </div>
                        ) : null}
                        <p className="text-text line-clam">{t(item.name)}</p>
                      </div>
                    </SearchBlockLink>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {transmissionsSearchResult.length > 0 && (
            <div>
              <SearchBlockTitle>Трансмиссии</SearchBlockTitle>
              <ul className="space-y-1">
                {transmissionsSearchResult.map((item) => (
                  <li key={item.id}>
                    <SearchBlockLink
                      href={`/catalog/transmissions/${item.id}`}
                      onClick={handleCloseSearchResults}
                    >
                      <div className="flex items-center gap-2.5">
                        {item.image ? (
                          <div className="shrink-0 size-10 overflow-hidden">
                            <Image
                              src={getProductImageSrc(
                                item.image,
                                "thumbnail.webp"
                              )}
                              width="40"
                              height="40"
                              alt={t(item.name)}
                            />
                          </div>
                        ) : null}
                        <p className="text-sm line-clamp-2">{t(item.name)}</p>
                      </div>
                    </SearchBlockLink>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </form>
  );
}

function SearchBlockTitle({ children }: { children: string }) {
  return (
    <p className="mb-1 px-5 text-xs md:text-sm text-neutral-gray">{children}</p>
  );
}

function SearchBlockLink({
  href,
  onClick,
  className,
  children,
}: {
  href: string;
  onClick: () => void;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`
        block px-5 py-2
        text-sm
        text-text
        hover:text-accent-blue

        hover:bg-base-gray
        focus-visible:bg-base-gray

        rounded-sm
        transition-colors

        group
        [&_p]:group-hover:text-accent-blue

        [&_p]:transition-colors
        [&_p]:duration-200

        ${className}
      `}
    >
      {children}
    </Link>
  );
}
