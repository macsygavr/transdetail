import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";

import { useI18N } from "@/i18n/hooks/useLocale";

import { type Category } from "@cms/sdk/categories/entities";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { Swiper, SwiperSlide, SwiperRef } from "swiper/react";
import { FreeMode, Pagination } from "swiper/modules";
import { useProductSearchQueryOptions } from "@cms/sdk/products/hooks/queries";
import { useQuery } from "@tanstack/react-query";

type CategoriesSliderProps = {
  isLoading: boolean;
  categories: Category[] | [];
};

export default function CategoriesSlider({
  isLoading,
  categories,
}: CategoriesSliderProps) {
  const swiperRef = useRef<SwiperRef>(null);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-center py-8 text-gray-500">
          Загрузка категорий...
        </div>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-center py-8 text-gray-500">
          Категории не найдены
        </div>
      </div>
    );
  }

  const pagination = {
    el: "#cat-pagination-1",
    clickable: true,
    bulletElement: "button",
    bulletActiveClass: "swiper-pagination-point--active",
    bulletClass: "swiper-pagination-point",
  };

  const handlePrev = () => {
    if (swiperRef.current?.swiper) {
      swiperRef.current.swiper.slidePrev();
    }
  };

  const handleNext = () => {
    if (swiperRef.current?.swiper) {
      swiperRef.current.swiper.slideNext();
    }
  };

  return (
    <div className="relative flex flex-col gap-4">
      <div className="relative">
        <button
          onClick={handlePrev}
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 z-10
            hidden md:flex items-center justify-center
            size-8 cursor-pointer
            rounded-full bg-white shadow-(--gray-deep-shadow)
            hover:opacity-70 active:opacity-50 disabled:opacity-30 disabled:cursor-not-allowed
          "
        >
          <ChevronLeft className="size-7 text-main-red" />
        </button>

        <div className="">
          <Swiper
            ref={swiperRef}
            className="overflow-hidden p-3! -m-3!"
            modules={[Pagination, FreeMode]}
            pagination={pagination}
            watchSlidesProgress={true}
            slidesPerView={"auto"}
            spaceBetween={15}
          >
            {categories.map((category) => (
              <SwiperSlide
                className="w-[184px]! md:w-[225px]!"
                key={category.id}
              >
                <CategoryCardItem category={category} />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        <button
          onClick={handleNext}
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-10
            hidden md:flex items-center justify-center
            size-8 cursor-pointer
            rounded-full bg-white shadow-(--gray-deep-shadow)
            hover:opacity-70 active:opacity-50 disabled:opacity-30 disabled:cursor-not-allowed
          "
        >
          <ChevronRight className="size-7 text-main-red" />
        </button>
      </div>

      <div
        id="cat-pagination-1"
        className="flex justify-center gap-x-1.5 md:gap-x-2"
      ></div>
    </div>
  );
}

function CategoryCardItem({ category }: { category: Category }) {
  const { t } = useI18N();

  const productsQuery = useQuery(
    useProductSearchQueryOptions({
      params: {
        searchParams: {
          offset: 0,
          limit: 0,
          facets: ["category"],
        },
      },
      queryOptions: {
        staleTime: Infinity,
      },
    })
  );

  const categoryImage = category.icon
    ? `/media/${category.icon}/thumbnail.webp`
    : "/mocks/category1.png";

  return (
    <Link
      href={`/catalog/products?category=${category.id}`}
      className="
      flex flex-col items-stretch
      w-[184px] md:w-[225px]
      p-[12px] md:p-[16px]
      gap-y-[8px] md:gap-y-[12px]
      shadow-(--gray-deep-shadow)
      rounded-[12px] border-1 border-neutral-gray-light

      cursor-pointer

      hover:shadow-(--gray-deep-shadow-deep)

      group
    "
    >
      <div className="w-[160px] h-[112px] md:w-[185px] md:h-[130px] shrink-0 flex items-center justify-center">
        <Image
          src={categoryImage}
          alt={t(category.name)}
          width={160}
          height={112}
          className="object-contain"
          unoptimized
        />
      </div>
      <div className="grow flex flex-col justify-between items-center gap-1">
        <h3 className="font-medium text-text group-hover:text-main-red text-[14px]/4 text-center h-[32px] text-ellipsis overflow-hidden text-wrap w-full">
          {t(category.name)}
        </h3>

        <div className="text-[14px]/4 h-[14px]">
          {productsQuery.data && (
            <>
              <span className="text-accent-blue font-semibold">
                {`${productsQuery.data?.facets?.category_id?.[category.id] ?? 0}`}{" "}
              </span>
              наименований
            </>
          )}
        </div>
      </div>
    </Link>
  );
}
