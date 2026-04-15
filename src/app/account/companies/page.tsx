"use client";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import PageTitle from "@/components/PageTitle/PageTitle";
import ContentContainer from "@/components/ContentContainer/ContentContainer";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useCompany } from "@/domain/companies/hooks/use-current-company";
import type { User } from "@cms/sdk/auth/entities";
import {
  useIdentitiesListQueryOptions,
  useWhoAmIQueryOptions,
} from "@cms/sdk/auth/hooks/queries";
import { useCompaniesListQueryOptions } from "@cms/sdk/companies/hooks/queries";
import { useCreateRegistrationRequestMutation } from "@cms/sdk/auth/hooks/mutations";
import { CreateRegistrationRequest } from "@cms/sdk/auth/api";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";

const validatedSchema = z
  .object({
    companyForm: z.enum(["individual", "legal_entity"]),
    firstName: z.string().min(1, "Введите имя"),
    lastName: z.string().min(1, "Введите фамилию"),
    middleName: z.string().optional(),
    phone: z
      .string()
      .min(1, "Введите номер телефона")
      .refine((val) => val.replace(/\D/g, "").length >= 11, {
        message: "Неправильно введен номер телефона",
      }),
    email: z.string().min(1, "Введите email").email("Неправильно введен email"),
    city: z.string().optional(),
    activity: z.string().min(1, "Укажите сферу деятельности"),
    inn: z.string().optional(),
    kpp: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.companyForm === "individual") {
      if (!data.city) {
        ctx.addIssue({
          path: ["city"],
          code: z.ZodIssueCode.custom,
          message: "Укажите город",
        });
      }
    }

    if (data.companyForm === "legal_entity") {
      if (!data.inn) {
        ctx.addIssue({
          path: ["inn"],
          code: z.ZodIssueCode.custom,
          message: "Введите ИНН",
        });
      } else if (!/^\d{10}$/.test(data.inn)) {
        ctx.addIssue({
          path: ["inn"],
          code: z.ZodIssueCode.custom,
          message: "ИНН должен содержать 10 цифр",
        });
      }

      if (!data.kpp) {
        ctx.addIssue({
          path: ["kpp"],
          code: z.ZodIssueCode.custom,
          message: "Введите КПП",
        });
      } else if (!/^\d{9}$/.test(data.kpp)) {
        ctx.addIssue({
          path: ["kpp"],
          code: z.ZodIssueCode.custom,
          message: "КПП должен содержать 9 цифр",
        });
      }
    }
  });

type CompanyRegistrationForm = z.infer<typeof validatedSchema>;

const getDefaultFormValues = (
  userData: User | null | undefined,
  email: string,
  phone: string
): CompanyRegistrationForm => ({
  firstName: userData?.first_name || "",
  lastName: userData?.last_name || "",
  middleName: "",
  email: email,
  phone: phone,
  city: "",
  activity: "",
  companyForm: "legal_entity" as const,
  inn: "",
  kpp: "",
});

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

