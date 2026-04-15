"use client";

import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableCellUpdateAndDelete,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import ContactPersonDialog, {
  type ContactPersonDraft,
} from "@/domain/companies/components/ContactPersonDialog";
import { useCompany } from "@/domain/companies/hooks/use-current-company";
import Link from "next/link";
import * as React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import PageTitle from "@/components/PageTitle/PageTitle";
import ContentContainer from "@/components/ContentContainer/ContentContainer";
import { Identity } from "@cms/sdk/auth/entities";
import {
  useUserUpdateMutation,
  useIdentityCreateMutation,
  useIdentityDeleteMutation,
  useUserChangePasswordMutation,
} from "@cms/sdk/auth/hooks/mutations";
import {
  useIdentitiesListQueryOptions,
  useWhoAmIQueryOptions,
} from "@cms/sdk/auth/hooks/queries";
import { ContactPerson } from "@cms/sdk/companies/entities";
import {
  useContactPersonCreateMutation,
  useContactPersonDeleteMutation,
  useContactPersonUpdateMutation,
} from "@cms/sdk/companies/hooks/mutations";
import { useContactPersonsListQueryOptions } from "@cms/sdk/companies/hooks/queries";

function FormHeader({ children }: { children: string }) {
  return (
    <h2 className="text-[16px] md:text-[20px] leading-[100%] md:leading-[23px] font-medium">
      {children}
    </h2>
  );
}

function formatFullName(p: {
  last_name?: string | null;
  first_name?: string | null;
  middle_name?: string | null;
}) {
  return [p.last_name, p.first_name, p.middle_name].filter(Boolean).join(" ");
}

type IdentityType = "email" | "phone";

function normalizeIdentity(type: IdentityType, raw: string) {
  if (type === "phone") {
    let v = raw;
    if (!v.startsWith("+")) v = "+" + v.replace(/\+/g, "");
    v = "+" + v.slice(1).replace(/\D/g, "");
    return v;
  }
  return raw.trim();
}

function validateIdentity(type: IdentityType, v: string) {
  if (!v.trim()) return "Значение обязательно";
  if (type === "email" && !v.includes("@")) return "Email должен содержать '@'";
  if (type === "phone" && !/^\+\d+$/.test(v))
    return "Телефон должен быть в формате +79991234567";
  return null;
}

function IdentityAddDialog({
  open,
  onOpenChange,
  type,
  isPending,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: IdentityType;
  isPending: boolean;
  onConfirm: (normalizedIdentifier: string) => Promise<void>;
}) {
  const [identifier, setIdentifier] = React.useState<string>("");
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!open) return;
    setIdentifier("");
    setError(null);
  }, [open, type]);

  const submit = async () => {
    const normalized = normalizeIdentity(type, identifier);
    const err = validateIdentity(type, normalized);
    if (err) {
      setError(err);
      return;
    }

    setError(null);
    try {
      await onConfirm(normalized);
      onOpenChange(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Не удалось добавить");
    }
  };

  return (
    <Dialog modal={true} open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {type === "phone" ? "Добавить телефон" : "Добавить email"}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-2">
          <label>
            <Label>{type === "phone" ? "Телефон (+7...)" : "Email"}</Label>
            <Input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              disabled={isPending}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  submit().catch(() => {
                    // errors are handled in submit
                  });
                }
              }}
            />
          </label>
          {error && <p className="text-main-red text-[12px]">{error}</p>}
        </div>

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Отмена
          </Button>
          <Button type="button" onClick={submit} disabled={isPending}>
            Добавить
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function PersonalDataForm({
  userId,
  initial,
}: {
  userId: string;
  initial: {
    first_name: string;
    last_name: string;
    middle_name?: string | null;
  };
}) {
  const queryClient = useQueryClient();
  const updateUserMutation = useUserUpdateMutation();
  const [form, setForm] = React.useState(() => ({
    first_name: initial.first_name,
    last_name: initial.last_name,
    middle_name: initial.middle_name ?? "",
  }));
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    setForm({
      first_name: initial.first_name,
      last_name: initial.last_name,
      middle_name: initial.middle_name ?? "",
    });
  }, [initial.first_name, initial.last_name, initial.middle_name]);

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setError(null);
        try {
          await updateUserMutation.mutateAsync({
            id: userId,
            first_name: form.first_name,
            last_name: form.last_name,
            middle_name: form.middle_name ? form.middle_name : undefined,
          });
          // whoami has a different query key than users/*
          await queryClient.invalidateQueries({ queryKey: ["auth", "whoami"] });
          toast.success("Персональные данные сохранены");
        } catch (e) {
          setError(e instanceof Error ? e.message : "Не удалось сохранить");
          toast.error("Ошибка сохранения данных", {});
        }
      }}
      className="
      [&_label]:flex [&_label]:flex-col [&_label]:gap-y-[6px]
      [&_input]:text-[12px] md:[&_input]:text-[14px]
      flex flex-col gap-y-[12px] md:gap-y-[20px]
      p-[16px] md:p-[24px] text-text
      border border-neutral-gray-deep rounded-[10px]
    "
    >
      <FormHeader>Персональные данные</FormHeader>
      <label>
        <Label>Фамилия</Label>
        <Input
          type="text"
          value={form.last_name}
          onChange={(e) =>
            setForm((s) => ({ ...s, last_name: e.target.value }))
          }
        />
      </label>
      <label>
        <Label>Имя</Label>
        <Input
          type="text"
          value={form.first_name}
          onChange={(e) =>
            setForm((s) => ({ ...s, first_name: e.target.value }))
          }
        />
      </label>
      <label>
        <Label>Отчество</Label>
        <Input
          type="text"
          value={form.middle_name}
          onChange={(e) =>
            setForm((s) => ({ ...s, middle_name: e.target.value }))
          }
        />
      </label>
      {error && <p className="text-main-red text-[12px]">{error}</p>}
      <Button
        type="submit"
        className="self-end"
        disabled={updateUserMutation.isPending}
      >
        Сохранить
      </Button>
    </form>
  );
}

