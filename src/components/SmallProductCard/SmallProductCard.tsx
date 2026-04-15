import Link from "next/link";
import Image from "next/image";
import categoryDefault from "../../assets/category_default.png";
import { useI18N } from "@/i18n/hooks/useLocale";
import { useWhoAmIQueryOptions } from "@cms/sdk/auth/hooks/queries";
import { Product } from "@cms/sdk/products/entities";
import AddToCartButton from "@/domain/carts/components/AddToCartButton";
import FavoriteButton from "@/components/elements/FavoriteButton";
import { useProductPrice } from "@/domain/products/hooks/use-product-price";
import { useQuery } from "@tanstack/react-query";

type SmallProductCardProps = {
  product: Product;
  locale?: string; // e.g. ru-RU, en-US; default ru-RU
  href?: string; // explicit link override
  hrefBuilder?: (p: Product) => string; // custom route generator
  imageBaseUrl?: string; // prefix for relative images (CDN/API)
  priceTypeId?: string; // pick price by type when multiple exist
  currency?: string; // e.g. RUB, USD; default RUB
  cartId?: string;
};

// function isAbsoluteUrl(u: string): boolean {
//   return /^https?:\/\//i.test(u);
// }

function resolveImageUrl(img: string | undefined): string | undefined {
  return `/media/${img}/medium.webp`;
}

export default function SmallProductCard({
  product,
  href,
  hrefBuilder,
  cartId,
}: SmallProductCardProps) {
  const { t } = useI18N();

  const { data: whoAmI } = useQuery(useWhoAmIQueryOptions());

  const isAuthorized = !!whoAmI;

  const { formattedPrice } = useProductPrice(product);

  const name = t(product?.name) || "—";
  const article = product?.article ?? "—";
  const partNumber = product?.part_number ?? "—";

  const firstImage = product?.images?.[0];
  const resolvedImage = resolveImageUrl(firstImage);

  const computedHref =
    href ??
    (hrefBuilder ? hrefBuilder(product) : `/catalog/products/${product.id}`);

  return (
    <li
      className="
      flex flex-col
      p-[12px] md:p-[20px]
      border-[1px] border-[#E8E8E8]
      rounded-[10px]
      hover:shadow-(--gray-deep-shadow)
      hover:cursor-pointer
      group
    "
    >
      <div
        className="
        mb-[8px] md:mb-[12px] w-full h-[76px] 2sm:h-[100px] md:h-[130px]"
      >
        <Link href={computedHref}>
          <Image
            className="size-full object-contain object-center"
            unoptimized
            width={194}
            height={130}
            src={firstImage && resolvedImage ? resolvedImage : categoryDefault}
            alt={name || "Фото товара"}
          />
        </Link>
      </div>

      <div className="flex flex-col gap-y-[12px] md:gap-y-[16px]">
        <h3 className="text-accent-blue font-medium text-[12px] md:text-[14px]">
          <Link
            className="group-hover:text-main-red text-inherit active:opacity-50"
            href={computedHref}
          >
            {name}
          </Link>
        </h3>

        <div className="text-[10px] text-neutral-gray">
          <p>
            Артикул <span className="text-text">{article}</span>
          </p>
          <p>
            Part number <span className="text-text">{partNumber}</span>
          </p>
        </div>

        <div className="flex flex-col gap-y-2">
          {isAuthorized ? (
            <>
              <p className="mb-[4px] text-accent-blue text-[18px] md:text-[20px] leading-[100%] font-medium">
                {formattedPrice}
              </p>
              <div className="flex items-center gap-2">
                <AddToCartButton
                  product={product}
                  cartId={cartId}
                  className="flex-1"
                />
                <FavoriteButton productId={product.id} />
              </div>
            </>
          ) : (
            <>
              <p className="mb-1 text-accent-blue text-[18px] md:text-[20px] leading-[100%] font-medium">
                Цена скрыта
              </p>
              <p className="text-text text-[10px] md:text-[12px] leading-[100%]">
                *Необходимо{" "}
                <Link
                  href="/auth/login"
                  className="text-main-red hover:underline"
                >
                  авторизоваться
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </li>
  );
}