export default function Page() {
  const currentCompany = useCompany();
  const whoAmIQuery = useQuery(useWhoAmIQueryOptions());
  const userId = whoAmIQuery.data?.id;

  const identitiesQuery = useQuery(
    useIdentitiesListQueryOptions({
      params: {
        userId: userId || "",
      },
      queryOptions: {
        enabled: !!userId,
      },
    })
  );

  const userEmail = useMemo(
    () =>
      identitiesQuery.data?.items?.find(
        (identity) => identity.provider === "email"
      )?.identifier || "",
    [identitiesQuery.data?.items]
  );

  const userPhone = useMemo(
    () =>
      identitiesQuery.data?.items?.find(
        (identity) => identity.provider === "phone"
      )?.identifier || "",
    [identitiesQuery.data?.items]
  );

  const defaultValues = useMemo(
    () => getDefaultFormValues(whoAmIQuery.data, userEmail, userPhone),
    [whoAmIQuery.data, userEmail, userPhone]
  );

  const companiesQuery = useQuery(
    useCompaniesListQueryOptions({
      queryOptions: {
        enabled: true,
      },
    })
  );
  const items = companiesQuery.data?.items ?? [];

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  const form = useForm<CompanyRegistrationForm>({
    resolver: zodResolver(validatedSchema),
    defaultValues,
    mode: "onSubmit",
  });

  const { register, handleSubmit, formState, setValue, reset, control, watch } =
    form;

  const companyForm = useWatch({
    control: control,
    name: "companyForm",
  });

  useEffect(() => {
    const newDefaults = getDefaultFormValues(
      whoAmIQuery.data,
      userEmail,
      userPhone
    );
    reset(newDefaults);
  }, [whoAmIQuery.data, userEmail, userPhone, reset]);

  useEffect(() => {
    if (companyForm === "individual") {
      setValue("inn", "");
      setValue("kpp", "");
    }
    if (companyForm === "legal_entity") {
      setValue("city", "");
    }
  }, [companyForm, setValue]);

  const registerCompanyMutation = useCreateRegistrationRequestMutation({
    mutationOptions: {
      onSuccess() {
        toast.success("Заявка на добавление компании успешно отправлена");
        setIsAddDialogOpen(false);
        reset(defaultValues);
        setAddError(null);
      },
      onError(error: Error) {
        setAddError(error.message || "Не удалось отправить заявку");
      },
    },
  });

  async function handleCreateCompany(data: CompanyRegistrationForm) {
    setAddError(null);

    try {
      const cleanDigits = data.phone.replace(/\D/g, "");

      let formattedPhone = cleanDigits;
      if (cleanDigits.startsWith("7")) {
        formattedPhone = "+7" + cleanDigits.slice(1);
      } else if (cleanDigits.length === 10) {
        formattedPhone = "+7" + cleanDigits;
      } else if (cleanDigits.startsWith("+7") && cleanDigits.length === 12) {
        formattedPhone = cleanDigits;
      } else {
        formattedPhone = "+7" + cleanDigits.slice(-10);
      }

      const payload: CreateRegistrationRequest = {
        user_email: data.email.trim(),
        user_phone: formattedPhone,
        user_first_name: data.firstName.trim(),
        user_last_name: data.lastName.trim(),
        user_middle_name: data.middleName?.trim() || null,
        company_legal_form: data.companyForm,
        company_activity: data.activity.trim(),
      };

      if (data.companyForm === "individual") {
        if (data.city) {
          payload.company_city = data.city.trim();
        }
      }

      if (data.companyForm === "legal_entity") {
        if (data.inn) {
          payload.company_inn = data.inn.trim();
        }
        if (data.kpp) {
          payload.company_kpp = data.kpp.trim();
        }
      }

      await registerCompanyMutation.mutateAsync(payload);
    } catch (e) {
      setAddError(
        e instanceof Error ? e.message : "Не удалось отправить заявку"
      );
    }
  }

  const closeDialog = () => {
    setIsAddDialogOpen(false);
    reset(defaultValues);
    setAddError(null);
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      closeDialog();
    }
  };

  return (
    <ContentContainer>
      <Breadcrumb className="mb-4 md:mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/" className="text-main-red hover:text-main-red">
                Главная
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link
                href="/account"
                className="text-main-red hover:text-main-red"
              >
                Личный кабинет
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/account/companies" className="text-neutral-gray">
                Мои компании
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <PageTitle>Мои компании</PageTitle>

      <div className="flex flex-col gap-y-[20px]">
        <Button
          type="button"
          className="self-start"
          onClick={() => setIsAddDialogOpen(true)}
        >
          Добавить компанию
        </Button>

        <div className="[&_label]:flex [&_label]:flex-col [&_label]:gap-y-[6px] md:col-span-2 overflow-x-auto flex flex-col gap-y-[12px] md:gap-y-[20px] text-text">
          {companiesQuery.isLoading ? (
            <div className="text-neutral-gray">Загрузка...</div>
          ) : companiesQuery.isError ? (
            <div className="text-main-red">Не удалось загрузить компании</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Название компании</TableHead>
                  <TableHead>ИНН/КПП</TableHead>
                  <TableHead />
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((company) => {
                  const isCurrent = company.id === currentCompany.companyId;

                  return (
                    <TableRow key={company.id}>
                      <TableCell>{company.name}</TableCell>
                      <TableCell>
                        {company.inn}
                        {company.kpp ? ` / ${company.kpp}` : ""}
                      </TableCell>
                      <TableCell className="text-center">
                        <Link
                          href={`/account/companies/${company.id}`}
                          className="text-accent-blue hover:underline"
                        >
                          Просмотр
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Button
                          type="button"
                          variant="outline"
                          className="ml-auto"
                          onClick={() => {
                            void currentCompany.setCompanyId(company.id);
                          }}
                          disabled={currentCompany.isPending || isCurrent}
                        >
                          {isCurrent
                            ? "Текущая компания"
                            : "Войти под компанией"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {items.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-neutral-gray">
                      Нет компаний
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </div>
      </div>

      {isAddDialogOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={handleOverlayClick}
        >
          <div className="p-0 border border-(--color-neutral-gray-light) bg-white shadow-(--gray-deep-shadow) w-full max-w-[360px] md:max-w-[410px] mx-4 max-h-[90vh] overflow-y-auto">
            <div className="px-[24px] md:px-[32px] py-[24px] md:py-[40px]">
              <div className="mb-6 md:mb-8">
                <h2 className="text-2xl font-semibold text-center">
                  Добавить компанию
                </h2>
              </div>

              <form
                onSubmit={handleSubmit(handleCreateCompany)}
                className="flex flex-col gap-y-[16px] md:gap-y-[20px] [&_label]:flex [&_label]:flex-col [&_label]:gap-y-[6px] text-text"
              >
                <div>
                  <Label htmlFor="firstName">Имя</Label>
                  <Input
                    id="firstName"
                    placeholder="Ваше имя"
                    value={watch("firstName")}
                    onChange={(e) => {
                      const filtered = filterNameInput(e.target.value);
                      setValue("firstName", filtered);
                    }}
                    disabled={registerCompanyMutation.isPending}
                    className={
                      formState.errors.firstName ? "border-main-red" : ""
                    }
                  />
                  {formState.errors.firstName && (
                    <p className="text-[10px] leading-[12px] md:text-[12px] md:leading-[14px] text-main-red mt-1">
                      {formState.errors.firstName.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="lastName">Фамилия</Label>
                  <Input
                    id="lastName"
                    placeholder="Ваша фамилия"
                    value={watch("lastName")}
                    onChange={(e) => {
                      const filtered = filterNameInput(e.target.value);
                      setValue("lastName", filtered);
                    }}
                    disabled={registerCompanyMutation.isPending}
                    className={
                      formState.errors.lastName ? "border-main-red" : ""
                    }
                  />
                  {formState.errors.lastName && (
                    <p className="text-[10px] leading-[12px] md:text-[12px] md:leading-[14px] text-main-red mt-1">
                      {formState.errors.lastName.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="phone">Телефон</Label>
                  <Input
                    id="phone"
                    placeholder="+7"
                    type="tel"
                    value={watch("phone")}
                    onChange={(e) => {
                      const formatted = formatPhoneNumber(e.target.value);
                      setValue("phone", formatted);
                    }}
                    disabled={registerCompanyMutation.isPending}
                    className={formState.errors.phone ? "border-main-red" : ""}
                  />
                  {formState.errors.phone && (
                    <p className="text-[10px] leading-[12px] md:text-[12px] md:leading-[14px] text-main-red mt-1">
                      {formState.errors.phone.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="email">Электронная почта</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Ваша электронная почта"
                    {...register("email")}
                    disabled={registerCompanyMutation.isPending}
                    className={formState.errors.email ? "border-main-red" : ""}
                  />
                  {formState.errors.email && (
                    <p className="text-[10px] leading-[12px] md:text-[12px] md:leading-[14px] text-main-red mt-1">
                      {formState.errors.email.message}
                    </p>
                  )}
                </div>

                <div className="grid gap-[6px]">
                  <span className="text-[12px] md:text-[14px] text-(--color-neutral-gray-dark)">
                    Тип
                  </span>
                  <RadioGroup
                    value={companyForm}
                    onValueChange={(v) =>
                      setValue(
                        "companyForm",
                        v as "individual" | "legal_entity"
                      )
                    }
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="individual" id="type-individual" />
                      <Label htmlFor="type-individual" className="flex-1">
                        Физическое лицо
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem
                        value="legal_entity"
                        id="type-legal-entity"
                      />
                      <Label htmlFor="type-legal-entity" className="flex-1">
                        Юридическое лицо
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {companyForm === "legal_entity" && (
                  <>
                    <div>
                      <Label htmlFor="inn">ИНН</Label>
                      <Input
                        id="inn"
                        placeholder="ИНН"
                        {...register("inn")}
                        onChange={(e) => {
                          const onlyDigits = e.target.value
                            .replace(/\D/g, "")
                            .slice(0, 10);
                          setValue("inn", onlyDigits);
                        }}
                        maxLength={10}
                        disabled={registerCompanyMutation.isPending}
                        className={
                          formState.errors.inn ? "border-main-red" : ""
                        }
                      />
                      {formState.errors.inn && (
                        <p className="text-[10px] leading-[12px] md:text-[12px] md:leading-[14px] text-main-red mt-1">
                          {formState.errors.inn.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="kpp">КПП</Label>
                      <Input
                        id="kpp"
                        placeholder="КПП"
                        {...register("kpp")}
                        onChange={(e) => {
                          const onlyDigits = e.target.value
                            .replace(/\D/g, "")
                            .slice(0, 9);
                          setValue("kpp", onlyDigits);
                        }}
                        maxLength={9}
                        disabled={registerCompanyMutation.isPending}
                        className={
                          formState.errors.kpp ? "border-main-red" : ""
                        }
                      />
                      {formState.errors.kpp && (
                        <p className="text-[10px] leading-[12px] md:text-[12px] md:leading-[14px] text-main-red mt-1">
                          {formState.errors.kpp.message}
                        </p>
                      )}
                    </div>
                  </>
                )}

                {companyForm === "individual" && (
                  <div>
                    <Label htmlFor="city">Город</Label>
                    <Input
                      id="city"
                      placeholder="Ваш город"
                      value={watch("city")}
                      onChange={(e) => {
                        const filtered = filterCityInput(e.target.value);
                        setValue("city", filtered);
                      }}
                      disabled={registerCompanyMutation.isPending}
                      className={formState.errors.city ? "border-main-red" : ""}
                    />
                    {formState.errors.city && (
                      <p className="text-[10px] leading-[12px] md:text-[12px] md:leading-[14px] text-main-red mt-1">
                        {formState.errors.city.message}
                      </p>
                    )}
                  </div>
                )}

                <div>
                  <Label htmlFor="activity">Сфера деятельности</Label>
                  <Input
                    id="activity"
                    placeholder="Сфера деятельности"
                    {...register("activity")}
                    disabled={registerCompanyMutation.isPending}
                    className={
                      formState.errors.activity ? "border-main-red" : ""
                    }
                  />
                  {formState.errors.activity && (
                    <p className="text-[10px] leading-[12px] md:text-[12px] md:leading-[14px] text-main-red mt-1">
                      {formState.errors.activity.message}
                    </p>
                  )}
                </div>

                {addError && (
                  <p className="text-[10px] leading-[12px] md:text-[12px] md:leading-[14px] text-main-red">
                    {addError}
                  </p>
                )}

                <div className="flex flex-col gap-2 pt-4">
                  <Button
                    type="submit"
                    className="bg-main-red hover:bg-main-red-deep w-full"
                    disabled={registerCompanyMutation.isPending}
                  >
                    Добавить компанию
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={closeDialog}
                    disabled={registerCompanyMutation.isPending}
                    className="w-full"
                  >
                    Отмена
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </ContentContainer>
  );
}
