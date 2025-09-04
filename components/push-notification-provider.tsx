"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import type { Session } from "next-auth";
import {
  requestNotificationPermission,
  storeFCMToken,
  setupForegroundListener,
  areNotificationsEnabled,
} from "@/lib/push-notifications";

export function PushNotificationProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession() as { data: Session | null };

  useEffect(() => {
    // Initialize push notifications when user is authenticated
    if (session?.user?.id) {
      initializePushNotifications();
    }
  }, [session]);

  useEffect(() => {
    // Set up service worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/firebase-messaging-sw.js")
        .then((registration) => {
          console.log("Service Worker registered:", registration);
        })
        .catch((error) => {
          console.error("Service Worker registration failed:", error);
        });
    }

    // Set up foreground message listener
    const unsubscribe = setupForegroundListener();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  const initializePushNotifications = async () => {
    try {
      // Check if notifications are already enabled
      if (areNotificationsEnabled()) {
        // Get token and store it (in case it changed)
        const token = await requestNotificationPermission();
        if (token && session?.user?.id) {
          await storeFCMToken(token, session.user.id);
        }
      }
    } catch (error) {
      console.error("Error initializing push notifications:", error);
    }
  };

  return <>{children}</>;
}
