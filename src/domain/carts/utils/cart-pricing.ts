import { pickDisplayPrice } from "@/domain/products/hooks/use-product-price";
import { CartItem } from "@cms/sdk/carts/entities";
import { Currency } from "@cms/sdk/currencies/entities";
import { Warehouse } from "@cms/sdk/warehouses/entities";

export function getCurrencyCodeForCartItem(
  item: CartItem,
  warehousesMap: Record<string, Warehouse> | null | undefined,
  currenciesMap: Record<string, Currency> | null | undefined
): string | null {
  const warehouse = warehousesMap?.[item.warehouse_id];
  const currencyId = warehouse?.currency_id;
  if (!currencyId) return null;
  const code = currenciesMap?.[currencyId]?.code;
  return code ?? null;
}

export type CartTotals = {
  sum: number;
  currencyCode: string | null;
  isMultiCurrency: boolean;
};

export function computeCartTotals(
  items: CartItem[],
  priceTypeId: string | null | undefined,
  warehousesMap: Record<string, Warehouse> | null | undefined,
  currenciesMap: Record<string, Currency> | null | undefined
): CartTotals {
  let sum = 0;
  const currencySet = new Set<string>();

  for (const item of items) {
    const qty = item.quantity ?? 0;
    const price = pickDisplayPrice(item.product?.prices, priceTypeId);
    sum += (price?.price ?? 0) * qty;

    const code = getCurrencyCodeForCartItem(item, warehousesMap, currenciesMap);
    if (code) currencySet.add(code);
  }

  const currencyCode = currencySet.size === 1 ? [...currencySet][0] : null;

  return {
    sum,
    currencyCode,
    isMultiCurrency: currencySet.size > 1,
  };
}
