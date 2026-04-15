import { type ReactNode } from "react";

export default function PageTitle({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <h1
      className={`mb-5 md:mb-7.5 text-xl md:text-3xl text-text font-medium ${className}`}
    >
      {children}
    </h1>
  );
}
