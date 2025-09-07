"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import type { Session } from "next-auth";
import { useRouter } from "next/navigation";

export function useMessageNotifications() {
  const { data: session } = useSession() as { data: Session | null };
  const router = useRouter();

  // Function to send notification for direct message
  const sendDirectMessageNotification = async (
    recipientId: string,
    content: string,
    chatId: string
  ) => {
    try {
      await fetch("/api/messages/notify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recipientId,
          content,
          chatId,
        }),
      });
    } catch (error) {
      console.error("Error sending message notification:", error);
    }
  };

  // Function to handle notification click navigation
  const handleNotificationClick = (notificationData: any) => {
    const { type, id, slug, url } = notificationData;
    
    switch (type) {
      case "message":
        router.push(`/messages/${id}`);
        break;
      case "friend_request":
        router.push(`/profile/${id}`);
        break;
      case "gathering_message":
        router.push(`/gathering/${slug}/chat`);
        break;
      case "post":
        router.push(`/posts/${id}`);
        break;
      default:
        if (url) {
          router.push(url);
        }
    }
  };

  return {
    sendDirectMessageNotification,
    handleNotificationClick,
    isAuthenticated: !!session?.user?.id,
  };
}
