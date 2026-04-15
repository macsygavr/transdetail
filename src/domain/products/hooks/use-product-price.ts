import { useMemo } from "react";
import { Product, ProductPrice } from "@cms/sdk/products/entities";
import { Warehouse } from "@cms/sdk/warehouses/entities";
import { Currency } from "@cms/sdk/currencies/entities";
import { useCompany } from "@/domain/companies/hooks/use-current-company";
import { useCurrenciesListQueryOptions } from "@cms/sdk/currencies/hooks/queries";
import { useWarehousesListQueryOptions } from "@cms/sdk/warehouses/hooks/queries";
import { useQuery } from "@tanstack/react-query";
import { useLanguages } from "@/providers/LanguageContext";

export interface UseProductPriceResult {
  formattedPrice: string | null;
  price: ProductPrice | null;
  currency: Currency | null;
  warehouse: Warehouse | null;
  inStock: boolean;
}

export function useProductPrice(
  product: Product | null | undefined
): UseProductPriceResult {
  const languages = useLanguages();
  const company = useCompany();
  const currenciesQuery = useQuery(useCurrenciesListQueryOptions());
  const warehousesQuery = useQuery(useWarehousesListQueryOptions());

  const inStock = useMemo(
    () => product?.stock?.some((s) => s.amount > 0) ?? false,
    [product?.stock]
  );

  const price = useMemo(
    () =>
      pickDisplayPrice(
        product?.prices,
        company.companyQuery.data?.price_type_id
      ) ?? null,
    [product?.prices, company.companyQuery.data]
  );

  const warehouse = useMemo(
    () =>
      warehousesQuery.data?.items.find(
        (item) => item.id === price?.warehouse_id
      ) ?? null,
    [warehousesQuery.data?.items, price?.warehouse_id]
  );

  const currency = useMemo(() => {
    return warehouse?.currency_id
      ? (currenciesQuery.data?.items.find(
          (item) => item.id === warehouse.currency_id
        ) ?? null)
      : null;
  }, [warehouse?.currency_id, currenciesQuery.data?.items]);

  const formattedPrice = useMemo(() => {
    const value = price?.price ?? null;
    const formatted =
      value !== null && currency?.code
        ? formatMoney(value, currency.code, languages)
        : null;

    return formatted;
  }, [price?.price, currency?.code]);

  return {
    formattedPrice,
    price,
    currency,
    warehouse,
    inStock,
  };
}

export function formatMoney(
  amount: number,
  currencyCode: string | null,
  languages?: string[]
): string {
  if (!currencyCode) return "—";

  try {
    return new Intl.NumberFormat(languages, {
      style: "currency",
      currency: currencyCode,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${amount} ${currencyCode}`;
  }
}

export function pickDisplayPrice(
  prices?: ProductPrice[] | null,
  priceTypeId?: string | null
): ProductPrice | null {
  if (!prices || prices.length === 0) {
    return null;
  }

  if (priceTypeId) {
    const byType = prices.find((p) => p.price_type_id === priceTypeId);

    if (byType) {
      return byType;
    }
  }

  return prices.find((p) => p.is_default) ?? prices[0];
}
