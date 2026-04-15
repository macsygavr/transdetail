import type { APIClientOptions } from "@cms/sdk/common/api";

import { API_HOST } from "@/constants/api";

export function createServerCMSClientOptions(
  requestCookies: string
): APIClientOptions {
  return {
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
}
