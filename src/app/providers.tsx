"use client";

import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { PropsWithChildren, useState } from "react";
import { APIClientOptionsContext } from "@cms/sdk/common/hooks/client";

export function SingletonQueryClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [client] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={client}>
      {children}
      <ReactQueryDevtools />
    </QueryClientProvider>
  );
}

export function SDKAPIClientConfigurationProvider({
  children,
}: PropsWithChildren) {
  return (
    <APIClientOptionsContext
      value={{
        middlewares: [(url, init, next) => next(url, init)],
      }}
    >
      {children}
    </APIClientOptionsContext>
  );
}
