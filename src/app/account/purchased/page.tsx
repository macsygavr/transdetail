import Sorting from "@/components/Sorting/Sorting";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
} from "@/components/ui/pagination";

export default function Page() {
  return (
    <div className="flex flex-col gap-y-[12px] md:gap-y-[20px]">
      <Sorting />

      <div className="grid gap-y-[20px] md:gap-y-[24px]">
        <ul className="grid gap-y-[8px]">
          {/* <PurchasedProductRow /> <PurchasedProductRow /> */}
          <span className="text-red text-6xl">Purchased Products</span>
        </ul>

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
    </div>
  );
}
