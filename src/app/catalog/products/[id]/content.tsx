"use client";

import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import ContentContainer from "@/components/ContentContainer/ContentContainer";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import PageTitle from "@/components/PageTitle/PageTitle";
import { Separator } from "@/components/ui/separator";
import ProductGallery from "./ProductGallery";
import { useParams, useSearchParams } from "next/navigation";
import FavoriteButton from "@/components/elements/FavoriteButton";
import { useMemo } from "react";
import NoImage from "@/components/elements/NoImage";
import { getProductImageSrc } from "@/utils/index";
import { useCompany } from "@/domain/companies/hooks/use-current-company";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import AddToCartButton from "@/domain/carts/components/AddToCartButton";
import { useEntityMap } from "@/utils";
import { useI18N } from "@/i18n/hooks/useLocale";
import { useWhoAmIQueryOptions } from "@cms/sdk/auth/hooks/queries";
import { useManufacturersListQueryOptions } from "@cms/sdk/manufacturers/hooks/queries";
import { Product } from "@cms/sdk/products/entities";
import {
  useProductQueryOptions,
  useProductStatusesListQueryOptions,
} from "@cms/sdk/products/hooks/queries";
import { useListPropertiesQueryOptions } from "@cms/sdk/property/hooks/queries";
import { useProductPrice } from "@/domain/products/hooks/use-product-price";
import BackButton from "@/components/BackButton/BackButton";
import { useTransmissionQueryOptions } from "@cms/sdk/transmissions/hooks/queries";
import { useCategoryQueryOptions } from "@cms/sdk/categories/hooks/queries";

function getProductImage(
  product: Product,
  size: "thumbnail" | "small" | "medium" | "large" | "optimized" = "thumbnail"
): string | null {
  if (!product) return null;

  const image = product.images_expanded?.[0];
  if (image?.variants?.[size]?.objectname) {
    return getProductImageSrc(image.id, image.variants[size].objectname);
  }

  if (product.images?.[0]) {
    return getProductImageSrc(product.images[0], `${size}.webp`);
  }

  return null;
}

