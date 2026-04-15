import { formatMoney } from "@/domain/products/hooks/use-product-price";

type OrderStateWithPriceProps = {
  price?: number;
  currency?: string;
};

export default function OrderStateWithPrice({
  price,
  currency = "RUB",
}: OrderStateWithPriceProps) {
  const formattedPrice = formatMoney(price || 0, currency, ["ru-RU"]);

  return (
    <p className="flex flex-wrap justify-end items-baseline gap-[6px]">
      <span className="font-medium text-[14px] leading-[20px] md:text-[20px] md:leading-[23px]">
        {/* <span className="text-[10px] leading-[14px] md:text-[12px]">        Оплачено</span> */}
        {formattedPrice}
      </span>
    </p>
  );
}
