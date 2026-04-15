"use client";

import { useCallback, useMemo } from "react";

import { useSetCurrentCompanyMutation } from "@cms/sdk/companies/hooks/mutations";
import { useCurrentCompanyQueryOptions } from "@cms/sdk/companies/hooks/queries";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useWhoAmIQueryOptions } from "@cms/sdk/auth/hooks/queries";

export type CurrentCompanyContextValue = {
  companyId: string | null;
  setCompanyId: (companyId: string | null) => Promise<void>;
  isPending: boolean;
};

export function useCompany() {
  const queryClient = useQueryClient();

  const whoAmIQuery = useQuery(useWhoAmIQueryOptions());

  const companyQuery = useQuery(
    useCurrentCompanyQueryOptions({
      queryOptions: {
        retry: false,
        enabled: !!whoAmIQuery.data,
        staleTime: Infinity,
      },
    })
  );

  const companyId = companyQuery.data?.id ?? null;

  const setCurrentCompanyMutation = useSetCurrentCompanyMutation({
    mutationOptions: {
      onSuccess: (company) => {
        queryClient.setQueryData(["companies", "current"], company);
        void queryClient.invalidateQueries({ queryKey: ["carts"] });
        void queryClient.invalidateQueries({ queryKey: ["orders"] });
      },
    },
  });

  const setCompanyId = useCallback(
    async (nextCompanyId: string | null) => {
      if (!nextCompanyId || nextCompanyId === companyId) {
        return;
      }

      await setCurrentCompanyMutation.mutateAsync({
        company_id: nextCompanyId,
      });
    },
    [companyId, setCurrentCompanyMutation]
  );

  const value = useMemo<CurrentCompanyContextValue>(
    () => ({
      companyId,
      setCompanyId,
      isPending: setCurrentCompanyMutation.isPending,
    }),
    [companyId, setCompanyId, setCurrentCompanyMutation.isPending]
  );

  return {
    ctx: value,
    companyId,
    companyQuery,
    setCompanyId,
    isPending: setCurrentCompanyMutation.isPending,
  };
}
