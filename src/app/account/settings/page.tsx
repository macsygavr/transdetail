import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Info } from "lucide-react";
import Link from "next/link";
import type { PropsWithChildren } from "react";
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

function FormTitle({ children }: PropsWithChildren) {
  return (
    <p className="mb-[12px] md:mb-[20px] text-text font-medium text-[16px] leading-[100%] md:text-[20px] md:leading-[23px]">
      {children}
    </p>
  );
}

export default function Page() {
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
              Настройки
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <PageTitle>Настройки</PageTitle>

      <form
        action=""
        className="md:max-w-[470px] p-[16px] md:p-[24px] space-y-[24px] md:space-y-[40px] border border-neutral-gray-deep rounded-[10px]"
      >
        <div>
          <FormTitle>Уведомления</FormTitle>
          <div className="space-y-[12px] md:space-y-[20px]">
            <div className="space-y-[5px] md:space-y-[6px]">
              <p className="text-[12px] leading-[14px] md:text-[14px] md:leading-[16px]">
                Телефон
              </p>
              <div className="flex items-center gap-x-[12px] md:gap-x-[20px]">
                <Input type="text" className="bg-neutral-gray-light" />
                <Button variant="outline" className="shrink-0">
                  Изменить
                </Button>
              </div>
            </div>
            <div className="space-y-[5px] md:space-y-[6px]">
              <p className="text-[12px] leading-[14px] md:text-[14px] md:leading-[16px]">
                Электронная почта
              </p>
              <div className="flex gap-x-[12px] md:gap-x-[20px]">
                <Input type="text" className="bg-neutral-gray-light" />
                <Button variant="outline" className="shrink-0">
                  Изменить
                </Button>
              </div>
            </div>
            <Label className="flex gap-x-[6px]">
              <Checkbox />
              <span>Уведомления</span>
            </Label>
            <div className="flex gap-x-[7px] p-[16px] bg-base-gray rounded-[10px]">
              <Info className="shrink-0 aspect-square w-[17px] md:w-[20px] text-accent-blue" />
              <p className="text-color-neutral-gray text-[12px] leading-[18px] md:text-[14px] md:leading-[20px]">
                Уведомления о сформированном заказе отключить нельзя. Вы можете
                снять метку в данном разделе{" "}
                <Link href="/" className="font-medium">
                  «Настроки уведомлений»
                </Link>{" "}
                в случае, если не хотите получать уведомления о статусах Вашего
                заказа.
              </p>
            </div>
          </div>
        </div>

        <div>
          <FormTitle>Новинки, акции, специальные предложения</FormTitle>
          <div className="space-y-[12px] md:space-y-[20px]">
            <Label className="flex gap-x-[6px]">
              <Checkbox />
              <span>Push-уведомления</span>
            </Label>
            <Label className="flex gap-x-[6px]">
              <Checkbox />
              <span>E-mail</span>
            </Label>
            <Label className="flex gap-x-[6px]">
              <Checkbox />
              <span>SMS</span>
            </Label>
          </div>
        </div>
      </form>
    </ContentContainer>
  );
}
