"use client";

import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

const Checkbox = React.forwardRef<
  React.ComponentRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      `
        peer

        shrink-0
        size-[14px]

        bg-white
        border
        border-neutral-gray-deep
        rounded-[2px]

        cursor-pointer

        hover:border-neutral-gray

        focus-visible:outline-none
        focus:border-focus-blue
        focus-visible:border-focus-blue

        disabled:cursor-not-allowed
        disabled:bg-neutral-gray-light
        disabled:data-[state=checked]:text-[#FFD8D0]

        data-[state=checked]:text-main-red
      `,
      className
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator
      className={cn(`
        flex
        items-center
        justify-center
        text-current
      `)}
    >
      <Check className="size-[12px]" />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
));
Checkbox.displayName = CheckboxPrimitive.Root.displayName;

export { Checkbox };
