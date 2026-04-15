"use client";

import { useEffect, useMemo, useState } from "react";
import { throttle } from "lodash";
import { ChevronDown, Info } from "lucide-react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";

import HowMeasuring from "@/assets/how_measuring.png";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useI18N } from "@/i18n/hooks/useLocale";
import { cn } from "@/lib/utils";

import ContentContainer from "../ContentContainer/ContentContainer";
import { useConfigurationSettingsQueryOptions } from "@cms/sdk/configuration/hooks/queries";
import { useQuery } from "@tanstack/react-query";
import { useListPropertiesQueryOptions } from "@cms/sdk/property/hooks/queries";

export default function HeaderPanelBottom() {
  const { t } = useI18N();
  const router = useRouter();
  const searchParams = useSearchParams();

  const configuration = useQuery(
    useConfigurationSettingsQueryOptions({
      queryOptions: {
        staleTime: Infinity,
      },
    })
  );
  const selectionByParamsPropertiesIdList = useMemo(() => {
    const value =
      configuration.data?.[
        "transdetail_web__navbar__selection_by_params__properties"
      ]?.value;

    return Array.isArray(value)
      ? value.filter(
          (item): item is string => typeof item === "string" && item.length > 0
        )
      : [];
  }, [configuration.data]);
  const { data: propertiesList } = useQuery(useListPropertiesQueryOptions());
  const selectionByParamsFields = useMemo(
    () =>
      selectionByParamsPropertiesIdList.flatMap((propertyId) => {
        const property = propertiesList?.items.find(
          (item) => item.id === propertyId
        );

        if (!property) {
          return [];
        }

        const label = t(property.name);

        return [
          {
            id: property.id,
            label,
            placeholder: label,
            queryKey: `p_${property.id}`,
          },
        ];
      }),
    [selectionByParamsPropertiesIdList, propertiesList?.items, t]
  );

  const [isParametersShown, setIsParametersShown] = useState(false);
  const [values, setValues] = useState<Record<string, string>>({});

  function handleSelectionClick() {
    const params = new URLSearchParams();

    selectionByParamsFields.forEach((field) => {
      const value = values[field.id]?.trim();

      if (value) {
        params.set(field.queryKey, value);
      }
    });

    const queryString = params.toString();

    router.push(
      queryString
        ? `/selection-by-params?${queryString}`
        : "/selection-by-params"
    );
  }

  useEffect(() => {
    const handleResize = throttle(() => {
      if (window.innerWidth >= 768 && isParametersShown) {
        setIsParametersShown(false);
      }
    });

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => {
      handleResize.cancel();
      window.removeEventListener("resize", handleResize);
    };
  }, [isParametersShown]);

  useEffect(() => {
    const nextValues = selectionByParamsFields.reduce<Record<string, string>>(
      (acc, field) => {
        const value = searchParams.get(field.queryKey)?.trim();

        if (value) {
          acc[field.id] = value;
        }

        return acc;
      },
      {}
    );

    setValues(nextValues);
  }, [searchParams, selectionByParamsFields]);

  return (
    <div className="border-t">
      <ContentContainer>
        <div className="flex flex-col 1lg:flex-row items-center py-[16px] 1lg:gap-x-[20px]">
          <div className="relative flex flex-wrap 1lg:flex-nowrap w-full justify-between items-center gap-y-[12px] 1lg:gap-x-[20px]">
            <p className="shrink-0 font-medium text-[12px] leading-[14px] md:text-[14px] md:leading-[20px]">
              Подобрать по параметрам
            </p>

            <button
              className="absolute top-[1px] right-0 flex items-center gap-x-[4px] p-0 md:hidden text-[12px] leading-[14px] text-neutral-gray hover:text-main-red cursor-pointer"
              onClick={() => setIsParametersShown((previous) => !previous)}
            >
              <span>{isParametersShown ? "Свернуть" : "Развернуть"}</span>
              <ChevronDown
                className={cn(
                  "size-[12] shrink-0 transition-transform duration-300",
                  {
                    "rotate-180": isParametersShown,
                  }
                )}
              />
            </button>

            <div
              className={cn(
                "w-full 1lg:w-auto hidden md:flex 1lg:flex-grow flex-col 3sm:flex-row gap-y-[12px] 3sm:gap-x-[12px] 2md:gap-x-[20px]",
                {
                  flex: isParametersShown,
                }
              )}
            >
              <div
                className="grid gap-x-[12px] gap-y-[12px] 2md:gap-x-[20px] items-center w-full"
                style={{
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(min(220px, 100%), 1fr))",
                }}
              >
                {selectionByParamsFields.map((field) => (
                  <Input
                    key={field.id}
                    type="number"
                    aria-label={field.label}
                    placeholder={field.placeholder}
                    value={values[field.id] ?? ""}
                    onChange={(event) => {
                      const nextValue = event.target.value;

                      setValues((current) => ({
                        ...current,
                        [field.id]: nextValue,
                      }));
                    }}
                  />
                ))}
              </div>

              <div className="flex 3sm:flex-row-reverse justify-end items-center gap-x-[15px] md:gap-x-[12px]">
                <Dialog>
                  <DialogTrigger asChild>
                    <span className="flex items-center gap-x-[4px] md:gap-x-[7px] w-max text-[12px] md:text-[14px] group cursor-pointer">
                      <Info className="w-[17px] h-[17px] text-accent-blue" />
                      <span className="text-neutral-gray group-hover:text-main-red">
                        Как мы мерим?
                      </span>
                    </span>
                  </DialogTrigger>

                  <DialogContent className="sm:max-w-229.5 p-6">
                    <DialogHeader>
                      <DialogTitle className="text-xl md:text-3xl text-center">
                        Как мы мерим?
                      </DialogTitle>
                    </DialogHeader>
                    <div className="w-full">
                      <Image
                        width={870}
                        height={470}
                        src={HowMeasuring.src}
                        alt="Как мы измеряем"
                        className="size-full max-w-217.5 max-h-117.5"
                      />
                    </div>
                  </DialogContent>
                </Dialog>

                <Button type="button" onClick={handleSelectionClick}>
                  Подобрать
                </Button>
              </div>
            </div>
          </div>
        </div>
      </ContentContainer>
    </div>
  );
}
