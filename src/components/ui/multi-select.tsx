"use client";

import * as React from "react";
import { useEffect } from "react";
import { Command as CommandPrimitive, useCommandState } from "cmdk";
import { ChevronDownIcon, XIcon } from "lucide-react";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";

export interface Option {
  value: string;
  label: string;
  disable?: boolean;
  fixed?: boolean;
  [key: string]: string | boolean | undefined;
}

interface GroupOption {
  [key: string]: Option[];
}

interface MultipleSelectorProps {
  value?: Option[];
  defaultOptions?: Option[];
  options?: Option[];
  placeholder?: string;
  loadingIndicator?: React.ReactNode;
  emptyIndicator?: React.ReactNode;
  delay?: number;
  triggerSearchOnFocus?: boolean;
  onSearch?: (value: string) => Promise<Option[]>;
  onSearchSync?: (value: string) => Option[];
  onChange?: (options: Option[]) => void;
  maxSelected?: number;
  onMaxSelected?: (maxLimit: number) => void;
  hidePlaceholderWhenSelected?: boolean;
  disabled?: boolean;
  groupBy?: string;
  className?: string;
  selectFirstItem?: boolean;
  creatable?: boolean;
  allowReplaceOnMax?: boolean;
  maxDisplayLength?: number;
  commandProps?: React.ComponentPropsWithoutRef<typeof Command>;
  inputProps?: Omit<
    React.ComponentPropsWithoutRef<typeof CommandPrimitive.Input>,
    "value" | "placeholder" | "disabled"
  >;
}

export interface MultipleSelectorRef {
  selectedValue: Option[];
  input: HTMLInputElement;
  focus: () => void;
  reset: () => void;
}

export function useDebounce<T>(value: T, delay?: number): T {
  const [debouncedValue, setDebouncedValue] = React.useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay || 500);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

function transToGroupOption(options: Option[], groupBy?: string): GroupOption {
  if (!options.length) return {};
  if (!groupBy) return { "": options };

  const groupOption: GroupOption = {};
  options.forEach((option) => {
    const key = (option[groupBy] as string) || "";
    if (!groupOption[key]) groupOption[key] = [];
    groupOption[key].push(option);
  });
  return groupOption;
}

function removePickedOption(
  groupOption: GroupOption,
  picked: Option[]
): GroupOption {
  const cloneOption = JSON.parse(JSON.stringify(groupOption)) as GroupOption;
  for (const [key, value] of Object.entries(cloneOption)) {
    cloneOption[key] = value.filter(
      (val) => !picked.find((p) => p.value === val.value)
    );
  }
  return cloneOption;
}

function isOptionsExist(
  groupOption: GroupOption,
  targetOption: Option[]
): boolean {
  for (const [, value] of Object.entries(groupOption)) {
    if (
      value.some((option) => targetOption.find((p) => p.value === option.value))
    )
      return true;
  }
  return false;
}

const truncateText = (text: string, maxLength: number): string => {
  return text.length <= maxLength ? text : text.substring(0, maxLength);
};

