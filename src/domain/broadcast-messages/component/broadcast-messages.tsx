"use client";

import { useState, useMemo } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMarkMessageAsReadMutation } from "@cms/sdk/broadcast-messages/hooks/mutations";
import { useUnreadBroadcastMessagesQueryOptions } from "@cms/sdk/broadcast-messages/hooks/queries";
import { useQuery } from "@tanstack/react-query";

export default function BroadcastMessages() {
  const { data, error } = useQuery(
    useUnreadBroadcastMessagesQueryOptions({
      queryOptions: {
        staleTime: Infinity,
      },
    })
  );
  const markAsReadMutation = useMarkMessageAsReadMutation();
  const [hiddenMessages, setHiddenMessages] = useState<string[]>([]);

  const messages = useMemo(() => {
    const apiMessages = data?.items || [];

    return apiMessages.filter(
      (message) => message.content && !hiddenMessages.includes(message.id)
    );
  }, [data?.items, hiddenMessages]);

  if (error || messages.length === 0) {
    return null;
  }

  const handleCloseMessage = async (messageId: string) => {
    setHiddenMessages((prev) => [...prev, messageId]);
    await markAsReadMutation.mutateAsync(messageId);
  };

  return (
    <div className="flex flex-col gap-y-3">
      {messages.map((message) => (
        <div
          key={message.id}
          className="relative p-3 md:p-4 bg-accent-blue-light rounded-xl"
        >
          {message.title?.trim() && (
            <h3 className="font-semibold mb-2 text-gray-900 pr-10">
              {message.title}
            </h3>
          )}
          <p className="text-gray-700 pr-10">{message.content}</p>
          <Button
            size="icon"
            variant="outline"
            className="absolute top-3 right-3 text-[#32406F] hover:text-main-red border-none"
            onClick={() => handleCloseMessage(message.id)}
            disabled={markAsReadMutation.isPending}
          >
            {markAsReadMutation.isPending ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-500" />
            ) : (
              <X size={18} />
            )}
          </Button>
        </div>
      ))}
    </div>
  );
}
