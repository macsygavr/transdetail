import DataHeader from "@/components/DataHeader/DataHeader";
import DataItem from "@/components/DataItem/DataItem";
import Separator from "@/components/Separator/Separator";

export default function Page() {
  return (
    <div className="flex flex-col gap-y-[20px] md:gap-y-[30px]">
      <div className="flex flex-col gap-y-[16px] p-[16px] md:p-[24px] bg-(--color-base-gray) rounded-[12px]">
        <div className="grid items-start gap-y-[16px] 3sm:grid-cols-[250px_250px] gap-x-[20px] md:gap-x-[60px]">
          <div className="grid gap-y-[4px] md:gap-y-[12px]">
            <DataHeader text="Менеджер" />
            <DataItem label="ФИО" text="Дебров Владимир Алексеевич" />
          </div>

          <div className="grid items-start gap-y-[4px] md:gap-y-[12px]">
            <DataHeader text="Информация о возврате" />
            <div>
              <DataItem
                label="Статус"
                text={<span className="text-main-red">Закрыт</span>}
              />
              <DataItem label="Дата возврата" text="17.02.2022" />
            </div>
          </div>
        </div>

        <Separator />

        <div className="grid gap-y-[16px] 3sm:grid-cols-[250px_250px] gap-x-[20px] md:gap-x-[60px]">
          <div className="grid gap-y-[4px] md:gap-y-[12px] 3sm:w-full">
            <DataHeader text="Получатель" />
            <DataItem label="ФИО" text="Дебров Владимир Алексеевич" />
          </div>

          <div className="grid gap-y-[4px] md:gap-y-[12px]">
            <DataHeader text="Контактные данные" />
            <div>
              <DataItem label="Телефон" text="+7 900 100-22-23" />
              <DataItem label="Электронные почта" text="debrov@gmail.com" />
            </div>
          </div>
        </div>
      </div>

      {/* <OrderStructure /> */}
    </div>
  );
}
