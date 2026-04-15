import ContentContainer from "@/components/ContentContainer/ContentContainer";
import NewDetailsBanner from "@/components/NewDetailsBanner";
import PageTitle from "@/components/PageTitle/PageTitle";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
            <BreadcrumbPage className="text-neutral-gray">
              Поиск трансмиссии по марке
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <PageTitle>Поиск трансмиссии по марке</PageTitle>

      <form
        action="GET"
        className="md:flex p-[16px] md:p-[24px] mb-[30px] md:mb-[40px] rounded-[12px] shadow-(--gray-deep-shadow)"
      >
        <div className="grow">
          <p className="mb-[15px] text-text text-[16px] md:text-[20px] font-medium">
            Определить модель АКПП по марке авто
          </p>

          <div className="grid gap-[20px] 2md:grid-cols-2 3xl:grid-cols-3">
            <div className="flex flex-col">
              <p className="mb-[4px] text-[14px]">Выберите марку</p>

              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Марка" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">100</SelectItem>
                  <SelectItem value="dark">200</SelectItem>
                  <SelectItem value="system">300</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col">
              <p className="mb-[4px] text-[14px]">Выберите модель</p>

              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Модель" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">100</SelectItem>
                  <SelectItem value="dark">200</SelectItem>
                  <SelectItem value="system">300</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col">
              <p className="mb-[4px] text-[14px]">Год выпуска</p>

              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Год выпуска" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">100</SelectItem>
                  <SelectItem value="dark">200</SelectItem>
                  <SelectItem value="system">300</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </form>

      <div className="grid gap-y-[40px] md:gap-y-[60px]">
        <div className="grid gap-y-[20px] md:gap-y-[24px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Марка</TableHead>
                <TableHead>Модель</TableHead>
                <TableHead>Год выпуска</TableHead>
                <TableHead>Тип трансмиссии</TableHead>
                <TableHead>Двигатель</TableHead>
                <TableHead>Трансмиссии</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>Acura</TableCell>
                <TableCell>2.2 CL</TableCell>
                <TableCell>96-97</TableCell>
                <TableCell>4 SP FWD</TableCell>
                <TableCell>L4 2.2L</TableCell>
                <TableCell>A6VA</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Acura</TableCell>
                <TableCell>2.2 CL</TableCell>
                <TableCell>96-97</TableCell>
                <TableCell>4 SP FWD</TableCell>
                <TableCell>L4 2.2L</TableCell>
                <TableCell>A6VA</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Acura</TableCell>
                <TableCell>2.2 CL</TableCell>
                <TableCell>96-97</TableCell>
                <TableCell>4 SP FWD</TableCell>
                <TableCell>L4 2.2L</TableCell>
                <TableCell>A6VA</TableCell>
              </TableRow>
            </TableBody>
          </Table>

          <Button variant="tertiary" className="mx-auto">
            Загрузить ещё
          </Button>

          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationLink href="#" isActive>
                  1
                </PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#">2</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#">3</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#">99</PaginationLink>
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>

        <NewDetailsBanner />
      </div>
    </ContentContainer>
  );
}
