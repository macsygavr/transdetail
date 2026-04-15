"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import type { Swiper as SwiperType } from "swiper";
import { Navigation, Thumbs } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

import PhotoSwipeLightbox from "photoswipe/lightbox";
import "photoswipe/style.css";

import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/navigation";
import "swiper/css/thumbs";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { getProductImageSrc } from "@/utils/index";
import { MediaObjectVariant } from "@cms/sdk/media/entities";

type ProductGalleryImage = {
  id: string;
  variants: Record<string, MediaObjectVariant>;
  alt?: string | null;
  hash: string;
  file_extension: string;
  created_at?: string | null;
  updated_at?: string | null;
};

export default function ProductGallery({
  images,
}: {
  images: Array<ProductGalleryImage>;
}) {
  const [thumbsSwiper, setThumbsSwiper] = useState<SwiperType | null>(null);
  const prevButtonThumbsSwiperRef = useRef<HTMLButtonElement>(null);
  const nextButtonThumbsSwiperRef = useRef<HTMLButtonElement>(null);
  const [activeSlideIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    let lightbox: PhotoSwipeLightbox | null = new PhotoSwipeLightbox({
      gallery: "#photo-swipe-gallery",
      children: "a",
      wheelToZoom: true,

      pswpModule: () => import("photoswipe"),
    });

    lightbox.init();

    return () => {
      lightbox?.destroy();
      lightbox = null;
    };
  }, []);

  return (
    <div className="overflow-hidden grid gap-y-2">
      <div className="overflow-hidden size-full max-h-100 aspect-3/2 border border-border rounded-lg ">
        <Swiper
          id="photo-swipe-gallery"
          spaceBetween={0}
          slidesPerView={1}
          thumbs={{
            swiper: thumbsSwiper,
            slideThumbActiveClass: "border-main-red!",
          }}
          modules={[Navigation, Thumbs]}
          onSlideChange={(swiper) => {
            setActiveIndex(swiper.activeIndex);
          }}
          className="size-full"
        >
          {images.map((image, index) => {
            const optimizedImgSrc = getProductImageSrc(
              image.id,
              image.variants.optimized.objectname
            );
            const largeImgSrc = getProductImageSrc(
              image.id,
              image.variants.large.objectname
            );

            return (
              <SwiperSlide key={index}>
                <a
                  className="flex items-center justify-center size-full"
                  href={optimizedImgSrc}
                  data-pswp-width={image.variants.optimized.width}
                  data-pswp-height={image.variants.optimized.height}
                  key={"photo-swipe-gallery-" + index}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Image
                    src={largeImgSrc}
                    loader={() => largeImgSrc}
                    width={image.variants.large.width as number}
                    height={image.variants.large.height as number}
                    alt={image.alt || `Фото товара`}
                    className="w-full h-full object-contain"
                  />
                </a>
              </SwiperSlide>
            );
          })}
        </Swiper>
      </div>

      <div className="overflow-hidden flex justify-center items-center gap-x-4 w-full h-15 max-w-90 mx-auto ">
        <button
          ref={prevButtonThumbsSwiperRef}
          className="
            shrink-0
            flex items-center justify-center
            size-8 cursor-pointer
            rounded-full bg-white shadow-(--gray-deep-shadow)
            hover:bg-main-red group active:opacity-50 disabled:bg-dark disabled:opacity-20 disabled:cursor-not-allowed
          "
        >
          <ChevronLeft className="size-7 text-main-red group-hover:text-white" />
          <span className="sr-only">Previous slide</span>
        </button>

        <Swiper
          breakpoints={{
            320: {
              slidesPerView: 3,
              spaceBetween: 8,
            },
            414: {
              slidesPerView: 4,
              spaceBetween: 8,
            },
          }}
          navigation={{
            prevEl: prevButtonThumbsSwiperRef.current,
            nextEl: nextButtonThumbsSwiperRef.current,
          }}
          onSwiper={setThumbsSwiper}
          modules={[Navigation, Thumbs]}
          className="h-15 [&_.swiper-wrapper]:items-stretch"
        >
          {images.map((image, index) => {
            const imgSrc = getProductImageSrc(
              image.id,
              image.variants.thumbnail.objectname
            );

            return (
              <SwiperSlide
                key={index}
                className={cn(
                  "size-15! rounded-sm border border-transparent cursor-pointer",
                  { "border-main-red!": index === activeSlideIndex }
                )}
                onClick={() => setActiveIndex(index)}
              >
                <div className="size-15 p-1">
                  <Image
                    src={imgSrc}
                    loader={() => imgSrc}
                    width={image.variants.thumbnail.width as number}
                    height={image.variants.thumbnail.height as number}
                    alt={image.alt || `Фото товара`}
                    className="size-full object-cover object-center"
                  />
                </div>
              </SwiperSlide>
            );
          })}
        </Swiper>

        <button
          ref={nextButtonThumbsSwiperRef}
          className="shrink-0
            flex items-center justify-center
            size-8 cursor-pointer
            rounded-full bg-white shadow-(--gray-deep-shadow)
            hover:bg-main-red group active:opacity-50 disabled:bg-dark disabled:opacity-20 disabled:cursor-not-allowed
          "
        >
          <ChevronRight className="size-7 text-main-red group-hover:text-white" />
          <span className="sr-only">Next slide</span>
        </button>
      </div>
    </div>
  );
}
