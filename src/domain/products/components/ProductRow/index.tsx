import { useState, type ElementType, type ReactNode } from "react";

import { cn } from "@/lib/utils";
import { useI18N } from "@/i18n/hooks/useLocale";
import AddToCartButton from "@/domain/carts/components/AddToCartButton";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import NoImage from "@/components/elements/NoImage";
import Image from "next/image";
import FavoriteButton from "@/components/elements/FavoriteButton";
import { useWhoAmIQueryOptions } from "@cms/sdk/auth/hooks/queries";
import { Product } from "@cms/sdk/products/entities";
import { useProductPrice } from "../../hooks/use-product-price";
import { useQuery } from "@tanstack/react-query";

export type ProductRowProps = {
  /** Outer wrapper element. Prefer `li` when used in lists. */
  as?: ElementType;
  /** ClassName for the outer wrapper (e.g. to enable leading/trailing layout). */
  className?: string;

  /** ClassName for the main container (the bordered card/row element). */
  containerClassName?: string;

  /** Optional left control (checkbox, etc). Rendered outside the bordered container. */
  leading?: ReactNode;
  /** Optional right control (trash button, etc). Rendered outside the bordered container. */
  trailing?: ReactNode;

  /** Optional badges block. Positioned by the base component. */
  badgesClassName?: string;

  /** Product image block. */
  mediaClassName?: string;

  /** Main content (title + meta + details). */
  contentClassName?: string;

  /** Main content (title + meta + details). */
  product: Product;

  /** Right-side actions column (price + buttons, qty, etc). */
  actions?: ReactNode;
  actionsClassName?: string;

  /** Wrapper for content+actions layout. */
  bodyClassName?: string;

  manufacturersMap: Record<string, { name: Record<string, string> }>;

  cartId?: string;

  /**
   * When true, any attempt to remove the item (set quantity to 0) requires confirmation.
   * Defaults to false to preserve existing behavior.
   */
  confirmOnRemove?: boolean;
};

const getProductImage = (product: Product): string => {
  if (product.images && product.images.length > 0) {
    const imageId = product.images[0];
    if (imageId.startsWith("http")) {
      return imageId;
    }
    return `/media/${imageId}/thumbnail.webp`;
  }
  return "";
};

export default function ProductRow({
  as: Root = "li",
  className,
  containerClassName,
  leading,
  trailing,
  badgesClassName,
  mediaClassName,
  contentClassName,
  actions,
  actionsClassName,
  bodyClassName,
  product,
  manufacturersMap,
  cartId,
  confirmOnRemove = false,
}: ProductRowProps) {
  const { t } = useI18N();

  const whoAmIQuery = useQuery(
    useWhoAmIQueryOptions({
      queryOptions: {
        retry: false,
      },
    })
  );

  const isAuthorized = whoAmIQuery.isSuccess && !!whoAmIQuery.data;

  const { inStock, formattedPrice } = useProductPrice(product);

  const productImage = getProductImage(product);
  const [showFallbackImage, setShowFallbackImage] = useState(false);

  const productName = t(product.name);
  const technical_description = product.technical_description
    ? t(product.technical_description)
    : "—";

  return (
    <Root className={cn(className)}>
      {leading ? (
        <div className="shrink-0 mr-[8px] md:mr-[12px]">{leading}</div>
      ) : null}

      <div
        className={cn(
          "md:relative flex flex-col sm:flex-row gap-4 sm:gap-6 md:gap-8 p-3 md:pr-[30px] md:p-2 border border-[#E8E8E8] rounded-[10px] transition-shadow duration-200 hover:border-main-red hover:shadow-lg",
          containerClassName
        )}
      >
        {isAuthorized && (
          <div
            className={cn(
              "md:absolute md:top-[8px] md:left-[8px] hidden md:flex md:gap-x-[4px]",
              badgesClassName
            )}
          >
            {inStock ? (
              <Badge variant="one">В наличии</Badge>
            ) : (
              <Badge variant="five">Нет в наличии</Badge>
            )}
          </div>
        )}

        <div
          className={cn(
            "shrink-0 w-[120px] h-[120px] sm:w-[120px] sm:h-[120px]",
            mediaClassName
          )}
        >
          {productImage && !showFallbackImage ? (
            <Image
              className="w-full h-full object-contain"
              src={productImage}
              alt={productName}
              width={100}
              height={100}
              unoptimized
              onError={() => {
                setShowFallbackImage(true);
              }}
            />
          ) : (
            <NoImage />
          )}
        </div>

        <div
          className={cn(
            "flex flex-col gap-y-[12px] md:flex-row md:gap-y-0 md:gap-x-[30px] justify-between grow min-w-0",
            bodyClassName
          )}
        >
          <div className={cn("grow min-w-0", contentClassName)}>
            <div>
              <h3 className="mb-[8px] font-medium">
                <div className="max-w-[300px]">
                  <span
                    className="text-[12px] md:text-[14px] text-accent-blue truncate block"
                    title={productName}
                  >
                    {productName}
                  </span>
                </div>
              </h3>

              <div className="flex flex-col gap-y-[16px] text-xs md:text-sm">
                <div className="flex flex-wrap gap-x-[16px] gap-y-2">
                  {product.article && (
                    <div className="flex flex-col min-w-[80px]">
                      <span className="text-neutral-gray">Артикул</span>
                      <span className="text-text break-words">
                        {product.article}
                      </span>
                    </div>
                  )}
                  {product.part_number && (
                    <div className="flex flex-col min-w-[80px]">
                      <span className="text-neutral-gray">Тех. номер</span>
                      <span className="text-text break-words">
                        {product.part_number}
                      </span>
                    </div>
                  )}
                  {product.manufacturer_id && (
                    <div className="flex flex-col min-w-[80px]">
                      <span className="text-neutral-gray">Производитель</span>
                      <span className="text-text break-words">
                        {product.manufacturer_id &&
                          t(manufacturersMap[product.manufacturer_id]?.name)}
                      </span>
                    </div>
                  )}
                </div>

                <div className="w-full max-w-[300px]">
                  <div className="flex flex-col">
                    <span className="text-neutral-gray">Тех. описание</span>
                    <span
                      className="text-text truncate block"
                      title={technical_description}
                    >
                      {technical_description}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div
            className={cn(
              "flex flex-col items-start justify-start gap-2 md:p-4",
              actionsClassName
            )}
          >
            {actions ? (
              actions
            ) : isAuthorized ? (
              <>
                {inStock && formattedPrice && (
                  <span className="text-accent-blue text-base md:text-xl leading-[100%] font-medium">
                    {formattedPrice}
                  </span>
                )}
                <div className="flex items-center gap-2">
                  <AddToCartButton
                    product={product}
                    cartId={cartId}
                    confirmOnRemove={confirmOnRemove}
                  />
                  <FavoriteButton
                    className="ml-0 md:ml-3"
                    productId={product.id}
                  />
                </div>
              </>
            ) : (
              <div>
                <p className="mb-1 text-accent-blue text-base md:text-xl leading-[100%] font-medium">
                  Цена скрыта
                </p>
                <p className="text-text text-[10px] md:text-[12px] leading-[100%]">
                  *Необходимо{" "}
                  <span className="text-main-red hover:underline">
                    авторизоваться
                  </span>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {trailing ? (
        <div className="shrink-0 ml-[12px] md:ml-[16px]">{trailing}</div>
      ) : null}
    </Root>
  );
}
