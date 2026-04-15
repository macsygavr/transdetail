"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Separator from "@/components/Separator/Separator";
import OrderStateWithPrice from "@/components/OrderStateWithPrice/OrderStateWithPrice";
import OrderActions from "@/components/OrderActions/OrderActions";
import DataItem from "@/components/DataItem/DataItem";
import DataHeader from "@/components/DataHeader/DataHeader";
import {
  useOrderQueryOptions,
  useOrderStatusesListQueryOptions,
} from "@cms/sdk/orders/hooks/queries";
import {
  useIdentitiesListQueryOptions,
  useUserQueryOptions,
} from "@cms/sdk/auth/hooks/queries";
import OrderStructure from "@/components/OrderStructure/OrderStructure";
import type { OrderStatus } from "@cms/sdk/orders/entities";

function formatFullName(p: {
  last_name?: string | null;
  first_name?: string | null;
  middle_name?: string | null;
}) {
  return [p.last_name, p.first_name, p.middle_name].filter(Boolean).join(" ");
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

function ColoredStatusText({
  statusName,
  colorHex,
}: {
  statusName: string;
  colorHex?: string | null;
}) {
  const textColor = colorHex || "#1f2937";

  return (
    <span
      className="text-[12px] md:text-[14px] font-medium"
      style={{ color: textColor }}
    >
      {statusName}
    </span>
  );
}

export default function Page() {
  const params = useParams();
  const orderId = params.order as string;

  const orderQuery = useQuery(
    useOrderQueryOptions({
      params: {
        id: orderId,
        fetchParams: {
          expand: ["contact_person"],
        },
      },
    })
  );

  const { data: statuses } = useQuery(useOrderStatusesListQueryOptions());

  const order = orderQuery.data;
  const contactPerson = order?.contact_person;
  const userId = order?.user_id;

  const userQuery = useQuery(
    useUserQueryOptions({
      params: {
        id: userId ?? "",
      },
      queryOptions: {
        enabled: !!userId,
      },
    })
  );
  const userIdentitiesQuery = useQuery(
    useIdentitiesListQueryOptions({
      params: {
        userId: userId ?? "",
      },
      queryOptions: {
        enabled: !!userId,
      },
    })
  );

  const identities = userIdentitiesQuery.data?.items || [];
  const userPhone = identities.find((i) => i.provider === "phone")?.identifier;

  const fullName = contactPerson
    ? formatFullName(contactPerson)
    : userQuery.data
      ? formatFullName(userQuery.data)
      : "";

  const phone = contactPerson?.phone || userPhone || "";

  const { name: statusName, color: statusColor } = getStatusInfo(
    order?.status_id,
    statuses
  );

  return (
    <div>
      <div className="flex flex-col gap-y-[16px] mb-[20px] md:mb-[30px] p-[16px] md:p-[24px] bg-base-gray rounded-[12px]">
        <div className="grid gap-y-[16px] 3sm:grid-cols-[250px_250px] gap-x-[20px] md:gap-x-[60px]">
          <div className="grid items-start gap-y-[4px] md:gap-y-[12px]">
            <DataHeader text="Получатель" />
            <DataItem label="ФИО" text={fullName} />
          </div>

          <div className="grid items-start gap-y-[4px] md:gap-y-[12px]">
            <DataHeader text="Контактные данные" />
            <div>
              <DataItem label="Телефон" text={phone} />
            </div>
          </div>
        </div>

        <Separator />
        <div className="flex flex-col 3sm:flex-row 3sm:flex-wrap 3sm:items-center 3sm:gap-x-[24px] gap-y-[8px]">
          {/* <div className="grid gap-y-[4px] md:gap-y-[12px] 3sm:w-full mb-[16px]">
            <DataHeader text="Доставка" />
            <DataItem
              label="Тип доставки"
              text="Доставка в пункт выдачи — СДЭК"
            />
          </div>

          <p className="text-[12px] leading-[18px] md:text-[12px] md:leading-[20px]">
            MSK135 ул. Михневская, 8
          </p>

          <p className="flex items-center gap-[6px] text-[12px] leading-[18px] md:text-[12px] md:leading-[20px]">
            <span className="aspect-square w-[6px] rounded-full bg-green"></span>
            <span>Царицыно</span>
          </p>

          <div className="text-[12px] leading-[18px] md:text-[12px] md:leading-[20px]">
            <p>Пн-Пт 10:00-20:00</p>
            <p>Сб-Вс 10:00-18:00</p>
          </div>

          <p className="text-[12px] leading-[18px] md:text-[12px] md:leading-[20px] text-main-red">
            Откроется через 1 ч. 35 мин.
          </p> */}

          <div>
            <DataItem
              label="Статус заказа"
              text={
                <ColoredStatusText
                  statusName={statusName}
                  colorHex={statusColor}
                />
              }
            />
          </div>
        </div>
        <Separator />

        <div className="flex justify-between flex-wrap gap-4">
          <div>
            <span className="font-medium text-[12px] leading-[18px] md:text-[14px] md:leading-[20px]">
              Итого
            </span>
            <OrderStateWithPrice price={order?.total_price} />
          </div>

          <OrderActions orderId={orderId} orderNumericId={orderId} />
        </div>
      </div>
      <OrderStructure orderId={orderId} />
    </div>
  );
}
