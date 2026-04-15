"use client";

import { Printer, Download } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useOrderPdfMutation } from "@cms/sdk/orders/hooks/mutations";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface OrderActionsProps {
  orderId: string;
  orderNumericId?: string | number;
}

export default function OrderActions({
  orderId,
  orderNumericId,
}: OrderActionsProps) {
  const { mutateAsync: downloadPdf, isPending: isDownloading } =
    useOrderPdfMutation();
  const [isOpen, setIsOpen] = useState(false);

  const handlePdfAction = async (action: "download" | "print") => {
    try {
      const pdfBlob = await downloadPdf(orderId);
      const url = window.URL.createObjectURL(pdfBlob);

      if (action === "download") {
        const a = document.createElement("a");
        a.href = url;
        a.download = `order-${orderNumericId || orderId}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } else {
        window.open(url);
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="flex items-center gap-[8px] md:gap-[12px]">
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button className="h-8 px-2" disabled={isDownloading}>
            <Printer className="h-4 w-4" />
            <span className="ml-2">Печать</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-[180px]">
          <DropdownMenuItem
            onClick={() => handlePdfAction("download")}
            disabled={isDownloading}
            className="cursor-pointer flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Скачать PDF
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => handlePdfAction("print")}
            disabled={isDownloading}
            className="cursor-pointer flex items-center gap-2"
          >
            <Printer className="h-4 w-4" />
            Открыть для печати
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
