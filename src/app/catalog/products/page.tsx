import {
  defaultShouldDehydrateQuery,
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { cookies } from "next/headers";
import ProductsContent from "./content";
import { APIClientOptions } from "@cms/sdk/common/api";
import { useWhoAmIQueryOptions } from "@cms/sdk/auth/hooks/queries";
import { useCurrentCompanyQueryOptions } from "@cms/sdk/companies/hooks/queries";
import { useManufacturersListQueryOptions } from "@cms/sdk/manufacturers/hooks/queries";
import { useProductSearchQueryOptions } from "@cms/sdk/products/hooks/queries";
import { useTransmissionsListQueryOptions } from "@cms/sdk/transmissions/hooks/queries";
import { useCategoriesListQueryOptions } from "@cms/sdk/categories/hooks/queries";
import { useCurrentCartQueryOptions } from "@cms/sdk/carts/hooks/queries";
import { API_HOST } from "@/constants/api";
import { useCurrenciesListQueryOptions } from "@cms/sdk/currencies/hooks/queries";
import { useWarehousesListQueryOptions } from "@cms/sdk/warehouses/hooks/queries";
import { useUserFavoritesListQueryOptions } from "@cms/sdk/favorite-products/hooks/queries";

const PAGE_SIZE = 24;

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const [params, cookieStore] = await Promise.all([searchParams, cookies()]);
  const requestCookies = cookieStore.toString();

  const client = new QueryClient();
  const clientOptions: APIClientOptions = {
    baseURL: API_HOST,
    middlewares: [
      async (url, init, next) => {
        const headers = new Headers(init.headers);

        if (requestCookies) {
          headers.set("cookie", requestCookies);
        }

        return next(url, {
          ...init,
          headers,
        });
      },
    ],
  };

  const selectedTransmission = Array.isArray(params.transmission)
    ? params.transmission[0]
    : params.transmission;

  const selectedCategory = Array.isArray(params.category)
    ? params.category[0]
    : params.category;

  const currentCompanyQueryOptions = useCurrentCompanyQueryOptions({
    clientOptions,
    queryOptions: {
      retry: false,
    },
  });

  const whoAmIQueryOptions = useWhoAmIQueryOptions({
    clientOptions,
    queryOptions: {
      staleTime: Infinity,
    },
  });

  await Promise.all([
    Promise.all([
      client.fetchQuery(whoAmIQueryOptions),
      client.fetchQuery(currentCompanyQueryOptions),
    ]).then(([whoAmI, currentCompany]) => {
      const productExpand = whoAmI
        ? (["images", "prices", "stock"] as const)
        : (["images"] as const);

      return Promise.all([
        ...(whoAmI
          ? [
              client.prefetchQuery(
                useCurrentCartQueryOptions({
                  clientOptions,
                  params: {
                    company_id: currentCompany?.id,
                    expand: ["product"],
                  },
                  queryOptions: {
                    staleTime: Infinity,
                  },
                })
              ),
              client.prefetchQuery(
                useUserFavoritesListQueryOptions({
                  clientOptions,
                  queryOptions: {
                    staleTime: Infinity,
                  },
                })
              ),
            ]
          : []),
        client.prefetchQuery(
          useProductSearchQueryOptions({
            clientOptions,
            params: {
              searchParams: {
                company_id: currentCompany?.id ?? undefined,
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
        ),
        client.prefetchQuery(
          useProductSearchQueryOptions({
            clientOptions,
            params: {
              searchParams: {
                company_id: currentCompany?.id ?? undefined,
                category: selectedCategory ? [selectedCategory] : undefined,
                transmission: selectedTransmission
                  ? [selectedTransmission]
                  : undefined,
                offset: 0,
                limit: PAGE_SIZE,
                expand: [...productExpand],
              },
            },
            queryOptions: {
              staleTime: Infinity,
            },
          })
        ),
      ]);
    }),
    client.prefetchQuery(
      useManufacturersListQueryOptions({
        clientOptions,
        queryOptions: {
          retry: false,
        },
      })
    ),
    client.prefetchQuery(
      useTransmissionsListQueryOptions({
        clientOptions,
        params: {
          parentId: null,
          include_inactive: false,
        },
        queryOptions: {
          retry: false,
        },
      })
    ),
    ...(selectedTransmission
      ? [
          client.prefetchQuery(
            useTransmissionsListQueryOptions({
              clientOptions,
              params: {
                parentId: selectedTransmission,
                include_inactive: false,
              },
              queryOptions: {
                retry: false,
              },
            })
          ),
        ]
      : []),
    client.prefetchQuery(
      useCategoriesListQueryOptions({
        clientOptions,
      })
    ),
    client.prefetchQuery(
      useCategoriesListQueryOptions({
        clientOptions,
        params: {
          parent_id: null,
          include_inactive: false,
        },
      })
    ),
    client.prefetchQuery(
      useCurrenciesListQueryOptions({
        clientOptions,
      })
    ),
    client.prefetchQuery(
      useWarehousesListQueryOptions({
        clientOptions,
      })
    ),
  ]);

  return (
    <HydrationBoundary state={dehydrate(client)}>
      <ProductsContent />
    </HydrationBoundary>
  );
}
