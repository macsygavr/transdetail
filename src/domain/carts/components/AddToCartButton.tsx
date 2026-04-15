"use client";

import { useCallback, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { MinusIcon, PlusIcon, Trash2 } from "lucide-react";
import {
  Group,
  Input,
  Label,
  NumberField,
  Button as RAButton,
} from "react-aria-components";
import { useCompany } from "@/domain/companies/hooks/use-current-company";
import { cn } from "@/lib/utils";
import {
  useCartCreateMutation,
  useRemoveCartItemsMutation,
  useSetCurrentCartMutation,
  useUpsertCartItemsMutation,
} from "@cms/sdk/carts/hooks/mutations";
import {
  useCartQueryOptions,
  useCurrentCartQueryOptions,
} from "@cms/sdk/carts/hooks/queries";
import { Product } from "@cms/sdk/products/entities";
import { useProductPrice } from "@/domain/products/hooks/use-product-price";
import { useDebounceCallback } from "usehooks-ts";

export type AddToCartButtonProps = Omit<
  React.ComponentProps<typeof Button>,
  "onClick"
> & {
  product: Product;
  cartId?: string;
  /**
   * When true, any attempt to remove the item (set quantity to 0) requires confirmation.
   * Defaults to false to preserve existing behavior.
   */
  confirmOnRemove?: boolean;
};

export default function AddToCartButton(props: AddToCartButtonProps) {
  const company = useCompany();

  const { inStock, price, warehouse } = useProductPrice(props.product);

  const currentCartQuery = useQuery(
    useCurrentCartQueryOptions({
      params: {
        company_id: props.cartId ? null : company.companyId,
        expand: ["product"],
      },
      queryOptions: {
        staleTime: Infinity,
      },
    })
  );

  const cartId = props.cartId ?? currentCartQuery.data?.id ?? null;

  const cartQuery = useQuery(
    useCartQueryOptions({
      params: {
        id: props.cartId!,
        fetchParams: {
          expand: ["product"],
        },
      },
      queryOptions: {
        enabled: !!props.cartId,
      },
    })
  );

  const cart = props.cartId ? cartQuery.data : currentCartQuery.data;

  const cartItem = useMemo(() => {
    return cart?.items.find((item) => item.product_id === props.product.id);
  }, [cart?.items, props.product.id]);

  const handleNotify = async () => {
    // TODO: implement me
  };

  if (!price) {
    return (
      <Button
        disabled
        variant="secondary"
        className={cn("col-start-2 col-span-1", props.className)}
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
        }}
      >
        В корзину
      </Button>
    );
  }

  if (!inStock || !warehouse) {
    return (
      <Button
        disabled
        className={cn("col-start-2 col-span-1", props.className)}
        variant="tertiary"
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          handleNotify();
        }}
      >
        Нет в наличии
      </Button>
    );
  }

  return (
    <InternalAddToCartButton
      key={`${cartId}-${cartItem?.product_id}`}
      initialQuantity={cartItem?.quantity ?? null}
      {...props}
      cartId={cartId}
      warehouseId={warehouse?.id}
    />
  );
}

type InternalAddToCartButtonProps = Omit<
  React.ComponentProps<typeof Button>,
  "onClick"
> & {
  product: Product;
  warehouseId: string;
  cartId: string | null;
  confirmOnRemove?: boolean;
  initialQuantity: number | null;
};

