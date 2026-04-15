"use client";
import Link from "next/link";
import Image from "next/image";
import NoImage from "@/components/elements/NoImage";
import { OrderItem } from "@cms/sdk/orders/entities";
import { useI18N } from "@/i18n/hooks/useLocale";

import { Product } from "@cms/sdk/products/entities";
import { Currency } from "@cms/sdk/currencies/entities";
import { Warehouse } from "@cms/sdk/warehouses/entities";
import { useState } from "react";

type OrderProductCardProps = {
  item: OrderItem;
  manufacturersMap?: Record<string, { name: Record<string, string> }>;
  warehousesMap?: Record<string, Warehouse>;
  currenciesMap?: Record<string, Currency>;
};

const formatPrice = (currencyCode?: string | null, price?: number | null) => {
  if (!price || !currencyCode) return null;
  try {
    return new Intl.NumberFormat(navigator.language, {
      style: "currency",
      currency: currencyCode,
    }).format(price);
  } catch {
    return `${price} ${currencyCode ?? ""}`;
  }
};

const getCurrencyCode = (
  product: Product | undefined,
  warehousesMap: Record<string, Warehouse> = {},
  currenciesMap: Record<string, Currency> = {}
): string | null => {
  if (!product?.prices?.[0]?.warehouse_id) {
    return null;
  }

  const warehouseId = product.prices[0].warehouse_id;
  const warehouse = warehousesMap[warehouseId];

  if (!warehouse?.currency_id) return null;

  const currencyId = warehouse.currency_id;

  if (currenciesMap && currenciesMap[currencyId]) {
    return currenciesMap[currencyId].code;
  }

  return null;
};

const getProductImage = (product: Product | undefined): string => {
  if (!product?.images?.[0]) return "";
  const imageId = product.images[0];
  return imageId.startsWith("http")
    ? imageId
    : `/media/${imageId}/thumbnail.webp`;
};

export default function OrderProductCard({
  item,
  manufacturersMap = {},
  warehousesMap = {},
  currenciesMap = {},
}: OrderProductCardProps) {
  const { t } = useI18N();
  const product = item.product;
  const [showFallbackImage, setShowFallbackImage] = useState(false);

  const productImage = getProductImage(product);

  const totalPrice = item.total_price || item.price_per_item * item.quantity;

  const currencyCode = getCurrencyCode(product, warehousesMap, currenciesMap);
  const formattedPrice = formatPrice(currencyCode, totalPrice);

  const productName = t(product?.name);
  const productDescription = t(product?.description);
  const technicalDescription = t(product?.technical_description);

  const manufacturer = product?.manufacturer_id
    ? manufacturersMap[product.manufacturer_id]
    : undefined;
  const manufacturerName = manufacturer ? t(manufacturer.name) : "";

  const fallbackFormatPrice = (price?: number | null) => {
    if (!price) return "0 ₽";
    return new Intl.NumberFormat("ru-RU", {
      style: "currency",
      currency: "RUB",
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <li className="flex gap-x-4 p-3 md:p-4 not-last:border-b border-neutral-gray-deep">
      <div className="shrink-0 size-25 md:size-40">
        {productImage && !showFallbackImage ? (
          <Image
            className="size-full object-contain"
            src={productImage}
            width={100}
            height={100}
            alt={productName}
            unoptimized={productImage.startsWith("http")}
            onError={() => setShowFallbackImage(true)}
          />
        ) : (
          <NoImage />
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-y-3 md:gap-y-0 md:gap-x-7.5 justify-between grow">
        <div className="grow">
          <h3 className="mb-2 font-medium">
            <Link
              className="text-xs md:text-sm text-accent-blue hover:text-main-red-deep active:opacity-60"
              href="/product"
            >
              {productName}
            </Link>
          </h3>

          <div className="flex flex-col gap-y-4 text-xxs">
            <div className="flex flex-wrap gap-x-4 gap-y-2">
              {product?.article && (
                <div>
                  <div className="text-neutral-gray">Артикул:</div>
                  <div className="text-text">{product.article}</div>
                </div>
              )}

              {product?.part_number && (
                <div>
                  <div className="text-neutral-gray">Тех. номер:</div>
                  <div className="text-text">{product.part_number}</div>
                </div>
              )}

              {manufacturerName && (
                <div>
                  <div className="text-neutral-gray">Производитель:</div>
                  <div className="text-text">{manufacturerName}</div>
                </div>
              )}
            </div>

            {(technicalDescription || productDescription) && (
              <div className="w-full 2md:flex">
                {technicalDescription && (
                  <div className="pb-2 mb-2 2md:pb-0 2md:mb-0 2md:pr-3 2md:mr-3 border-b border-border-gray 2md:border-b-0 2md:border-r">
                    <div className="text-neutral-gray">Тех. описание:</div>
                    <div className="text-text">{technicalDescription}</div>
                  </div>
                )}

                {productDescription && (
                  <div>
                    <div className="text-neutral-gray">
                      Тех. характеристика:
                    </div>
                    <div className="text-text">{productDescription}</div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col items-end shrink-0">
          <div className="text-accent-blue text-base md:text-xl font-medium">
            {formattedPrice || fallbackFormatPrice(totalPrice)}
          </div>
          <div className="text-xs md:text-sm text-text">
            {item.quantity} шт.
          </div>
        </div>
      </div>
    </li>
  );
}
