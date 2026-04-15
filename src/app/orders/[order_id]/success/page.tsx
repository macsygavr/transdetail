"use client";

import ContentContainer from "@/components/ContentContainer/ContentContainer";
import PageTitle from "@/components/PageTitle/PageTitle";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import OrderProductCard from "@/domain/products/components/OrderProductCard";
import { useParams } from "next/navigation";
import { useOrderQueryOptions } from "@cms/sdk/orders/hooks/queries";
import { useManufacturersListQueryOptions } from "@cms/sdk/manufacturers/hooks/queries";
import { useEntityMap } from "@/utils";
import { useOrderPdfMutation } from "@cms/sdk/orders/hooks/mutations";
import { Download, Printer } from "lucide-react";
import { formatMoney } from "@/domain/products/hooks/use-product-price";
import { useQuery } from "@tanstack/react-query";

export default function Page() {
  const params = useParams();
  const orderId = params.order_id as string;

  const {
    data: order,
    isLoading,
    isError,
  } = useQuery(
    useOrderQueryOptions({
      params: {
        id: orderId,
        fetchParams: {
          expand: ["product"],
        },
      },
    })
  );

  const { mutateAsync: downloadPdf, isPending: isDownloading } =
    useOrderPdfMutation();
  const manufacturersQuery = useQuery(useManufacturersListQueryOptions());
  const manufacturersMap = useEntityMap(manufacturersQuery.data?.items);

  const handlePdfAction = async (action: "download" | "print") => {
    const pdfBlob = await downloadPdf(orderId);
    const url = window.URL.createObjectURL(pdfBlob);

    if (action === "download") {
      const a = document.createElement("a");
      a.href = url;
      a.download = `order-${order?.numeric_id || orderId}.pdf`;
      a.click();
    } else {
      window.open(url);
    }
  };

  if (isLoading)
    return (
      <ContentContainer>
        <div className="flex justify-center p-10">
          <p className="text-neutral-gray text-sm">Загрузка заказа...</p>
        </div>
      </ContentContainer>
    );

  if (isError || !order)
    return (
      <ContentContainer>
        <div className="flex flex-col items-center justify-center p-10 gap-4">
          <PageTitle className="text-center text-main-red">
            Заказ не найден
          </PageTitle>
          <Button asChild>
            <Link href="/catalog/products">Перейти в каталог</Link>
          </Button>
        </div>
      </ContentContainer>
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
    <ContentContainer>
      <PageTitle className="text-center">Заказ успешно создан!</PageTitle>
      <p className="mx-auto mb-5 md:mb-7.5 max-w-71 md:max-w-max text-center text-xs md:text-sm">
        Мы отправили вам письмо со всей информацией о заказе на email
      </p>

      <div className="flex flex-col gap-5 md:gap-6">
        <div className="overflow-hidden border border-neutral-gray-deep rounded-xl">
          <div className="p-3 md:px-5 bg-neutral-gray-light">
            <div className="flex items-center justify-between gap-6 text-text ">
              <Link href={`/account/orders/${order.id}`}>
                <h2 className="grow font-bold text-sm md:text-base leading-[100%] md:leading-[22px]">
                  {orderTitle}
                </h2>
              </Link>

              <p className="flex flex-wrap justify-end items-baseline gap-[6px]">
                <span className="font-medium text-sm leading-[20px] md:text-xl md:leading-[23px]">
                  {formatMoney(order.total_price, "RUB", ["ru-RU"])}
                </span>
              </p>
            </div>
          </div>

          <ul className="border-b border-neutral-gray-deep">
            {order.items.map((item) => (
              <OrderProductCard
                key={item.id}
                item={item}
                manufacturersMap={manufacturersMap}
              />
            ))}
          </ul>

          <div className="flex items-center justify-center p-3 md:pt-4 md:pb-6">
            <Button variant="tertiary" asChild>
              <Link href={`/account/orders/${order.id}`}>
                Детальная информация о заказе
              </Link>
            </Button>
          </div>
        </div>

        <div className="flex justify-end p-3 md:p-4 bg-base-gray rounded-xl">
          {/* <div className="text-xs md:text-sm">
            <p>
              <span className="font-medium">Товар зарезервирован</span> до 21:00
              13 марта
            </p>
            <p>
              <span className="font-medium">Будет готов к отгрузке</span> 10
              марта
            </p>
          </div> */}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                className="text-center"
                variant="outline"
                disabled={isDownloading}
              >
                Распечатать бланк заказа
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => handlePdfAction("download")}
                disabled={isDownloading}
              >
                <Download className="mr-2 h-4 w-4" />
                Скачать PDF
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handlePdfAction("print")}
                disabled={isDownloading}
              >
                <Printer className="mr-2 h-4 w-4" />
                Открыть для печати
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <Button asChild className="mx-auto">
          <Link href="/catalog/products">Продолжить покупки</Link>
        </Button>
      </div>
    </ContentContainer>
  );
}
