"use client";

import Color from "color";

interface OrderStatusBadgeProps {
  statusName: string;
  colorHex?: string | null;
  className?: string;
  opacity?: number;
}

export function OrderStatusBadge({
  statusName,
  colorHex,
  className = "",
  opacity = 0.15,
}: OrderStatusBadgeProps) {
  if (!colorHex) {
    return (
      <span
        className={`inline-flex items-center justify-center px-[10px] pt-[3px] pb-[5px] text-[12px] md:text-[14px] font-bold rounded-[4px] bg-gray-200 text-gray-700 ${className}`}
      >
        {statusName}
      </span>
    );
  }

  try {
    const color = Color(colorHex);

    const backgroundColor = color.alpha(opacity).string();

    const textColor = colorHex;

    const borderColor = color.alpha(opacity * 2).string();

    return (
      <span
        className={`inline-flex items-center justify-center px-[10px] pt-[3px] pb-[5px] text-[12px] md:text-[14px] font-bold rounded-[4px] ${className}`}
        style={{
          backgroundColor: backgroundColor,
          color: textColor,
          border: `1px solid ${borderColor}`,
        }}
      >
        {statusName}
      </span>
    );
  } catch (error) {
    console.warn("Invalid color hex:", colorHex);
    return (
      <span
        className={`inline-flex items-center justify-center px-[10px] pt-[3px] pb-[5px] text-[12px] md:text-[14px] font-bold rounded-[4px] bg-gray-200 text-gray-700 ${className}`}
      >
        {statusName}
      </span>
    );
  }
}
