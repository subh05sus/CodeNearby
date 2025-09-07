# Push Notifications (FCM) — Setup & Testing

This document explains how to set up and test browser push notifications for CodeNearby using Firebase Cloud Messaging (FCM). It also contains notes for reviewers and a small PR checklist.

## Quick summary
- Client: FCM Web SDK (config via NEXT_PUBLIC_* env vars)
- Server: Firebase Admin SDK (requires service account credentials in env)
- Service worker: `public/firebase-messaging-sw.js` — must contain real Firebase config at build time

## Required env vars (local)
Fill these in `.env.local` (see `.env.example`):
- NEXT_PUBLIC_FIREBASE_API_KEY
- NEXT_PUBLIC_FIREBASE_PROJECT_ID
- NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
- NEXT_PUBLIC_FIREBASE_APP_ID
- NEXT_PUBLIC_FIREBASE_DATABASE_URL
- NEXT_PUBLIC_FIREBASE_VAPID_KEY

Server-side (for sending pushes):
- FIREBASE_PROJECT_ID
- FIREBASE_CLIENT_EMAIL
- FIREBASE_PRIVATE_KEY (replace newlines with `\\n` when pasting)

Also ensure `MONGODB_URI` is set and a running MongoDB is reachable for testing user token storage.

## Service worker
- `public/firebase-messaging-sw.js` currently contains placeholder config and comments.
- Service workers can't read process.env at runtime; replace the placeholders during build or deploy. Example techniques:
  - Template + build script that injects NEXT_PUBLIC_FIREBASE_* values into the file
  - Keep a separate `firebase-messaging-sw.prod.js` generated in CI

## Local testing steps
1. Populate `.env.local` with the env vars above and run `npm run dev`.
2. Open http://localhost:3000 in Chrome/Edge/Firefox (HTTPS is required for production; `localhost` is allowed during dev).
3. Sign in and open Profile → Edit → Notifications. Click "Enable notifications" and grant permission in the browser.
4. From another account or by using the test route (see below) send a message or friend request. Verify you receive a notification while:
   - App is in foreground (in-app toast / native notification)
   - App is backgrounded or closed (OS notification via service worker)
5. Click the notification to ensure it navigates to the expected page.

## Developer test helper (recommended for reviewers without Firebase keys)
If you want reviewers to try the UI without Firebase access, add a small temporary route that returns a simulated push payload to the client and opens the notification UI. This repo intentionally avoids shipping such a route; if you'd like, I can add a `/api/notifications/test` route that:
- Accepts an authenticated user
- Returns a simulated notification payload
- Does not call Firebase Admin

## PR checklist for this feature
- [ ] `.env.example` updated with required keys and clear instructions
- [ ] `public/firebase-messaging-sw.js` documented and note about build-time replacement included
- [ ] Server-side send functions gracefully no-op when admin credentials are missing (so reviewers can run the site without secrets)
- [ ] Unit or integration tests for the server send helper (optional)
- [ ] Documentation included (this file)

## Notes for reviewers
- The code contains guards around Firebase and Mongo initialization to avoid fatal startup errors when envs are missing. This is deliberate so contributors can run locally.
- Background notifications depend on your deployment injecting real Firebase config into the service worker at build time.
- Server sends will be no-ops if admin credentials are not present; check server logs for messages when testing with credentials.

---

If you'd like, I can:
- Add a small `/api/notifications/test` endpoint so reviewers can exercise the UI without Firebase credentials, or
- Implement a build-time script (simple Node script) to generate `public/firebase-messaging-sw.js` from env vars during `npm run build`.

Tell me which option you prefer and I'll implement it and open the PR.
## Future Enhancements

- 🔔 **Rich Notifications**: Add images, actions, and rich content
- 📊 **Analytics**: Track notification open rates and effectiveness  
- 🎯 **Targeting**: Send notifications based on user activity/location
- 📱 **Mobile App**: Extend to native mobile app notifications
- 🔕 **Quiet Hours**: Respect user timezone and quiet hours
- 🔄 **Sync**: Better cross-device notification sync

## Contributing

When adding new notification types:

1. Add the notification type to `NotificationSettings` interface
2. Update server-side notification functions in `push-notifications-server.ts`
3. Add UI controls in `notification-settings.tsx`
4. Update service worker click handlers in `firebase-messaging-sw.js`
5. Test across different browsers and devices

---

Built with ❤️ for the CodeNearby community
