"use client";
import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "@/lib/utils";
function Tabs({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn("flex flex-col gap-y-[16px]", className)}
      {...props}
    />
  );
}
function TabsList({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <div className="relative w-full overflow-hidden after:content-[''] after:absolute after:bottom-[1px] after:inset-x-0 after:h-[1px] after:bg-neutral-gray-deep">
      <div className="overflow-x-auto whitespace-nowrap">
        <TabsPrimitive.List
          data-slot="tabs-list"
          className={cn(
            "flex gap-x-[16px] md:gap-x-[24px] min-w-max whitespace-nowrap font-medium text-[20px] leading-[100%] md:text-[30px]",
            className
          )}
          {...props}
        />
      </div>
    </div>
  );
}
function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        `
          relative

          shrink-0
          flex items-center gap-1
          pb-[11px]
          md:pb-[14px]

          text-neutral-gray
          hover:text-gray-deep

          data-[state=active]:after:content-['']
          data-[state=active]:after:absolute
          data-[state=active]:after:z-1
          data-[state=active]:after:bottom-0
          data-[state=active]:after:inset-x-0

          after:h-[3px]
          after:bg-accent-blue
          after:rounded-full

          data-[state=active]:bg-transparent
          data-[state=active]:text-accent-blue

          cursor-pointer

        data-[state=inactive]:[&_[data-slot=badge]]:bg-neutral-gray
        `,
        className
      )}
      {...props}
    />
  );
}
function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn("flex-1 outline-none", className)}
      {...props}
    />
  );
}
export { Tabs, TabsList, TabsTrigger, TabsContent };
