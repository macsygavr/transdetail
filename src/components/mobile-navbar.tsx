import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { cookies } from "next/headers";

import { useWhoAmIQueryOptions } from "@cms/sdk/auth/hooks/queries";
import { APIClientOptions } from "@cms/sdk/common/api";

import { createServerCMSClientOptions } from "@/lib/cms-client-options";

import MobileNavbarClient from "./mobile-navbar-client";

export default async function MobileNavbar() {
  const cookieStore = await cookies();
  const requestCookies = cookieStore.toString();

  const client = new QueryClient();
  const clientOptions: APIClientOptions =
    createServerCMSClientOptions(requestCookies);

  await client.prefetchQuery(
    useWhoAmIQueryOptions({
      clientOptions,
    })
  );

  return (
    <HydrationBoundary state={dehydrate(client)}>
      <MobileNavbarClient />
    </HydrationBoundary>
  );
}
