"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useContactPersonCreateMutation } from "@cms/sdk/companies/hooks/mutations";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useShippingOptionsListQueryOptions } from "@cms/sdk/shipping-options/hooks/queries";
import { useI18N } from "@/i18n/hooks/useLocale";
import { useQuery } from "@tanstack/react-query";

export type ContactPersonDraft = {
  last_name: string;
  first_name: string;
  middle_name: string;
  phone: string;
  city: string;
  inn: string;
  passport: string;
  shipping_option_id: string;
  payment_option_id: string;
};

type ContactPersonDialogProps = {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  title?: string;
  initialDraft?: ContactPersonDraft;
  isPending?: boolean;
  onSave?: (draft: ContactPersonDraft) => Promise<void>;
  onCreated?: (id: string) => void;
  companyId?: string;
  triggerLabel?: React.ReactNode;
};

const EMPTY_DRAFT: ContactPersonDraft = {
  last_name: "",
  first_name: "",
  middle_name: "",
  phone: "",
  city: "",
  inn: "",
  passport: "",
  shipping_option_id: "",
  payment_option_id: "",
};

const formatPhoneNumber = (value: string) => {
  const digits = value.replace(/\D/g, "");

  if (digits.length === 0) return "";
  if (digits.length <= 1) return "+7";
  if (digits.length <= 4) return `+7 (${digits.slice(1)}`;
  if (digits.length <= 7)
    return `+7 (${digits.slice(1, 4)}) ${digits.slice(4)}`;
  if (digits.length <= 9)
    return `+7 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  return `+7 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7, 9)}-${digits.slice(9, 11)}`;
};

const filterNameInput = (value: string) => {
  return value.replace(/[^A-Za-zА-Яа-яЁё\s-]/g, "");
};

const filterCityInput = (value: string) => {
  return value.replace(/[^A-Za-zА-Яа-яЁё\s-]/g, "");
};

export default function ContactPersonDialog(props: ContactPersonDialogProps) {
  const isControlled = props.open !== undefined;

  const [internalOpen, setInternalOpen] = React.useState(false);
  const open = isControlled ? props.open : internalOpen;

  const handleOpenChange = (newOpen: boolean) => {
    if (isControlled && props.onOpenChange) {
      props.onOpenChange(newOpen);
    } else {
      setInternalOpen(newOpen);
    }
  };

  const title = props.title ?? "Добавить";
  const initialDraft = props.initialDraft ?? EMPTY_DRAFT;
  const createMutation = useContactPersonCreateMutation({
    params: {
      companyId: props.companyId ?? "",
    },
  });
  const isPending = props.isPending ?? createMutation.isPending;

  const [draft, setDraft] = React.useState<ContactPersonDraft>(initialDraft);
  const [error, setError] = React.useState<string | null>(null);
  const shippingOptions = useQuery(useShippingOptionsListQueryOptions());
  const { t } = useI18N();

  React.useEffect(() => {
    if (open) {
      setDraft(initialDraft);
      setError(null);
    }
  }, [open, initialDraft]);
  const submit = async () => {
    setError(null);

    // Валидация
    if (!draft.first_name.trim()) {
      setError("Введите имя");
      return;
    }

    if (!draft.last_name.trim()) {
      setError("Введите фамилию");
      return;
    }

    if (!draft.city.trim()) {
      setError("Укажите город");
      return;
    }

    if (!draft.phone.trim()) {
      setError("Введите номер телефона");
      return;
    }

    const phoneDigits = draft.phone.replace(/\D/g, "");
    if (phoneDigits.length !== 11) {
      setError("Неправильно введен номер телефона");
      return;
    }

    const hasInn = draft.inn.trim().length > 0;
    const hasPassport = draft.passport.trim().length > 0;

    if (!hasInn && !hasPassport) {
      setError("Необходимо заполнить либо ИНН, либо Паспортные данные");
      return;
    }

    if (hasInn) {
      const innDigits = draft.inn.replace(/\D/g, "");
      if (innDigits.length !== 10 && innDigits.length !== 12) {
        setError("ИНН должен содержать 10 или 12 цифр");
        return;
      }
    }

    if (hasPassport) {
      const passportDigits = draft.passport.replace(/\D/g, "");
      if (passportDigits.length !== 10) {
        setError("Паспортные данные должны содержать 10 цифр");
        return;
      }
    }

    try {
      if (props.onSave) {
        await props.onSave(draft);
      } else if (props.companyId) {
        const result = await createMutation.mutateAsync({
          first_name: draft.first_name,
          last_name: draft.last_name || undefined,
          middle_name: draft.middle_name || undefined,
          phone: draft.phone || undefined,
          city: draft.city,
          inn: draft.inn || undefined,
          passport: draft.passport || undefined,
          shipping_option_id: draft.shipping_option_id || undefined,
        });
        props.onCreated?.(result.id);
      }
      handleOpenChange(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Не удалось сохранить");
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {!isControlled && (
        <DialogTrigger asChild>
          <button className="w-full py-1.5 pl-1 text-sm text-main-red focus:text-main-red-deep hover:text-main-red-deep cursor-pointer hover:bg-accent focus:bg-accent">
            {props.triggerLabel ?? "+ Добавить контактное лицо"}
          </button>
        </DialogTrigger>
      )}

      <DialogContent>
        <form
          className="grid gap-y-5"
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
        >
          <DialogTitle className="text-3xl font-medium text-center">
            {title}
          </DialogTitle>

          <div>
            <Label>Фамилия</Label>
            <Input
              value={draft.last_name}
              onChange={(e) => {
                const filtered = filterNameInput(e.target.value);
                setDraft((s) => ({ ...s, last_name: filtered }));
              }}
              placeholder="Ваша фамилия"
              type="text"
              disabled={isPending}
              className={error?.includes("Фамилия") ? "border-main-red" : ""}
            />
            {error?.includes("Фамилия") && (
              <p className="text-[10px] leading-[12px] md:text-[12px] md:leading-[14px] text-main-red mt-1">
                {error}
              </p>
            )}
          </div>
          <div>
            <Label>Имя</Label>
            <Input
              value={draft.first_name}
              onChange={(e) => {
                const filtered = filterNameInput(e.target.value);
                setDraft((s) => ({ ...s, first_name: filtered }));
              }}
              placeholder="Ваше имя"
              type="text"
              disabled={isPending}
              className={error?.includes("Имя") ? "border-main-red" : ""}
            />
            {error?.includes("Имя") && (
              <p className="text-[10px] leading-[12px] md:text-[12px] md:leading-[14px] text-main-red mt-1">
                {error}
              </p>
            )}
          </div>
          <div>
            <Label>Отчество</Label>
            <Input
              value={draft.middle_name}
              onChange={(e) => {
                const filtered = filterNameInput(e.target.value);
                setDraft((s) => ({ ...s, middle_name: filtered }));
              }}
              placeholder="Ваше отчество"
              type="text"
              disabled={isPending}
            />
          </div>
          <div>
            <Label>Телефон</Label>
            <Input
              value={draft.phone}
              onChange={(e) => {
                const formatted = formatPhoneNumber(e.target.value);
                setDraft((s) => ({ ...s, phone: formatted }));
              }}
              placeholder="+7"
              type="tel"
              disabled={isPending}
              className={error?.includes("телефон") ? "border-main-red" : ""}
            />
            {error?.includes("телефон") && (
              <p className="text-[10px] leading-[12px] md:text-[12px] md:leading-[14px] text-main-red mt-1">
                {error}
              </p>
            )}
          </div>

          <div>
            <Label>Город *</Label>
            <Input
              value={draft.city}
              onChange={(e) => {
                const filtered = filterCityInput(e.target.value);
                setDraft((s) => ({ ...s, city: filtered }));
              }}
              placeholder="Ваш город"
              type="text"
              disabled={isPending}
              className={error?.includes("Город") ? "border-main-red" : ""}
            />
            {error?.includes("Город") && (
              <p className="text-[10px] leading-[12px] md:text-[12px] md:leading-[14px] text-main-red mt-1">
                {error}
              </p>
            )}
          </div>

          <div>
            <Label>ИНН</Label>
            <Input
              value={draft.inn}
              onChange={(e) => {
                const onlyDigits = e.target.value
                  .replace(/\D/g, "")
                  .slice(0, 12);
                setDraft((s) => ({ ...s, inn: onlyDigits }));
              }}
              placeholder="ИНН"
              type="text"
              maxLength={12}
              disabled={isPending}
              className={error?.includes("ИНН") ? "border-main-red" : ""}
            />
            {error?.includes("ИНН") && (
              <p className="text-[10px] leading-[12px] md:text-[12px] md:leading-[14px] text-main-red mt-1">
                {error}
              </p>
            )}
          </div>

          <div>
            <Label>Паспортные данные</Label>
            <Input
              value={draft.passport}
              onChange={(e) => {
                const onlyDigits = e.target.value
                  .replace(/\D/g, "")
                  .slice(0, 10);
                let formatted = onlyDigits;
                if (onlyDigits.length > 4) {
                  formatted =
                    onlyDigits.slice(0, 4) + " " + onlyDigits.slice(4);
                }
                setDraft((s) => ({ ...s, passport: formatted }));
              }}
              placeholder="Серия и номер (10 цифр)"
              type="text"
              maxLength={11}
              disabled={isPending}
              className={error?.includes("Паспорт") ? "border-main-red" : ""}
            />
            {error?.includes("Паспорт") && (
              <p className="text-[10px] leading-[12px] md:text-[12px] md:leading-[14px] text-main-red mt-1">
                {error}
              </p>
            )}
          </div>

          <div>
            <Label>Способ доставки</Label>
            <Select
              value={draft.shipping_option_id}
              onValueChange={(val) =>
                setDraft((s) => ({ ...s, shipping_option_id: val }))
              }
              disabled={isPending}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Выберите доставку" />
              </SelectTrigger>
              <SelectContent>
                {(shippingOptions.data?.items ?? []).map((option) => (
                  <SelectItem key={option.id} value={String(option.id)}>
                    {t(option.name)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* <div>
            <Label>Способ оплаты</Label>
            <Select
              value={draft.payment_option_id}
              onValueChange={(val) =>
                setDraft((s) => ({ ...s, payment_option_id: val }))
              }
              disabled={isPending}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Выберите оплату" />
              </SelectTrigger>
              <SelectContent>
                {(paymentOptions.data?.items ?? []).map((option) => (
                  <SelectItem key={option.id} value={String(option.id)}>
                    {t(option.name)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div> */}

          {error && <p className="text-main-red text-[12px]">{error}</p>}

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isPending}
            >
              Отменить
            </Button>
            <Button type="submit" disabled={isPending}>
              Сохранить
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
