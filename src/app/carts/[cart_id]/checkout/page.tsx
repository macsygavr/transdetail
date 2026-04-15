"use client";

import { useMemo, type ReactNode } from "react";

import ContentContainer from "@/components/ContentContainer/ContentContainer";
import PageTitle from "@/components/PageTitle/PageTitle";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useI18N } from "@/i18n/hooks/useLocale";
import ContactPersonDialog from "@/domain/companies/components/ContactPersonDialog";
import {
  computeCartTotals,
  getCurrencyCodeForCartItem,
} from "@/domain/carts/utils/cart-pricing";
import {
  formatMoney,
  pickDisplayPrice,
} from "@/domain/products/hooks/use-product-price";
import { useEntityMap } from "@/utils";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Lock } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import * as React from "react";
import { useCartQueryOptions } from "@cms/sdk/carts/hooks/queries";
import { Company } from "@cms/sdk/companies/entities";
import {
  useCompanyQueryOptions,
  useContactPersonsListQueryOptions,
} from "@cms/sdk/companies/hooks/queries";
import { useCurrenciesListQueryOptions } from "@cms/sdk/currencies/hooks/queries";
import { useOrderCreateMutation } from "@cms/sdk/orders/hooks/mutations";
import { useWarehousesListQueryOptions } from "@cms/sdk/warehouses/hooks/queries";
import { useLanguages } from "@/providers/LanguageContext";

function formatFullName(p: {
  last_name?: string | null;
  first_name: string;
  middle_name?: string | null;
}) {
  return [p.last_name, p.first_name, p.middle_name].filter(Boolean).join(" ");
}

