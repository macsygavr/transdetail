import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { cookies } from "next/headers";
import HomePageContent from "./content";
import { APIClientOptions } from "@cms/sdk/common/api";
import { useWhoAmIQueryOptions } from "@cms/sdk/auth/hooks/queries";
import { useCurrentCompanyQueryOptions } from "@cms/sdk/companies/hooks/queries";
import {
  useProductCollectionsListQueryOptions,
  useProductSearchQueryOptions,
} from "@cms/sdk/products/hooks/queries";
import { useTransmissionsListQueryOptions } from "@cms/sdk/transmissions/hooks/queries";
import { useCategoriesListQueryOptions } from "@cms/sdk/categories/hooks/queries";
import { useUnreadBroadcastMessagesQueryOptions } from "@cms/sdk/broadcast-messages/hooks/queries";
import { useCurrentCartQueryOptions } from "@cms/sdk/carts/hooks/queries";
import { API_HOST } from "@/constants/api";
import {
  useOrdersListQueryOptions,
  useOrderStatusesListQueryOptions,
} from "@cms/sdk/orders/hooks/queries";
import { useWarehousesListQueryOptions } from "@cms/sdk/warehouses/hooks/queries";
import { useCurrenciesListQueryOptions } from "@cms/sdk/currencies/hooks/queries";
import { useUserFavoritesListQueryOptions } from "@cms/sdk/favorite-products/hooks/queries";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const [, cookieStore] = await Promise.all([searchParams, cookies()]);
  const requestCookies = cookieStore.toString();

  const client = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: Infinity,
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

  const whoAmIQueryOptions = useWhoAmIQueryOptions({
    clientOptions,
    queryOptions: {
      retry: false,
    },
  });

  const currentCompanyQueryOptions = useCurrentCompanyQueryOptions({
    clientOptions,
    queryOptions: {
      retry: false,
      staleTime: Infinity,
    },
  });

  await Promise.all([
    Promise.all([
      client.fetchQuery(whoAmIQueryOptions),
      client.fetchQuery(currentCompanyQueryOptions),
    ]).then(([whoAmI, currentCompany]) => {
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
          useProductCollectionsListQueryOptions({
            clientOptions: clientOptions,
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
        ),
        client.prefetchQuery(
          useOrdersListQueryOptions({
            clientOptions,
            params: {
              filter: {
                limit: 100,
                offset: 0,
                user_id: whoAmI?.id,
                company_id: currentCompany?.id ?? undefined,
              },
            },
            queryOptions: {
              enabled: !!currentCompany?.id,
              staleTime: Infinity,
            },
          })
        ),
      ]);
    }),
    client.prefetchQuery(
      useTransmissionsListQueryOptions({
        clientOptions: clientOptions,
        params: {
          include_inactive: false,
          parentId: "-",
        },
        queryOptions: {
          staleTime: Infinity,
        },
      })
    ),
    // catalog sidebar
    client.prefetchQuery(
      useCategoriesListQueryOptions({
        clientOptions,
        params: {
          include_inactive: false,
          parent_id: null,
        },
        queryOptions: {
          staleTime: Infinity,
        },
      })
    ),
    // broadcast messages
    client.prefetchQuery(
      useUnreadBroadcastMessagesQueryOptions({
        clientOptions,
        queryOptions: {
          staleTime: Infinity,
        },
      })
    ),
    // orders section
    client.prefetchQuery(
      useOrderStatusesListQueryOptions({
        clientOptions,
        queryOptions: {
          staleTime: Infinity,
        },
      })
    ),
    client.prefetchQuery(
      useWarehousesListQueryOptions({
        clientOptions,
        queryOptions: {
          staleTime: Infinity,
        },
      })
    ),
    client.prefetchQuery(
      useCurrenciesListQueryOptions({
        clientOptions,
        queryOptions: {
          staleTime: Infinity,
        },
      })
    ),
  ]);

  const state = dehydrate(client);

  // console.log("SERVER:(home)", state);

  return (
    <HydrationBoundary state={state}>
      <HomePageContent />
    </HydrationBoundary>
  );
}
