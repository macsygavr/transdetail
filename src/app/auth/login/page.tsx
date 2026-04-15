"use client";

import { useEffect, useState } from "react";
import PageTitle from "@/components/PageTitle/PageTitle";
import Separator from "@/components/Separator/Separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useLoginMutation } from "@cms/sdk/auth/hooks/mutations";
import { useWhoAmIQueryOptions } from "@cms/sdk/auth/hooks/queries";
import { useQuery } from "@tanstack/react-query";

export default function Page() {
  const router = useRouter();
  const user = useQuery(useWhoAmIQueryOptions());

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (user.data && user.isSuccess) {
      router.push("/");
    }
  }, [user.data, user.isSuccess, router]);

  const { mutate, isPending, error } = useLoginMutation({
    mutationOptions: {
      async onSuccess() {
        await user.refetch();
        router.push("/");
      },
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError(null);

    if (!email.trim() || !password) {
      setFormError("Пожалуйста, введите email и пароль.");
      return;
    }

    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
    if (!emailOk) {
      setFormError("Введите корректный адрес электронной почты.");
      return;
    }

    mutate({ identifier: email.trim(), provider: "email", password });
  };

  const disabled = user.isFetching || isPending;

  return (
    <>
      <div className="mb-6 md:mb-8">
        <Breadcrumb>
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
                Вход
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <PageTitle>Вход</PageTitle>
      </div>

      <div className="flex flex-col gap-y-[16px] md:gap-y-[24px] w-full 3sm:max-w-[360px] md:max-w-[410px] mx-auto px-[16px] py-[24px] md:px-[32px] md:py-[40px] border border-neutral-gray-light shadow-(--gray-deep-shadow) rounded-[12px]">
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-y-[16px] md:gap-y-[20px] [&_label]:flex [&_label]:flex-col [&_label]:gap-y-[6px]"
        >
          <Label>
            <span>Электронная почта</span>
            <Input
              placeholder="Ваша электронная почта"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={disabled}
              required
            />
          </Label>

          <Label>
            <span>Пароль</span>
            <Input
              placeholder="Пароль"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={disabled}
              required
            />
          </Label>

          {(formError || error) && (
            <p className="text-[10px] leading-[12px] md:text-[12px] md:leading-[14px] text-red-600">
              {formError || error?.message}
            </p>
          )}

          <Button className="bg-main-red" type="submit" disabled={disabled}>
            {disabled ? "Вход..." : "Войти"}
          </Button>
        </form>

        <Separator />

        <p className="flex flex-col items-center 2sm:flex-row 2sm:justify-center gap-x-[5px] text-[12px] leading-[18px] md:text-[14px] md:leading-[20px]">
          <span>Нет аккаунта?</span>
          <Link
            className="text-main-red hover:text-main-red-deep hover:underline active:opacity-60"
            href="/auth/register"
          >
            Оставьте заявку на регистрацию
          </Link>
        </p>
      </div>
    </>
  );
}
