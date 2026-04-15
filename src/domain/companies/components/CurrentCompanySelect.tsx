"use client";

import { Check, Plus } from "lucide-react";
import Link from "next/link";

import { cn } from "@/lib/utils";

import { useCompany } from "../hooks/use-current-company";
import { useCompaniesListQueryOptions } from "@cms/sdk/companies/hooks/queries";
import { useQuery } from "@tanstack/react-query";

export interface CurrentCompanySelectProps {
  onSelected?: () => void;
  className?: string;
}

export function CurrentCompanySelect({
  onSelected,
  className,
}: CurrentCompanySelectProps) {
  const currentCompany = useCompany();

  const { data: companiesList, isLoading: isCompaniesLoading } = useQuery(
    useCompaniesListQueryOptions({
      queryOptions: {
        staleTime: Infinity,
      },
    })
  );

  const items = companiesList?.items ?? [];

  async function handleSelectCompany(companyId: string) {
    if (currentCompany.companyId === companyId) return;

    await currentCompany.setCompanyId(companyId);
    onSelected?.();
  }

  return (
    <div className={cn("flex flex-col gap-y-[10px]", className)}>
      <p className="font-medium">Мои компании</p>

      {isCompaniesLoading ? (
        <p className="text-neutral-gray text-[12px]">Загрузка...</p>
      ) : items.length ? (
        <div className="flex flex-col gap-y-[10px]">
          {items.map((item) => {
            const isCurrent = item.id === currentCompany.companyId;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  void handleSelectCompany(item.id);
                }}
                disabled={currentCompany.isPending || isCurrent}
                className={cn(
                  "flex items-center justify-between gap-x-[12px] text-left cursor-pointer hover:text-main-red active:opacity-60",
                  {
                    "text-main-red font-bold": isCurrent,
                  }
                )}
              >
                <span className="truncate">{item.name}</span>
                {isCurrent ? (
                  <Check className="shrink-0 w-[16px] h-[16px] text-main-red" />
                ) : null}
              </button>
            );
          })}
        </div>
      ) : (
        <p className="text-neutral-gray text-[12px]">Нет компаний</p>
      )}

      <Link
        href="/account/companies"
        className="flex items-center text-accent-blue"
        onClick={onSelected}
      >
        <Plus strokeWidth={3} className="w-[12px] h-[12px]" />
        <span>Добавить компанию</span>
      </Link>
    </div>
  );
}
