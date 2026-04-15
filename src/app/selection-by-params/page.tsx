"use client";

import ContentContainer from "@/components/ContentContainer/ContentContainer";
import PageTitle from "@/components/PageTitle/PageTitle";
import { Button } from "@/components/ui/button";
import { useCompany } from "@/domain/companies/hooks/use-current-company";
import ProductRow from "@/domain/products/components/ProductRow";
import { useEntityMap } from "@/utils";
import { useQuery } from "@tanstack/react-query";
import { useWhoAmIQueryOptions } from "@cms/sdk/auth/hooks/queries";
import { useConfigurationSettingsQueryOptions } from "@cms/sdk/configuration/hooks/queries";
import { useManufacturersListQueryOptions } from "@cms/sdk/manufacturers/hooks/queries";
import { useProductSearchQueryOptions } from "@cms/sdk/products/hooks/queries";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";

export default function Page() {
  const searchParams = useSearchParams();

  const configuration = useQuery(useConfigurationSettingsQueryOptions());
  const selectionByParamsPropertiesIdList = useMemo(() => {
    const value =
      configuration.data?.[
        "transdetail_web__navbar__selection_by_params__properties"
      ]?.value;

    return Array.isArray(value)
      ? value.filter(
          (item): item is string => typeof item === "string" && item.length > 0
        )
      : [];
  }, [configuration.data]);

  const whoAmIQuery = useQuery(useWhoAmIQueryOptions());
  const company = useCompany();

  const manufacturersQuery = useQuery(useManufacturersListQueryOptions());
  const manufacturersMap = useEntityMap(manufacturersQuery.data?.items);

  const spread = useMemo(() => {
    const value = Number(
      configuration.data?.[
        "transdetail_web__navbar__selection_by_params__spread"
      ]?.value
    );

    return Number.isFinite(value) ? value : 0.02;
  }, [configuration.data]);

  const propertyFilters = useMemo(
    () =>
      selectionByParamsPropertiesIdList.flatMap((propertyId) => {
        const rawValue = searchParams.get(`p_${propertyId}`)?.trim();
        const value = Number(rawValue);

        if (!rawValue || !Number.isFinite(value)) {
          return [];
        }

        return [
          {
            id: propertyId,
            op: "ge" as const,
            value: value - spread,
          },
          {
            id: propertyId,
            op: "le" as const,
            value: value + spread,
          },
        ];
      }),
    [searchParams, selectionByParamsPropertiesIdList, spread]
  );

  const productsQuery = useQuery(
    useProductSearchQueryOptions({
      params: {
        searchParams: {
          company_id: company.companyId ?? undefined,
          property: propertyFilters.length ? propertyFilters : undefined,
          offset: 0,
          limit: 24,
          expand:
            whoAmIQuery.isSuccess && !!whoAmIQuery.data
              ? ["images", "prices", "stock"]
              : ["images"],
        },
      },
      queryOptions: {
        enabled: whoAmIQuery.isFetched && configuration.isFetched,
      },
    })
  );

  return (
    <ContentContainer>
      <PageTitle>Подбор по параметрам</PageTitle>

      <div className="grid gap-[20px] md:gap-[24px]">
        <ul className="grid gap-y-[12px] md:gap-y-[20px]">
          {productsQuery.data?.items.map((item) => (
            <Link key={item.id} href={`/catalog/products/${item.id}`}>
              <ProductRow
                key={item.id}
                product={item}
                manufacturersMap={manufacturersMap}
                as={"li"}
              />
            </Link>
          ))}
        </ul>

        {/* TODO: implement me */}

        <Button variant="tertiary" className="mx-auto">
          Загрузить ещё
        </Button>

        {/* <Pagination>
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
    </ContentContainer>
  );
}
