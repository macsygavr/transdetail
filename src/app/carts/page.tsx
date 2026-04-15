"use client";

import { useCallback, useMemo, useState } from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Edit2Icon, Loader2, Plus, X } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

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
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import CartNameDialog from "@/domain/carts/components/CartNameDialog";
import { computeCartTotals } from "@/domain/carts/utils/cart-pricing";
import { useCompany } from "@/domain/companies/hooks/use-current-company";
import ProductRow from "@/domain/products/components/ProductRow";
import { useEntityMap } from "@/utils";
import {
  useCartCreateMutation,
  useCartDeleteMutation,
  useCartUpdateMutation,
  useRemoveCartItemsMutation,
  useSetCurrentCartMutation,
  useUpsertCartItemsMutation,
} from "@cms/sdk/carts/hooks/mutations";
import {
  useCartsListQueryOptions,
  useCurrentCartQueryOptions,
} from "@cms/sdk/carts/hooks/queries";
import { useCurrenciesListQueryOptions } from "@cms/sdk/currencies/hooks/queries";
import { useManufacturersListQueryOptions } from "@cms/sdk/manufacturers/hooks/queries";
import { useWarehousesListQueryOptions } from "@cms/sdk/warehouses/hooks/queries";
import { formatMoney } from "@/domain/products/hooks/use-product-price";
import { useAPIClientOptions } from "@cms/sdk/common/hooks/client";
import { useLanguages } from "@/providers/LanguageContext";

type CartButtonProps = {
  isActive: boolean;
  isLoading?: boolean;
  disabled?: boolean;
  label: string;
  onSelect: () => void;
  onRename: () => void;
  onDelete: () => void;
  deleteDisabled?: boolean;
  renameDisabled?: boolean;
};

function CartButton({
  isActive,
  isLoading,
  disabled,
  label,
  onSelect,
  onRename,
  onDelete,
  deleteDisabled,
  renameDisabled,
}: CartButtonProps) {
  return (
    <li
      className={`
        relative
        group flex items-center
        gap-x-2.5
        text-text text-xs leading-[14px]
        md:text-sm md:leading-[100%]
        bg-transparent hover:bg-transparent
        border rounded-sm md:rounded-lg
        ${isActive ? "border-main-red" : "border-neutral-gray-deep"}
      `}
    >
      <button
        type="button"
        onClick={onSelect}
        disabled={disabled}
        aria-busy={isLoading}
        className="size-full py-2 pl-3 pr-14.5 md:pl-4 md:py-3.25 text-left cursor-pointer disabled:cursor-not-allowed disabled:opacity-70"
      >
        <span className="inline-flex items-center gap-2">
          <span>{label}</span>
          {isLoading ? <Loader2 className="size-4 animate-spin" /> : null}
        </span>
      </button>

      <div className="absolute right-2 flex gap-x-2.5">
        <Button
          size="icon"
          className="p-0 w-auto h-auto border-none bg-transparent hover:bg-transparent"
          onClick={onRename}
          disabled={renameDisabled}
          aria-label="Rename cart"
        >
          <Edit2Icon className="size-4 text-neutral-gray-deep group-hover:text-accent-blue" />
        </Button>

        <Button
          size="icon"
          className="p-0 w-auto h-auto border-none bg-transparent hover:bg-transparent"
          onClick={onDelete}
          disabled={deleteDisabled}
        >
          <X className="size-4 text-neutral-gray-deep group-hover:text-main-red" />
        </Button>
      </div>
    </li>
  );
}

