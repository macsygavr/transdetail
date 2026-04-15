"use client";

export default function NewDetailsBanner() {
  return (
    <div
      className="
      relative overflow-hidden
      py-[30px] px-[20px]
      rounded-[12px] bg-[url(/mocks/new-details-banner-bg.jpg)]
      bg-right bg-[length:60%] bg-no-repeat

      before:content-['']
      before:absolute
      before:inset-0
      before:bg-linear-[90deg,#282C34_50%,#282C3400_93%]
    "
    >
      <p className="relative w-[160px] md:w-[280px] text-white text-[20px] md:text-[30px] ">
        Новые детали каждую неделю
      </p>
    </div>
  );
}
