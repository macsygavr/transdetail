"use client";
import OrderActions from "@/components/OrderActions/OrderActions";
import OrderStateWithPrice from "@/components/OrderStateWithPrice/OrderStateWithPrice";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import type { PropsWithChildren } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import PageTitle from "@/components/PageTitle/PageTitle";
import ContentContainer from "@/components/ContentContainer/ContentContainer";
import OrderProductCard from "@/domain/products/components/OrderProductCard";
import {
  useOrdersListQueryOptions,
  useOrderStatusesListQueryOptions,
} from "@cms/sdk/orders/hooks/queries";
import { useManufacturersListQueryOptions } from "@cms/sdk/manufacturers/hooks/queries";
import type { Manufacturer } from "@cms/sdk/manufacturers/entities";
import { useMemo } from "react";
import { Order } from "@cms/sdk/orders/entities";
import type { OrderStatus } from "@cms/sdk/orders/entities";
import { OrderStatusBadge } from "@/components/OrderStatusBadge/OrderStatusBadge";

interface OrderBlockProps {
  order: Order;
  manufacturersMap: Record<string, Manufacturer>;
  statuses: { items: OrderStatus[] } | undefined;
}

function getStatusInfo(
  statusId: string | null | undefined,
  statuses: { items: OrderStatus[] } | undefined
) {
  if (!statusId || !statuses?.items) {
    return { name: "Неизвестный статус", color: null };
  }
  const status = statuses.items.find((s) => s.id === statusId);
  return {
    name: status?.name?.ru || status?.name?.en || "Неизвестный статус",
    color: status?.color || null,
  };
}

function OrderBlock({ order, manufacturersMap, statuses }: OrderBlockProps) {
  if (!order) return null;
  const { name: statusName, color: statusColor } = getStatusInfo(
    order.status_id,
    statuses
  );

  const dateStr = new Date(order.created_at).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
  });

  const orderTitle =
    typeof order.numeric_id === "number"
      ? `Заказ №${order.numeric_id} от ${dateStr}`
      : `Заказ от ${dateStr}`;

  return (
    <div className="overflow-hidden border border-neutral-gray-deep rounded-[12px]">
      <div className="p-[12px] md:px-[20px] bg-neutral-gray-light">
        <div className="flex items-center justify-between gap-[24px] mb-[8px] pb-[8px] md:mb-[12px] md:pb-[12px] text-text border-b border-neutral-gray-deep">
          <Link href={`/account/orders/${order.id}`}>
            <h2 className="grow font-bold text-[14px] md:text-[16px] leading-[100%] md:leading-[22px]">
              {orderTitle}
            </h2>
          </Link>
          <OrderStateWithPrice price={order.total_price} />
        </div>
        <div className="flex flex-wrap justify-between gap-[16px]">
          <div className="flex items-center gap-[12px]">
            <p className="flex flex-col">
              <span className="text-[12px] leading-[18px] md:text-[14px] md:leading-[20px] text-text font-medium">
                Статус заказа
              </span>
            </p>

            <OrderStatusBadge statusName={statusName} colorHex={statusColor} />
          </div>

          <OrderActions orderId={order.id} />
        </div>
      </div>

      <ul className="border-b border-neutral-gray-deep">
        {order.items?.map((item) => (
          <OrderProductCard
            key={item.id}
            item={item}
            manufacturersMap={manufacturersMap}
          />
        ))}
      </ul>

      <div className="flex items-center justify-center p-[12px] md:pt-[16px] md:pb-[24px] border-t border-neutral-gray-deep">
        <Button variant="tertiary" asChild>
          <Link href={`/account/orders/${order.id}`}>
            Детальная информация о заказе
          </Link>
        </Button>
      </div>
    </div>
  );
}

function OrderBlocksList({ children }: PropsWithChildren) {
  return <div className="grid gap-y-[30px] md:gap-y-[40px]">{children}</div>;
}

export default function Page() {
  const { data: orders, isLoading } = useQuery(
    useOrdersListQueryOptions({
      params: {
        filter: {
          expand: ["product"],
        },
      },
    })
  );

  const { data: statuses } = useQuery(useOrderStatusesListQueryOptions());

  const manufacturersQuery = useQuery(useManufacturersListQueryOptions());

  const manufacturersMap = useMemo(() => {
    const items = manufacturersQuery.data?.items || [];
    return items.reduce(
      (acc, manufacturer) => {
        acc[manufacturer.id] = manufacturer;
        return acc;
      },
      {} as Record<string, Manufacturer>
    );
  }, [manufacturersQuery.data?.items]);

  if (isLoading)
    return (
      <ContentContainer>
        <div className="flex justify-center p-10">
          <p className="text-neutral-gray text-sm">Загрузка заказов...</p>
        </div>
      </ContentContainer>
    );

  return (
    <ContentContainer>
      <Breadcrumb className="mb-4 md:mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/" className="text-[#ef4323] hover:text-[#ef4323]">
                Главная
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link
                href="/account"
                className="text-[#ef4323] hover:text-[#ef4323]"
              >
                Личный кабинет
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="text-neutral-gray">
              Заказы
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <PageTitle>Заказы</PageTitle>

      {!orders?.items?.length ? (
        <div className="flex flex-col items-center justify-center p-10 gap-4">
          <p className="text-neutral-gray text-sm">У вас пока нет заказов</p>
          <Button asChild>
            <Link href="/catalog/products">Перейти в каталог</Link>
          </Button>
        </div>
      ) : (
        <OrderBlocksList>
          {orders.items.map((order) => (
            <OrderBlock
              key={order.id}
              order={order}
              manufacturersMap={manufacturersMap}
              statuses={statuses}
            />
          ))}
        </OrderBlocksList>
      )}
    </ContentContainer>
  );
}
