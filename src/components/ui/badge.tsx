import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  `
    inline-flex
    justify-center
    items-center

    p-[4px_11px_6px]
    md:p-[4px_11px_7px]

    text-[10px]
    md:text-[12px]
    leading-[100%]
    font-medium

    rounded-[4px]
  `,
  {
    variants: {
      variant: {
        one: `
            text-green

            bg-green-light
          `,
        two: `
            text-focus-blue

            bg-focus-blue-light
          `,
        three: `
            text-yellow-promo

            bg-yellow-promo-light
          `,
        four: `
            text-main-red

            bg-rose
          `,
        five: `
            text-neutral-gray

            bg-neutral-gray-light
          `,
        countOne: `
            min-w-[22px] min-h-[22px]
            p-[5px_4px]
            md:p-[5px_4px]

            text-white font-bold

            bg-accent-blue
            rounded-full
          `,
        countTwo: `
            min-w-[22px] min-h-[22px]
            p-[5px_4px]
            md:p-[5px_4px]

            text-white font-bold

            bg-main-red
            rounded-full
          `,
      },
    },
    defaultVariants: {
      variant: `one`,
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
