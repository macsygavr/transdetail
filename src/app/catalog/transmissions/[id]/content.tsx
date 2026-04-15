"use client";

import ContentContainer from "@/components/ContentContainer/ContentContainer";
import PageTitle from "@/components/PageTitle/PageTitle";
import TransmissionSelector from "@/components/TransmissionSelector/page";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useI18N } from "@/i18n/hooks/useLocale";
import SchemesList from "@/components/SchemesList/SchemesList";
import { Loader2 } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import ProductRow from "@/domain/products/components/ProductRow";
import { useCategoriesListQueryOptions } from "@cms/sdk/categories/hooks/queries";
import { useManufacturersListQueryOptions } from "@cms/sdk/manufacturers/hooks/queries";
import { Product } from "@cms/sdk/products/entities";
import { useProductSearchQueryOptions } from "@cms/sdk/products/hooks/queries";
import { useTransmissionQueryOptions } from "@cms/sdk/transmissions/hooks/queries";
import { useWhoAmIQueryOptions } from "@cms/sdk/auth/hooks/queries";
import { useCompany } from "@/domain/companies/hooks/use-current-company";

interface AccordionProductListProps {
  categoryName: string;
  products: Product[];
  manufacturersMap: Record<string, { name: Record<string, string> }>;
  transmissionId: string;
}

