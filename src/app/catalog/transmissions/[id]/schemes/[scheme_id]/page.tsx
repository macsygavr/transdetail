import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { cookies } from "next/headers";
import { APIClientOptions } from "@cms/sdk/common/api";
import Content from "./content";
import { useWhoAmIQueryOptions } from "@cms/sdk/auth/hooks/queries";
import { useManufacturersListQueryOptions } from "@cms/sdk/manufacturers/hooks/queries";
import { useProductListQueryOptions } from "@cms/sdk/products/hooks/queries";
import {
  useTransmissionQueryOptions,
  useTransmissionsListQueryOptions,
} from "@cms/sdk/transmissions/hooks/queries";
import { useCurrentCompanyQueryOptions } from "@cms/sdk/companies/hooks/queries";
import { useCurrentCartQueryOptions } from "@cms/sdk/carts/hooks/queries";
import { API_HOST } from "@/constants/api";
import { useUserFavoritesListQueryOptions } from "@cms/sdk/favorite-products/hooks/queries";
export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ id: string; scheme_id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const [routeParams, resolvedSearchParams, cookieStore] = await Promise.all([
    params,
    searchParams,
    cookies(),
  ]);
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

  const transmissionId = routeParams.id;
  const schemeId = routeParams.scheme_id;
  const backUrlParam = resolvedSearchParams.backUrl;
  const backUrl = Array.isArray(backUrlParam)
    ? (backUrlParam[0] ?? "#")
    : (backUrlParam ?? "#");

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
          useProductListQueryOptions({
            clientOptions,
            params: {
              filter: {
                $filter: { transmission_id: schemeId },
              },
              listParams: {
                limit: 1000,
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
    client.prefetchQuery(
      useTransmissionQueryOptions({
        clientOptions,
        params: {
          id: schemeId,
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
          parentId: transmissionId,
          include_inactive: false,
        },
        queryOptions: {
          staleTime: Infinity,
        },
      })
    ),
    client.prefetchQuery(useManufacturersListQueryOptions({ clientOptions })),
  ]);

  return (
    <HydrationBoundary state={dehydrate(client)}>
      <Content
        transmissionId={transmissionId}
        schemeId={schemeId}
        backUrl={backUrl}
      />
    </HydrationBoundary>
  );
}
