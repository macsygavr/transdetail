"use client";

import { useMemo } from "react";
import Link from "next/link";
import ContentContainer from "@/components/ContentContainer/ContentContainer";
import { OrdersSection } from "../../components/home/Orders";
import { Button } from "@/components/ui/button";
import ProductsSection from "../../components/home/ProductsSection";
import { Variants } from "@/components/HeaderProductsGroup";
// import NewDetailsBanner from "@/components/NewDetailsBanner";
// import CastrolOilBanner from "@/components/CastrolOilBanner";
import CatalogSidebar from "@/components/CatalogSidebar";
import { PartnersAndMarket } from "../../components/home/PartnersAndMarket";
import TopSlider from "../../components/home/TopSlider";
import { useI18N } from "@/i18n/hooks/useLocale";
import { CategoriesSection } from "../../components/home/CategoriesSection";
import SearchTransmission from "../../components/home/SearchTransmission";
import BroadcastMessages from "@/domain/broadcast-messages/component/broadcast-messages";
import { useQuery } from "@tanstack/react-query";
import { useWhoAmIQueryOptions } from "@cms/sdk/auth/hooks/queries";
import { useTransmissionsListQueryOptions } from "@cms/sdk/transmissions/hooks/queries";
import { useProductCollectionsListQueryOptions } from "@cms/sdk/products/hooks/queries";

export default function HomePageContent() {
  const { t } = useI18N();
  const whoAmIQuery = useQuery(useWhoAmIQueryOptions());

  const { data: transmissions } = useQuery(
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

  const { data: productCollections } = useQuery(
    useProductCollectionsListQueryOptions({
      params: {
        query: {},
        listParams: {
          count: false,
        },
      },
      queryOptions: {
        staleTime: Infinity,
      },
    })
  );

  const transmissionsToRender = useMemo(
    () => transmissions?.items.filter((item) => !item.parent_id).slice(0, 20),
    [transmissions]
  );

  return (
    <>
      <ContentContainer>
        <div className="flex flex-col 3xl:flex-row 3xl:items-start 3xl:gap-x-[30px]">
          <div className="hidden 3xl:flex 3xl:flex-col gap-y-[30px] 3xl:w-[300px] shrink-0">
            <CatalogSidebar />
            {/* <CastrolOilBanner /> */}
          </div>

          <div className="flex flex-col gap-y-[40px] md:gap-y-[60px] w-full 1lg:max-w-[1360px] 3xl:max-w-[960px] mx-auto">
            <div className="flex flex-col gap-y-[30px]">
              <BroadcastMessages />

              <div
                className="
                flex flex-col-reverse 2md:grid 2md:grid-cols-2 2md:items-stretch
                gap-y-[20px] md:gap-y-[30px] 2md:gap-x-[20px]
                w-full m-auto
                3xl:max-w-[960px] 1lg:max-w-[1360px]"
              >
                <div className="2md:p-0 text-[12px] md:text-[14px]">
                  <div className="flex flex-col p-[16px] md:p-[24px] h-full bg-base-gray rounded-[12px]">
                    <p className="mb-[8px] md:mb-[16px] font-medium text-text">
                      Мы предоставляем большой перечень деталей трансмиссий для
                      большинства авто
                    </p>

                    <SearchTransmission />

                    <ul className="grid grid-cols-3 3sm:grid-cols-[repeat(auto-fit,minmax(90px,1fr))] gap-x-2.5 gap-y-1 3sm:gap-x-4 mb-4 text-accent-blue">
                      {transmissionsToRender?.map((transmission) => (
                        <Link
                          href={`/catalog/transmissions/${transmission.id}`}
                          key={transmission.id}
                          className="hover:text-main-red hover:cursor-pointer truncate"
                        >
                          {t(transmission.name)}
                        </Link>
                      ))}
                    </ul>

                    <Button variant="outline" asChild className="self-start">
                      <Link href="/catalog/transmissions">
                        Полный список трансмиссий
                      </Link>
                    </Button>
                  </div>
                </div>

                <TopSlider />
              </div>
            </div>

            {whoAmIQuery.data && <OrdersSection key={whoAmIQuery.data?.id} />}

            <CategoriesSection />

            {productCollections?.items.map((collection) => {
              return (
                <ProductsSection
                  key={collection.id}
                  products={collection.products}
                  variant={Variants.Flame}
                  title={collection.name["en"]}
                  linkAddress="/catalog/products"
                  linkText="Посмотреть все товары"
                />
              );
            })}

            {/* <NewDetailsBanner /> */}

            {/* <ProductsSection
              variant={Variants.Star}
              title="Новые поступления"
              linkAddress="/catalog/products"
              linkText="Посмотреть все товары"
            /> */}

            {/* <NewDetailsBanner /> */}

            {/* <ProductsSection
              variant={Variants.Tag}
              title="Цена на товар снизилась"
              linkAddress="/catalog/products"
              linkText="Посмотреть все товары"
            /> */}

            {/* <ProductsSection
              variant={Variants.TrendingDown}
              title="Распродажа"
              linkAddress="/catalog/products"
              linkText="Посмотреть все товары"
            /> */}
          </div>
        </div>
      </ContentContainer>

      <PartnersAndMarket />
    </>
  );
}
