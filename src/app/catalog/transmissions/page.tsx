import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { cookies } from "next/headers";
import TransmissionsContent from "./content";
import { useTransmissionsListQueryOptions } from "@cms/sdk/transmissions/hooks/queries";
import { APIClientOptions } from "@cms/sdk/common/api";
import { API_HOST } from "@/constants/api";
export default async function TransmissionsPage() {
  const cookieStore = await cookies();
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

  await client.prefetchQuery(
    useTransmissionsListQueryOptions({
      clientOptions: clientOptions,
      params: {
        parentId: "-",
        include_inactive: false,
      },
    })
  );

  return (
    <HydrationBoundary state={dehydrate(client)}>
      <TransmissionsContent />
    </HydrationBoundary>
  );
}
