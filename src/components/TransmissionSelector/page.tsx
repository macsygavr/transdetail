"use client";

import { useCallback, useMemo, useState, useEffect } from "react";
import { Option } from "@/components/ui/multi-select";
import MultipleSelector from "@/components/ui/multi-select";
import { useI18N } from "@/i18n/hooks/useLocale";
import { Loader2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery } from "@tanstack/react-query";
import { useTransmissionsListQueryOptions } from "@cms/sdk/transmissions/hooks/queries";

interface TransmissionSelectorProps {
  selectedTransmission: string | null;
  onTransmissionChange: (transmissionId: string | null) => void;
  onRecentTransmissionClick?: (transmissionName: string) => void;
  className?: string;
  showRecentTransmissions?: boolean;
}

const TransmissionSelector = ({
  selectedTransmission,
  onTransmissionChange,
  onRecentTransmissionClick,
  className,
  showRecentTransmissions = true,
}: TransmissionSelectorProps) => {
  const { t } = useI18N();
  const transmissionsQuery = useQuery(
    useTransmissionsListQueryOptions({
      params: {
        parentId: null,
        include_inactive: false,
      },
      queryOptions: {
        retry: false,
      },
    })
  );
  const [recentTransmissions, setRecentTransmissions] = useState<string[]>([]);

  useEffect(() => {
    const stored = sessionStorage.getItem("recentTransmissions");
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        setRecentTransmissions(parsed);
      }
    }
  }, []);

  useEffect(() => {
    if (!transmissionsQuery.data?.items) return;
    const available = new Set(
      transmissionsQuery.data.items.map((item) => t(item.name))
    );
    const cleaned = recentTransmissions.filter((name) => available.has(name));
    if (cleaned.length !== recentTransmissions.length) {
      setRecentTransmissions(cleaned);
      sessionStorage.setItem("recentTransmissions", JSON.stringify(cleaned));
    }
  }, [transmissionsQuery.data?.items, t, recentTransmissions]);

  const updateRecentTransmissions = useCallback((newTransmission: string) => {
    setRecentTransmissions((prev) => {
      let updated = [
        newTransmission,
        ...prev.filter((item) => item !== newTransmission),
      ];
      updated = updated.slice(0, 20);
      sessionStorage.setItem("recentTransmissions", JSON.stringify(updated));
      return updated;
    });
  }, []);

  const transmissionOptions = useMemo(() => {
    return (
      transmissionsQuery.data?.items?.map((transmission) => ({
        value: transmission.id,
        label: t(transmission.name),
      })) || []
    );
  }, [transmissionsQuery.data?.items, t]);

  const selectedTransmissionOption = useMemo(() => {
    if (!selectedTransmission) return [];
    const option = transmissionOptions.find(
      (opt) => opt.value === selectedTransmission
    );
    return option ? [option] : [];
  }, [selectedTransmission, transmissionOptions]);

  const searchTransmissions = useCallback(
    (searchTerm: string): Option[] => {
      const trimmedTerm = searchTerm.trim();

      if (!trimmedTerm) {
        return transmissionOptions.slice(0, 50);
      }

      const lowerSearchTerm = trimmedTerm.toLowerCase();

      const exactMatches = transmissionOptions.filter((option) =>
        option.label.toLowerCase().startsWith(lowerSearchTerm)
      );

      const partialMatches = transmissionOptions.filter(
        (option) =>
          !option.label.toLowerCase().startsWith(lowerSearchTerm) &&
          option.label.toLowerCase().includes(lowerSearchTerm)
      );

      return [...exactMatches, ...partialMatches].slice(0, 100);
    },
    [transmissionOptions]
  );

  const handleMultipleSelectorChange = useCallback(
    (options: Option[]) => {
      if (options.length > 0) {
        const selectedLabel = options[0].label;
        updateRecentTransmissions(selectedLabel);
        onTransmissionChange(options[0].value);
      } else {
        onTransmissionChange(null);
      }
    },
    [onTransmissionChange, updateRecentTransmissions]
  );

  const handleRecentTransmissionClick = useCallback(
    (transmissionName: string) => {
      updateRecentTransmissions(transmissionName);
      if (onRecentTransmissionClick) {
        onRecentTransmissionClick(transmissionName);
      } else {
        const transmission = transmissionOptions.find(
          (opt) => opt.label === transmissionName
        );
        if (transmission) {
          onTransmissionChange(transmission.value);
        }
      }
    },
    [
      transmissionOptions,
      onTransmissionChange,
      onRecentTransmissionClick,
      updateRecentTransmissions,
    ]
  );

  return (
    <div className={className}>
      <h2 className="flex items-center gap-x-[10px] mb-[10px] font-medium text-[16px] leading-[100%] md:leading-[23px] md:text-[20px]">
        <span className="flex shrink-0 w-[14px] h-[14px] md:w-[17px] md:h-[17px] bg-center bg-no-repeat bg-cover bg-[url(/icons/grid.svg)]"></span>
        <span>Выбор трансмиссии</span>
      </h2>

      <MultipleSelector
        value={selectedTransmissionOption}
        onChange={handleMultipleSelectorChange}
        defaultOptions={transmissionOptions.slice(0, 50)}
        options={transmissionOptions}
        onSearchSync={searchTransmissions}
        placeholder="Поиск трансмиссии"
        emptyIndicator={
          <div className="text-center py-3">
            <p className="text-sm text-gray-500">Трансмиссия не найдена</p>
          </div>
        }
        loadingIndicator={
          <div className="flex items-center justify-center py-3">
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            <span className="text-sm">Поиск...</span>
          </div>
        }
        maxSelected={1}
        triggerSearchOnFocus={true}
        hidePlaceholderWhenSelected={false}
        allowReplaceOnMax={true}
      />

      {showRecentTransmissions && recentTransmissions.length > 0 && (
        <>
          <Separator className="my-4" />
          <div>
            <p className="mb-[14px] text-[12px] leading-[100%] md:text-[14px] md:leading-[20px] font-medium text-text">
              Просмотренные вами трансмиссии
            </p>
            <ScrollArea className="h-48 w-full rounded-md">
              <div className="p-2">
                <div className="flex flex-wrap gap-[8px]">
                  {recentTransmissions.map((name, index) => (
                    <button
                      key={index}
                      className="inline-flex items-center justify-center w-fit max-w-full py-[8px] px-[12px] text-[12px] md:text-[14px] font-normal text-black bg-white border border-[#2B3990] rounded-[6px] hover:bg-accent-blue-light hover:border-[#2B3990] cursor-pointer text-center"
                      onClick={(e) => {
                        e.preventDefault();
                        handleRecentTransmissionClick(name);
                      }}
                    >
                      {name}
                    </button>
                  ))}
                </div>
              </div>
            </ScrollArea>
          </div>
        </>
      )}
    </div>
  );
};

export default TransmissionSelector;
