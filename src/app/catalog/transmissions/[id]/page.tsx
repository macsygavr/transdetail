import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { cookies } from "next/headers";
import Content from "./content";
import { APIClientOptions } from "@cms/sdk/common/api";
import { useWhoAmIQueryOptions } from "@cms/sdk/auth/hooks/queries";
import { useCategoriesListQueryOptions } from "@cms/sdk/categories/hooks/queries";
import { useCurrentCompanyQueryOptions } from "@cms/sdk/companies/hooks/queries";
import { useManufacturersListQueryOptions } from "@cms/sdk/manufacturers/hooks/queries";
import { useProductSearchQueryOptions } from "@cms/sdk/products/hooks/queries";
import {
  useTransmissionQueryOptions,
  useTransmissionsListQueryOptions,
} from "@cms/sdk/transmissions/hooks/queries";
import { useCurrentCartQueryOptions } from "@cms/sdk/carts/hooks/queries";
import { API_HOST } from "@/constants/api";
import { useCurrenciesListQueryOptions } from "@cms/sdk/currencies/hooks/queries";
import { useWarehousesListQueryOptions } from "@cms/sdk/warehouses/hooks/queries";
import { useUserFavoritesListQueryOptions } from "@cms/sdk/favorite-products/hooks/queries";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [{ id }, cookieStore] = await Promise.all([params, cookies()]);
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
                transmission: [id],
                limit: 200,
                expand: [...productExpand],
              },
            },
            queryOptions: {
              enabled: true,
              staleTime: Infinity,
            },
          })
        ),
      ]);
    }),
    client.prefetchQuery(
      useTransmissionQueryOptions({
        clientOptions,
        params: {
          id,
        },
        queryOptions: {
          staleTime: Infinity,
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
    client.prefetchQuery(
      useTransmissionsListQueryOptions({
        clientOptions,
        params: {
          parentId: id,
          include_inactive: false,
        },
      })
    ),
    client.prefetchQuery(
      useCategoriesListQueryOptions({
        clientOptions,
        params: {
          include_inactive: false,
          parent_id: null,
        },
      })
    ),
    client.prefetchQuery(
      useManufacturersListQueryOptions({
        clientOptions,
      })
    ),
    client.prefetchQuery(useCurrenciesListQueryOptions({ clientOptions })),
    client.prefetchQuery(useWarehousesListQueryOptions({ clientOptions })),
  ]);

  return (
    <HydrationBoundary state={dehydrate(client)}>
      <Content id={id} />
    </HydrationBoundary>
  );
}
