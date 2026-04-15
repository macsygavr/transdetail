import type { PropsWithChildren } from "react";

export default function ContentContainer({ children }: PropsWithChildren) {
  return (
    <div className="mx-auto max-w-[1360px] px-[15px] md:px-[20px] 1lg:px-[35px] w-full">
      {children}
    </div>
  );
}
