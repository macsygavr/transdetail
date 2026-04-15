import ContentContainer from "@/components/ContentContainer/ContentContainer";
import PageTitle from "@/components/PageTitle/PageTitle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";

export default function Page() {
  return (
    <ContentContainer>
      <PageTitle>Контактные данные</PageTitle>

      <div className="grid md:grid-cols-2 2md:grid-cols-[1fr_470px] gap-[20px] 1lg:gap-[30px] text-text">
        <div className="p-[16px] md:p-[24px] bg-base-gray rounded-[10px]">
          <h2 className="mb-[12px] md:mb-[20px] font-medium text-[16px] leading-[100%] md:text-[20px] md:leading-[100%]">
            Консультации и заказ по телефонам
          </h2>

          <div className="flex flex-col 2sm:flex-row md:flex-col 2md:flex-row gap-[32px] md:gap-y-[24px] md:gap-x-[40px] text-[12px] leading-[18px] md:text-[14px] md:leading-[20px]">
            <div className="space-y-[4px] md:space-y-[8px]">
              <h3 className="font-medium">Оптовый отдел</h3>
              <div className="">
                <p>+7 (495) 796-799-6</p>
                <p>+7 (495) 744-722-4</p>
              </div>
              <Button
                asChild
                variant="link"
                size="text"
                className="font-normal"
              >
                <Link href="mailto:info@transdetail.ru">
                  info@transdetail.ru
                </Link>
              </Button>
            </div>

            <div>
              <h3 className="font-medium text-[12px] leading-[18px] md:text-[14px] md:leading-[20px]">
                График работы
              </h3>
              <div>
                <p>В будни с 09:00 до 19:00 </p>
                <p>Суббота с10:00 до 15:00</p>
              </div>
            </div>
          </div>
        </div>

        <form className="flex flex-col gap-y-[12px] md:gap-y-[20px] p-[16px] md:p-[24px] rounded-[10px] border border-neutral-gray-deep">
          <h2 className="mb-[12px] md:mb-[20px] text-text font-medium text-[16px] leading-[100%] md:text-[20px] md:leading-[100%]">
            Форма обратной связи
          </h2>

          <label>
            <Label>Имя</Label>
            <Input type="text"></Input>
          </label>
          <label>
            <Label>Фамилия</Label>
            <Input type="text"></Input>
          </label>
          <label>
            <Label>Электронная почта</Label>
            <Input type="email" />
          </label>
          <label>
            <Label>Текст сообщения</Label>
            <Textarea />
          </label>

          <p className="text-[10px] leading-[100%] md:text-[12px] md:leading-[14px] text-neutral-gray">
            Нажимая кнопку, я соглашаюсь с{" "}
            <Link className="text-main-red" href="/">
              политикой конфиденциальности
            </Link>{" "}
            и даю своё согласие на обработку моих персональных данных
          </p>

          <Button
            className="self-end text-[12px] leading-[100%] md:text-[14px] md:leading-[16px] bg-main-red"
            type="submit"
          >
            Отправить
          </Button>
        </form>
      </div>
    </ContentContainer>
  );
}
