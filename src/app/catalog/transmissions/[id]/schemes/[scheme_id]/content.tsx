"use client";

import ContentContainer from "@/components/ContentContainer/ContentContainer";
import PageTitle from "@/components/PageTitle/PageTitle";
import { ChevronDown, MoveLeft } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { useI18N } from "@/i18n/hooks/useLocale";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import ProductRow from "@/domain/products/components/ProductRow";
import { Manufacturer } from "@cms/sdk/manufacturers/entities";
import { useManufacturersListQueryOptions } from "@cms/sdk/manufacturers/hooks/queries";
import { Product } from "@cms/sdk/products/entities";
import { useProductListQueryOptions } from "@cms/sdk/products/hooks/queries";
import {
  useTransmissionQueryOptions,
  useTransmissionsListQueryOptions,
} from "@cms/sdk/transmissions/hooks/queries";
import { useWhoAmIQueryOptions } from "@cms/sdk/auth/hooks/queries";

import SchemeImageMapCanvas from "./SchemeImageMapCanvas";

interface ProductAccordionListProps {
  code: string;
  products: Product[];
  manufacturersMap: Record<string, Manufacturer>;
  isShown: boolean;
  onToggle: (code: string) => void;
  registerSection: (code: string, node: HTMLDivElement | null) => void;
}

interface TransmissionSchemeContentProps {
  transmissionId: string;
  schemeId: string;
  backUrl: string;
}

function ProductAccordionList({
  code,
  products,
  manufacturersMap,
  isShown,
  onToggle,
  registerSection,
}: ProductAccordionListProps) {
  if (products.length === 0) return null;

  return (
    <div
      ref={(node) => registerSection(code, node)}
      className="grid gap-y-[12px] md:gap-y-[20px] scroll-mt-6 md:scroll-mt-8"
    >
      <button
        type="button"
        className="flex items-center text-main-red font-medium cursor-pointer hover:underline"
        aria-expanded={isShown}
        onClick={() => onToggle(code)}
      >
        <span>{code}</span>
        <ChevronDown
          size={16}
          className={cn("duration-200 transition-transform", {
            "rotate-180": isShown,
          })}
        />
      </button>

      <ul
        className={cn("hidden flex-col gap-y-[8px] md:gap-y-[12px]", {
          flex: isShown,
        })}
      >
        {products.map((product) => (
          <Link key={product.id} href={`/catalog/products/${product.id}`}>
            <ProductRow
              as={"li"}
              product={product}
              manufacturersMap={manufacturersMap}
            />
          </Link>
        ))}
      </ul>
    </div>
  );
}

