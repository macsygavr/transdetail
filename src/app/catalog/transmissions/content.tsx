"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import ContentContainer from "@/components/ContentContainer/ContentContainer";
import PageTitle from "@/components/PageTitle/PageTitle";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import NewDetailsBanner from "@/components/NewDetailsBanner";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import NoImage from "@/components/elements/NoImage";
import { useI18N } from "@/i18n/hooks/useLocale";
import { useThrottle } from "@uidotdev/usehooks";
import fuzzysort from "fuzzysort";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Transmission } from "@cms/sdk/transmissions/entities";
import { useTransmissionsListQueryOptions } from "@cms/sdk/transmissions/hooks/queries";
import { useQuery } from "@tanstack/react-query";

function TransmissionCard({ transmission }: { transmission: Transmission }) {
  const { t } = useI18N();
  const name = t(transmission.name);

  const hasImage = !!transmission.image;
  const imageSrc = hasImage
    ? `/media/${transmission.image}/thumbnail.webp`
    : "";

  return (
    <li className="flex flex-col py-[16px] px-[12px] md:p-[20px] border border-neutral-gray-deep rounded-[10px]">
      <p className="mb-[8px] md:mb-[12px] text-[12px] md:text-[14px] text-center font-medium truncate">
        {name}
      </p>

      <div className="overflow-hidden w-full aspect-[1.6] mb-[12px] md:mb-[16px] rounded-[4px] bg-neutral-gray-light">
        {hasImage ? (
          <Image
            className="w-full h-full object-center object-cover"
            src={imageSrc}
            width={260}
            height={160}
            alt={name}
            unoptimized
          />
        ) : (
          <NoImage />
        )}
      </div>

      <Button asChild variant="secondary" className="mb-[8px] md:mb-[12px]">
        <Link href={`/catalog/transmissions/${transmission.id}`}>
          Перейти на страницу
        </Link>
      </Button>

      <Button>Добавить в просмотренные</Button>
    </li>
  );
}

const ITEMS_PER_PAGE = 24;

export default function TransmissionsContent() {
  const searchParams = useSearchParams();
  const { data, isLoading } = useQuery(
    useTransmissionsListQueryOptions({
      params: {
        parentId: "-",
        include_inactive: false,
      },
    })
  );

  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);

  const [keywords, setKeywords] = useState(() => {
    const params = searchParams.get("keywords");
    return params ? params : "";
  });

  const throttledKeywords = useThrottle(keywords, 500);
  const isSearchActive = throttledKeywords.trim().length >= 3;

  const filteredTransmissions = useMemo(() => {
    if (!isSearchActive) return data?.items || [];

    const result = fuzzysort.go(throttledKeywords, data?.items || [], {
      keys: ["name.en", "name.ru", "description.en", "description.ru"],
    });

    return result.map((item) => item.obj);
  }, [isSearchActive, throttledKeywords, data?.items]);

  useEffect(() => {
    setVisibleCount(ITEMS_PER_PAGE);
  }, [throttledKeywords]);

  const visibleTransmissions = filteredTransmissions.slice(0, visibleCount);
  const hasMore = visibleCount < filteredTransmissions.length;

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + ITEMS_PER_PAGE);
  };

  return (
    <ContentContainer>
      <Breadcrumb className="mb-4 md:mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/" className="text-[#ef4323] hover:text-[#ef4323]">
                Главная
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="text-neutral-gray">
              Трансмиссии
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <PageTitle>Трансмиссии</PageTitle>

      <div className="md:flex p-[16px] md:p-[24px] mb-[30px] md:mb-[40px] rounded-[12px] shadow-(--gray-deep-shadow)">
        <div className="md:shrink-0 md:w-[353px] pb-[16px] mb-[16px] md:pb-0 md:mb-0 md:pr-[24px] md:mr-[24px] border-b md:border-b-0 md:border-r border-neutral-gray-deep">
          <p className="mb-[15px] text-text text-[16px] md:text-[20px] font-medium">
            Поиск модели АКПП по названию
          </p>

          <div>
            <p className="mb-[4px] text-[14px]">Найти модель АКПП</p>

            <div className="relative flex flex-grow">
              <Input
                type="text"
                placeholder="Поиск"
                value={keywords}
                onChange={(event) => setKeywords(event.target.value)}
                className=""
              />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-[14px] w-[14px] text-main-red" />
            </div>
          </div>
        </div>

        {/* <div className="md:grow">
          <p className="mb-[15px] text-text text-[16px] md:text-[20px] font-medium">
            Определить модель АКПП по марке авто
          </p>

          <div className="grid gap-[20px] 2md:grid-cols-2 3xl:grid-cols-3">
            <div className="flex flex-col">
              <p className="mb-[4px] text-[14px]">Выберите марку</p>

              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Марка" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">100</SelectItem>
                  <SelectItem value="dark">200</SelectItem>
                  <SelectItem value="system">300</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col">
              <p className="mb-[4px] text-[14px]">Выберите модель</p>

              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Модель" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">100</SelectItem>
                  <SelectItem value="dark">200</SelectItem>
                  <SelectItem value="system">300</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col">
              <p className="mb-[4px] text-[14px]">Год выпуска</p>

              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Год выпуска" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">100</SelectItem>
                  <SelectItem value="dark">200</SelectItem>
                  <SelectItem value="system">300</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div> */}
      </div>

      <div className="grid gap-y-[40px] md:gap-y-[60px]">
        <div className="grid gap-y-[20px] md:gap-y-[24px]">
          {isLoading ? (
            <div className="text-center py-8 text-gray-500">
              Загрузка трансмиссий...
            </div>
          ) : (
            <>
              {filteredTransmissions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  {isSearchActive ? "Не найдено" : "Трансмиссии не найдены"}
                </div>
              ) : (
                <>
                  <ul className="grid gap-[10px] md:gap-[20px] 1lg:gap-[30px] grid-cols-2 3sm:grid-cols-3 1lg:grid-cols-4">
                    {visibleTransmissions.map((transmission) => (
                      <TransmissionCard
                        key={transmission.id}
                        transmission={transmission}
                      />
                    ))}
                  </ul>

                  {hasMore && (
                    <Button
                      variant="tertiary"
                      className="mx-auto"
                      onClick={handleLoadMore}
                    >
                      Загрузить ещё
                    </Button>
                  )}
                </>
              )}
            </>
          )}
        </div>

        <NewDetailsBanner />
      </div>
    </ContentContainer>
  );
}
