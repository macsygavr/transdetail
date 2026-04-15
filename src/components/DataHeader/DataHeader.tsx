export default function DataHeader({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  return (
    <p
      className={`font-medium text-text text-[12px] leading-[18px] md:text-[14px] md:leading-[14px] ${className}`}
    >
      {text}
    </p>
  );
}
