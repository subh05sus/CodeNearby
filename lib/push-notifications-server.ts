import admin from "firebase-admin";

const hasAdminCredentials = Boolean(
  process.env.FIREBASE_PROJECT_ID &&
    process.env.FIREBASE_CLIENT_EMAIL &&
    process.env.FIREBASE_PRIVATE_KEY
);

// Initialize Firebase Admin if credentials are available
if (hasAdminCredentials) {
  try {
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
        }),
      });
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn("Failed to initialize Firebase Admin SDK:", err);
  }
} else {
  // eslint-disable-next-line no-console
  console.warn(
    "Firebase Admin credentials not set. Push notifications will be disabled on the server."
  );
}

export interface PushNotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  clickAction?: string;
  data?: Record<string, string>;
}

export interface NotificationTarget {
  token?: string;
  tokens?: string[];
  topic?: string;
}

/**
 * Send push notification to specific user(s)
 */
export async function sendPushNotification(
  target: NotificationTarget,
  payload: PushNotificationPayload
): Promise<boolean> {
  try {
    if (!hasAdminCredentials) {
      // In development or when credentials are missing, just log and return
      // so callers don't fail the request flow.
      // eslint-disable-next-line no-console
      console.info("sendPushNotification skipped: Firebase Admin not configured.");
      return false;
    }
    // Prepare common notification payload for webpush
    const webpushNotification: admin.messaging.WebpushConfig = {
      notification: {
        title: payload.title,
        body: payload.body,
        icon: payload.icon || "/icon-192x192.png",
        badge: payload.badge || "/icon-192x192.png",
        // note: click_action supported via fcmOptions.link
      },
      fcmOptions: payload.clickAction ? { link: payload.clickAction } : undefined,
    };

    let result: any;

    if (target.token) {
      // Send to single device (token)
      const msg: admin.messaging.Message = {
        token: target.token,
        notification: {
          title: payload.title,
          body: payload.body,
          imageUrl: payload.icon,
        },
        webpush: webpushNotification,
        data: payload.data || {},
      };

      result = await admin.messaging().send(msg);
    } else if (target.tokens && target.tokens.length > 0) {
      // Send to multiple device tokens
      const multicastMessage: admin.messaging.MulticastMessage = {
        tokens: target.tokens,
        notification: {
          title: payload.title,
          body: payload.body,
        },
        webpush: webpushNotification,
        data: payload.data || {},
      };

  // use any to call sendMulticast in case typings differ
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  result = await (admin.messaging() as any).sendMulticast(multicastMessage as any);
    } else if (target.topic) {
      // Send to topic
      const msg: admin.messaging.Message = {
        topic: target.topic,
        notification: {
          title: payload.title,
          body: payload.body,
          imageUrl: payload.icon,
        },
        webpush: webpushNotification,
        data: payload.data || {},
      };

      result = await admin.messaging().send(msg);
    } else {
      throw new Error("No valid target specified");
    }

    console.log("Push notification sent successfully:", result);
    return true;
  } catch (error) {
    console.error("Error sending push notification:", error);
    return false;
  }
}

/**
 * Send notification for new message
 */
export async function sendMessageNotification(
  recipientToken: string,
  senderName: string,
  messagePreview: string,
  chatId: string
): Promise<boolean> {
  return sendPushNotification(
    { token: recipientToken },
    {
      title: `New message from ${senderName}`,
      body: messagePreview,
      icon: "/icon-192x192.png",
      clickAction: `/messages/${chatId}`,
      data: {
        type: "message",
        chatId,
        senderId: senderName,
      },
    }
  );
}

/**
 * Send notification for friend request
 */
export async function sendFriendRequestNotification(
  recipientToken: string,
  senderName: string,
  senderUsername: string
): Promise<boolean> {
  return sendPushNotification(
    { token: recipientToken },
    {
      title: "New friend request",
      body: `${senderName} (@${senderUsername}) sent you a friend request`,
      icon: "/icon-192x192.png",
      clickAction: `/profile/${senderUsername}`,
      data: {
        type: "friend_request",
        senderUsername,
        senderName,
      },
    }
  );
}

/**
 * Send notification for gathering message
 */
export async function sendGatheringMessageNotification(
  tokens: string[],
  senderName: string,
  gatheringName: string,
  messagePreview: string,
  gatheringSlug: string
): Promise<boolean> {
  if (tokens.length === 0) return false;

  return sendPushNotification(
    { tokens },
    {
      title: `${gatheringName}`,
      body: `${senderName}: ${messagePreview}`,
      icon: "/icon-192x192.png",
      clickAction: `/gathering/${gatheringSlug}/chat`,
      data: {
        type: "gathering_message",
        gatheringSlug,
        senderName,
      },
    }
  );
}

/**
 * Send notification for new post in feed
 */
export async function sendPostNotification(
  tokens: string[],
  authorName: string,
  postPreview: string,
  postId: string
): Promise<boolean> {
  if (tokens.length === 0) return false;

  return sendPushNotification(
    { tokens },
    {
      title: `New post from ${authorName}`,
      body: postPreview,
      icon: "/icon-192x192.png",
      clickAction: `/posts/${postId}`,
      data: {
        type: "post",
        postId,
        authorName,
      },
    }
  );
}

/**
 * Send notification for events
 */
export async function sendEventNotification(
  tokens: string[],
  eventTitle: string,
  eventDescription: string,
  eventUrl?: string
): Promise<boolean> {
  if (tokens.length === 0) return false;

  return sendPushNotification(
    { tokens },
    {
      title: eventTitle,
      body: eventDescription,
      icon: "/icon-192x192.png",
      clickAction: eventUrl || "/events",
      data: {
        type: "event",
        eventTitle,
        eventUrl: eventUrl || "/events",
      },
    }
  );
}
