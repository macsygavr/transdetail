"use client";

import { PropsWithChildren, useEffect, useMemo, useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type CartNameDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;

  title: string;
  confirmText: string;
  cancelText?: string;

  defaultValue?: string;
  maxLength?: number;
  isPending?: boolean;
  onConfirm: (name: string) => Promise<void> | void;
};

export default function CartNameDialog({
  open,
  title,
  confirmText,
  cancelText = "Отмена",
  defaultValue,
  maxLength,
  isPending,
  onConfirm,
  onOpenChange,
}: PropsWithChildren<CartNameDialogProps>) {
  const initial = useMemo(() => (defaultValue ?? "").trim(), [defaultValue]);
  const [name, setName] = useState<string>(initial);

  useEffect(() => {
    if (!open) return;
    setName(initial);
  }, [open, initial]);

  const trimmed = name.trim();
  const canSubmit = trimmed.length > 0 && !isPending;

  async function handleSubmit() {
    if (!canSubmit) return;
    await onConfirm(trimmed);
  }

  return (
    <Dialog modal={true} open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="grid gap-y-[10px]">
            <Label className="text-[18px] leading-[24px] text-text">
              Название корзины
            </Label>
            <Input
              placeholder="Название корзины"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={maxLength}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSubmit().catch(() => {
                    // silent fail (requested)
                  });
                }
              }}
              disabled={!!isPending}
              className="h-[56px] rounded-[10px] px-[18px] text-[18px] leading-[24px]"
            />
          </div>
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-[16px]">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={!!isPending}
              className="h-[56px] rounded-[10px] text-[20px] leading-[24px] font-semibold"
            >
              {cancelText}
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={() => {
                handleSubmit().catch(() => {
                  // silent fail (requested)
                });
              }}
              disabled={!canSubmit}
              className="h-[56px] rounded-[10px] text-[20px] leading-[24px] font-semibold"
            >
              {confirmText}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