function IdentitiesManager({ userId }: { userId: string }) {
  const identitiesQuery = useQuery(
    useIdentitiesListQueryOptions({
      params: {
        userId,
      },
    })
  );
  const identities = identitiesQuery.data?.items ?? [];

  const createMutation = useIdentityCreateMutation();
  const deleteMutation = useIdentityDeleteMutation();

  const [addType, setAddType] = React.useState<IdentityType | null>(null);
  const [deleteIdentity, setDeleteIdentity] = React.useState<Identity | null>(
    null
  );

  return (
    <div
      className="
      [&_label]:flex [&_label]:flex-col [&_label]:gap-y-[6px]
      md:col-span-2 overflow-x-auto
      flex flex-col gap-y-[12px] md:gap-y-[20px]
      p-[16px] md:p-[24px] text-text
      border border-neutral-gray-deep rounded-[10px]
    "
    >
      <FormHeader>Телефон и почта (идентификаторы)</FormHeader>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Тип</TableHead>
            <TableHead>Значение</TableHead>
            {/* <TableHead>По умолчанию</TableHead> */}
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {identities.map((i) => {
            return (
              <TableRow key={i.id}>
                <TableCell>{i.provider}</TableCell>
                <TableCell>{i.identifier}</TableCell>
                {/* <TableCell>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      updateMutation.mutate({
                        userId,
                        identityId: i.id,
                        data: {
                          metadata: { ...i.metadata, is_default: !isDefault },
                        },
                      })
                    }
                    disabled={updateMutation.isPending}
                  >
                    {isDefault ? "Да" : "Нет"}
                  </Button>
                </TableCell> */}
                <TableCell className="flex justify-end">
                  <Button
                    type="button"
                    variant="link"
                    size={"text"}
                    onClick={() => setDeleteIdentity(i)}
                    disabled={deleteMutation.isPending}
                  >
                    Удалить
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
          {identities.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} className="text-neutral-gray">
                Нет телефонов/почты
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <div className="flex flex-col gap-2">
        <div className="flex gap-2">
          <Button
            type="button"
            variant={addType === "phone" ? "primary" : "outline"}
            onClick={() => setAddType("phone")}
          >
            Добавить телефон
          </Button>
          <Button
            type="button"
            variant={addType === "email" ? "primary" : "outline"}
            onClick={() => setAddType("email")}
          >
            Добавить email
          </Button>
        </div>
      </div>

      {addType && (
        <IdentityAddDialog
          open={true}
          onOpenChange={(open) => {
            if (!open) setAddType(null);
          }}
          type={addType}
          isPending={createMutation.isPending}
          onConfirm={async (normalizedIdentifier) => {
            try {
              await createMutation.mutateAsync({
                userId: userId,
                provider: addType,
                identifier: normalizedIdentifier,
                user_id: userId,
                metadata: {},
              });

              toast.success(
                `${addType === "email" ? "Email" : "Телефон"} успешно добавлен`
              );
            } catch (e) {
              toast.error("Произошла ошибка при добавлении");
              throw e;
            }
          }}
        />
      )}

      <AlertDialog
        open={!!deleteIdentity}
        onOpenChange={(open) => {
          if (!open) setDeleteIdentity(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить идентификатор</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteIdentity
                ? `${deleteIdentity.provider}: ${deleteIdentity.identifier}`
                : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>
              Отмена
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={deleteMutation.isPending}
              onClick={() => {
                if (!deleteIdentity) return;

                deleteMutation.mutate(
                  {
                    userId: userId,
                    identityId: deleteIdentity.id,
                  },
                  {
                    onSuccess: () => {
                      toast.success("Идентификатор удален");
                      setDeleteIdentity(null);
                    },
                    onError: () => {
                      toast.error("Не удалось удалить идентификатор");
                    },
                  }
                );
              }}
            >
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function ChangePasswordForm({
  userId,
  onSuccess,
}: {
  userId: string;
  onSuccess: () => void;
}) {
  const mutation = useUserChangePasswordMutation();
  const [oldPassword, setOldPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [repeatPassword, setRepeatPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [showOldPassword, setShowOldPassword] = React.useState(false);
  const [showNewPassword, setShowNewPassword] = React.useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = React.useState(false);
  const [oldPasswordError, setOldPasswordError] = React.useState<string | null>(
    null
  );
  const [repeatPasswordError, setRepeatPasswordError] = React.useState<
    string | null
  >(null);

  const validatePasswordMatch = (repeatValue: string) => {
    if (newPassword !== repeatValue) {
      setRepeatPasswordError("Пароли не совпадают");
    } else {
      setRepeatPasswordError(null);
    }
  };

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setError(null);
        setOldPasswordError(null);
        if (newPassword !== repeatPassword) {
          setError("Пароли не совпадают");
          toast.error("Пароли не совпадают");
          return;
        }
        try {
          await mutation.mutateAsync({
            userId: userId,
            old_password: oldPassword || undefined,
            new_password: newPassword,
          });
          setOldPassword("");
          setNewPassword("");
          setRepeatPassword("");
          toast.success("Пароль успешно изменен");
          onSuccess();
        } catch (e) {
          console.error(e);

          const errorMessage = e instanceof Error ? e.message : String(e);

          if (errorMessage.includes("old password")) {
            setOldPasswordError("Неверный старый пароль");
          } else if (errorMessage.includes("Failed to change password")) {
            toast.warning("Ошибка смены пароля");
          } else {
            toast.warning(errorMessage || "Ошибка смены пароля");
          }
        }
      }}
      className="
      [&_label]:flex [&_label]:flex-col [&_label]:gap-y-[6px]
      [&_input]:text-[12px] md:[&_input]:text-[14px]
      flex flex-col gap-y-[12px] md:gap-y-[20px]
      p-[16px] md:p-[24px] text-text
      border border-neutral-gray-deep rounded-[10px]
    "
    >
      <FormHeader>Изменить пароль</FormHeader>
      <label>
        <Label>Старый пароль</Label>
        <div style={{ position: "relative" }}>
          <Input
            type={showOldPassword ? "text" : "password"}
            value={oldPassword}
            onChange={(e) => {
              setOldPassword(e.target.value);
              setOldPasswordError(null);
            }}
            style={{ paddingRight: "40px" }}
            className={oldPasswordError ? "border-red-500" : ""}
          />
          <button
            type="button"
            onClick={() => setShowOldPassword(!showOldPassword)}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center p-1"
            aria-label={showOldPassword ? "Скрыть пароль" : "Показать пароль"}
          >
            {showOldPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
        {oldPasswordError && (
          <p className="text-main-red text-[12px] mt-1">{oldPasswordError}</p>
        )}
      </label>
      <label>
        <Label>Новый пароль</Label>
        <div style={{ position: "relative" }}>
          <Input
            type={showNewPassword ? "text" : "password"}
            value={newPassword}
            onChange={(e) => {
              setNewPassword(e.target.value);
              setRepeatPasswordError(null);
            }}
            style={{ paddingRight: "40px" }}
          />
          <button
            type="button"
            onClick={() => setShowNewPassword(!showNewPassword)}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center p-1"
            aria-label={showNewPassword ? "Скрыть пароль" : "Показать пароль"}
          >
            {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
      </label>
      <label>
        <Label>Еще раз</Label>
        <div style={{ position: "relative" }}>
          <Input
            type={showRepeatPassword ? "text" : "password"}
            value={repeatPassword}
            onChange={(e) => {
              const value = e.target.value;
              setRepeatPassword(value);
              validatePasswordMatch(value);
            }}
            className={repeatPasswordError ? "border-red-500" : ""}
            style={{ paddingRight: "40px" }}
          />
          <button
            type="button"
            onClick={() => setShowRepeatPassword(!showRepeatPassword)}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center p-1"
            aria-label={
              showRepeatPassword ? "Скрыть пароль" : "Показать пароль"
            }
          >
            {showRepeatPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
        {repeatPasswordError && (
          <p className="text-main-red text-[12px] mt-1">
            {repeatPasswordError}
          </p>
        )}
      </label>
      <Button type="submit" className="self-end" disabled={mutation.isPending}>
        Обновить пароль
      </Button>
    </form>
  );
}

function ContactPersonsSection({ companyId }: { companyId: string }) {
  const queryClient = useQueryClient();
  const contactPersonsQuery = useQuery(
    useContactPersonsListQueryOptions({
      params: {
        companyId,
      },
    })
  );
  const items = contactPersonsQuery.data?.items ?? [];

  const createMutation = useContactPersonCreateMutation({
    params: {
      companyId: companyId,
    },
  });
  const deleteMutation = useContactPersonDeleteMutation({
    params: {
      companyId: companyId,
    },
  });

  const updateMutation = useContactPersonUpdateMutation();

  const [upsert, setUpsert] = React.useState<
    null | { mode: "add" } | { mode: "edit"; person: ContactPerson }
  >(null);

  const [deletePerson, setDeletePerson] = React.useState<ContactPerson | null>(
    null
  );

  const isUpsertOpen = upsert !== null;
  const upsertInitialDraft: ContactPersonDraft =
    upsert?.mode === "edit"
      ? {
          last_name: upsert.person.last_name ?? "",
          first_name: upsert.person.first_name ?? "",
          middle_name: upsert.person.middle_name ?? "",
          phone: upsert.person.phone ?? "",
          city: upsert.person.city ?? "",
          inn: upsert.person.inn ?? "",
          passport: upsert.person.passport ?? "",
          shipping_option_id: upsert.person.shipping_option_id ?? "",
          payment_option_id: upsert.person.payment_option_id ?? "",
        }
      : {
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

  return (
    <div
      className="
      [&_label]:flex [&_label]:flex-col [&_label]:gap-y-[6px]
      md:col-span-2 overflow-x-auto
      flex flex-col gap-y-[12px] md:gap-y-[20px]
      p-[16px] md:p-[24px] text-text
      border border-neutral-gray-deep rounded-[10px]
    "
    >
      <FormHeader>Контактные лица</FormHeader>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ФИО</TableHead>
            <TableHead>Телефон</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((p) => (
            <TableRow key={p.id}>
              <TableCell>
                {formatFullName({
                  last_name: p.last_name,
                  first_name: p.first_name,
                  middle_name: p.middle_name,
                })}
              </TableCell>
              <TableCell>{p.phone ?? ""}</TableCell>
              <TableCellUpdateAndDelete
                onUpdate={() => setUpsert({ mode: "edit", person: p })}
                onDelete={() => setDeletePerson(p)}
              />
            </TableRow>
          ))}
          {items.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} className="text-neutral-gray">
                Нет контактных лиц
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <div className="flex justify-end gap-2">
        <Button
          type="button"
          className="self-end"
          onClick={() => setUpsert({ mode: "add" })}
        >
          Добавить
        </Button>
      </div>

      <ContactPersonDialog
        open={isUpsertOpen}
        onOpenChange={(open: boolean) => {
          if (!open) setUpsert(null);
        }}
        title={
          upsert?.mode === "edit"
            ? "Редактировать контактное лицо"
            : "Добавить контактное лицо"
        }
        initialDraft={upsertInitialDraft}
        isPending={createMutation.isPending || updateMutation.isPending}
        onSave={async (draft: ContactPersonDraft) => {
          const payload = {
            last_name: draft.last_name || undefined,
            first_name: draft.first_name,
            middle_name: draft.middle_name || undefined,
            phone: draft.phone || undefined,
            city: draft.city,
            inn: draft.inn || undefined,
            passport: draft.passport || undefined,
            shipping_option_id: draft.shipping_option_id || undefined,
            payment_option_id: draft.payment_option_id || undefined,
          };

          try {
            if (upsert?.mode === "add") {
              await createMutation.mutateAsync(payload);
              toast.success("Контактное лицо создано");
              return;
            }
            if (upsert?.mode === "edit") {
              await updateMutation.mutateAsync({
                company_id: companyId,
                contact_person_id: upsert.person.id,
                data: payload,
              });
              await queryClient.invalidateQueries({
                queryKey: ["companies", companyId, "contact-persons"],
              });
              toast.success("Контактное лицо обновлено");
            }
          } catch (e) {
            toast.error("Не удалось сохранить контактное лицо");
            throw e;
          }
        }}
      />

      <AlertDialog
        open={!!deletePerson}
        onOpenChange={(open) => {
          if (!open) setDeletePerson(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить контактное лицо</AlertDialogTitle>
            <AlertDialogDescription>
              {deletePerson
                ? formatFullName({
                    last_name: deletePerson.last_name,
                    first_name: deletePerson.first_name,
                    middle_name: deletePerson.middle_name,
                  })
                : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>
              Отмена
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={deleteMutation.isPending}
              onClick={() => {
                if (!deletePerson) return;
                deleteMutation.mutate(deletePerson.id);
                setDeletePerson(null);
              }}
            >
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function ContactPersonsSectionPlaceholder() {
  return (
    <div
      className="
      md:col-span-2 overflow-x-auto
      flex flex-col gap-y-[12px] md:gap-y-[20px]
      p-[16px] md:p-[24px] text-text
      border border-neutral-gray-deep rounded-[10px]
    "
    >
      <FormHeader>Контактные лица</FormHeader>
      <p className="text-neutral-gray text-[12px]">Компания не выбрана</p>
    </div>
  );
}

function AccountAuthedContent({
  userId,
  whoami,
  companyId,
  onPasswordChanged,
}: {
  userId: string;
  whoami: {
    first_name: string;
    last_name: string;
    middle_name?: string | null;
  };
  companyId: string | null;
  onPasswordChanged: () => void;
}) {
  return (
    <>
      <PersonalDataForm
        userId={userId}
        initial={{
          first_name: whoami.first_name,
          last_name: whoami.last_name,
          middle_name: whoami.middle_name,
        }}
      />

      <ChangePasswordForm userId={userId} onSuccess={onPasswordChanged} />

      <IdentitiesManager userId={userId} />

      {companyId ? (
        <ContactPersonsSection companyId={companyId} />
      ) : (
        <ContactPersonsSectionPlaceholder />
      )}
    </>
  );
}

export default function Page() {
  const whoamiQuery = useQuery(useWhoAmIQueryOptions());
  const whoami = whoamiQuery.data;
  const userId = whoami?.id ?? null;

  const company = useCompany();

  return (
    <ContentContainer>
      <Breadcrumb className="mb-4 md:mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/" className="text-[#ef4323] hover:text-[#ef4323]">
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
              Личная информация
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <PageTitle>Личная информация</PageTitle>

      <div className="grid md:grid-cols-2 gap-[12px] md:gap-[20px]">
        {whoamiQuery.isLoading && (
          <div className="md:col-span-2 text-neutral-gray">Загрузка...</div>
        )}

        {whoami === null && !whoamiQuery.isLoading && (
          <div className="md:col-span-2 text-main-red">Не авторизован</div>
        )}

        {whoami && userId && (
          <AccountAuthedContent
            userId={userId}
            whoami={whoami}
            companyId={company.companyId}
            onPasswordChanged={() => {}}
          />
        )}
      </div>
    </ContentContainer>
  );
}