const CommandEmpty = ({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Empty>) => {
  const render = useCommandState((state) => state.filtered.count === 0);
  if (!render) return null;
  return (
    <div
      className={cn("px-2 py-4 text-center text-sm", className)}
      cmdk-empty=""
      role="presentation"
      {...props}
    />
  );
};

const MultipleSelector = ({
  value,
  onChange,
  placeholder,
  defaultOptions: arrayDefaultOptions = [],
  options: arrayOptions,
  delay,
  onSearch,
  onSearchSync,
  loadingIndicator,
  emptyIndicator,
  maxSelected = Number.MAX_SAFE_INTEGER,
  onMaxSelected,
  hidePlaceholderWhenSelected,
  disabled,
  groupBy,
  className,
  selectFirstItem = true,
  creatable = false,
  triggerSearchOnFocus = false,
  allowReplaceOnMax = false,
  maxDisplayLength = 50,
  commandProps,
  inputProps,
}: MultipleSelectorProps) => {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [open, setOpen] = React.useState(false);
  const [onScrollbar, setOnScrollbar] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  const [selected, setSelected] = React.useState<Option[]>(value || []);
  const [options, setOptions] = React.useState<GroupOption>(
    transToGroupOption(arrayDefaultOptions, groupBy)
  );

  const [inputValue, setInputValue] = React.useState("");
  const debouncedSearchTerm = useDebounce(inputValue, delay || 500);

  const handleClickOutside = (event: MouseEvent | TouchEvent) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target as Node) &&
      inputRef.current &&
      !inputRef.current.contains(event.target as Node)
    ) {
      setOpen(false);
      inputRef.current.blur();
    }
  };

  const handleUnselect = React.useCallback(
    (option: Option) => {
      const newOptions = selected.filter((s) => s.value !== option.value);
      setSelected(newOptions);
      onChange?.(newOptions);
      setInputValue("");
    },
    [onChange, selected]
  );

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      const input = inputRef.current;
      if (input) {
        if (
          (e.key === "Delete" || e.key === "Backspace") &&
          input.value === "" &&
          selected.length > 0
        ) {
          const lastSelectOption = selected[selected.length - 1];
          if (!lastSelectOption.fixed) handleUnselect(lastSelectOption);
        }
        if (e.key === "Escape") input.blur();
      }
    },
    [handleUnselect, selected]
  );

  useEffect(() => {
    const handleEvent = (e: MouseEvent | TouchEvent) => handleClickOutside(e);
    if (open) {
      document.addEventListener("mousedown", handleEvent);
      document.addEventListener("touchend", handleEvent);
    }
    return () => {
      document.removeEventListener("mousedown", handleEvent);
      document.removeEventListener("touchend", handleEvent);
    };
  }, [open]);

  useEffect(() => {
    if (value) setSelected(value);
  }, [value]);

  useEffect(() => {
    if (!arrayOptions || onSearch || onSearchSync) return;
    const newOption = transToGroupOption(arrayOptions || [], groupBy);
    if (JSON.stringify(newOption) !== JSON.stringify(options))
      setOptions(newOption);
  }, [
    arrayDefaultOptions,
    arrayOptions,
    groupBy,
    onSearch,
    onSearchSync,
    options,
  ]);

  useEffect(() => {
    if (!onSearchSync || !open) return;
    const res = onSearchSync?.(debouncedSearchTerm);
    setOptions(transToGroupOption(res || [], groupBy));
  }, [debouncedSearchTerm, groupBy, open, triggerSearchOnFocus, onSearchSync]);

  useEffect(() => {
    if (!onSearch || !open) return;
    const doSearch = async () => {
      setIsLoading(true);
      const res = await onSearch?.(debouncedSearchTerm);
      setOptions(transToGroupOption(res || [], groupBy));
      setIsLoading(false);
    };
    if (triggerSearchOnFocus || debouncedSearchTerm) doSearch();
  }, [debouncedSearchTerm, groupBy, open, triggerSearchOnFocus, onSearch]);

  const CreatableItem = () => {
    if (!creatable) return undefined;
    if (
      isOptionsExist(options, [{ value: inputValue, label: inputValue }]) ||
      selected.find((s) => s.value === inputValue)
    )
      return undefined;

    const Item = (
      <CommandItem
        value={inputValue}
        className="cursor-pointer"
        onMouseDown={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onSelect={(value: string) => {
          if (selected.length >= maxSelected) {
            if (allowReplaceOnMax) {
              const newOptions = [{ value, label: value }];
              setSelected(newOptions);
              onChange?.(newOptions);
              setInputValue("");
              setOpen(false);
              return;
            } else {
              onMaxSelected?.(selected.length);
              return;
            }
          }
          setInputValue("");
          const newOptions = [...selected, { value, label: value }];
          setSelected(newOptions);
          onChange?.(newOptions);
        }}
      >
        {`Create "${inputValue}"`}
      </CommandItem>
    );

    if (!onSearch && inputValue.length > 0) return Item;
    if (onSearch && debouncedSearchTerm.length > 0 && !isLoading) return Item;
    return undefined;
  };

  const EmptyItem = React.useCallback(() => {
    if (!emptyIndicator) return undefined;
    if (onSearch && !creatable && Object.keys(options).length === 0) {
      return (
        <CommandItem value="-" disabled>
          {emptyIndicator}
        </CommandItem>
      );
    }
    return <CommandEmpty>{emptyIndicator}</CommandEmpty>;
  }, [creatable, emptyIndicator, onSearch, options]);

  const selectables = React.useMemo<GroupOption>(
    () => removePickedOption(options, selected),
    [options, selected]
  );

  const commandFilter = React.useCallback(() => {
    if (commandProps?.filter) return commandProps.filter;
    if (creatable) {
      return (value: string, search: string) =>
        value.toLowerCase().includes(search.toLowerCase()) ? 1 : -1;
    }
    return undefined;
  }, [creatable, commandProps?.filter]);

  const getInputDisplayValue = () => {
    if (selected.length > 0)
      return truncateText(selected[0].label, maxDisplayLength);
    return inputValue;
  };

  const handleInputChange = (value: string) => {
    if (selected.length > 0 && value !== getInputDisplayValue()) {
      setSelected([]);
      onChange?.([]);
    }
    setInputValue(value);
    inputProps?.onValueChange?.(value);
  };

  const handleInputFocus = (event: React.FocusEvent<HTMLInputElement>) => {
    setOpen(true);
    if (triggerSearchOnFocus) onSearch?.(debouncedSearchTerm);
    inputProps?.onFocus?.(event);
  };

  const handleInputBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    if (!onScrollbar) setOpen(false);
    inputProps?.onBlur?.(event);
  };

  const handleArrowClick = () => {
    if (disabled) return;
    if (open) {
      setOpen(false);
      inputRef.current?.blur();
    } else {
      setOpen(true);
      inputRef.current?.focus();
    }
  };

  const handleClearClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    const wasFocused = document.activeElement === inputRef.current;
    setSelected([]);
    onChange?.([]);
    setInputValue("");
    if (wasFocused) inputRef.current?.blur();
    setOpen(false);
  };

  return (
    <Command
      ref={dropdownRef}
      {...commandProps}
      onKeyDown={(e) => {
        handleKeyDown(e);
        commandProps?.onKeyDown?.(e);
      }}
      className={cn(
        "h-auto overflow-visible bg-transparent",
        commandProps?.className
      )}
      shouldFilter={
        commandProps?.shouldFilter !== undefined
          ? commandProps.shouldFilter
          : !onSearch && !onSearchSync
      }
      filter={commandFilter()}
    >
      <div
        className={cn(
          "border-neutral-gray-deep hover:border-neutral-gray focus-within:border-focus-blue focus-within:ring-ring/50 dark:has-aria-invalid:ring-destructive/40 has-aria-invalid:border-destructive has-aria-invalid:ring-destructive/20 relative min-h-[38px] rounded-[6px] border text-sm transition-[color,box-shadow] outline-none focus-within:ring-[3px] has-disabled:pointer-events-none has-disabled:cursor-not-allowed has-disabled:opacity-50",
          className
        )}
        onClick={() => {
          if (disabled) return;
          inputRef?.current?.focus();
          if (!open) setOpen(true);
        }}
      >
        <div className="relative">
          <CommandPrimitive.Input
            {...inputProps}
            ref={inputRef}
            value={getInputDisplayValue()}
            disabled={disabled}
            onValueChange={handleInputChange}
            onBlur={handleInputBlur}
            onFocus={handleInputFocus}
            placeholder={
              hidePlaceholderWhenSelected && selected.length !== 0
                ? ""
                : placeholder
            }
            className={cn(
              "placeholder:text-neutral-gray w-full bg-transparent outline-hidden disabled:cursor-not-allowed h-full py-2 px-3 text-[12px] md:text-[14px]",
              {
                "text-gray-900": selected.length > 0,
                "pr-15": selected.length > 0,
                "overflow-hidden whitespace-nowrap": selected.length > 0,
              },
              inputProps?.className
            )}
          />

          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {selected.length > 0 && (
              <button
                type="button"
                onClick={handleClearClick}
                className={cn(
                  "text-muted-foreground/80 hover:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 flex size-6 items-center justify-center rounded-md border border-transparent transition-[color,box-shadow] outline-none focus-visible:ring-[3px]",
                  (disabled ||
                    selected.length < 1 ||
                    selected.filter((s) => s.fixed).length ===
                      selected.length) &&
                    "hidden"
                )}
                aria-label="Clear all"
              >
                <XIcon size={16} aria-hidden="true" />
              </button>
            )}

            <button
              type="button"
              onClick={handleArrowClick}
              disabled={disabled}
              className={cn(
                "flex items-center justify-center transition-transform duration-200",
                open && "rotate-180",
                disabled && "cursor-not-allowed opacity-50"
              )}
            >
              <ChevronDownIcon className="size-4 text-main-red" />
            </button>
          </div>
        </div>
      </div>
      <div className="relative">
        <div
          className={cn(
            "border-input absolute top-2 z-10 w-full overflow-hidden rounded-md border",
            "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
            !open && "hidden"
          )}
          data-state={open ? "open" : "closed"}
        >
          {open && (
            <CommandList
              className="bg-popover text-popover-foreground shadow-lg outline-hidden max-h-[300px] overflow-auto"
              onMouseLeave={() => setOnScrollbar(false)}
              onMouseEnter={() => setOnScrollbar(true)}
              onMouseUp={() => inputRef?.current?.focus()}
            >
              {isLoading ? (
                <>{loadingIndicator}</>
              ) : (
                <>
                  {EmptyItem()}
                  {CreatableItem()}
                  {!selectFirstItem && (
                    <CommandItem value="-" className="hidden" />
                  )}
                  {Object.entries(selectables).map(([key, dropdowns]) => (
                    <CommandGroup
                      key={key}
                      heading={key}
                      className="overflow-auto"
                    >
                      {dropdowns.map((option) => (
                        <CommandItem
                          key={option.value}
                          value={option.value}
                          disabled={option.disable}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                          }}
                          onSelect={() => {
                            if (selected.length >= maxSelected) {
                              if (allowReplaceOnMax) {
                                const newOptions = [option];
                                setSelected(newOptions);
                                onChange?.(newOptions);
                                setInputValue(option.label);
                                setOpen(false);
                                return;
                              } else {
                                onMaxSelected?.(selected.length);
                                return;
                              }
                            }
                            const newOptions = [...selected, option];
                            setSelected(newOptions);
                            onChange?.(newOptions);
                            setOpen(false);
                          }}
                          className={cn(
                            "cursor-pointer",
                            option.disable &&
                              "pointer-events-none cursor-not-allowed opacity-50"
                          )}
                        >
                          {option.label}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  ))}
                </>
              )}
            </CommandList>
          )}
        </div>
      </div>
    </Command>
  );
};

export default MultipleSelector;
