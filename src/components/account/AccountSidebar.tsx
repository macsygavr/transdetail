"use client";

import { useRouter } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import { useCompany } from "@/domain/companies/hooks/use-current-company";
import cn from "clsx";
import type { LucideIcon } from "lucide-react";
import {
  Archive,
  Building,
  Heart,
  LogOut,
  ShoppingCart,
  User,
} from "lucide-react";
import Link from "next/link";
import { useI18N } from "@/i18n/hooks/useLocale";
import { useWhoAmIQueryOptions } from "@cms/sdk/auth/hooks/queries";
import { useLogoutMutation } from "@cms/sdk/auth/hooks/mutations";
import { useCartsListQueryOptions } from "@cms/sdk/carts/hooks/queries";
import { useCompaniesListQueryOptions } from "@cms/sdk/companies/hooks/queries";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  useOrderStatusesListQueryOptions,
  useOrdersListQueryOptions,
} from "@cms/sdk/orders/hooks/queries";

type SidebarMenuItem = {
  icon: LucideIcon;
  label: string;
  link: string;
  count?: number;
};

export function AccountSidebar({
  onMenuItemClick,
}: {
  onMenuItemClick?: () => void;
}) {
  const router = useRouter();
  const whoAmI = useQuery(useWhoAmIQueryOptions());
  const logoutMutation = useLogoutMutation();
  const queryClient = useQueryClient();
  const { t } = useI18N();
  const currentCompany = useCompany();
  const company = currentCompany.companyQuery.data;

  const isLoading =
    Boolean(currentCompany.companyId) && currentCompany.companyQuery.isLoading;
  const orgName = isLoading
    ? "Загрузка..."
    : company?.name
      ? company.name
      : "Не выбрана";
  const orgId = isLoading
    ? "Загрузка..."
    : (company?.numeric_id ?? "Не выбрана");

  const companiesQuery = useQuery(
    useCompaniesListQueryOptions({
      queryOptions: {
        enabled: Boolean(whoAmI.isSuccess && whoAmI.data),
      },
    })
  );
  // const cartsQuery = useCartsListQuery({
  //   enabled: Boolean(whoAmI.isSuccess && whoAmI.data),
  // });

  const cartsQuery = useQuery(useCartsListQueryOptions());

  const orderStatusesQuery = useQuery(useOrderStatusesListQueryOptions());
  const ordersQuery = useQuery(
    useOrdersListQueryOptions({
      params: {
        filter: {
          company_id: currentCompany.companyId ?? undefined,
          limit: 25,
        },
      },
    })
  );

  async function handleLogout() {
    if (logoutMutation.isPending) return;

    try {
      await logoutMutation.mutateAsync();
      queryClient.clear();
      router.push("/auth/login");
    } catch {
      // silent fail (requested)
    }
  }

  const SIDEBAR_DATA_NAVIGATION: SidebarMenuItem[] = [
    {
      icon: User,
      label: "Личная информация",
      link: `/account`,
    },
    {
      icon: Building,
      label: "Мои компании",
      link: `/account/companies`,
      count: companiesQuery.data?.items.length,
    },
    {
      icon: ShoppingCart,
      label: "Корзины",
      link: "/carts",
      count: cartsQuery.data?.items.filter(
        (cart) => cart.company_id === currentCompany.companyId
      ).length,
    },
    {
      icon: Heart,
      label: "Избранное",
      link: `/account/favorites`,
    },
    {
      icon: Archive,
      label: "Заказы",
      link: `/account/orders`,
      count: ordersQuery.data?.count,
    },
    // {
    //   icon: Bell,
    //   label: "Уведомления",
    //   link: `/account/notifications`,
    //   isBorderBottom: true,
    //   count: 3,
    // },
    // {
    //   icon: Settings,
    //   label: "Настройки",
    //   link: `/account/settings`,
    //   isBorderBottom: true,
    // },
  ];

  return (
    <aside className="w-full overflow-y-auto 1lg:w-[270px] 3xl:w-[300px] mr-[30px] text-[14px] leading-[20px] shadow-(--gray-deep-shadow) rounded-[12px]">
      <div className="flex flex-col gap-y-[10px] p-[24px] pb-0">
        <div>
          <p>
            <span className="font-medium">{orgName}</span>
          </p>
          <p className="relative flex">
            <span className="font-mono font-thin text-[.625rem] text-gray-500 text-nowrap uppercase truncate w-full">
              ID: {orgId}
            </span>
          </p>
        </div>
        <Separator />
        <div>
          <p>
            <span className="font-medium">Заказы:</span>
          </p>

          {orderStatusesQuery.data?.items.map((status) => (
            <p key={status.id}>
              {t(status.name)}:{" "}
              <span className="text-main-red font-medium">
                {
                  ordersQuery.data?.items.filter(
                    (order) => order.status_id == status.id
                  ).length
                }
              </span>
            </p>
          ))}
        </div>
      </div>
      <div className="p-[24px] pt-[20px] space-y-[24px] bg-white">
        <nav>
          <ul>
            {SIDEBAR_DATA_NAVIGATION.map((menuItem) => (
              <li
                key={`${menuItem.label}:${menuItem.link}`}
                className={cn(
                  "not-last:mb-[16px] not-last:border-b not-last:border-neutral-gray-deep"
                )}
              >
                <Link
                  className="flex items-center gap-[8px] pb-[10px]"
                  href={menuItem.link}
                  onClick={onMenuItemClick}
                >
                  <menuItem.icon className={`text-accent-blue`} size={22} />
                  <span>{menuItem.label}</span>
                  <span className="grow text-main-red font-medium flex justify-end">
                    {menuItem.count ? menuItem.count : ""}
                  </span>
                </Link>
              </li>
            ))}
            {/* <li
              className="not-last:mb-4 not-last:border-b not-last:border-neutral-gray-deep"
            >
              <button
                type="button"
                className="flex items-center gap-2 pb-2.5 hover:cursor-pointer"
                onClick={async () => {
                  // Need to implement
                }}
              >
                <Smartphone className='text-main-red' size={22} />
                <span>Выйти на всех устройствах</span>
              </button>
            </li> */}
            <li className="not-last:mb-4 not-last:border-b not-last:border-neutral-gray-deep">
              <button
                type="button"
                className="flex items-center gap-2 pb-2.5 hover:cursor-pointer"
                onClick={async () => {
                  await handleLogout();
                  onMenuItemClick?.();
                }}
              >
                <LogOut className="text-main-red" size={22} />
                <span>Выйти из аккаунта</span>
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </aside>
  );
}
