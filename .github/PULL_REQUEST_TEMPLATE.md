
<!-- Describe the change in a single sentence. -->

Summary:

---

Checklist:
- [ ] I added/updated documentation where relevant (see `PUSH_NOTIFICATIONS.md`)
- [ ] I updated `.env.example` with any required env vars
- [ ] The app builds and starts locally (`npm run dev`) without secrets (guarded behavior)
- [ ] For features that require external services, I documented how to test (service worker/Firebase instructions)
- [ ] I did not commit secrets or private keys

Testing steps:
1. Run `npm run dev`
2. Open http://localhost:3000
3. Sign in and test notification flows when env vars are provided, or run the /api/notifications/test helper if present

Notes for reviewers:
- This PR includes push notification setup and defensive guards so local runs without Firebase/Mongo credentials do not crash the app.
# 🚀 Pull Request Overview

## 📄 Description
<!-- Briefly explain what this PR does -->

## 🔗 Related Issue(s)
<!-- Mention the issue(s) this PR addresses (ex: Closes #123) -->

## 🛠️ Changes Made
- <!-- List major changes made -->
- <!-- Example: Added new feature for AI-Connect search -->

## 🧪 Testing Details
- [ ] Ran `npm run dev` without errors
- [ ] Manual tests completed (ex: tested feature locally)
- [ ] New/updated unit tests (if applicable)

## 📸 Screenshots (if UI changes)
<!-- Add screenshots or gifs to showcase before/after -->

## 📝 Notes for Reviewers
<!-- Any special things reviewers should know? -->

---

# ✅ PR Checklist

- [ ] My code follows the project’s style guidelines.
- [ ] I have performed a self-review of my code.
- [ ] I have commented my code where necessary.
- [ ] I have updated documentation where necessary.
- [ ] This PR is ready for a detailed review.

---

> _Thank you for contributing to CodeNearby! Let's build something incredible together! 🚀_