export default function Page() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const languages = useLanguages();
  const company = useCompany();

  const sdkClientOptions = useAPIClientOptions();

  const cartsListQuery = useQuery(
    useCartsListQueryOptions({
      clientOptions: sdkClientOptions,
    })
  );
  const createCartMutation = useCartCreateMutation();
  const setCurrentCartMutation = useSetCurrentCartMutation();

  const updateCartMutation = useCartUpdateMutation({
    mutationOptions: {
      onSuccess: () => {
        cartsListQuery.refetch();
      },
    },
  });

  const deleteCartMutation = useCartDeleteMutation({});

  const upsertItemsMutation = useUpsertCartItemsMutation();
  const removeItemsMutation = useRemoveCartItemsMutation();

  const manufacturersQuery = useQuery(
    useManufacturersListQueryOptions({
      clientOptions: sdkClientOptions,
    })
  );
  const warehousesQuery = useQuery(
    useWarehousesListQueryOptions({
      clientOptions: sdkClientOptions,
    })
  );
  const currenciesQuery = useQuery(
    useCurrenciesListQueryOptions({
      clientOptions: sdkClientOptions,
    })
  );

  const manufacturersMap = useEntityMap(manufacturersQuery.data?.items);
  const warehousesMap = useEntityMap(warehousesQuery.data?.items);
  const currenciesMap = useEntityMap(currenciesQuery.data?.items);

  const currentCartQuery = useQuery(
    useCurrentCartQueryOptions({
      clientOptions: sdkClientOptions,
      params: {
        company_id: company.companyId,
        expand: ["product"],
      },
    })
  );

  const selectedCartId = currentCartQuery.data?.id ?? null;

  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(
    new Set()
  );
  const [targetCartId, setTargetCartId] = useState<string>("");
  const [pendingCartId, setPendingCartId] = useState<string | null>(null);

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [renameCartId, setRenameCartId] = useState<string | null>(null);

  const carts = useMemo(() => {
    const items = cartsListQuery.data?.items ?? [];
    return items
      .slice()
      .filter((cart) => cart.company_id === company.companyId)
      .sort(
        (a, b) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
  }, [cartsListQuery.data?.items, company.companyId]);

  const { transferCarts, showTransferSelect, selectedCartName } =
    useMemo(() => {
      const filtered = carts.filter((cart) => cart.id !== selectedCartId);
      const selected = filtered.find((cart) => cart.id === targetCartId);

      return {
        transferCarts: filtered,
        showTransferSelect: filtered.length >= 1,
        selectedCartName: selected?.name ?? "",
      };
    }, [carts, selectedCartId, targetCartId]);

  const currentCart = currentCartQuery.data;

  const totalQuantityInCurrentCart = useMemo(() => {
    return currentCart?.items.reduce(
      (sum, item) => sum + (item.quantity ?? 0),
      0
    );
  }, [currentCart?.items]);

  const currentCartTotals = useMemo(() => {
    return computeCartTotals(
      currentCart?.items ?? [],
      company.companyQuery.data?.price_type_id,
      warehousesMap,
      currenciesMap
    );
  }, [
    currenciesMap,
    currentCart?.items,
    warehousesMap,
    company.companyQuery.data?.price_type_id,
  ]);

  const totalPriceDisplay = useMemo(() => {
    if (currentCartTotals.isMultiCurrency) return "—";
    return formatMoney(
      currentCartTotals.sum,
      currentCartTotals.currencyCode,
      languages
    );
  }, [
    currentCartTotals.currencyCode,
    currentCartTotals.isMultiCurrency,
    currentCartTotals.sum,
    languages,
  ]);

  const canCheckout =
    !!selectedCartId &&
    !!currentCart &&
    !currentCartQuery.isLoading &&
    !currentCartQuery.isError &&
    (currentCart.items?.length ?? 0) > 0;

  const handleDeleteCart = useCallback(
    async (cartId: string) => {
      if (deleteCartMutation.isPending) {
        return;
      }

      try {
        await deleteCartMutation.mutateAsync(cartId);

        queryClient.removeQueries({ queryKey: ["carts", cartId] });

        if (cartId === renameCartId) {
          setRenameDialogOpen(false);
          setRenameCartId(null);
        }

        await Promise.all([
          cartsListQuery.refetch(),
          currentCartQuery.refetch(),
        ]);
      } catch {}
    },
    [
      cartsListQuery,
      currentCartQuery,
      deleteCartMutation,
      queryClient,
      renameCartId,
    ]
  );

  const renameCartDefaultValue = useMemo(() => {
    if (!renameCartId) return "";
    return carts.find((c) => c.id === renameCartId)?.name ?? "";
  }, [carts, renameCartId]);

  const handleCreateCartConfirm = useCallback(
    async (name: string) => {
      const companyId = company.companyId;
      if (createCartMutation.isPending) return;

      try {
        const created = await createCartMutation.mutateAsync({
          name,
          company_id: companyId ?? undefined,
        });

        if (companyId) {
          await setCurrentCartMutation.mutateAsync({
            company_id: companyId,
            cart_id: created.id,
          });
        }

        await Promise.all([
          cartsListQuery.refetch(),
          currentCartQuery.refetch(),
        ]);
        setCreateDialogOpen(false);
      } catch {}
    },
    [
      cartsListQuery,
      company.companyId,
      createCartMutation,
      currentCartQuery,
      setCurrentCartMutation,
    ]
  );

  const handleRenameCartConfirm = useCallback(
    async (name: string) => {
      const companyId = company.companyId;
      if (!renameCartId) return;
      if (updateCartMutation.isPending) return;

      try {
        await updateCartMutation.mutateAsync({
          cart_id: renameCartId,
          name,
          company_id: companyId ?? undefined,
        });
        setRenameDialogOpen(false);
        setRenameCartId(null);
      } catch {}
    },
    [company.companyId, renameCartId, updateCartMutation]
  );

  // const handleRemoveItem = useCallback(
  //   async (variables: {
  //     cart_id: string;
  //     product_id: string;
  //     warehouse_id: string;
  //   }) => {
  //     if (removeCartItemsMutation.isPending) return;
  //     try {
  //       await removeCartItemsMutation.mutateAsync({
  //         cart_id: variables.cart_id,
  //         items: [
  //           {
  //             product_id: variables.product_id,
  //             warehouse_id: variables.warehouse_id,
  //           },
  //         ],
  //       });
  //     } catch {
  //       // silent  fail (UI currently doesn't have toasts)
  //     }
  //   },
  //   [removeCartItemsMutation]
  // );

  const handleSelectCart = useCallback(
    async (cartId: string) => {
      if (
        !company.companyId ||
        setCurrentCartMutation.isPending ||
        cartId === selectedCartId
      ) {
        return;
      }

      setPendingCartId(cartId);
      setSelectedProducts(new Set());
      setTargetCartId("");

      try {
        await setCurrentCartMutation.mutateAsync({
          company_id: company.companyId,
          cart_id: cartId,
        });
        await currentCartQuery.refetch();
      } finally {
        setPendingCartId(null);
      }
    },
    [company.companyId, selectedCartId, setCurrentCartMutation]
  );

  const handleTransferProducts = useCallback(async () => {
    if (!selectedCartId || !targetCartId || selectedProducts.size === 0) return;

    const items = currentCart?.items
      .filter((item) => selectedProducts.has(item.product_id))
      .map((item) => ({
        product_id: item.product_id,
        warehouse_id: item.warehouse_id,
        quantity: item.quantity,
      }));

    if (!items || items.length === 0) return;

    try {
      await upsertItemsMutation.mutateAsync({
        cart_id: targetCartId,
        items,
      });

      await removeItemsMutation.mutateAsync({
        cart_id: selectedCartId,
        items: items.map(({ product_id, warehouse_id }) => ({
          product_id,
          warehouse_id,
        })),
      });

      await currentCartQuery.refetch();
      setSelectedProducts(new Set());
      setTargetCartId("");
    } catch (error) {
      console.error("Failed to transfer products:", error);
    }
  }, [
    selectedCartId,
    targetCartId,
    selectedProducts,
    currentCart?.items,
    currentCartQuery,
    upsertItemsMutation,
    removeItemsMutation,
  ]);

  const handleRemoveSelectedProducts = useCallback(async () => {
    if (!selectedCartId || selectedProducts.size === 0) return;

    const itemsToRemove = currentCart?.items
      .filter((item) => selectedProducts.has(item.product_id))
      .map(({ product_id, warehouse_id }) => ({
        product_id,
        warehouse_id,
      }));

    if (!itemsToRemove || itemsToRemove.length === 0) return;

    try {
      await removeItemsMutation.mutateAsync({
        cart_id: selectedCartId,
        items: itemsToRemove,
      });

      await currentCartQuery.refetch();
      setSelectedProducts(new Set());
      setTargetCartId("");
    } catch (error) {
      console.error("Failed to remove products:", error);
    }
  }, [
    selectedCartId,
    selectedProducts,
    currentCart?.items,
    currentCartQuery,
    removeItemsMutation,
  ]);

  const allSelected = useMemo(() => {
    if (!currentCart?.items.length) return false;
    return selectedProducts.size === currentCart.items.length;
  }, [selectedProducts.size, currentCart?.items.length]);

  const handleSelectAll = useCallback(() => {
    const newSet = new Set(selectedProducts);
    if (allSelected) {
      newSet.clear();
    } else {
      currentCart?.items.forEach((item) => {
        if (item.product) {
          newSet.add(item.product_id);
        }
      });
    }
    setSelectedProducts(newSet);
  }, [selectedProducts, currentCart?.items, allSelected]);

  const hasSelectedProducts = selectedProducts.size > 0;
  const isTransferring =
    upsertItemsMutation.isPending || removeItemsMutation.isPending;

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
                    className="text-[#ef4323] hover:text-[#ef4323]"
                  >
                    Главная
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link
                    href="/account"
                    className="text-[#ef4323] hover:text-[#ef4323]"
                  >
                    Личный кабинет
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-neutral-gray">
                  Корзины
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <PageTitle>
          Корзины{" "}
          {company.companyQuery.data
            ? ` - ${company.companyQuery.data.name}`
            : ""}
        </PageTitle>
      </div>

      <div className="flex flex-col 1lg:flex-row 1lg:grow gap-[30px] 1lg:items-start">
        <div className="grow">
          <ul className="flex items-center gap-[8px] md:gap-[12px] mb-[8px] [&_li]:shrink-0 flex-wrap">
            {carts.map((cart) => (
              <CartButton
                key={cart.id}
                isActive={cart.id === selectedCartId}
                isLoading={
                  pendingCartId === cart.id &&
                  (setCurrentCartMutation.isPending ||
                    currentCartQuery.isFetching)
                }
                disabled={
                  setCurrentCartMutation.isPending || pendingCartId !== null
                }
                label={cart.name ?? "Корзина"}
                onSelect={() => {
                  void handleSelectCart(cart.id);
                }}
                onRename={() => {
                  setRenameCartId(cart.id);
                  setRenameDialogOpen(true);
                }}
                onDelete={() => handleDeleteCart(cart.id)}
                deleteDisabled={
                  deleteCartMutation.isPending ||
                  setCurrentCartMutation.isPending
                }
                renameDisabled={
                  updateCartMutation.isPending ||
                  setCurrentCartMutation.isPending
                }
              />
            ))}
            <li>
              <Button
                variant="outline"
                className="group items-center p-[6px] pl-[12px] md:px-[16px] font-normal rounded-[4px] md:rounded-[8px]"
                disabled={createCartMutation.isPending}
                onClick={() => setCreateDialogOpen(true)}
              >
                <Plus className="size-[16px]" />
                <span>Добавить ещё</span>
              </Button>
            </li>
          </ul>

          <Separator className="mb-[20px]" />

          <div className="grid gap-[24px] md:gap-[30px]">
            <ul className="grid gap-[12px] md:gap-[20px]">
              {cartsListQuery.isLoading ? (
                <li className="text-neutral-gray text-[12px] md:text-[14px]">
                  Загрузка корзин...
                </li>
              ) : carts.length === 0 ? (
                <li className="text-neutral-gray text-[12px] md:text-[14px]">
                  Создайте корзину или просто начните добавлять товары из
                  каталога
                </li>
              ) : cartsListQuery.isError ? (
                <li className="text-neutral-gray text-[12px] md:text-[14px]">
                  Не удалось загрузить корзины
                </li>
              ) : currentCartQuery.isLoading ? (
                <li className="text-neutral-gray text-[12px] md:text-[14px]">
                  Загрузка корзины...
                </li>
              ) : currentCartQuery.isError ? (
                <li className="text-neutral-gray text-[12px] md:text-[14px]">
                  Не удалось загрузить корзину
                </li>
              ) : !currentCart ? (
                <li className="text-neutral-gray text-[12px] md:text-[14px]">
                  Текущая корзина не выбрана
                </li>
              ) : currentCart.items.length === 0 ? (
                <li className="text-neutral-gray text-[12px] md:text-[14px]">
                  В корзине нет товаров
                </li>
              ) : (
                currentCart.items
                  .filter((item) => !!item.product)
                  .sort((a, b) => (a.product_id > b.product_id ? 1 : -1))
                  .map((item) => (
                    <div
                      key={`${currentCart.id}:${item.warehouse_id}:${item.product_id}`}
                      className="flex items-start gap-3"
                    >
                      <Checkbox
                        id={`product-${item.product_id}`}
                        className="mt-4"
                        checked={selectedProducts.has(item.product_id)}
                        disabled={isTransferring}
                        onCheckedChange={(checked) => {
                          const newSet = new Set(selectedProducts);
                          if (checked) {
                            newSet.add(item.product_id);
                          } else {
                            newSet.delete(item.product_id);
                          }
                          setSelectedProducts(newSet);
                        }}
                      />
                      <Link
                        href={`/catalog/products/${item.product_id}`}
                        className="flex-1"
                      >
                        <ProductRow
                          as={"li"}
                          product={item.product!}
                          manufacturersMap={manufacturersMap}
                          confirmOnRemove
                        />
                      </Link>
                    </div>
                  ))
              )}
            </ul>

            <Separator />

            <div className="flex items-start 3sm:items-center gap-[20px] md:gap-[30px]">
              <Label className="flex gap-x-[6px]">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={handleSelectAll}
                  disabled={isTransferring || !currentCart?.items.length}
                />
                <span>Выбрать все</span>
              </Label>

              <div className="flex flex-wrap gap-[8px] md:gap-[20px]">
                {showTransferSelect && (
                  <Select
                    value={targetCartId}
                    onValueChange={setTargetCartId}
                    disabled={isTransferring}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Выберите корзину">
                        {selectedCartName}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {transferCarts.map((cart) => (
                        <SelectItem key={cart.id} value={cart.id}>
                          {cart.name ?? "Корзина"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}

                <Button
                  variant="tertiary"
                  disabled={
                    !hasSelectedProducts || !targetCartId || isTransferring
                  }
                  onClick={handleTransferProducts}
                >
                  Перенести в корзину
                </Button>

                <Button
                  variant="outline"
                  onClick={handleRemoveSelectedProducts}
                  disabled={!hasSelectedProducts || isTransferring}
                >
                  Удалить
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="1lg:shrink-0 grid gap-y-[12px] md:gap-y-[16px] 1lg:w-[270px] 3xl:w-[300px] p-[16px] md:p-[24px] rounded-[12px] shadow-(--gray-deep-shadow) [&_span]:shrink-0">
          <p className="flex justify-between text-[12px] leading-[18px] md:text-[14px] md:leading-[20px]">
            <span
              className="text-text font-medium overflow-hidden text-ellipsis whitespace-nowrap max-w-[180px] 3xl:max-w-[200px]"
              title={currentCart?.name ?? "Корзина"}
            >
              {currentCart?.name ?? "Корзина"}
            </span>
          </p>
          <p className="flex justify-between text-[12px] leading-[18px] md:text-[14px] md:leading-[20px]">
            <span className="text-neutral-gray">
              Товары ({totalQuantityInCurrentCart})
            </span>
            <span className="font-medium text-text">{totalPriceDisplay}</span>
          </p>
          {/* <p className="flex justify-between text-[12px] leading-[18px] md:text-[14px] md:leading-[20px]">
            <span className="text-neutral-gray">Скидка</span>
            <span className="font-medium text-main-red">—</span>
          </p> */}
          <Separator />
          <p className="flex flex-wrap gap-1 justify-between text-accent-blue font-bold text-[14px] leading-[20px] md:text-[16px] md:leading-[22px]">
            <span>Общая стоимость</span>
            <span>{totalPriceDisplay}</span>
          </p>
          {currentCartTotals.isMultiCurrency ? (
            <p className="text-[12px] leading-[18px] text-neutral-gray">
              Разные валюты
            </p>
          ) : null}
          <Button
            disabled={!canCheckout}
            onClick={() => {
              if (!selectedCartId) return;
              router.push(`/carts/${selectedCartId}/checkout`);
            }}
          >
            Оформить заказ
          </Button>
        </div>
      </div>

      <CartNameDialog
        open={createDialogOpen}
        title="Добавление корзины"
        confirmText="Добавить"
        defaultValue=""
        maxLength={64}
        isPending={createCartMutation.isPending}
        onConfirm={handleCreateCartConfirm}
        onOpenChange={(open) => setCreateDialogOpen(open)}
      />

      <CartNameDialog
        open={renameDialogOpen}
        title="Редактирование корзины"
        confirmText="Сохранить"
        defaultValue={renameCartDefaultValue}
        maxLength={64}
        isPending={updateCartMutation.isPending}
        onConfirm={handleRenameCartConfirm}
        onOpenChange={(open) => {
          setRenameDialogOpen(open);
          if (!open) setRenameCartId(null);
        }}
      />
    </ContentContainer>
  );
}
