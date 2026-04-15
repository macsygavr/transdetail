"use client";

import { z } from "zod";
import PageTitle from "@/components/PageTitle/PageTitle";
import Separator from "@/components/Separator/Separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useRouter } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { CreateRegistrationRequest } from "@cms/sdk/auth/api";
import { useCreateRegistrationRequestMutation } from "@cms/sdk/auth/hooks/mutations";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const validatedSchema = z
  .object({
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
    type: z.enum(["individual", "legal_entity"]),
    inn: z.string().optional(),
    kpp: z.string().optional(),
    companyName: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.type === "individual") {
      if (!data.city) {
        ctx.addIssue({
          path: ["city"],
          code: z.ZodIssueCode.custom,
          message: "Укажите город",
        });
      }
    }

    if (data.type === "legal_entity") {
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

type RegistrationForm = z.infer<typeof validatedSchema>;

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
  const router = useRouter();

  const form = useForm<RegistrationForm>({
    resolver: zodResolver(validatedSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      middleName: "",
      phone: "",
      email: "",
      city: "",
      activity: "",
      type: "individual",
      inn: "",
      kpp: "",
      companyName: "",
    },
    mode: "onSubmit",
  });

  const { register, handleSubmit, formState, setValue, watch } = form;
  const type = watch("type");

  const { mutate, isPending, error } = useCreateRegistrationRequestMutation({
    mutationOptions: {
      onSuccess() {
        router.push("/auth/registration-success");
      },
    },
  });

  const onSubmit = (data: RegistrationForm) => {
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
      user_last_name: data.lastName.trim(),
      user_first_name: data.firstName.trim(),
      company_legal_form: data.type,
      company_activity: data.activity.trim(),
    };

    if (data.type === "individual") {
      if (data.city) {
        payload.company_city = data.city.trim();
      }
    }

    if (data.type === "legal_entity") {
      if (data.inn) {
        payload.company_inn = data.inn.trim();
      }
      if (data.kpp) {
        payload.company_kpp = data.kpp.trim();
      }
    }

    mutate(payload);
  };

  return (
    <>
      <div className="mb-6 md:mb-8">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Главная</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Регистрация</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <PageTitle>Регистрация</PageTitle>
      </div>

      <div className="flex flex-col gap-y-[16px] md:gap-y-[24px] w-full 3sm:max-w-[360px] md:max-w-[410px] mx-auto px-[16px] py-[24px] md:px-[32px] md:py-[40px] border border-(--color-neutral-gray-light) shadow-(--gray-deep-shadow) rounded-[12px]">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-y-[16px] md:gap-y-[20px]"
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
              disabled={isPending}
              className={formState.errors.firstName ? "border-main-red" : ""}
            />
            {formState.errors.firstName && (
              <p className="text-main-red text-xs mt-1">
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
              disabled={isPending}
              className={formState.errors.lastName ? "border-main-red" : ""}
            />
            {formState.errors.lastName && (
              <p className="text-main-red text-xs mt-1">
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
              disabled={isPending}
              className={formState.errors.phone ? "border-main-red" : ""}
            />
            {formState.errors.phone && (
              <p className="text-main-red text-xs mt-1">
                {formState.errors.phone.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="email">Электронная почта</Label>
            <Input
              id="email"
              placeholder="Ваша почта"
              type="email"
              {...register("email")}
              disabled={isPending}
              className={formState.errors.email ? "border-main-red" : ""}
            />
            {formState.errors.email && (
              <p className="text-main-red text-xs mt-1">
                {formState.errors.email.message}
              </p>
            )}
          </div>

          <div className="grid gap-[6px]">
            <span className="text-[12px] md:text-[14px] text-(--color-neutral-gray-dark)">
              Тип
            </span>
            <RadioGroup
              value={type}
              onValueChange={(v) =>
                setValue("type", v as "individual" | "legal_entity")
              }
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="individual" id="type-individual" />
                <Label htmlFor="type-individual" className="flex-1">
                  Физическое лицо
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="legal_entity" id="type-legal-entity" />
                <Label htmlFor="type-legal-entity" className="flex-1">
                  Юридическое лицо
                </Label>
              </div>
            </RadioGroup>
          </div>

          {type === "legal_entity" && (
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
                  disabled={isPending}
                  className={formState.errors.inn ? "border-main-red" : ""}
                />
                {formState.errors.inn && (
                  <p className="text-main-red text-xs mt-1">
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
                  disabled={isPending}
                  className={formState.errors.kpp ? "border-main-red" : ""}
                />
                {formState.errors.kpp && (
                  <p className="text-main-red text-xs mt-1">
                    {formState.errors.kpp.message}
                  </p>
                )}
              </div>
            </>
          )}

          {type === "individual" && (
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
                disabled={isPending}
                className={formState.errors.city ? "border-main-red" : ""}
              />
              {formState.errors.city && (
                <p className="text-main-red text-xs mt-1">
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
              disabled={isPending}
              className={formState.errors.activity ? "border-main-red" : ""}
            />
            {formState.errors.activity && (
              <p className="text-main-red text-xs mt-1">
                {formState.errors.activity.message}
              </p>
            )}
          </div>

          {error && <p className="text-main-red text-xs">{error.message}</p>}

          <p className="text-[10px] leading-[12px] md:text-[12px] md:leading-[14px]">
            Регистрируясь, вы соглашаетесь с условиями{" "}
            <Link
              href="/"
              className="text-main-red hover:text-main-red-deep hover:underline active:opacity-60"
            >
              политики обработки персональных данных и пользовательским
              соглашением
            </Link>
          </p>

          <Button className="bg-main-red" type="submit" disabled={isPending}>
            {isPending ? "Отправка..." : "Отправить заявку"}
          </Button>
        </form>

        <Separator />

        <p className="flex flex-col items-center 2sm:flex-row 2sm:justify-center gap-x-[5px] text-[12px] leading-[18px] md:text-[14px] md:leading-[20px]">
          <span>Есть аккаунт?</span>
          <Link
            className="text-main-red hover:text-main-red-deep hover:underline active:opacity-60"
            href="/auth/login"
          >
            Войдите в личный кабинет
          </Link>
        </p>
      </div>
    </>
  );
}
