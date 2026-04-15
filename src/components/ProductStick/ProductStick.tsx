export default function ProductStick() {
  // В наличии: text-(--color-green) bg-(--color-green-light)
  // Нет в наличии: text-(--color-neutral-gray) bg-(--color-neutral-gray-light)
  // Уценённый text-(--color-yellow-promo) bg-(--color-yellow-promo-light)
  // Новинка: text-(--color-focus-blue) bg-(--color-focus-blue-light)

  return (
    <span
      className="
      pt-[2px] pb-[4px] md:pt-[4px] md:pb-[7px] px-[8px] md:px-[12px]
      text-[10px] md:text-[12px] font-medium leading-[100%]
      text-main-red bg-rose
      rounded-[4px]"
    >
      -25%
    </span>
  );
}