function AccordionProductList({
  categoryName,
  products,
  manufacturersMap,
  transmissionId,
}: AccordionProductListProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex flex-col gap-y-[12px] md:gap-y-[20px]">
      <button
        className="overflow-hidden flex border border-neutral-gray-deep rounded-[8px] group cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="flex items-center p-[12px] md:py-[16px] md:px-[24px]">
          <span className="shrink-0 flex mr-[8px] md:mr-[16px]">
            <Image
              className="m-auto w-[24px] h-[24px] md:w-[33px] md:h-[33px]"
              height={33}
              width={33}
              src="/icons/circle.svg"
              alt="Иконка круга"
            />
          </span>
          <span className="text-left text-[16px] md:text-[23px] leading-[100%] text-accent-blue group-hover:text-main-red font-medium">
            {categoryName}
          </span>
        </span>

        <span className="shrink-0 w-[50px] md:w-[65px] flex items-center justify-center ml-auto bg-neutral-gray-light border-l border-neutral-gray-deep cursor-pointer">
          <span
            className={cn(
              "shrink-0 flex items-center justify-center size-[15px] md:size-[19px] rounded-full duration-200 transition-transform",
              { "rotate-90": isOpen }
            )}
          >
            <Image
              className="m-auto size-full"
              height={23}
              width={23}
              src="/icons/right-circle-arrow.svg"
              alt="свернуть/развернуть"
            />
          </span>
        </span>
      </button>

      <div className={cn("hidden", { block: isOpen })}>
        <ul className="flex flex-col gap-y-[12px] md:gap-y-[20px]">
          {products.map((product) => (
            <Link
              key={product.id}
              href={`/catalog/products/${product.id}?transmission=${transmissionId}&source=transmission`}
            >
              <ProductRow
                as={"li"}
                product={product}
                manufacturersMap={manufacturersMap}
              />
            </Link>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default function Content({ id }: { id: string }) {
  const { t } = useI18N();
  const router = useRouter();
  const pathname = usePathname();

  const whoAmIQuery = useQuery(useWhoAmIQueryOptions());
  const company = useCompany();

  const { data: transmission, isLoading: isTransmissionLoading } = useQuery(
    useTransmissionQueryOptions({
      params: {
        id,
      },
      queryOptions: {
        staleTime: Infinity,
      },
    })
  );

  const { data: productsData } = useQuery(
    useProductSearchQueryOptions({
      params: {
        searchParams: {
          company_id: company.companyId ?? undefined,
          transmission: [id],
          limit: 200,
          expand:
            whoAmIQuery.isSuccess && !!whoAmIQuery.data
              ? ["images", "prices", "stock"]
              : ["images"],
        },
      },
      queryOptions: {
        enabled: whoAmIQuery.isFetched,
        staleTime: Infinity,
      },
    })
  );

  const { data: categoriesData } = useQuery(
    useCategoriesListQueryOptions({
      params: {
        include_inactive: false,
        parent_id: null,
      },
    })
  );

  const { data: manufacturersData } = useQuery(
    useManufacturersListQueryOptions()
  );

  const manufacturersMap = useMemo(() => {
    const map: Record<string, { name: Record<string, string> }> = {};
    manufacturersData?.items.forEach((manufacturer) => {
      map[manufacturer.id] = manufacturer;
    });
    return map;
  }, [manufacturersData]);

  const categoriesMap = useMemo(() => {
    const map: Record<string, { name: Record<string, string> }> = {};
    categoriesData?.items.forEach((category) => {
      map[category.id] = category;
    });
    return map;
  }, [categoriesData]);

  const groupedProducts = useMemo(() => {
    if (!productsData?.items) return [];

    const groups: Record<string, Product[]> = {};
    productsData.items.forEach((product) => {
      const categoryId = product.category_id || "uncategorized";
      if (!groups[categoryId]) {
        groups[categoryId] = [];
      }
      groups[categoryId].push(product);
    });

    return Object.entries(groups).map(([categoryId, products]) => ({
      catId: categoryId,
      name:
        categoryId === "uncategorized"
          ? "Без категории"
          : t(categoriesMap[categoryId]?.name) || "Неизвестная категория",
      products,
    }));
  }, [productsData, categoriesMap, t]);

  const handleTransmissionChange = (transmissionId: string | null) => {
    if (transmissionId && transmissionId !== id) {
      router.push(`/catalog/transmissions/${transmissionId}`);
    }
  };

  if (isTransmissionLoading) {
    return (
      <ContentContainer>
        <div className="flex justify-center items-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-main-red" />
        </div>
      </ContentContainer>
    );
  }

  if (!transmission) {
    return (
      <ContentContainer>
        <div className="text-center py-10">Трансмиссия не найдена</div>
      </ContentContainer>
    );
  }

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
                href="/catalog/transmissions"
                className="text-[#ef4323] hover:text-[#ef4323]"
              >
                Каталог
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="text-neutral-gray">
              {t(transmission.name)}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <PageTitle>{t(transmission.name)}</PageTitle>

      <div className="grid gap-[30px] md:gap-[40px]">
        <div className="grid gap-[16px] grid-cols-1 3sm:grid-cols-2 2md:grid-cols-[1.5fr_1fr_auto] px-[16px] md:px-[24px] py-[12px] md:py-[16px] shadow-(--gray-deep-shadow) rounded-[12px] overflow-visible">
          <div className="grid gap-[5px] md:gap-[6px] overflow-visible">
            <TransmissionSelector
              selectedTransmission={id}
              onTransmissionChange={handleTransmissionChange}
              showRecentTransmissions={false}
            />
          </div>

          <div className="flex items-center gap-x-[12px] md:gap-x-[16px] pl-0 pt-[16px] 2md:pt-0 2md:pl-[16px] text-[12px] md:text-[14px] font-medium border-t 2md:border-t-0 2md:border-l border-neutral-gray-deep min-w-0 overflow-visible">
            <div className="w-full min-w-0 overflow-visible">
              <SchemesList transmissionId={id} backUrl={pathname} />
            </div>
          </div>

          <div className="flex justify-end border-t 2md:border-t-0 2md:border-l border-neutral-gray-deep pt-[16px] 2md:pt-0 2md:pl-[16px]">
            <div className="flex flex-col">
              <p className="mb-[6px] md:mb-[8px] text-neutral-gray text-[12px] md:text-[14px]">
                Выберите вид отображения
              </p>
              <div className="flex overflow-hidden w-max text-[12px] md:text-[14px] border border-main-red rounded-[8px]">
                <button className="px-[13px] pt-[6px] pb-[7px] text-white bg-main-red cursor-default">
                  Первый режим
                </button>
                <Link
                  href={`/catalog/products?transmission=${id}`}
                  className="px-[13px] pt-[6px] pb-[7px] text-main-red bg-white hover:bg-gray-50"
                >
                  Второй режим
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-start">
          <div className="flex flex-col gap-y-[16px] md:gap-y-[20px] w-full max-w-[1000]">
            {groupedProducts.length > 0 ? (
              groupedProducts.map((group) => (
                <AccordionProductList
                  key={group.catId}
                  categoryName={group.name}
                  products={group.products}
                  manufacturersMap={manufacturersMap}
                  transmissionId={id}
                />
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                Товары не найдены
              </div>
            )}
          </div>
        </div>
      </div>
    </ContentContainer>
  );
}