function InternalAddToCartButton({
  product,
  warehouseId,
  cartId,
  initialQuantity,
  confirmOnRemove = false,
  disabled,
  children,
  ...buttonProps
}: InternalAddToCartButtonProps) {
  const company = useCompany();

  const createCartMutation = useCartCreateMutation({});
  const setCurrentCartMutation = useSetCurrentCartMutation();
  const upsertCartItemMutation = useUpsertCartItemsMutation();
  const removeCartItemMutation = useRemoveCartItemsMutation();

  const [quantity, setQuantity] = useState<number | null>(initialQuantity);
  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false);

  const sync = useCallback(
    async (
      cartId: string,
      product: Product,
      warehouseId: string,
      quantity: number
    ) => {
      if (!cartId) {
        return;
      }

      if (quantity && quantity > 0) {
        await upsertCartItemMutation.mutateAsync({
          cart_id: cartId,
          items: [
            {
              product_id: product.id,
              warehouse_id: warehouseId,
              quantity: quantity,
            },
          ],
        });
      } else {
        await removeCartItemMutation.mutateAsync({
          cart_id: cartId,
          items: [
            {
              product_id: product.id,
              warehouse_id: warehouseId,
            },
          ],
        });
      }
    },
    [upsertCartItemMutation, removeCartItemMutation]
  );

  const debouncedSync = useDebounceCallback(sync, 500);

  const handleAdd = async () => {
    if (!cartId) {
      try {
        const companyId = company.companyId;
        const result = await createCartMutation.mutateAsync({
          company_id: companyId ?? undefined,
          name: "Корзина",
        });

        if (companyId) {
          await setCurrentCartMutation.mutateAsync({
            company_id: companyId,
            cart_id: result.id,
          });
        }

        await upsertCartItemMutation.mutateAsync({
          cart_id: result.id,
          items: [
            {
              product_id: product.id,
              warehouse_id: warehouseId,
              quantity: 1,
            },
          ],
        });
      } catch (error) {}
    } else {
      setQuantity(1);
      debouncedSync(cartId, product, warehouseId, 1);
    }
  };

  const handleChange = (next: number) => {
    if (!cartId) {
      return;
    }

    const current = quantity ?? 0;

    // Confirm only when transitioning from >0 to 0 (removal intent).
    if (confirmOnRemove && next === 0 && current > 0) {
      setIsRemoveDialogOpen(true);
      return;
    }

    setQuantity(next);
    debouncedSync(cartId, product, warehouseId, next);
  };

  const handleRemove = () => {
    if (!cartId) {
      return;
    }

    setIsRemoveDialogOpen(false);
    setQuantity(0);
    debouncedSync(cartId, product, warehouseId, 0);
  };

  return quantity && quantity > 0 ? (
    <>
      <ProductCounter
        value={quantity}
        onChange={handleChange}
        disabled={disabled || isRemoveDialogOpen}
      />

      <AlertDialog
        open={isRemoveDialogOpen}
        onOpenChange={(open) => {
          setIsRemoveDialogOpen(open);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить товар из корзины?</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsRemoveDialogOpen(false);
              }}
            >
              Отмена
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleRemove();
              }}
            >
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  ) : (
    <Button
      variant="secondary"
      {...buttonProps}
      className={cn("col-start-2 col-span-1", buttonProps.className)}
      disabled={disabled || !product}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        handleAdd();
      }}
    >
      {children ?? "В корзину"}
    </Button>
  );
}

type ProductCounterProps = {
  value: number;
  onChange: (val: number) => void;
  disabled?: boolean;
};

const ProductCounter = ({ value, onChange, disabled }: ProductCounterProps) => {
  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="icon"
        disabled={disabled}
        className="h-8.5 md:h-10 w-8 md:w-10 px-0"
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          onChange(0);
        }}
      >
        <Trash2 className="size-4" />
        <span className="sr-only">Удалить</span>
      </Button>

      <NumberField
        defaultValue={1}
        minValue={0}
        value={value}
        isDisabled={disabled}
        onChange={onChange}
        className={"w-[140px]"}
      >
        <Label className="flex items-center gap-2 text-sm leading-none font-medium select-none sr-only">
          Числовое поле с кнопками плюс и минус
        </Label>
        <Group className="relative flex items-center justify-between overflow-hidden h-8.5 md:h-10 w-full text-xs md:text-sm whitespace-nowrap bg-transparent outline-none border border-neutral-gray-deep rounded-md transition-[color,box-shadow] data-disabled:pointer-events-none data-disabled:cursor-not-allowed data-disabled:opacity-50 data-focus-within:border-accent-blue data-focus-within:accent-blue/50 data-focus-within:has-aria-invalid:ring-main-red/20 dark:data-focus-within:has-aria-invalid:ring-main-red/40 data-focus-within:has-aria-invalid:border-main-red">
          <RAButton
            slot="decrement"
            className="flex items-center justify-center aspect-square shrink-0 h-full w-5 md:w-7 -ms-px text-sm text-muted-foreground hover:text-foreground transition-[color,box-shadow] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
            }}
          >
            <MinusIcon />
            <span className="sr-only">Decrement</span>
          </RAButton>
          <Input
            className="w-full text-center text-xs md:text-sm font-medium tabular-nums outline-none"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
            }}
          />
          <RAButton
            slot="increment"
            className="flex items-center justify-center aspect-square h-full w-5 md:w-7 -me-px text-sm text-muted-foreground hover:text-foreground transition-[color,box-shadow] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
            }}
          >
            <PlusIcon />
            <span className="sr-only">Increment</span>
          </RAButton>
        </Group>
      </NumberField>
    </>
  );
};
