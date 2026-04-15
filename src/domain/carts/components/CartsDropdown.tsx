"use client";

import { useMemo, useState } from "react";
import { Check, Edit2Icon, Plus, ShoppingCart } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

import CartNameDialog from "@/domain/carts/components/CartNameDialog";
import Link from "next/link";
import { useCompany } from "@/domain/companies/hooks/use-current-company";
import { useQuery } from "@tanstack/react-query";
import { useWhoAmIQueryOptions } from "@cms/sdk/auth/hooks/queries";
import {
  useCartCreateMutation,
  useSetCurrentCartMutation,
  useCartUpdateMutation,
} from "@cms/sdk/carts/hooks/mutations";
import {
  useCartsListQueryOptions,
  useCurrentCartQueryOptions,
} from "@cms/sdk/carts/hooks/queries";
import { pickDisplayPrice } from "@/domain/products/hooks/use-product-price";
import { cn } from "@/lib/utils";

export default function CartsDropdown() {
  const { data: user } = useQuery(useWhoAmIQueryOptions());
  const company = useCompany();

  const cartsListQuery = useQuery(
    useCartsListQueryOptions({
      queryOptions: {
        enabled: !!user,
        staleTime: Infinity,
      },
    })
  );

  const createCartMutation = useCartCreateMutation({});
  const setCurrentCartMutation = useSetCurrentCartMutation();

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [hoverCardOpen, setHoverCardOpen] = useState(false);

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

  const currentCartQuery = useQuery(
    useCurrentCartQueryOptions({
      params: {
        company_id: user ? company.companyId : null,
        expand: ["product"],
      },
      queryOptions: {
        staleTime: Infinity,
      },
    })
  );

  const selectedCartId = currentCartQuery.data?.id ?? null;

  const updateSelectedCartMutation = useCartUpdateMutation({});

  const totalQuantityInSelectedCart = useMemo(() => {
    return (
      currentCartQuery.data?.items?.reduce(
        (sum, item) => sum + (item.quantity ?? 0),
        0
      ) ?? 0
    );
  }, [currentCartQuery.data?.items]);

  const sumDisplay = useMemo(() => {
    return currentCartQuery.data?.items?.reduce((sum, item) => {
      const price = pickDisplayPrice(
        item.product?.prices,
        company.companyQuery.data?.price_type_id
      );

      return sum + (price?.price ?? 0) * item.quantity;
    }, 0);
  }, [company.companyQuery.data?.price_type_id, currentCartQuery.data?.items]);

  async function handleCreateCartConfirm(name: string) {
    if (createCartMutation.isPending) return;

    try {
      const companyId = company.companyId;
      const created = await createCartMutation.mutateAsync({
        company_id: companyId ?? undefined,
        name,
      });

      if (companyId) {
        await setCurrentCartMutation.mutateAsync({
          company_id: companyId,
          cart_id: created.id,
        });
      }

      setCreateDialogOpen(false);
    } catch {
      // silent fail (requested)
    }
  }

  async function handleRenameCartConfirm(name: string) {
    if (!selectedCartId) return;
    if (updateSelectedCartMutation.isPending) return;

    try {
      await updateSelectedCartMutation.mutateAsync({
        cart_id: selectedCartId,
        name,
      });
      setRenameDialogOpen(false);
    } catch {
      // silent fail (requested)
    }
  }

  async function handleSelectCart(cartId: string) {
    if (!company.companyId || setCurrentCartMutation.isPending) return;

    try {
      await setCurrentCartMutation.mutateAsync({
        company_id: company.companyId,
        cart_id: cartId,
      });
      setHoverCardOpen(false);
    } catch {
      // silent fail (requested)
    }
  }

  if (!user || cartsListQuery.isLoading || cartsListQuery.isError) {
    return (
      <Button
        disabled
        variant="secondary"
        className="relative hidden md:flex md:size-[46px] 1lg:w-auto md:p-0 1lg:p-[9px_20px] justify-center gap-x-[4px]"
      >
        <ShoppingCart className="size-[22px] text-main-red" />
        <span className="hidden 1lg:inline">Корзина</span>
      </Button>
    );
  }

  return (
    <>
      <HoverCard
        open={hoverCardOpen}
        onOpenChange={setHoverCardOpen}
        openDelay={0}
        closeDelay={500}
      >
        <HoverCardTrigger asChild>
          <Link
            href={`/carts`}
            className="relative flex justify-center items-center md:size-[46px] 1lg:w-auto md:p-0 1lg:p-[9px_20px] gap-x-[4px] bg-[#FEF0EF] text-main-red rounded-[8px]"
          >
            <ShoppingCart className="size-[22px] text-main-red" />
            <span className="hidden 1lg:inline">Корзина</span>

            <Badge
              variant="countOne"
              className="absolute top-[-10px] right-[-10px]"
            >
              {totalQuantityInSelectedCart}
            </Badge>
          </Link>
        </HoverCardTrigger>

        <HoverCardContent className="w-[240px] p-0">
          <div className="w-[240px] m-[-4px] flex flex-col gap-y-[10px] px-[20px] pt-[20px] pb-[12px] text-[14px] border-b-1 border-[#E8E8E8]">
            {cartsListQuery.isLoading ? (
              <p className="text-neutral-gray text-[12px]">Загрузка...</p>
            ) : cartsListQuery.isError ? (
              <p className="text-neutral-gray text-[12px]">
                Не удалось загрузить корзины
              </p>
            ) : !currentCartQuery.data ? (
              <p className="text-neutral-gray text-[12px]">
                Корзина не выбрана
              </p>
            ) : (
              <>
                <button
                  type="button"
                  className="group/font font-medium text-left hover:text-accent-blue cursor-pointer active:opacity-60 overflow-hidden text-ellipsis whitespace-nowrap max-w-[200px]"
                  onClick={() => {
                    setHoverCardOpen(false);
                    setTimeout(() => {
                      setRenameDialogOpen(true);
                    }, 25);
                  }}
                  title={currentCartQuery.data.name}
                >
                  {currentCartQuery.data.name}
                  <Edit2Icon
                    height={12}
                    width={12}
                    strokeWidth={3}
                    className="opacity-20 group-hover/font:opacity-100 transition-opacity inline-flex items-center justify-center shrink-0 ml-1"
                  />
                </button>
                <p className="flex flex-wrap gap-x-[8px] text-neutral-gray text-[12px]">
                  <span>Товаров: {totalQuantityInSelectedCart}</span>
                  <span>на сумму: {sumDisplay}</span>
                </p>
              </>
            )}
          </div>

          <div className="flex flex-col gap-y-[10px] px-[20px] pb-[20px] pt-[12px] text-[14px]">
            <p className="text-neutral-gray text-[12px]">Другие корзины</p>

            {carts.length ? (
              carts.map((cart) => (
                <button
                  key={cart.id}
                  type="button"
                  className={cn(
                    "text-left hover:text-main-red cursor-pointer active:opacity-60 flex items-center justify-between",
                    {
                      "text-main-red font-bold": selectedCartId === cart.id,
                    }
                  )}
                  onClick={() => {
                    void handleSelectCart(cart.id);
                  }}
                >
                  <span className="truncate">{cart.name}</span>
                  {selectedCartId === cart.id ? (
                    <Check className="shrink-0 w-[16px] h-[16px] text-main-red" />
                  ) : null}
                </button>
              ))
            ) : (
              <p className="text-neutral-gray text-[12px]">Нет других корзин</p>
            )}

            <button
              type="button"
              onClick={() => {
                setHoverCardOpen(false);
                setTimeout(() => {
                  setCreateDialogOpen(true);
                }, 25);
              }}
              disabled={
                createCartMutation.isPending || setCurrentCartMutation.isPending
              }
              className="flex items-center text-accent-blue cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <Plus strokeWidth={3} className="w-[12px] h-[12px]" />
              <span>Добавить корзину</span>
            </button>
          </div>
        </HoverCardContent>
      </HoverCard>

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
        defaultValue={currentCartQuery.data?.name ?? ""}
        maxLength={64}
        isPending={updateSelectedCartMutation.isPending}
        onConfirm={handleRenameCartConfirm}
        onOpenChange={(open) => setRenameDialogOpen(open)}
      />
    </>
  );
}
