"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { useMemo } from "react";
import { dehydrate, useQuery, useQueryClient } from "@tanstack/react-query";
import { useI18N } from "@/i18n/hooks/useLocale";
import { useCurrenciesListQueryOptions } from "@cms/sdk/currencies/hooks/queries";
import { Order, OrderStatus } from "@cms/sdk/orders/entities";
import {
  useOrdersListQueryOptions,
  useOrderStatusesListQueryOptions,
} from "@cms/sdk/orders/hooks/queries";
import { useWarehousesListQueryOptions } from "@cms/sdk/warehouses/hooks/queries";
import { useWhoAmIQueryOptions } from "@cms/sdk/auth/hooks/queries";
import { useCompany } from "@/domain/companies/hooks/use-current-company";
import { useLanguages } from "@/providers/LanguageContext";

const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString("en-US");

const formatPrice = (
  price?: number | null,
  currencyCode?: string | null,
  languages?: string[]
) => {
  if (!price || !currencyCode) {
    return new Intl.NumberFormat(languages, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price || 0);
  }

  try {
    return new Intl.NumberFormat(languages, {
      style: "currency",
      currency: currencyCode,
    }).format(price);
  } catch {
    return `${price} ${currencyCode ?? ""}`;
  }
};

function OrderItem({
  order,
  statusName,
  color,
  currencyCode,
}: {
  order: Order;
  statusName: string;
  color: string;
  currencyCode?: string;
}) {
  const languages = useLanguages();
  const formattedPrice = formatPrice(
    order.total_price || 0,
    currencyCode,
    languages
  );

  return (
    <li className="flex justify-between items-center 2md:grid 2md:grid-cols-[2fr_1fr] px-[12px] py-[8px] md:px-[24px] md:py-[12px] shadow-(--gray-deep-shadow) rounded-[8px]">
      <div className="flex flex-col gap-y-[8px] 3sm:flex-row 3sm:gap-x-[20px] md:justify-between">
        <div className="3sm:w-[180px]">
          <h4 className="text-[12px] md:text-[14px] text-(--color-text) font-medium">
            Заказ №{order.numeric_id}
          </h4>
          <p className="text-[10px] md:text-[12px] text-(--color-neutral-gray)">
            от {formatDate(order.created_at)}
          </p>
        </div>
        <div className="flex flex-col items-start md:flex-row md:items-center md:gap-x-[20px] 2md:gap-x-[40px]">
          {/* <div className="flex flex-col items-start md:flex-row md:items-center md:gap-x-[20px] 2md:gap-x-[40px]">
            <span className="text-[12px] md:text-[14px] text-(--color-neutral-gray)">
              <span className="md:block">Заберите</span> до 28.02.3570 22:00
            </span>
          </div> */}
          <span
            className="px-[10px] pt-[3px] pb-[5px] text-[12px] md:text-[14px] font-bold rounded-[4px]"
            style={{ color: "#FFFFFF", backgroundColor: color }}
          >
            {statusName}
          </span>
        </div>
      </div>
      <span className="text-[14px] md:text-[16px] md:text-right font-bold">
        {formattedPrice}
      </span>
    </li>
  );
}

function OrdersList({
  orders,
  statusId,
  warehousesMap,
  currenciesMap,
  statusesMap,
}: {
  orders: Order[];
  statusId: string;
  warehousesMap: Record<string, string>;
  currenciesMap: Record<string, string>;
  statusesMap: Record<string, OrderStatus>;
}) {
  const { t } = useI18N();
  const status = statusesMap[statusId];
  const statusName = status ? t(status.name) : `Status ${statusId}`;
  const color = status?.color;

  if (orders.length === 0) {
    return <div className="text-center py-8 text-gray-500">Нет заказов</div>;
  }

  return (
    <ul className="space-y-2">
      {orders.map((order) => {
        const warehouseId = order.items?.[0]?.warehouse_id;
        const currencyCode = warehouseId
          ? currenciesMap[warehousesMap[warehouseId]]
          : undefined;

        return (
          <OrderItem
            key={order.id}
            order={order}
            statusName={statusName}
            color={color}
            currencyCode={currencyCode}
          />
        );
      })}
    </ul>
  );
}

