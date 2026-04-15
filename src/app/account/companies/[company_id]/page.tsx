"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import Link from "next/link";
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
import { Lock, Loader2 } from "lucide-react";
import { useParams } from "next/navigation";
import { useCompanyQueryOptions } from "@cms/sdk/companies/hooks/queries";
import { useQuery } from "@tanstack/react-query";

export default function Page() {
  const params = useParams();
  const companyId = params?.company_id as string;
  const { data: company, isLoading } = useQuery(
    useCompanyQueryOptions({
      params: {
        id: companyId,
      },
    })
  );

  if (isLoading) {
    return (
      <ContentContainer>
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-[#ef4323]" />
        </div>
      </ContentContainer>
    );
  }

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
            <BreadcrumbLink asChild>
              <Link
                href="/account/companies"
                className="text-[#ef4323] hover:text-[#ef4323]"
              >
                Мои компании
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="text-neutral-gray">
              Данные компании
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <PageTitle>Данные компании</PageTitle>

      <form
        className="
        [&_label]:flex [&_label]:flex-col [&_label]:gap-y-[6px]
        [&_input]:text-[12px] md:[&_input]:text-[14px] text-[12px] md:text-[14px]
        flex flex-col gap-y-[12px] md:gap-y-[20px]
        p-[16px] md:p-[24px] text-(--color-text)
        border border-neutral-gray-deep rounded-[10px]
      "
      >
        <div className="pb-[20px] md:pb-[24px] border-b border-[#F1F1F2]">
          <div className="relative">
            <Label>
              <span>Название</span>
              <Input type="text" value={company?.name || ""} readOnly />
            </Label>
            <Lock className="absolute bottom-3 right-2 size-3.5" />
          </div>
        </div>

        <div className="pb-[20px] md:pb-[24px] border-b border-[#F1F1F2]">
          <p className="mb-[14px] md:mb-[20px] font-medium leading-[18px] md:leading-[18px]">
            Форма
          </p>

          <RadioGroup defaultValue={company?.form || "legal_entity"}>
            <div className="relative">
              <Label className="flex items-center space-x-2 cursor-not-allowed">
                <RadioGroupItem
                  value="individual"
                  disabled
                  checked={company?.form === "individual"}
                />
                <span>Физическое лицо</span>
              </Label>
            </div>
            <div className="relative">
              <Label className="flex items-center space-x-2 cursor-not-allowed">
                <RadioGroupItem
                  value="legal_entity"
                  disabled
                  checked={company?.form === "legal_entity"}
                />
                <span>Юридическое лицо</span>
              </Label>
            </div>
          </RadioGroup>
        </div>

        <div>
          <p className="mb-[14px] md:mb-[20px] font-medium leading-[18px] md:leading-[18px]">
            Реквизиты
          </p>

          <div className="grid 3sm:grid-cols-2 gap-[12px] md:gap-[20px]">
            <div className="relative">
              <Label>
                <span>ИНН</span>
                <Input type="text" value={company?.inn || ""} readOnly />
              </Label>
              <Lock className="absolute bottom-3 right-2 size-3.5" />
            </div>

            <div className="relative">
              <Label>
                <span>КПП</span>
                <Input type="text" value={company?.kpp || ""} readOnly />
              </Label>
              <Lock className="absolute bottom-3 right-2 size-3.5" />
            </div>

            <div className="relative">
              <Label>
                <span>ОГРН</span>
                <Input type="text" value={company?.ogrn || ""} readOnly />
              </Label>
              <Lock className="absolute bottom-3 right-2 size-3.5" />
            </div>

            <div className="relative">
              <Label>
                <span>Адрес</span>
                <Input type="text" value={company?.address || ""} readOnly />
              </Label>
              <Lock className="absolute bottom-3 right-2 size-3.5" />
            </div>
          </div>
        </div>
      </form>
    </ContentContainer>
  );
}