export default function Page() {
  const { cart_id } = useParams();
  const cartId = cart_id as string;
  const router = useRouter();

  const { t } = useI18N();
  const languages = useLanguages();

  const createOrderMutation = useOrderCreateMutation({
    mutationOptions: {
      onSuccess: (order) => {
        router.push(`/orders/${order.id}/success`);
      },
    },
  });

  const cartQuery = useQuery(
    useCartQueryOptions({
      params: {
        id: cartId,
        fetchParams: {
          expand: ["product"],
        },
      },
      queryOptions: {
        enabled: !!cartId,
      },
    })
  );

  const cart = cartQuery.data;
  const cartCompanyId = cart?.company_id ?? null;

  const cartCompanyQuery = useQuery(
    useCompanyQueryOptions({
      params: {
        id: cartCompanyId,
      },
      queryOptions: {
        enabled: !!cartCompanyId,
      },
    })
  );

  const warehousesQuery = useQuery(useWarehousesListQueryOptions());
  const currenciesQuery = useQuery(useCurrenciesListQueryOptions());

  const warehousesMap = useEntityMap(warehousesQuery.data?.items);
  const currenciesMap = useEntityMap(currenciesQuery.data?.items);

  const cartItems = useMemo(() => {
    return (cart?.items ?? []).filter((item) => !!item.product);
  }, [cart?.items]);

  const cartTotals = useMemo(() => {
    return computeCartTotals(
      cartItems,
      cartCompanyQuery.data?.price_type_id,
      warehousesMap,
      currenciesMap
    );
  }, [cartItems, cartCompanyQuery.data, currenciesMap, warehousesMap]);

  const totalPriceDisplay = useMemo(() => {
    if (cartTotals.isMultiCurrency) return "—";
    return formatMoney(cartTotals.sum, cartTotals.currencyCode, languages);
  }, [cartTotals.currencyCode, cartTotals.isMultiCurrency, cartTotals.sum]);

  const [selectedContactPersonId, setSelectedContactPersonId] =
    React.useState<string>();
  const [selectedCity, setSelectedCity] = React.useState<string>("");
  const [isContactDialogOpen, setIsContactDialogOpen] = React.useState(false);
  const [isSelectOpen, setIsSelectOpen] = React.useState(false);

  const contactPersonsQuery = useQuery(
    useContactPersonsListQueryOptions({
      params: {
        companyId: cartCompanyId ?? "-",
      },
      queryOptions: {
        enabled: !!cartCompanyId,
      },
    })
  );
  const contactPersons = contactPersonsQuery.data?.items ?? [];

  const handleCreateOrder = () => {
    if (!cartId || !cartCompanyId) return;

    createOrderMutation.mutate({
      cart_id: cartId,
      company_id: cartCompanyId,
      contact_person_id: selectedContactPersonId || null,
    });
  };

  const checkoutDisabled =
    cartQuery.isLoading ||
    cartQuery.isError ||
    !cart ||
    !cart.company_id ||
    cartCompanyQuery.isLoading ||
    cartCompanyQuery.isError ||
    !cartCompanyQuery.data ||
    cartItems.length === 0 ||
    createOrderMutation.isPending;

  const handleAddContactClick = () => {
    setIsSelectOpen(false);
    setIsContactDialogOpen(true);
  };

  return (
    <ContentContainer>
      <div className="mb-6 md:mb-8">
        <div className="mb-4">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link
                    href="/"
                    className="text-main-red hover:text-main-red-deep"
                  >
                    Главная
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link
                    href="/carts"
                    className="text-main-red hover:text-main-red-deep"
                  >
                    Корзина
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-neutral-gray">
                  Оформление заказа
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <PageTitle>Оформление заказа</PageTitle>
      </div>

      <div className="flex flex-col gap-5 1lg:flex-row 1lg:gap-7.5 1lg:items-start">
        <form className="1lg:grow flex flex-col gap-y-3 md:gap-y-5 p-4 md:p-6 rounded-[10px] border border-neutral-gray-deep">
          {cartQuery.isLoading ? (
            <p className="text-neutral-gray text-sm">Загрузка корзины...</p>
          ) : cartQuery.isError ? (
            <p className="text-main-red text-sm">
              Не удалось загрузить корзину
            </p>
          ) : !cart ? (
            <p className="text-main-red text-sm">Корзина не найдена</p>
          ) : !cart.company_id ? (
            <p className="text-main-red text-sm">
              У корзины не указана компания
            </p>
          ) : cartCompanyQuery.isLoading ? (
            <p className="text-neutral-gray text-sm">Загрузка компании...</p>
          ) : cartCompanyQuery.isError ? (
            <p className="text-main-red text-sm">
              Не удалось загрузить компанию
            </p>
          ) : !cartCompanyQuery.data ? (
            <p className="text-main-red text-sm">Компания не найдена</p>
          ) : (
            <CheckoutCompanyDetails company={cartCompanyQuery.data} />
          )}

          <Separator className="md:col-span-2" />

          <div className="grid gap-5 md:grid-cols-2 md:gap-10">
            <div>
              <FormSectionTitle>Получатель</FormSectionTitle>

              <Select
                open={isSelectOpen}
                onOpenChange={setIsSelectOpen}
                value={selectedContactPersonId}
                onValueChange={(val) => {
                  setSelectedContactPersonId(val);

                  const selectedPerson = contactPersons.find(
                    (p) => p.id === val
                  );
                  if (selectedPerson?.city) {
                    setSelectedCity(selectedPerson.city);
                  } else {
                    setSelectedCity("");
                  }
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Выберите контактное лицо" />
                </SelectTrigger>
                <SelectContent>
                  {contactPersons.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {formatFullName(p)}
                    </SelectItem>
                  ))}
                  <Button
                    variant="link"
                    className="relative flex w-full cursor-pointer select-none items-center justify-start rounded-sm py-1.5 px-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground text-main-red font-normal h-auto no-underline"
                    onClick={handleAddContactClick}
                  >
                    <span>
                      {contactPersons.length > 0
                        ? "+ Добавить контактное лицо"
                        : "Добавить контактное лицо"}
                    </span>
                  </Button>
                </SelectContent>
              </Select>

              <ContactPersonDialog
                open={isContactDialogOpen}
                onOpenChange={setIsContactDialogOpen}
                companyId={cartCompanyId ?? undefined}
                onCreated={(id) => {
                  setSelectedContactPersonId(id);
                  setSelectedCity("");
                  setIsContactDialogOpen(false);
                }}
              />
            </div>

            <div>
              <FormSectionTitle>Город</FormSectionTitle>
              <Input
                placeholder="Укажите город"
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
              />
            </div>
          </div>
        </form>

        <div className="flex flex-col gap-3 1lg:gap-4 1lg:w-67.5 3xl:w-75 p-4 1lg:p-6 shadow-(--gray-deep-shadow) rounded-xl">
          <div className="flex items-baseline justify-between">
            <h2 className="text-text text-sm 1lg:text-base font-bold">
              Ваш заказ
            </h2>
            <p className="text-neutral-gray text-xxs 1lg:text-xs">
              {cartItems.length} товаров
            </p>
          </div>

          {cartQuery.isLoading ? (
            <p className="text-neutral-gray text-xs">Загрузка...</p>
          ) : cartQuery.isError ? (
            <p className="text-main-red text-xs">
              Не удалось загрузить корзину
            </p>
          ) : !cart ? (
            <p className="text-main-red text-xs">Корзина не найдена</p>
          ) : cartItems.length === 0 ? (
            <p className="text-neutral-gray text-xs">В корзине нет товаров</p>
          ) : !cart.company_id ? (
            <p className="text-main-red text-xs">
              У корзины не указана компания
            </p>
          ) : cartCompanyQuery.isLoading ? (
            <p className="text-neutral-gray text-xs">Загрузка компании...</p>
          ) : cartCompanyQuery.isError ? (
            <p className="text-main-red text-xs">
              Не удалось загрузить компанию
            </p>
          ) : (
            <ul className="space-y-3 text-xs">
              {cartItems.map((item) => {
                const product = item.product!;
                const unitPrice = pickDisplayPrice(
                  product.prices,
                  cartCompanyQuery.data?.price_type_id
                );

                const currencyCode = getCurrencyCodeForCartItem(
                  item,
                  warehousesMap,
                  currenciesMap
                );

                const unitPriceDisplay = unitPrice
                  ? formatMoney(unitPrice.price, currencyCode, languages)
                  : "—";

                const subtitleParts = [
                  product.article ? `Артикул ${product.article}` : null,
                  product.part_number
                    ? `Тех.Номер ${product.part_number}`
                    : null,
                ].filter(Boolean);

                return (
                  <li key={`${cartId}:${item.warehouse_id}:${item.product_id}`}>
                    <p className="text-neutral-gray">
                      {t(product.name)}
                      {subtitleParts.length
                        ? `, ${subtitleParts.join(", ")}`
                        : ""}
                    </p>
                    <p className="text-text font-medium">
                      {unitPriceDisplay} &#8212; {item.quantity ?? 0}шт
                    </p>
                  </li>
                );
              })}
            </ul>
          )}

          <Separator />

          <p className="flex flex-wrap gap-1 justify-between text-sm font-bold text-accent-blue">
            <span>Общая стоимость</span>
            <span>{totalPriceDisplay}</span>
          </p>

          {cartTotals.isMultiCurrency ? (
            <p className="text-xs text-neutral-gray">Разные валюты</p>
          ) : null}

          <Button
            type="button"
            disabled={checkoutDisabled}
            onClick={handleCreateOrder}
          >
            {createOrderMutation.isPending ? "Оформление..." : "Оформить заказ"}
          </Button>

          {createOrderMutation.isError && (
            <p className="text-xs text-main-red">
              Не удалось создать заказ. Попробуйте еще раз.
            </p>
          )}
        </div>
      </div>
    </ContentContainer>
  );
}

