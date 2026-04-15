import ContentContainer from "@/components/ContentContainer/ContentContainer";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import Image from "next/image";

export default function NotFound() {
  return (
    <ContentContainer>
      <div className="flex flex-col items-center max-w-[597px] w-full mx-auto">
        <p className="mb-[12px] text-text font-medium text-[16px] leading-[100%] md:text-[20px] md:leading-[23px] text-center">
          К сожалению, мы не смогли найти запрашиваемую страницу.
        </p>

        <Button asChild className="mx-auto mb-[24px] md:mb-[30px]">
          <Link href="/">Главная страница</Link>
        </Button>

        {/* <div className="flex w-full md:max-w-[500px] gap-x-[20px] mb-[24px] md:mb-[40px]">
          <Select>
            <SelectTrigger className="grow">
              <SelectValue placeholder="Выбрать трансмиссию" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Корзина №1">Корзина №1</SelectItem>
              <SelectItem value="Корзина №3">Корзина №3</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="tertiary">Подобрать</Button>
        </div> */}

        <Image
          className="w-full h-auto max-w-[358px] md:max-w-[412px]"
          width={412}
          height={389}
          src="/404-page.svg"
          alt="Робот с сообщением об ошибке"
        />
      </div>
    </ContentContainer>
  );
}
