"use client";

import Link from "next/link";
import PageTitle from "@/components/PageTitle/PageTitle";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export default function RegistrationSuccessPage() {
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
                  href="/auth/login"
                  className="text-[#ef4323] hover:text-[#ef4323]"
                >
                  Личный кабинет
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="text-neutral-gray">
                Заявка на регистрацию
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="flex flex-col gap-y-[16px] md:gap-y-[24px] w-full 3sm:max-w-[360px] md:max-w-[410px] mx-auto px-[16px] py-[24px] md:px-[32px] md:py-[40px] border border-neutral-gray-light shadow-(--gray-deep-shadow) rounded-[12px]">
        <PageTitle className="text-center">Заявка на регистрацию</PageTitle>

        <div className="text-[14px] md:text-[16px] leading-relaxed text-neutral-gray-dark">
          <p>
            Ваша заявка успешно отправлена на рассмотрение. В ближайшее время
            Вам будет направлен ответ с результатом рассмотрения заявки, на
            указанные вами контактные данные. Спасибо!
          </p>
        </div>
      </div>
    </>
  );
}
