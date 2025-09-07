// firebase-messaging-sw.js
import { initializeApp } from "firebase/app";
import { getMessaging, onBackgroundMessage } from "firebase/messaging/sw";

// Note: In production, these should be replaced with actual values
// Since service workers can't access environment variables, you may need to 
// generate this file dynamically or use a build-time replacement
const firebaseConfig = {
  apiKey: "firebase-api-key-placeholder",
  authDomain: "firebase-auth-domain-placeholder", 
  databaseURL: "firebase-database-url-placeholder",
  projectId: "firebase-project-id-placeholder",
  storageBucket: "firebase-storage-bucket-placeholder",
  messagingSenderId: "firebase-messaging-sender-id-placeholder",
  appId: "firebase-app-id-placeholder",
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

// Handle background messages
onBackgroundMessage(messaging, (payload) => {
  console.log("Received background message: ", payload);

  const { notification, data } = payload;
  
  const notificationTitle = notification?.title || "CodeNearby";
  const notificationOptions = {
    body: notification?.body || "You have a new notification",
    icon: notification?.icon || "/icon-192x192.png",
    badge: "/icon-192x192.png",
    tag: data?.type || "general",
    data: data || {},
    actions: [
      {
        action: "open",
        title: "Open",
      },
      {
        action: "close",
        title: "Close",
      },
    ],
    requireInteraction: true,
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener("notificationclick", (event) => {
  console.log("Notification click received:", event);

  const { notification, action } = event;
  const data = notification.data || {};

  event.notification.close();

  if (action === "close") {
    return;
  }

  // Handle different notification types
  let url = "/";
  
  switch (data.type) {
    case "message":
      url = `/messages/${data.chatId || data.id}`;
      break;
    case "friend_request":
      url = `/profile/${data.senderUsername || data.id}`;
      break;
    case "gathering_message":
      url = `/gathering/${data.gatheringSlug || data.slug}/chat`;
      break;
    case "post":
      url = `/posts/${data.postId || data.id}`;
      break;
    case "event":
      url = data.eventUrl || "/events";
      break;
    default:
      url = data.url || "/";
  }

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      // Check if there's already a window/tab open with the target URL
      for (const client of clientList) {
        if (client.url.includes(url) && "focus" in client) {
          return client.focus();
        }
      }
      
      // If no window/tab is already open, open a new one
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});

// Handle push event (fallback)
self.addEventListener("push", (event) => {
  console.log("Push event received:", event);
  
  if (event.data) {
    const data = event.data.json();
    const { notification } = data;
    
    if (notification) {
      const notificationTitle = notification.title || "CodeNearby";
      const notificationOptions = {
        body: notification.body || "You have a new notification",
        icon: notification.icon || "/icon-192x192.png",
        badge: "/icon-192x192.png",
        data: data.data || {},
      };

      event.waitUntil(
        self.registration.showNotification(notificationTitle, notificationOptions)
      );
    }
  }
});
