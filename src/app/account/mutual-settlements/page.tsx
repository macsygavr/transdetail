import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
              Взаиморасчеты
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <PageTitle>Взаиморасчеты</PageTitle>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Тип</TableHead>
            <TableHead>№</TableHead>
            <TableHead>Дата и время</TableHead>
            <TableHead>Сумма</TableHead>
            <TableHead>№ документа</TableHead>
            <TableHead>Документ</TableHead>
            <TableHead>Статус</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>Отгрузка</TableCell>
            <TableCell>1</TableCell>
            <TableCell>17.02.2022 11:19</TableCell>
            <TableCell>5600 &#8381;</TableCell>
            <TableCell>
              <span className="text-main-red">№ 576 от 17 февраля</span>
            </TableCell>
            <TableCell>
              <span className="text-main-red">УПД</span>
            </TableCell>
            <TableCell>
              <Badge>Завершена</Badge>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Отгрузка</TableCell>
            <TableCell>1</TableCell>
            <TableCell>17.02.2022 11:19</TableCell>
            <TableCell>5600 &#8381;</TableCell>
            <TableCell>
              <span className="text-main-red">№ 576 от 17 февраля</span>
            </TableCell>
            <TableCell>
              <span className="text-main-red">Счёт на оплату</span>
            </TableCell>
            <TableCell>
              <Badge>Оплачен</Badge>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </ContentContainer>
  );
}
