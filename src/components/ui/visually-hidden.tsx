"use client";

import * as VH from "@radix-ui/react-visually-hidden";

function VisuallyHidden({ ...props }: React.ComponentProps<typeof VH.Root>) {
  return <VH.Root {...props} />;
}

export { VisuallyHidden };
