"use client";

import * as React from "react";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { Circle } from "lucide-react";

import { cn } from "@/lib/utils";

const RadioGroup = React.forwardRef<
  React.ComponentRef<typeof RadioGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>
>(({ className, ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Root
      className={cn(
        "grid gap-[6px] [&_label]:flex [&_label]:flex-row [&_label]:items-center [&_label]:gap-[6px]",
        className
      )}
      {...props}
      ref={ref}
    />
  );
});
RadioGroup.displayName = RadioGroupPrimitive.Root.displayName;

const RadioGroupItem = React.forwardRef<
  React.ComponentRef<typeof RadioGroupPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>
>(({ className, ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Item
      ref={ref}
      className={cn(
        `
          size-[14px]

          bg-white
          border
          border-neutral-gray-deep
          rounded-full

          cursor-pointer

          hover:border-neutral-gray

          focus:outline-none
          focus:border-focus-blue
          focus-visible:border-focus-blue

          disabled:cursor-not-allowed
          disabled:bg-neutral-gray-light

          group
        `,
        className
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
        <Circle
          className={`
          size-[6px]
          fill-main-red
          stroke-main-red
          group-disabled:fill-[#FFD8D0]
          group-disabled:stroke-[#FFD8D0]
        `}
        />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  );
});
RadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName;

export { RadioGroup, RadioGroupItem };
