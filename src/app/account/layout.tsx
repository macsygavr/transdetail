"use client";

import ContentContainer from "@/components/ContentContainer/ContentContainer";
import PageTitle from "@/components/PageTitle/PageTitle";
import { AccountSidebar } from "@/components/account/AccountSidebar";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { VisuallyHidden } from "@/components/ui/visually-hidden";
import { throttle } from "lodash";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

function getPageTitle(pathname: string) {
  // switch (pathname) {
  //   case ACCOUNT_PAGE.PERSONAL_INFO:
  //     return "Личная информация";
  //   case ACCOUNT_PAGE.COMPANIES:
  //     return "Мои компании";
  //   case ACCOUNT_PAGE.COMPANY_ID:
  //     return "Моя компания";
  //   case ACCOUNT_PAGE.ADD_COMPANY:
  //     return "Добавить компанию";
  //   case ACCOUNT_PAGE.FAVOURITES:
  //     return "Избранное";
  //   case ACCOUNT_PAGE.ORDERS:
  //     return "Заказы";
  //   case ACCOUNT_PAGE.ORDER_ID:
  //     return "Заказ №1001 от 6 февраля";
  //   case ACCOUNT_PAGE.MUTUAL_SETTLEMENTS:
  //     return "Взаиморасчёты";
  //   case ACCOUNT_PAGE.NOTIFICATIONS:
  //     return "Уведомления";
  //   case ACCOUNT_PAGE.REFUNDS:
  //     return "Мои возвраты";
  //   case ACCOUNT_PAGE.REFUND_ID:
  //     return "Возврат №1001 от 6 февраля";
  //   case ACCOUNT_PAGE.PURCHASED:
  //     return "Купленные товары";
  //   case ACCOUNT_PAGE.SETTINGS:
  //     return "Настройки";
  //   default:
  //     return "";
  // }

  void pathname;

  return "";
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const [isMobileWidth, setIsMobileWidth] = useState(true);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const pathname = usePathname();

  const pageTitle = getPageTitle(pathname);

  useEffect(() => {
    const handleResize = throttle(() => {
      if (window.innerWidth >= 1240 && isMobileWidth) {
        setIsMobileWidth(false);
      }

      if (window.innerWidth < 1240 && !isMobileWidth) {
        setIsMobileWidth(true);
      }
    });

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => {
      handleResize.cancel();
      window.removeEventListener("resize", handleResize);
    };
  }, [isMobileWidth]);

  return (
    <ContentContainer>
      <PageTitle>{pageTitle}</PageTitle>

      {isMobileWidth ? (
        <>
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                className="1lg:hidden gap-x-[6px] md:gap-x-[8px] p-[9px] md:p-[9px] mb-[20px]"
                onClick={() => setIsSheetOpen(true)}
              >
                <span className="flex flex-col justify-around w-[16px] h-[16px] md:w-[18px] md:h-[18px] [&_span]:h-[1px] [&_span]:bg-main-red [&_span]:rounded-[1px]">
                  <span></span>
                  <span></span>
                  <span></span>
                </span>
                <span>Меню</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <VisuallyHidden>
                <SheetTitle>Меню</SheetTitle>
              </VisuallyHidden>
              <AccountSidebar onMenuItemClick={() => setIsSheetOpen(false)} />
            </SheetContent>
          </Sheet>

          <div className="relative flex">
            <div className="grow">{children}</div>
          </div>
        </>
      ) : (
        <div className="relative flex items-start">
          <AccountSidebar />
          <div className="grow">{children}</div>
        </div>
      )}
    </ContentContainer>
  );
}
