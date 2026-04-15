import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Button } from "@/components/ui/button";
import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

function SlideExample() {
  return (
    <div
      className="relative overflow-hidden flex justify-between 3sm:justify-evenly items-center p-[16px] text-white bg-gray-deep rounded-[12px]
      h-[258px] md:h-[352px]
      2md:w-full
      after:content-[''] after:absolute after:bottom-0 after:right-0
      after:w-[145px] 2sm:after:w-[175px] md:after:w-[201px] 1lg:after:w-[300px] 3xl:after:w-[201px]
      after:h-[177px] 2sm:after:h-[177px] md:after:h-[208px]
      after:rounded-tl-[20px] after:bg-main-red
    "
    >
      <div className="flex flex-col justify-center items-start">
        <span className="inline-block mb-[12px] px-[11px] pb-[4px] pt-[3px] text-[10px] text-main-red font-medium bg-main-red-light rounded-[4px]">
          Скидка 45%
        </span>

        <h3 className="mb-[16px] text-[16px] font-medium leading-[100%]">
          Герметик-прокладка
        </h3>

        <div className="flex flex-col 2sm:flex-row 2sm:gap-x-[8px] 2sm:items-baseline">
          <span className="text-[24px] font-medium leading-[100%]">
            288,00 ₽
          </span>
          <span className="text-[#ABB3BF] line-through text-[12px]">
            608,00 ₽
          </span>
        </div>

        <Button asChild className="mt-[12px] px-[20px] py-[7px] pb-[8px]">
          <Link href="/product" className="">
            Подробнее
          </Link>
        </Button>
      </div>

      <div className="relative z-1 w-[124px] h-[153px] md:w-[161px] md:h-[200px]">
        <Image
          src="/mocks/hermetic.png"
          alt="Герметик"
          width={161}
          height={200}
          className="object-contain w-full h-auto"
        />
      </div>
    </div>
  );
}

export default function TopSlider() {
  const prevButtonThumbsSwiperRef = useRef(null);
  const nextButtonThumbsSwiperRef = useRef(null);

  const pagination = {
    el: "#top-slider-pagination",
    clickable: true,
    bulletElement: "button",
    bulletActiveClass: "swiper-pagination-point--active",
    bulletClass: "swiper-pagination-point",
  };

  return (
    <div>
      <div className="relative">
        <Swiper
          loop
          autoplay={{
            delay: 3000,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          }}
          className="size-full"
          spaceBetween={20}
          slidesPerView={1}
          pagination={pagination}
          navigation={{
            prevEl: prevButtonThumbsSwiperRef.current,
            nextEl: nextButtonThumbsSwiperRef.current,
          }}
          modules={[Autoplay, Pagination, Navigation]}
        >
          <SwiperSlide>
            <SlideExample />
          </SwiperSlide>
          <SwiperSlide>
            <SlideExample />
          </SwiperSlide>
          <SwiperSlide>
            <SlideExample />
          </SwiperSlide>
          <SwiperSlide>
            <SlideExample />
          </SwiperSlide>
          <SwiperSlide>
            <SlideExample />
          </SwiperSlide>
        </Swiper>
        <div className="absolute left-0 bottom-3 z-1 w-full flex gap-x-3 justify-center items-center">
          <button
            ref={prevButtonThumbsSwiperRef}
            className="hidden
              md:flex items-center justify-center
              size-8 cursor-pointer
              rounded-full bg-white shadow-(--gray-deep-shadow)
              hover:opacity-70 active:opacity-50 disabled:bg-dark disabled:opacity-20 disabled:cursor-not-allowed
            "
          >
            <ChevronLeft className="size-7 text-main-red" />
            <span className="sr-only">Previous slide</span>
          </button>

          <div
            id="top-slider-pagination"
            className="flex justify-center gap-x-1.5 md:gap-x-2 w-auto!"
          ></div>

          <button
            ref={nextButtonThumbsSwiperRef}
            className="hidden
              md:flex items-center justify-center
              size-8 cursor-pointer
              rounded-full bg-white shadow-(--gray-deep-shadow)
              hover:opacity-70 active:opacity-50 disabled:bg-dark disabled:opacity-20 disabled:cursor-not-allowed
            "
          >
            <ChevronRight className="size-7 text-main-red" />
            <span className="sr-only">Next slide</span>
          </button>
        </div>
      </div>
    </div>
  );
}