export default function TransmissionSchemeContent({
  transmissionId,
  schemeId,
  backUrl,
}: TransmissionSchemeContentProps) {
  const { t } = useI18N();
  const [openPartCodes, setOpenPartCodes] = useState<Record<string, boolean>>(
    {}
  );
  const [pendingScrollCode, setPendingScrollCode] = useState<string | null>(
    null
  );
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const whoAmIQuery = useQuery(
    useWhoAmIQueryOptions({
      queryOptions: {
        retry: false,
      },
    })
  );

  const { data: parentTransmission } = useQuery(
    useTransmissionQueryOptions({
      params: {
        id: transmissionId,
      },
      queryOptions: {
        enabled: !!transmissionId,
        staleTime: Infinity,
      },
    })
  );

  const { data: currentScheme } = useQuery(
    useTransmissionQueryOptions({
      params: {
        id: schemeId,
      },
      queryOptions: {
        enabled: !!schemeId,
        staleTime: Infinity,
      },
    })
  );

  const { data: schemes } = useQuery(
    useTransmissionsListQueryOptions({
      params: {
        parentId: transmissionId,
        include_inactive: false,
      },
      queryOptions: {
        staleTime: Infinity,
      },
    })
  );

  const { data: productsList } = useQuery(
    useProductListQueryOptions({
      params: {
        filter: {
          $filter: { transmission_id: schemeId },
        },
        listParams: {
          limit: 1000,
          expand:
            whoAmIQuery.isSuccess && !!whoAmIQuery.data
              ? ["images", "prices", "stock"]
              : ["images"],
        },
      },
      queryOptions: {
        staleTime: Infinity,
      },
    })
  );

  const { data: manufacturers } = useQuery(useManufacturersListQueryOptions());

  const manufacturersMap = useMemo(() => {
    return (manufacturers?.items || []).reduce(
      (acc, item) => {
        acc[item.id] = item;
        return acc;
      },
      {} as Record<string, Manufacturer>
    );
  }, [manufacturers]);

  const partsWithProducts = useMemo(() => {
    if (!currentScheme?.parts || !productsList?.items) return [];

    const productsMap = productsList.items.reduce(
      (acc, product) => {
        acc[product.id] = product;
        return acc;
      },
      {} as Record<string, Product>
    );

    const groupedParts: Record<string, Product[]> = {};

    currentScheme.parts.forEach((part) => {
      if (!part.products) return;

      if (!groupedParts[part.code]) {
        groupedParts[part.code] = [];
      }

      part.products.forEach((productId) => {
        if (productsMap[productId]) {
          if (!groupedParts[part.code].find((p) => p.id === productId)) {
            groupedParts[part.code].push(productsMap[productId]);
          }
        }
      });
    });

    return Object.entries(groupedParts)
      .map(([code, products]) => ({
        code,
        products,
      }))
      .sort((a, b) =>
        a.code.localeCompare(b.code, undefined, { numeric: true })
      );
  }, [currentScheme, productsList]);

  const highlightedPartCodes = useMemo(
    () =>
      partsWithProducts
        .filter(({ products }) => products.length > 0)
        .map(({ code }) => code),
    [partsWithProducts]
  );

  const registerSection = useCallback(
    (code: string, node: HTMLDivElement | null) => {
      if (node) {
        sectionRefs.current[code] = node;
        return;
      }

      delete sectionRefs.current[code];
    },
    []
  );

  const handleTogglePart = useCallback((code: string) => {
    setOpenPartCodes((prev) => ({
      ...prev,
      [code]: !prev[code],
    }));
  }, []);

  const handleAreaSelect = useCallback((code: string) => {
    setOpenPartCodes((prev) => ({
      ...prev,
      [code]: true,
    }));
    setPendingScrollCode(code);
  }, []);

  useEffect(() => {
    setOpenPartCodes({});
    setPendingScrollCode(null);
    sectionRefs.current = {};
  }, [schemeId]);

  useEffect(() => {
    if (!pendingScrollCode || !openPartCodes[pendingScrollCode]) {
      return;
    }

    const node = sectionRefs.current[pendingScrollCode];

    if (!node) {
      return;
    }

    const animationFrameId = window.requestAnimationFrame(() => {
      node.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
      setPendingScrollCode(null);
    });

    return () => {
      window.cancelAnimationFrame(animationFrameId);
    };
  }, [openPartCodes, pendingScrollCode]);

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
          {parentTransmission && (
            <>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link
                    href={`/catalog/transmissions/${transmissionId}`}
                    className="text-[#ef4323] hover:text-[#ef4323]"
                  >
                    {t(parentTransmission.name)}
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
            </>
          )}
          {currentScheme && (
            <BreadcrumbItem>
              <BreadcrumbPage className="text-neutral-gray">
                {t(currentScheme.name)}
              </BreadcrumbPage>
            </BreadcrumbItem>
          )}
        </BreadcrumbList>
      </Breadcrumb>

      <PageTitle>
        {parentTransmission
          ? `Схемы ${t(parentTransmission.name)}`
          : "Загрузка..."}
      </PageTitle>

      <div
        className="
        overflow-x-auto w-full
        grid grid-flow-col auto-cols-[100px] md:auto-cols-[128px]
        gap-x-[12px] px-[12px] py-[8px] md:px-[20px] md:py-[16px]
        mb-[30px] md:mb-[40px]
        bg-(--color-base-gray) rounded-[8px]
      "
      >
        <div className="pb-[24px]">
          <Link
            className="flex flex-col items-center w-full aspect-square p-[5px] bg-main-red rounded-[12px] justify-center h-[120px]"
            href={`/catalog/transmissions/${transmissionId}`}
          >
            <MoveLeft className="shrink-0 text-white" size={32} />
            <span className="text-center text-[12px] text-white leading-[18px] font-medium">
              Назад в Каталог трансмиссий
            </span>
          </Link>
        </div>

        {schemes?.items.map((scheme) => (
          <div key={scheme.id}>
            <Link
              href={`/catalog/transmissions/${transmissionId}/schemes/${scheme.id}?backUrl=${encodeURIComponent(backUrl)}`}
              className={cn(
                "flex flex-col justify-center w-full aspect-square p-[5px] bg-white rounded-[12px] border h-[120px]",
                {
                  "border-main-red": scheme.id === schemeId,
                  "border-(--color-accent-blue)": scheme.id !== schemeId,
                }
              )}
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
            <p
              className={cn(
                "text-center text-[12px] leading-[20px] font-medium mt-1",
                {
                  "text-main-red": scheme.id === schemeId,
                  "text-(--color-text)": scheme.id !== schemeId,
                }
              )}
            >
              {t(scheme.name)}
            </p>
          </div>
        ))}
      </div>

      <div className="relative overflow-hidden w-full mb-[30px] md:mb-[40px] border border-neutral-gray-deep rounded-[12px]">
        {currentScheme?.image ? (
          <SchemeImageMapCanvas
            imageSrc={`/media/${currentScheme.image}/optimized.webp`}
            alt={t(currentScheme.name)}
            mapMarkup={currentScheme.parts_map}
            highlightedCodes={highlightedPartCodes}
            onAreaSelect={handleAreaSelect}
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-gray-100 text-gray-400">
            Нет изображения схемы
          </div>
        )}
      </div>

      <div className="flex flex-col gap-y-[20px] md:gap-y-[40px]">
        {partsWithProducts.map(({ code, products }) => (
          <ProductAccordionList
            key={code}
            code={code}
            products={products}
            manufacturersMap={manufacturersMap}
            isShown={!!openPartCodes[code]}
            onToggle={handleTogglePart}
            registerSection={registerSection}
          />
        ))}
        {partsWithProducts.length === 0 && (
          <div className="text-center text-gray-500">
            Нет товаров для этой схемы
          </div>
        )}
      </div>
    </ContentContainer>
  );
}