export default function ProductDetailsContent() {
  const { t } = useI18N();
  const { data: whoAmI } = useQuery(useWhoAmIQueryOptions());
  const isAuthorized = !!whoAmI;
  const isAdmin = whoAmI?.roles?.some((role) => role === "admin") ?? false;

  const manufacturersQuery = useQuery(useManufacturersListQueryOptions());
  const manufacturersMap = useEntityMap(manufacturersQuery.data?.items);

  const currentCompany = useCompany();

  const { id } = useParams();

  const searchParams = useSearchParams();
  const source = searchParams.get("source");
  const transmissionId = searchParams.get("transmission");
  const categoryId = searchParams.get("category");

  const { data: transmissionData } = useQuery(
    useTransmissionQueryOptions({
      params: {
        id: transmissionId || "",
      },
      queryOptions: {
        enabled: !!transmissionId,
        staleTime: Infinity,
      },
    })
  );

  const { data: categoryData } = useQuery(
    useCategoryQueryOptions({
      params: {
        id: categoryId || "",
      },
      queryOptions: {
        enabled: !!categoryId,
        staleTime: Infinity,
      },
    })
  );

  const transmissionName = transmissionData ? t(transmissionData.name) : null;
  const categoryName = categoryData ? t(categoryData.name) : null;

  const {
    data: productData,
    isLoading,
    isSuccess: isProductSuccess,
  } = useQuery(
    useProductQueryOptions({
      params: {
        id: `${id}`,
        fetchParams: {
          company_id: currentCompany.companyId ?? undefined,
          expand:
            isAdmin || isAuthorized
              ? ["images", "kit", "alternatives", "prices", "stock"]
              : ["images", "kit", "alternatives"],
        },
      },
      queryOptions: {
        staleTime: Infinity,
      },
    })
  );

  const { data: propertiesList, isSuccess: isPropertiesSuccess } = useQuery(
    useListPropertiesQueryOptions()
  );

  const { data: productStatusData, isSuccess: isStatusSuccess } = useQuery(
    useProductStatusesListQueryOptions({
      queryOptions: {
        staleTime: Infinity,
      },
    })
  );

  const isSuccess = isProductSuccess && isPropertiesSuccess && isStatusSuccess;

  const productStatus = useMemo(() => {
    return productStatusData?.items?.find(
      (item) => item.id === productData?.status_id
    );
  }, [productStatusData, productData]);

  const { inStock, formattedPrice } = useProductPrice(productData);

  if (isLoading)
    return (
      <ContentContainer>
        <div className="text-center py-8 text-gray-500">Загрузка данных...</div>
      </ContentContainer>
    );

  if (isSuccess) {
    return (
      <ContentContainer>
        <Breadcrumb className="mb-3 md:mb-4">
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
                  href="/catalog/products"
                  className="text-[#ef4323] hover:text-[#ef4323]"
                >
                  Каталог
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="text-neutral-gray">
                {t(productData.name)}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="mb-4 md:mb-6">
          <BackButton
            source={source}
            transmissionId={transmissionId}
            categoryId={categoryId}
            transmissionName={transmissionName}
            categoryName={categoryName}
          />
        </div>

        <PageTitle>{t(productData.name)}</PageTitle>

        <div className="grid gap-y-10 md:gap-y-15">
          <div className="grid 2md:grid-cols-[40%_1fr] gap-y-7.5 md:gap-x-5">
            <div className="grid items-start content-start gap-y-7.5">
              {productData.images_expanded?.length ? (
                <ProductGallery images={productData.images_expanded} />
              ) : (
                <NoImage />
              )}

              <div>
                <SectionTitle>Описание товара</SectionTitle>
                <p className="text-xs md:text-sm">
                  {t(productData.description)}
                </p>
              </div>

              {productData.alternatives_expanded?.length ? (
                <div>
                  <SectionTitle>Аналоги</SectionTitle>
                  <ul className="grid gap-y-2">
                    {productData.alternatives_expanded.map((item, i) => (
                      <AnalogProductCard key={i} productData={item} />
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>

            <div className="flex flex-col gap-y-5 md:gap-y-6">
              <div className="fixed 2md:static z-1 top-0 left-0 right-0 md:top-auto md:bottom-0 flex 2md:flex-wrap items-center p-[12px] 2md:p-[24px] rounded-b-[10px] 2md:rounded-[10px] bg-white shadow-(--gray-deep-shadow)">
                {/* <div className="hidden 2sm:flex 2sm:flex-col 2md:flex-row md:flex-row 2sm:items-start 2sm:gap-y-[4px] md:gap-x-[8px] 2sm:mr-[16px] 2md:mb-[9px] 2md:w-full">
                  <Badge>Новый</Badge>
                </div> */}

                <div className="flex items-center grow gap-2">
                  <div className="flex flex-col items-start 3sm:flex-row 3sm:gap-x-[8px] shrink-0 grow">
                    <span className="text-xl md:text-3xl text-accent-blue">
                      {isAuthorized ? (
                        inStock && formattedPrice ? (
                          formattedPrice
                        ) : null
                      ) : (
                        <span className="flex flex-col items-end">
                          <span className="text-accent-blue text-sm md:text-xl leading-[100%] font-medium">
                            Цена скрыта
                          </span>
                          <span className="text-text text-[10px] md:text-[12px] leading-[100%]">
                            *Необходимо{" "}
                            <Link
                              href={`/auth/login`}
                              className="text-main-red hover:underline"
                            >
                              авторизоваться
                            </Link>
                          </span>
                        </span>
                      )}
                    </span>
                  </div>

                  {isAuthorized ? (
                    <AddToCartButton product={productData} />
                  ) : null}
                  {isAuthorized ? (
                    <FavoriteButton
                      className="ml-3"
                      productId={productData.id}
                    />
                  ) : null}
                </div>
              </div>

              <div className="p-3 bg-base-gray rounded-[10px]">
                <SectionTitle>Техническая информация</SectionTitle>
                <ul className="flex flex-col 3sm:flex-row gap-y-[8px] 3sm:gap-x-[12px] md:gap-x-4">
                  {productData.article && (
                    <li className="flex flex-col px-3 py-2 border-1 border-[#E8E8E8] rounded-sm">
                      <span className="text-neutral-gray text-xs">Артикул</span>
                      <span className="font-medium text-text text-xs md:text-sm">
                        {productData.article}
                      </span>
                    </li>
                  )}

                  {productData.weight && (
                    <li className="flex flex-col px-[12px] py-[8px] border-1 border-[#E8E8E8] rounded-[4px]">
                      <span className="text-neutral-gray text-xs">
                        Вес нетто
                      </span>
                      <span className="font-medium text-text text-xs md:text-sm">
                        {productData.weight}кг
                      </span>
                    </li>
                  )}

                  {productData.part_number && (
                    <li className="flex flex-col px-[12px] py-[8px] border-1 border-[#E8E8E8] rounded-[4px]">
                      <span className="text-neutral-gray text-xs">
                        Тех. Номер
                      </span>
                      <span className="font-medium text-text text-xs md:text-sm">
                        {productData.part_number}
                      </span>
                    </li>
                  )}

                  {productData.manufacturer_id && (
                    <li className="flex flex-col px-[12px] py-[8px] border-1 border-[#E8E8E8] rounded-[4px]">
                      <span className="text-neutral-gray text-xs">
                        Производитель
                      </span>
                      <span className="font-medium text-text text-xs md:text-sm">
                        {t(
                          manufacturersMap[productData.manufacturer_id]?.name ||
                            ""
                        )}
                      </span>
                    </li>
                  )}

                  {productStatus && (
                    <li className="flex flex-col px-[12px] py-[8px] border-1 border-[#E8E8E8] rounded-[4px]">
                      <span className="text-neutral-gray text-xs">
                        Состояние
                      </span>
                      <span
                        style={{
                          color: productStatus?.color ?? "inherit",
                        }}
                        className={`font-medium text-xs md:text-sm`}
                      >
                        {t(productStatus?.name)}
                      </span>
                    </li>
                  )}
                </ul>
              </div>

              <section>
                <SectionTitle>Техническое описание</SectionTitle>
                <p className="p-[12px] text-xs text-text border border-neutral-gray-deep rounded-[10px]">
                  {t(productData.technical_description)}
                </p>
              </section>

              {propertiesList.items.some(
                (property) => productData?.properties?.[property.id]
              ) && (
                <>
                  <Separator />
                  <section>
                    <SectionTitle>Дополнительные характеристики</SectionTitle>
                    <ul className="overflow-hidden text-xs md:text-sm border border-[#E8E8E8] rounded-[10px]">
                      {propertiesList.items.map((property) => {
                        const propertyValue =
                          productData?.properties?.[property.id];

                        if (!propertyValue) return null;

                        return (
                          <li key={property.id} className="flex items-center">
                            <span className="w-[200px] p-[12px] font-medium bg-base-gray">
                              {t(property.name || "")}
                            </span>
                            <span className="pl-[12px]">{propertyValue}</span>
                          </li>
                        );
                      })}
                    </ul>
                  </section>
                </>
              )}

              {productData.cross_numbers?.length ? (
                <>
                  <Separator />
                  <section>
                    <SectionTitle>Варианты написания номеров</SectionTitle>
                    <ul
                      className="
            overflow-hidden text-xs md:text-sm border border-[#E8E8E8] rounded-[10px]
            [&_li]:grid [&_li]:grid-cols-2 [&_li]:p-[12px] [&_li:not(:first-child)]:uppercase
          "
                    >
                      <li className="first:font-medium first:bg-(--color-base-gray)">
                        <span>Номер</span>
                        <span>Производитель</span>
                      </li>

                      {productData.cross_numbers.map((item, i) => (
                        <li key={i}>
                          <span>{item.number}</span>
                          <span>
                            {t(
                              manufacturersMap[item.manufacturer_id]?.name || ""
                            )}
                          </span>
                        </li>
                      ))}
                    </ul>

                    {/* <Button className="mx-auto mt-4" variant="tertiary">
                          Показать все (+8)
                        </Button> */}
                  </section>
                </>
              ) : null}

              {productData.kit_expanded?.length ? (
                <>
                  <Separator />
                  <section>
                    <SectionTitle>Состав комплекта</SectionTitle>
                    <ul className="overflow-hidden border border-[#E8E8E8] rounded-[10px] [&_li:not(:last-child)]:border-b [&_li:not(:last-child)]:border-[E8E8E8]">
                      {productData.kit_expanded.map((item, i) => (
                        <KitElementCard
                          key={i}
                          amount={item.amount}
                          productData={item.product}
                        />
                      ))}
                    </ul>
                  </section>
                </>
              ) : null}

              {/* <Separator />

              <Tabs defaultValue="video">
                <TabsList>
                  <TabsTrigger value="video">Видео</TabsTrigger>
                  <TabsTrigger value="manuals">Мануалы</TabsTrigger>
                </TabsList>
                <TabsContent value="video">Тут будет ваше видео</TabsContent>
                <TabsContent value="manuals">Тут будут мануалы</TabsContent>
              </Tabs> */}
            </div>
          </div>

          {/* <NewDetailsBanner /> */}
        </div>
      </ContentContainer>
    );
  }
}

function SectionTitle({ children }: { children: string }) {
  return (
    <h2 className="mb-1 md:mb-2 text-xs md:text-sm font-medium text-text">
      {children}
    </h2>
  );
}

function AnalogProductCard({ productData }: { productData: Product }) {
  const { t } = useI18N();

  const { data: whoAmI } = useQuery(useWhoAmIQueryOptions());
  const isAuthorized = !!whoAmI;

  const manufacturersQuery = useQuery(useManufacturersListQueryOptions());
  const manufacturersMap = useEntityMap(manufacturersQuery.data?.items);

  const { inStock, formattedPrice } = useProductPrice(productData);

  const imageSrc = getProductImage(productData, "thumbnail");

  return (
    <Link href={`/catalog/products/${productData.id}`} className="block">
      <li className="md:relative flex gap-x-4 p-3 md:p-2 border border-[#E8E8E8] rounded-lg hover:shadow-md transition-shadow hover:border-red-500">
        <div className="shrink-0 flex items-center">
          <div className="size-14 md:size-20 relative block">
            {imageSrc ? (
              <Image
                className="object-contain w-full h-full"
                src={imageSrc}
                width={56}
                height={56}
                alt="Изображение товара"
                unoptimized
              />
            ) : (
              <NoImage />
            )}
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between grow gap-2">
          <div className="flex-1">
            <h3 className="mb-2 font-medium">
              <span className="text-[11px] md:text-xs text-accent-blue hover:text-main-red transition-colors cursor-pointer">
                {t(productData.name)}
              </span>
            </h3>

            <div className="flex flex-wrap md:flex-col gap-x-4 gap-y-2 md:gap-y-[1px] text-[10px]">
              {productData.article && (
                <div className="flex flex-col md:flex-row md:gap-x-[4px]">
                  <span className="text-neutral-gray">Артикул:</span>
                  <span className="text-text">{productData.article}</span>
                </div>
              )}
              {productData.part_number && (
                <div className="flex flex-col md:flex-row md:gap-x-[4px]">
                  <span className="text-neutral-gray">Тех. номер:</span>
                  <span className="text-text">{productData.part_number}</span>
                </div>
              )}
              {productData.manufacturer_id && (
                <div className="flex flex-col md:flex-row md:gap-x-1">
                  <span className="text-neutral-gray">Производитель:</span>
                  <span className="text-text">
                    {t(
                      manufacturersMap[productData.manufacturer_id]?.name || "-"
                    )}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col min-w-[120px]">
            {isAuthorized ? (
              <>
                {inStock && formattedPrice && (
                  <p className="mb-2 font-medium text-main-red text-[11px] md:text-xs">
                    {formattedPrice}
                  </p>
                )}
                <div className="flex items-center gap-2">
                  <AddToCartButton
                    product={productData}
                    className="!h-7 !text-[11px] md:!h-8 !px-2"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    className="group border-none !h-7 !w-7 md:!h-8 md:!w-8"
                  >
                    <Heart className="w-3.5 h-3.5 md:w-4 md:h-4 text-neutral-gray group-hover:text-main-red" />
                  </Button>
                </div>
              </>
            ) : (
              <>
                <p className="mb-1 text-accent-blue text-base md:text-xl leading-[100%] font-medium">
                  Цена скрыта
                </p>
                <p className="mb-[8px] text-text text-[10px] md:text-[12px] leading-[100%]">
                  *Необходимо{" "}
                  <Link
                    href={`/auth/login`}
                    className="text-main-red hover:underline"
                  >
                    авторизоваться
                  </Link>
                </p>
                <div className="flex items-center">
                  <AddToCartButton
                    product={productData}
                    className="grow ml-[8px] !h-7 !text-[11px] md:!h-8 !px-2"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    className="group border-none ml-3 !h-7 !w-7 md:!h-8 md:!w-8"
                  >
                    <Heart className="w-3.5 h-3.5 md:w-4 md:h-4 text-neutral-gray group-hover:text-main-red" />
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </li>
    </Link>
  );
}

function KitElementCard({
  productData,
  amount,
}: {
  productData: Product;
  amount: number;
}) {
  const { t } = useI18N();

  const manufacturersQuery = useQuery(useManufacturersListQueryOptions());
  const manufacturersMap = useEntityMap(manufacturersQuery.data?.items);

  const imageSrc = getProductImage(productData, "thumbnail");

  return (
    <Link href={`/catalog/products/${productData.id}`} className="block">
      <li className="flex gap-x-[20px] px-[16px] py-[12px] hover:bg-gray-50 transition-colors hover:border-red-500">
        <div className="shrink-0 size-[46px] relative block">
          {imageSrc ? (
            <Image
              className="object-contain w-full h-full"
              src={imageSrc}
              width={46}
              height={46}
              alt="Фото элемента комплекта"
              unoptimized
            />
          ) : (
            <NoImage />
          )}
        </div>

        <div className="flex flex-col 2sm:flex-row 2sm:justify-between 2sm:items-center 2sm:grow">
          <div>
            <h3 className="mb-[8px]">
              <span className="text-xs md:text-sm text-accent-blue hover:text-main-red transition-colors cursor-pointer">
                {t(productData.name)}
              </span>
            </h3>

            <div className="flex flex-col 2sm:flex-row 2sm:flex-wrap 2sm:gap-x-[12px] text-xs">
              {productData.article && (
                <div className="flex gap-x-1">
                  <span className="text-neutral-gray">Артикул:</span>
                  <span className="text-text">{productData.article}</span>
                </div>
              )}
              {productData.part_number && (
                <div className="flex gap-x-1">
                  <span className="text-neutral-gray">Тех. номер:</span>
                  <span className="text-text">{productData.part_number}</span>
                </div>
              )}

              {productData.manufacturer_id && (
                <div className="flex gap-x-1">
                  <span className="text-neutral-gray">Производитель:</span>
                  <span className="text-text">
                    {t(
                      manufacturersMap[productData.manufacturer_id]?.name || "-"
                    )}
                  </span>
                </div>
              )}
            </div>
          </div>

          <span className="shrink-0 text-sm font-medium text-accent-blue">
            {amount} шт.
          </span>
        </div>
      </li>
    </Link>
  );
}
