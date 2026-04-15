import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { cookies } from "next/headers";
import ProductDetailsContent from "./content";
import { APIClientOptions } from "@cms/sdk/common/api";
import { useWhoAmIQueryOptions } from "@cms/sdk/auth/hooks/queries";
import { useCategoryQueryOptions } from "@cms/sdk/categories/hooks/queries";
import { useCurrentCompanyQueryOptions } from "@cms/sdk/companies/hooks/queries";
import { useCurrenciesListQueryOptions } from "@cms/sdk/currencies/hooks/queries";
import { useUserFavoritesListQueryOptions } from "@cms/sdk/favorite-products/hooks/queries";
import { useManufacturersListQueryOptions } from "@cms/sdk/manufacturers/hooks/queries";
import {
  useProductQueryOptions,
  useProductStatusesListQueryOptions,
} from "@cms/sdk/products/hooks/queries";
import { useListPropertiesQueryOptions } from "@cms/sdk/property/hooks/queries";
import { useCurrentCartQueryOptions } from "@cms/sdk/carts/hooks/queries";
import { useTransmissionQueryOptions } from "@cms/sdk/transmissions/hooks/queries";
import { useWarehousesListQueryOptions } from "@cms/sdk/warehouses/hooks/queries";
import { API_HOST } from "@/constants/api";

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const [routeParams, resolvedSearchParams, cookieStore] = await Promise.all([
    params,
    searchParams,
    cookies(),
  ]);
  const requestCookies = cookieStore.toString();

  const client = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 2 * 50 * 1000,
      },
    },
  });
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

  const id = routeParams.id;
  const transmissionId = Array.isArray(resolvedSearchParams.transmission)
    ? resolvedSearchParams.transmission[0]
    : resolvedSearchParams.transmission;
  const categoryId = Array.isArray(resolvedSearchParams.category)
    ? resolvedSearchParams.category[0]
    : resolvedSearchParams.category;

  const currentCompanyQueryOptions = useCurrentCompanyQueryOptions({
    clientOptions,
    queryOptions: {
      retry: false,
    },
  });

  const whoAmIQueryOptions = useWhoAmIQueryOptions({
    clientOptions,
    queryOptions: {
      retry: false,
    },
  });

  await Promise.all([
    Promise.all([
      client.fetchQuery(whoAmIQueryOptions),
      client.fetchQuery(currentCompanyQueryOptions),
    ]).then(([whoAmI, currentCompany]) => {
      const isAuthorized = !!whoAmI;
      const isAdmin = whoAmI?.roles?.some((role) => role === "admin") ?? false;

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
          useProductQueryOptions({
            clientOptions,
            params: {
              id,
              fetchParams: {
                company_id: currentCompany?.id ?? undefined,
                expand:
                  isAdmin || (isAuthorized && currentCompany?.id)
                    ? ["images", "kit", "alternatives", "prices", "stock"]
                    : ["images", "kit", "alternatives"],
              },
            },
            queryOptions: {
              staleTime: Infinity,
            },
          })
        ),
      ]);
    }),
    client.prefetchQuery(useManufacturersListQueryOptions({ clientOptions })),
    client.prefetchQuery(useListPropertiesQueryOptions({ clientOptions })),
    client.prefetchQuery(
      useProductStatusesListQueryOptions({
        clientOptions,
        queryOptions: {
          staleTime: Infinity,
        },
      })
    ),
    client.prefetchQuery(useCurrenciesListQueryOptions({ clientOptions })),
    client.prefetchQuery(useWarehousesListQueryOptions({ clientOptions })),
    ...(transmissionId
      ? [
          client.prefetchQuery(
            useTransmissionQueryOptions({
              clientOptions,
              params: {
                id: transmissionId,
              },
              queryOptions: {
                staleTime: Infinity,
              },
            })
          ),
        ]
      : []),
    ...(categoryId
      ? [
          client.prefetchQuery(
            useCategoryQueryOptions({
              clientOptions,
              params: {
                id: categoryId,
              },
              queryOptions: {
                staleTime: Infinity,
              },
            })
          ),
        ]
      : []),
  ]);

  return (
    <HydrationBoundary state={dehydrate(client)}>
      <ProductDetailsContent />
    </HydrationBoundary>
  );
}
