# 🛠️ Contributor Guide to CodeNearby

Welcome, and thank you for considering contributing to **CodeNearby**!  
We’re building a world where developers can connect and grow together — and you can be part of it.

---

## 🌟 About CodeNearby

**CodeNearby** is a social networking platform built with **Next.js 14**, designed specifically for developers to:

- Find coding partners based on skills, interests, and location
- Connect using **AI-powered search** (Gemini AI)
- Chat, collaborate, and host virtual events
- Integrate their GitHub activities seamlessly
- Build local and global developer communities

Learn more: [CodeNearby Space](https://codenearby.space)

---

## 🚀 How to Get Started with Local Development

1. **Clone the repository**:

    ```bash
    git clone https://github.com/subh05sus/codenearby.git
    cd codenearby
    npm install
    ```

2. **Setup Environment Variables**:
   
   Create a `.env.local` file at the root and fill it using the `.env.example` as a reference.

   Required credentials:
   
   - **GitHub OAuth** — via [GitHub Developer Settings](https://github.com/settings/developers)
   - **MongoDB URI** — via [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - **Cloudinary Keys** — via [Cloudinary Dashboard](https://cloudinary.com)
   - **Firebase Config** — via [Firebase Console](https://console.firebase.google.com/)
   - **Gemini API Key** — via [Google AI Studio](https://makersuite.google.com/app/apikey)
   - **Upstash Redis URL and Token** — via [Upstash Console](https://console.upstash.com/login)

3. **Run the Development Server**:

    ```bash
    npm run dev
    ```

---

## 📋 What You Can Contribute

- **Bug Reports**: If something isn’t working, let us know!
- **Feature Requests**: Suggest new ideas that can improve CodeNearby.
- **Performance Improvements**: Help optimize speed and responsiveness.
- **UI/UX Enhancements**: Make the platform more beautiful and intuitive.
- **Documentation**: Improve clarity, fix typos, or enhance tutorials.

See [CONTRIBUTING.md](./CONTRIBUTING.md) for full contribution guidelines.

---

## 📂 Issue Templates Available

When you create an issue, please use one of these templates:

- [🐛 Bug Report](./.github/ISSUE_TEMPLATE/bug_report.md)
- [📚 Docs Feedback](./.github/ISSUE_TEMPLATE/docs-feedback.md)
- [🚀 Feature Request](./.github/ISSUE_TEMPLATE/feature_request.md)
- [⚡ Performance Issue](./.github/ISSUE_TEMPLATE/performance-issue.md)
- [🎨 UI Suggestion](./.github/ISSUE_TEMPLATE/ui-suggestion.md)

---

## 📦 Tech Stack Highlights

| Category | Stack |
|:---|:---|
| Framework | Next.js 14 |
| Database | MongoDB |
| Auth | NextAuth.js (GitHub Provider) |
| Storage | Cloudinary |
| Realtime + Notifications | Firebase |
| AI Search | Gemini AI |
| Caching | Upstash Redis |

---

## 🛡️ Important Policies

- Follow our [Code of Conduct](./CODE_OF_CONDUCT.md) to foster a welcoming environment.
- Ensure your pull requests are small, focused, and well-documented.
- Write clear, concise commit messages.
- Prefer meaningful discussions over silent edits.

---

## 🤝 Our Vision

We believe **networking for developers should be effortless**.  
Whether you are looking for a mentor, co-founder, or hackathon buddy — CodeNearby connects developers meaningfully, powered by AI.

Help us build that future.

---

# ✅ Contributor Quick Checklist

Before submitting your Pull Request (PR), ensure you:

- [ ] Created a **new branch** for your changes (`feature/your-feature-name`).
- [ ] **Linked to an existing Issue** or clearly described the need.
- [ ] **Followed the coding style** and structure already used in the project.
- [ ] **Tested** your code locally with `npm run dev`.
- [ ] **Updated documentation** if your changes affect APIs, UI, or behavior.
- [ ] **Checked all environment variables** needed for your feature (if applicable).
- [ ] **Wrote clear, descriptive commit messages**.
- [ ] **Reviewed** your PR before requesting review: no console logs, no dead code.
- [ ] **Referenced** the correct Issue/PR in your pull request description.
- [ ] **Passed all automated checks** (if CI/CD or linter workflows are set up).

> 🚀 _The cleaner your PR, the faster it gets reviewed and merged!_

---

## ⭐ Final Notes

- **Star** this repository to show your support.
- **Fork** and work on exciting ideas.
- **Share** CodeNearby with other developers.

> Built with ❤️ by [Subhadip](https://subhadip.me) and contributors.