function CheckoutCompanyDetails({ company }: { company: Company }) {
  if (company.form === "individual") {
    return (
      <div className="grid gap-5 md:grid-cols-2 md:gap-10">
        <div className="md:col-span-2">
          <FormSectionTitle>ФИО</FormSectionTitle>
          <Input value={company.name} readOnly />
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-5 md:grid-cols-2 md:gap-10">
      <div className="md:col-span-2">
        <FormSectionTitle>Данные организации</FormSectionTitle>

        <div className="grid gap-3 md:grid-cols-2 md:gap-y-3 md:gap-x-10">
          <div className="md:col-span-2 relative">
            <Label className="text-xs md:text-base">
              Наименование компании
            </Label>
            <Input value={company.name} readOnly />
            <Lock className="absolute bottom-3 right-2 size-3.5" />
          </div>

          <div className="relative">
            <Label className="text-xs md:text-base">ИНН</Label>
            <Input readOnly value={company.inn ?? ""} />
            <Lock className="absolute bottom-3 right-2 size-3.5" />
          </div>

          <div className="relative">
            <Label className="text-xs md:text-base">КПП</Label>
            <Input readOnly value={company.kpp ?? ""} />
            <Lock className="absolute bottom-3 right-2 size-3.5" />
          </div>
        </div>
      </div>
    </div>
  );
}

function FormSectionTitle({ children }: { children: ReactNode }) {
  return (
    <h2 className="mb-3 md:mb-5 text-text font-medium text-base leading-[100%] md:text-xl">
      {children}
    </h2>
  );
}
