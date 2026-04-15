import Link from "next/link";
import { Phone } from "lucide-react";
import { cookies } from "next/headers";
import { QueryClient } from "@tanstack/react-query";

import { useMenusListQueryOptions } from "@cms/sdk/menus/hooks/queries";

import { createServerCMSClientOptions } from "@/lib/cms-client-options";

import ContentContainer from "./ContentContainer/ContentContainer";
import FooterMenus from "./FooterMenus";

export default async function Footer() {
  const cookieStore = await cookies();
  const requestCookies = cookieStore.toString();
  const client = new QueryClient();
  const clientOptions = createServerCMSClientOptions(requestCookies);

  const menusList = await client.fetchQuery(
    useMenusListQueryOptions({
      clientOptions,
      params: {
        include_inactive: false,
      },
    })
  );

  const footerMenus = menusList.items
    .filter((menu) => menu.position === "footer" && menu.is_active)
    .map((menu) => ({
      ...menu,
      items: menu.items.filter((item) => item.is_active),
    }))
    .sort((left, right) => left.sort_order - right.sort_order);

  return (
    <footer className="mt-auto mb-15.25 md:mb-0 text-white text-[12px] md:text-[14px]">
      {/* <div className="border-b border-[#FFFFFF33] bg-[#333C48]">
        <ContentContainer>
          <div className="flex items-center justify-between 3sm:justify-center py-[16px] gap-x-[16px] md:gap-x-[20px]">
            <p>Заказывайте товары круглосуточно и задавайте вопросы.</p>
            <Button className="text-white border-white" variant='outline'>
              Задать вопрос
            </Button>
          </div>
        </ContentContainer>
      </div> */}

      {/* Средний блок */}
      <div className="bg-[#333C48]">
        <ContentContainer>
          <div className="flex flex-col 3sm:flex-row 3sm:gap-x-[80px] py-[22px]">
            <div className="flex items-start shrink-0 gap-x-[4px] md:gap-x-[12px]">
              <Phone className="w-[16px] h-[16px] md:w-[24px] md:h-[24px] mt-[5px] md:mt-[10px]" />

              <div className="flex flex-col mb-[14px]">
                <div className="flex flex-col mb-[5px] font-medium text-[16px] md:text-[24px]">
                  <Link
                    href="tel:84957967996"
                    className="hover:text-main-red focus:text-main-red active:opacity-60"
                  >
                    +7 495 796-79-96
                  </Link>
                  <Link
                    href="tel:84957477224"
                    className="hover:text-main-red focus:text-main-red active:opacity-60"
                  >
                    +7 495 747-72-24
                  </Link>
                </div>

                <Link
                  href="mailto:info@transdetail.ru"
                  className="hover:text-main-red focus:text-main-red active:opacity-60"
                >
                  info@transdetail.ru
                </Link>

                <div className="flex flex-col mb-[12px] text-(--color-neutral-gray)">
                  <p>пн–пт: 9:00–19:00</p>
                  <p>сб: 10:00–15:00</p>
                </div>

                {/* <ul className="flex gap-x-[12px]">
                  <li>
                    <Link href="/" className="cursor-pointer ">
                      <Image
                        className=""
                        src="/icons/vk.svg"
                        alt="VK"
                        width={24}
                        height={24}
                      />
                    </Link>
                  </li>

                  <li>
                    <Link href="/" className="cursor-pointer">
                      <Image
                        src="/icons/fb.svg"
                        alt="Facebook"
                        width={24}
                        height={24}
                      />
                    </Link>
                  </li>

                  <li>
                    <Link href="/" className="cursor-pointer">
                      <Image
                        src="/icons/x.svg"
                        alt="X"
                        width={24}
                        height={24}
                      />
                    </Link>
                  </li>

                  <li>
                    <Link href="/" className="cursor-pointer">
                      <Image
                        src="/icons/g+.svg"
                        alt="G+"
                        width={24}
                        height={24}
                      />
                    </Link>
                  </li>
                </ul> */}
              </div>
            </div>

            <FooterMenus menus={footerMenus} />
          </div>
        </ContentContainer>
      </div>

      {/* Нижний бар */}
      <div className="text-[8px] md:text-[12px] text-[#FFFFFF80] bg-[#282C34]">
        <ContentContainer>
          <div className="flex justify-between items-center gap-x-[40px] py-[8px]">
            <p className="text-neutral-gray">
              © Интернет-магазин ООО &#171;Трансдетейл&#187; — запчасти для
              АКПП.
            </p>

            <Link
              href="/"
              className="hover:text-main-red focus:text-main-red active:opacity-60"
            >
              Политика обработки персональных данных
            </Link>
          </div>
        </ContentContainer>
      </div>
    </footer>
  );
}
