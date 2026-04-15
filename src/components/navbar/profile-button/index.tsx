"use client";

import { useState } from "react";
import { Heart, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Button } from "@/components/ui/button";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { cn } from "@/lib/utils";
import { CurrentCompanySelect } from "@/domain/companies/components/CurrentCompanySelect";
import { useLogoutMutation } from "@cms/sdk/auth/hooks/mutations";
import { useWhoAmIQueryOptions } from "@cms/sdk/auth/hooks/queries";

export function ProfileButton() {
  const router = useRouter();
  const logoutMutation = useLogoutMutation();
  const queryClient = useQueryClient();

  const { data: user } = useQuery(useWhoAmIQueryOptions());
  const [isProfileHoverCardOpen, setIsProfileHoverCardOpen] = useState(false);

  async function handleLogout() {
    if (logoutMutation.isPending) return;

    try {
      await logoutMutation.mutateAsync();
      queryClient.clear();
      router.push("/");
    } catch {
      // silent fail (requested)
    }
  }

  return (
    <div className="flex justify-center items-center h-[46px] mr-[12px] 1lg:w-[253px] border border-neutral-gray-deep rounded-[8px]">
      {user ? (
        <HoverCard
          open={isProfileHoverCardOpen}
          onOpenChange={setIsProfileHoverCardOpen}
          openDelay={0}
          closeDelay={500}
        >
          <HoverCardTrigger asChild>
            <button
              className="flex justify-center items-center
                    grow gap-x-[4px] w-[46px] h-[45px]
                  hover:text-accent-blue  hover:bg-accent-blue-light cursor-pointer"
            >
              <User className="w-[22px] h-[22px] text-main-red" />
              <span className="hidden 1lg:inline">Профиль</span>
            </button>
          </HoverCardTrigger>

          <HoverCardContent className="w-auto p-0">
            <div className="m-[-4px] flex flex-col gap-y-[10px] px-[20px] pt-[20px] pb-[12px] text-[14px] border-b-1 border-[#E8E8E8]">
              <span className="font-medium">{`${user.first_name} ${user.last_name}`}</span>
              <Link
                href="/account"
                className="cursor-pointer"
                onClick={() => setIsProfileHoverCardOpen(false)}
              >
                Личный кабинет
              </Link>
              <Link
                href="/account/orders"
                className="cursor-pointer"
                onClick={() => setIsProfileHoverCardOpen(false)}
              >
                Заказы
              </Link>
              {/* <Link
                href="/account/notifications"
                className="flex items-center gap-x-[8px] cursor-pointer"
                onClick={() => setIsProfileHoverCardOpen(false)}
              >
                <span>Уведомления</span>
                <Badge variant="countTwo" className="rounded-full">
                  1
                </Badge>
              </Link> */}
              <button
                type="button"
                onClick={async () => {
                  setIsProfileHoverCardOpen(false);
                  await handleLogout();
                }}
                disabled={logoutMutation.isPending}
                className={cn("text-main-red text-left", {
                  "opacity-60 cursor-not-allowed": logoutMutation.isPending,
                  "cursor-pointer active:opacity-60": !logoutMutation.isPending,
                })}
              >
                Выход
              </button>
            </div>

            <div className="flex flex-col gap-y-[10px] px-[20px] pb-[20px] pt-[12px] text-[14px]">
              <CurrentCompanySelect
                onSelected={() => setIsProfileHoverCardOpen(false)}
              />
            </div>
          </HoverCardContent>
        </HoverCard>
      ) : (
        <Link
          href="/auth/login"
          className="flex justify-center items-center grow gap-x-[4px] w-[46px] h-[45px] hover:text-accent-blue  hover:bg-accent-blue-light cursor-pointer"
        >
          <User className="w-[22px] h-[22px] text-main-red" />
          <span className="hidden 1lg:inline">Войти</span>
        </Link>
      )}

      <span className="w-[1px] h-[22px] bg-neutral-gray-deep"></span>

      {user ? (
        <Link
          href="/account/favorites"
          className="flex justify-center items-center grow gap-x-[4px] w-[46px] h-[45px] hover:text-accent-blue  hover:bg-accent-blue-light"
        >
          <Heart className="w-[22px] h-[22px] text-main-red" />
          <span className="hidden 1lg:inline">Избранное</span>
        </Link>
      ) : (
        <Button
          disabled
          className="flex justify-center items-center grow gap-x-[4px] w-[46px] h-[45px] hover:text-accent-blue  hover:bg-accent-blue-light"
        >
          <Heart className="w-[22px] h-[22px] text-main-red" />
          <span className="hidden 1lg:inline">Избранное</span>
        </Button>
      )}
    </div>
  );
}
