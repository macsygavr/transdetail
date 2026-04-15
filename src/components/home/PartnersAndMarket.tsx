import Image from "next/image";
import ContentContainer from "@/components/ContentContainer/ContentContainer";

export function PartnersAndMarket() {
  return (
    <div className="py-[40px] md:py-[60px] mt-[40px] mb-[-80px] md:mt-[60px] md:mb-[-100px] bg-(--color-base-gray)">
      <ContentContainer>
        <div className="mb-[40px] md:mb-[60px]">
          <h3 className="mb-[16px] md:mb-[20px] text-[20px] md:text-[30px] font-medium">
            Партнеры
          </h3>
          <ul className="flex flex-wrap gap-[12px] md:gap-[20px]">
            <li>
              <Image
                className="w-[140px] h-[60px] md:w-[176px] md:h-[84px] mix-blend-darken"
                src="/partners/sonnax.png"
                width={176}
                height={84}
                alt="Sonnax"
              />
            </li>
            <li>
              <Image
                className="w-[140px] h-[60px] md:w-[176px] md:h-[84px] mix-blend-darken"
                src="/partners/bosch.png"
                width={176}
                height={84}
                alt="Bosch"
              />
            </li>
            <li>
              <Image
                className="w-[140px] h-[60px] md:w-[176px] md:h-[84px] mix-blend-darken"
                src="/partners/brembo.png"
                width={176}
                height={84}
                alt="Brembo"
              />
            </li>
            <li>
              <Image
                className="w-[140px] h-[60px] md:w-[176px] md:h-[84px] mix-blend-darken"
                src="/partners/castrol.png"
                width={176}
                height={84}
                alt="Castrol"
              />
            </li>
            <li>
              <Image
                className="w-[140px] h-[60px] md:w-[176px] md:h-[84px] mix-blend-darken"
                src="/partners/aisin.png"
                width={176}
                height={84}
                alt="Aisin"
              />
            </li>
          </ul>
        </div>

        <div>
          <h3 className="mb-[16px] md:mb-[20px] text-[20px] md:text-[30px] font-medium">
            О магазине
          </h3>

          <div className="p-[16px] md:p-[24px] text-[12px] md:text-[14px] border-1 border-[#EBEBEB] rounded-[12px] bg-white">
            <p className="mb-4">
              Наша Компания занимает лидирующее положение на российском рынке с
              1998 года. Имея огромный опыт в сфере продаж запасных частей для
              автоматических трансмиссий, мы поставляем продукцию, напрямую от
              производителей, минуя посредников. Это позволяет предложить Вам
              товары по более выгодной цене.
            </p>
            <p className="mb-4">
              В каталогах нашего интернет-магазина Вы можете найти запасные
              части и ремонтные комплекты для автоматических трансмиссий только
              наилучшего качества. Для того чтобы полностью соответствовать
              ожиданиям клиентов, Мы развиваем активную маркетинговую B2C
              политику, нацеленную на конечного потребителя. Главная задача –
              создать максимально комфортные условия продажи и доставки запасных
              частей. Мы следим за новинками автомобильного рынка, поставляя
              актуальную продукцию для автоматических трансмиссий европейского,
              американского и азиатского производства.
            </p>
            <p>Преимущества Нашей компании:</p>
            <ul className="list-disc pl-5 mb-4">
              <li>Специальная ценовая политика для наших клиентов</li>
              <li>Поставка оборудования под заказ</li>
              <li>Поставка запасных частей в кратчайшие сроки</li>
            </ul>
            <p>
              Мы открыты для сотрудничества со всеми партнёрами, занятыми в
              сфере ремонта автоматических трансмиссий. Сегодня Наша компания
              позволяет обеспечить поставки запчастей любых объемов.
            </p>
            <p>Наши правила — стабильность, оперативность, надежность.</p>
          </div>
        </div>
      </ContentContainer>
    </div>
  );
}