export function OrdersSection() {
  const { t } = useI18N();

  const { data: currentUser } = useQuery(useWhoAmIQueryOptions());
  const userId = currentUser?.id;

  const company = useCompany();

  const { data: ordersData } = useQuery(
    useOrdersListQueryOptions({
      params: {
        filter: {
          limit: 100,
          offset: 0,
          user_id: userId,
          company_id: company.companyId ?? undefined,
        },
      },
      queryOptions: {
        enabled: !!company.companyId,
        staleTime: Infinity,
      },
    })
  );

  const { data: statusesData } = useQuery(
    useOrderStatusesListQueryOptions({
      queryOptions: {
        staleTime: Infinity,
      },
    })
  );
  const { data: warehousesData } = useQuery(
    useWarehousesListQueryOptions({
      queryOptions: {
        staleTime: Infinity,
      },
    })
  );
  const { data: currenciesData } = useQuery(
    useCurrenciesListQueryOptions({
      queryOptions: {
        staleTime: Infinity,
      },
    })
  );

  // const client = useQueryClient();
  // const state = dehydrate(client);

  // console.log("CLIENT:Orders", state);

  const warehousesMap = useMemo(() => {
    const map: Record<string, string> = {};
    warehousesData?.items?.forEach((warehouse) => {
      map[warehouse.id] = warehouse.currency_id || "";
    });
    return map;
  }, [warehousesData]);

  const currenciesMap = useMemo(() => {
    const map: Record<string, string> = {};
    currenciesData?.items?.forEach((currency) => {
      map[currency.id] = currency.code;
    });
    return map;
  }, [currenciesData]);

  const statusesMap = useMemo(() => {
    const map: Record<string, OrderStatus> = {};
    statusesData?.items?.forEach((status) => {
      if (status.id) {
        map[status.id] = status;
      }
    });
    return map;
  }, [statusesData]);

  const ordersById = useMemo(() => {
    const map: Record<string, Order> = {};
    ordersData?.items?.forEach((order) => {
      if (order.id) {
        map[order.id] = order;
      }
    });
    return map;
  }, [ordersData]);

  const displayStatuses = useMemo(() => {
    return statusesData?.items || [];
  }, [statusesData]);

  const ordersByStatus = useMemo(() => {
    const groups: Record<string, Order[]> = {};
    displayStatuses.forEach((status) => {
      groups[status.id] = [];
    });
    Object.values(ordersById).forEach((order) => {
      if (order.status_id && groups[order.status_id]) {
        groups[order.status_id].push(order);
      }
    });
    return groups;
  }, [ordersById, displayStatuses]);

  const hasOrders = ordersData?.items && ordersData.items.length > 0;
  const hasStatuses = displayStatuses.length > 0;

  if (!hasOrders || !hasStatuses) {
    return null;
  }

  const defaultTab = displayStatuses[0]?.id || "";

  return (
    <Tabs defaultValue={defaultTab} className="w-full">
      <TabsList>
        {displayStatuses.map((status) => (
          <TabsTrigger
            key={status.id}
            value={status.id}
            className="px-6 flex gap-2"
          >
            {t(status.name)}
            {ordersByStatus[status.id]?.length ? (
              <span className="bg-main-red text-white size-7 rounded-full flex justify-center items-center text-lg">{`${ordersByStatus[status.id]?.length ?? 0}`}</span>
            ) : null}
          </TabsTrigger>
        ))}
      </TabsList>

      {displayStatuses.map((status) => {
        const orders = ordersByStatus[status.id] || [];

        return (
          <TabsContent key={status.id} value={status.id}>
            <OrdersList
              orders={orders}
              statusId={status.id}
              warehousesMap={warehousesMap}
              currenciesMap={currenciesMap}
              statusesMap={statusesMap}
            />
          </TabsContent>
        );
      })}
    </Tabs>
  );
}
