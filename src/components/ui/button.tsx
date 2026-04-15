import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  `
    shrink-0
    flex
    items-center
    justify-center
    gap-[4px]

    text-[12px] md:text-[14px]
    md:text-[14px] md:leading-[16px]
    font-medium text-center

    rounded-[6px]

    transition-all

    disabled:pointer-events-none
    disabled:opacity-50

    [&_svg]:pointer-events-none
    [&_svg]:shrink-0

    outline-none

    focus-visible:border-ring
    focus-visible:ring-ring/50
    focus-visible:ring-[3px]

    aria-invalid:ring-destructive/20
    aria-invalid:border-destructive

    cursor-pointer
  `,
  {
    variants: {
      variant: {
        primary: `
            text-white

            bg-main-red
            border
            border-main-red

            hover:bg-main-red-deep
            hover:border-main-red-deep

            focus:bg-main-red-deep
            focus:border-focus-blue

            active:opacity-60

            disabled:text-neutral-gray-deep
            disabled:bg-neutral-gray-light
            disabled:border-neutral-gray-light
          `,
        secondary: `
            text-main-red

            bg-rose
            border
            border-rose

            hover:bg-rose-deep
            hover:border-rose-deep

            focus:bg-rose
            focus:border-focus-blue

            active:opacity-60

            disabled:text-neutral-gray-deep
            disabled:bg-neutral-gray-light
            disabled:border-neutral-gray-light
          `,
        tertiary: `
            text-accent-blue

            bg-accent-blue-light
            border
            border-accent-blue-light

            hover:bg-accent-blue-deep
            hover:border-accent-blue-deep

            focus:bg-accent-blue-light
            focus:border-focus-blue

            active:opacity-60

            disabled:text-neutral-gray-deep
            disabled:bg-neutral-gray-light
            disabled:border-neutral-gray-light
          `,
        outline: `
            text-main-red

            bg-transparent
            border
            border-main-red-deep

            hover:text-main-red-deep
            hover:border-main-red-deep

            focus:text-main-red
            focus:border-focus-blue

            active:opacity-60

            disabled:text-neutral-gray-deep
            disabled:bg-neutral-gray-light
            disabled:border-neutral-gray-deep
          `,
        link: "p-0 text-main-red underline-offset-4 hover:underline active:opacity-[60]",
      },
      size: {
        default: `py-[9px] px-[22px] md:px-[32px] md:py-[11px] text-[12px] leading-[14px] md:text-[14px] md:leading-[16px] `,
        icon: "has-[>svg]:p-0",
        text: "p-0",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
