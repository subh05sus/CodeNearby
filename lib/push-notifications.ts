import { getToken, onMessage } from "firebase/messaging";
import { messaging } from "@/lib/firebase";

export interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: any;
}

// Request notification permission and get FCM token
export const requestNotificationPermission = async (): Promise<string | null> => {
  try {
    if (!messaging) {
      console.log("Firebase Messaging not supported");
      return null;
    }

    // Check if notifications are supported
    if (!("Notification" in window)) {
      console.log("This browser does not support notifications");
      return null;
    }

    // Check current permission
    let permission = Notification.permission;
    
    if (permission === "default") {
      // Request permission
      permission = await Notification.requestPermission();
    }

    if (permission === "granted") {
      // Get FCM token
      const token = await getToken(messaging, {
        vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
      });
      
      console.log("FCM Token:", token);
      return token;
    } else {
      console.log("Notification permission denied");
      return null;
    }
  } catch (error) {
    console.error("Error getting notification permission:", error);
    return null;
  }
};

// Store FCM token in database
export const storeFCMToken = async (token: string, userId: string): Promise<void> => {
  try {
    const response = await fetch("/api/notifications/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token, userId }),
    });

    if (!response.ok) {
      throw new Error("Failed to store FCM token");
    }
  } catch (error) {
    console.error("Error storing FCM token:", error);
  }
};

// Set up foreground message listener
export const setupForegroundListener = () => {
  if (!messaging) return null;

  return onMessage(messaging, (payload) => {
    console.log("Received foreground message:", payload);
    
    const { notification, data } = payload;
    
    if (notification) {
      showNotification({
        title: notification.title || "New Message",
        body: notification.body || "",
        icon: notification.icon || "/icon-192x192.png",
        data: data,
      });
    }
  });
};

// Show browser notification
export const showNotification = (payload: NotificationPayload): void => {
  if (!("Notification" in window)) {
    console.log("This browser does not support notifications");
    return;
  }

  if (Notification.permission === "granted") {
    const notification = new Notification(payload.title, {
      body: payload.body,
      icon: payload.icon || "/icon-192x192.png",
      badge: payload.badge || "/icon-192x192.png",
      tag: payload.tag,
      data: payload.data,
      requireInteraction: true,
    });

    // Handle notification click
    notification.onclick = (event) => {
      event.preventDefault();
      
      // Handle different notification types
      if (payload.data) {
        const { type, id, slug, url } = payload.data;
        
        switch (type) {
          case "message":
            window.open(`/messages/${id}`, "_blank");
            break;
          case "friend_request":
            window.open(`/profile/${id}`, "_blank");
            break;
          case "gathering_message":
            window.open(`/gathering/${slug}/chat`, "_blank");
            break;
          case "post":
            window.open(`/posts/${id}`, "_blank");
            break;
          default:
            if (url) {
              window.open(url, "_blank");
            } else {
              window.focus();
            }
        }
      } else {
        window.focus();
      }
      
      notification.close();
    };

    // Auto close after 10 seconds
    setTimeout(() => {
      notification.close();
    }, 10000);
  }
};

// Check if push notifications are enabled
export const areNotificationsEnabled = (): boolean => {
  return (
    "Notification" in window &&
    Notification.permission === "granted"
  );
};

// Get notification settings from local storage
export const getNotificationSettings = () => {
  if (typeof window === "undefined") return null;
  
  const settings = localStorage.getItem("notification-settings");
  return settings ? JSON.parse(settings) : {
    messages: true,
    friendRequests: true,
    gatheringMessages: true,
    posts: true,
    events: true,
  };
};

// Save notification settings to local storage
export const saveNotificationSettings = (settings: any) => {
  if (typeof window === "undefined") return;
  
  localStorage.setItem("notification-settings", JSON.stringify(settings));
};
