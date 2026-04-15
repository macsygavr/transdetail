import * as React from "react";

import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        `
          placeholder:text-neutral-gray
          selection:bg-primary
          selection:text-primary-foreground

          min-w-0 w-full h-[34px] md:h-[40px]
          p-[10px] md:p-[12px]

          text-[12px] leading-[14px] md:text-[14px] md:leading-[16px]

          bg-white outline-none rounded-[6px]
          border
          border-neutral-gray-deep
          hover:border-neutral-gray
          focus:border-focus-blue
          focus-visible:border-focus-blue
          invalid:border-main-red
          disabled:border-neutral-gray-deep
          disabled:bg-neutral-gray-light

          cursor-pointer
          disabled:pointer-events-none
          disabled:cursor-not-allowed

          transition-[color]

          file:inline-flex file:h-7
          file:text-[12px] file:leading-[14px] md:file:text-[14px] md:file:leading-[16px]
          file:font-medium file:text-foreground
          file:border-0 file:bg-transparent
        `,
        className
      )}
      {...props}
    />
  );
}

export { Input };
