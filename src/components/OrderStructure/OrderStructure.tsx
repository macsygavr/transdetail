"use client";

import { useOrderQueryOptions } from "@cms/sdk/orders/hooks/queries";
import { useManufacturersListQueryOptions } from "@cms/sdk/manufacturers/hooks/queries";
import { useEntityMap } from "@/utils";
import OrderProductCard from "@/domain/products/components/OrderProductCard";
import { useQuery } from "@tanstack/react-query";

interface OrderStructureProps {
  orderId: string;
}

export default function OrderStructure({ orderId }: OrderStructureProps) {
  const { data: order, isLoading } = useQuery(
    useOrderQueryOptions({
      params: {
        id: orderId,
        fetchParams: {
          expand: ["product"],
        },
      },
    })
  );

  const manufacturersQuery = useQuery(useManufacturersListQueryOptions());
  const manufacturersMap = useEntityMap(manufacturersQuery.data?.items);

  if (isLoading) {
    return (
      <div className="overflow-hidden border border-neutral-gray-deep rounded-[12px]">
        <p className="p-[12px] md:px-[20px] text-text font-medium text-[14px] leading-[100%] md:text-[16px] md:leading-[22px] bg-neutral-gray-light">
          Состав заказа
        </p>
        <div className="flex justify-center p-6">
          <p className="text-neutral-gray text-sm">Загрузка товаров...</p>
        </div>
      </div>
    );
  }

  const itemCount = order?.items?.length || 0;

  return (
    <div className="overflow-hidden border border-neutral-gray-deep rounded-[12px]">
      <p className="p-[12px] md:px-[20px] text-text font-medium text-[14px] leading-[100%] md:text-[16px] md:leading-[22px] bg-neutral-gray-light">
        Состав заказа ({itemCount} {getItemWord(itemCount)})
      </p>
      <ul>
        {order?.items?.map((item) => (
          <OrderProductCard
            key={item.id}
            item={item}
            manufacturersMap={manufacturersMap}
          />
        ))}
      </ul>
    </div>
  );
}

function getItemWord(count: number): string {
  if (count % 10 === 1 && count % 100 !== 11) return "товар";
  if (
    count % 10 >= 2 &&
    count % 10 <= 4 &&
    (count % 100 < 10 || count % 100 >= 20)
  )
    return "товара";
  return "товаров";
}
