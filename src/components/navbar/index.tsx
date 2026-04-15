import { Suspense } from "react";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { cookies } from "next/headers";

import { APIClientOptions } from "@cms/sdk/common/api";
import { useWhoAmIQueryOptions } from "@cms/sdk/auth/hooks/queries";
import { useCategoriesListQueryOptions } from "@cms/sdk/categories/hooks/queries";
import { useCurrentCompanyQueryOptions } from "@cms/sdk/companies/hooks/queries";
import {
  useCartsListQueryOptions,
  useCurrentCartQueryOptions,
} from "@cms/sdk/carts/hooks/queries";
import { useTransmissionsListQueryOptions } from "@cms/sdk/transmissions/hooks/queries";
import { useMenusListQueryOptions } from "@cms/sdk/menus/hooks/queries";

import { createServerCMSClientOptions } from "@/lib/cms-client-options";

import HeaderPanelBottom from "./HeaderPanelBottom";
import HeaderPanelMiddle from "./HeaderPanelMiddle";
import HeaderPanelTop from "./HeaderPanelTop";
import { useListPropertiesQueryOptions } from "@cms/sdk/property/hooks/queries";
import { useConfigurationSettingsQueryOptions } from "@cms/sdk/configuration/hooks/queries";

export default async function Navbar() {
  const cookieStore = await cookies();
  const requestCookies = cookieStore.toString();

  const client = new QueryClient();
  const clientOptions: APIClientOptions =
    createServerCMSClientOptions(requestCookies);

  const whoAmIQueryOptions = useWhoAmIQueryOptions({
    clientOptions,
    queryOptions: {
      staleTime: Infinity,
    },
  });

  const currentCompanyQueryOptions = useCurrentCompanyQueryOptions({
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
      return Promise.all([
        ...(whoAmI
          ? [
              client.prefetchQuery(
                useCartsListQueryOptions({
                  clientOptions,
                  queryOptions: {
                    staleTime: Infinity,
                  },
                })
              ),
            ]
          : []),
        ...(whoAmI && currentCompany?.id
          ? [
              client.prefetchQuery(
                useCurrentCartQueryOptions({
                  clientOptions,
                  params: {
                    company_id: currentCompany.id,
                    expand: ["product"],
                  },
                  queryOptions: {
                    staleTime: Infinity,
                  },
                })
              ),
            ]
          : []),
      ]);
    }),
    client.prefetchQuery(
      useTransmissionsListQueryOptions({
        clientOptions,
        params: {
          include_inactive: false,
          parentId: "-",
        },
        queryOptions: {
          staleTime: Infinity,
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
        queryOptions: {
          staleTime: Infinity,
        },
      })
    ),
    client.prefetchQuery(
      useListPropertiesQueryOptions({
        clientOptions,
        queryOptions: {
          staleTime: Infinity,
        },
      })
    ),
    client.prefetchQuery(
      useConfigurationSettingsQueryOptions({
        clientOptions,
        queryOptions: {
          staleTime: Infinity,
        },
      })
    ),
    client.prefetchQuery(
      useMenusListQueryOptions({
        clientOptions,
        params: {
          include_inactive: false,
        },
        queryOptions: {
          staleTime: Infinity,
        },
      })
    ),
  ]);

  return (
    <HydrationBoundary state={dehydrate(client)}>
      <header className="text-[12px] md:text-[14px] shadow-(--gray-deep-shadow)">
        <HeaderPanelTop />
        <HeaderPanelMiddle />
        <HeaderPanelBottom />
      </header>
    </HydrationBoundary>
  );
}
