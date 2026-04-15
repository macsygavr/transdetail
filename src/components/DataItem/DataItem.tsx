import { JSX } from "react";

export default function DataItem({
  label,
  text,
  className,
}: {
  label: string;
  text: string | JSX.Element;
  className?: string;
}) {
  return (
    <p
      className={`text-[12px] leading-[18px] md:text-[14px] md:leading-[20px] ${className}`}
    >
      <span className="text-neutral-gray">{label}:</span>{" "}
      <span className="text-text">{text}</span>
    </p>
  );
}
