import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { PropsWithChildren } from "react";
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

function OrderStatusNotification() {
  return (
    <li className="flex items-start gap-x-[8px] md:gap-x-[12px] pb-[12px] border-b border-neutral-gray-deep">
      <div className="shrink-0 aspect-square mt-[7px] md:mt-[8px] w-[6px] md:md-[8px] rounded-full bg-main-red"></div>
      <div className="space-y-[6px]">
        <h2 className="font-medium text-[12px] leading-[18px] md:text-[14px] md:leading-[20px] text-text">
          Заканчивается срок хранения заказа 009
        </h2>
        <p className="text-text text-[10px] leading-[12px]">
          Заберите его в пункте выдачи СДЭК до 13 февраля включительно, потом
          заказ придется отменить. Вход в пункт выдачи только в маске и
          перчатках.
        </p>
        <p className="text-neutral-gray text-[10px] leading-[100%]">
          8 февраля
        </p>
      </div>
    </li>
  );
}

function OrderStatusNotificationsList({ children }: PropsWithChildren) {
  return (
    <div className="md:relative">
      <button className="md:absolute md:top-[-43px] md:right-0 pb-[20px] text-[12px] leading-[14px] md:text-[14px] md:leading-[20px] text-main-red hover:underline active:opacity-60 cursor-pointer">
        Отметить все прочитанными
      </button>
      <ul className="space-y-[12px]">{children}</ul>
    </div>
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
              Уведомления
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <PageTitle>Уведомления</PageTitle>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">
            Все <Badge variant="countTwo">25</Badge>
          </TabsTrigger>
          <TabsTrigger value="orders">
            Заказы <Badge variant="countTwo">15</Badge>
          </TabsTrigger>
          <TabsTrigger value="promotions">
            Акции <Badge variant="countTwo">125</Badge>
          </TabsTrigger>
        </TabsList>
        <TabsContent value="all">
          <OrderStatusNotificationsList>
            <OrderStatusNotification />
            <OrderStatusNotification />
            <OrderStatusNotification />
          </OrderStatusNotificationsList>
        </TabsContent>
        <TabsContent value="orders">
          <OrderStatusNotificationsList>
            <OrderStatusNotification />
          </OrderStatusNotificationsList>
        </TabsContent>
        <TabsContent value="promotions">
          <OrderStatusNotificationsList>
            <OrderStatusNotification />
            <OrderStatusNotification />
            <OrderStatusNotification />
            <OrderStatusNotification />
          </OrderStatusNotificationsList>
        </TabsContent>
      </Tabs>
    </ContentContainer>
  );
}
