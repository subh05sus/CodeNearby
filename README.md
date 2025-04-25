# 👋 Welcome to CodeNearby

**CodeNearby** is a social networking platform built with **Next.js 14**, made specifically for developers to connect, collaborate, and grow together.

<a href="https://www.producthunt.com/posts/codenearby?embed=true&utm_source=badge-featured&utm_medium=badge&utm_souce=badge-codenearby" target="_blank"><img src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=909199&theme=light&t=1744912307005" alt="CodeNearby - Find&#0032;coding&#0032;partners&#0032;&#0038;&#0032;build&#0032;together—Tinder&#0032;for&#0032;developers&#0033; | Product Hunt" style="width: 250px; height: 54px;" width="250" height="54" /></a>

> 🚀 _Find coding partners. Build together. Think Tinder for developers._  
> 🧑‍💻 _Now open-source — contribute and grow with us!_

### 🌐 [Visit codenearby.space Now](https://codenearby.space)


## 🌟 Features

- 🔍 **Discover Developers**: Search by skills, interests, and location
- 🤖 **AI-Connect**: Find GitHub developers through natural conversation using Gemini AI
- 💬 **Chat**: Real-time conversations and collaboration
- 📢 **Developer Feed**: Share updates, snippets, and thoughts
- 🎭 **Virtual Gatherings**: Host anonymous polls, events & discussions
- 🐙 **GitHub Integration**: Auto-fetch your profile and GitHub activity
- 🌐 **Global Meets Local**: Interact worldwide, focus locally

---

## ⚙️ Tech Stack

- **Framework**: Next.js 14
- **Database**: MongoDB
- **Auth**: NextAuth.js (GitHub provider)
- **Storage**: Cloudinary
- **Realtime + Notifications**: Firebase
- **AI**: Gemini AI for intelligent developer search

---

## 🚧 .env Configuration

Create a `.env.local` file in the root and paste the following:

```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_secret_here

GITHUB_ID=your_github_id_here
GITHUB_SECRET=your_github_secret_here

MONGODB_URI=mongodb://localhost:27017
NODE_ENV=development

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

NEXT_PUBLIC_FIREBASE_DATABASE_URL=
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSENGER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=

GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_api_key
```

### 🔑 How to Get the Required Credentials

- **GitHub OAuth (NextAuth)**  
  → [GitHub Developer Settings](https://github.com/settings/developers) → Register a new OAuth App  
  → Homepage URL: `http://localhost:3000`  
  → Callback URL: `http://localhost:3000/api/auth/callback/github`

- **MongoDB URI**  
  → Use [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) or local MongoDB  
  → Example: `mongodb+srv://<username>:<password>@cluster.mongodb.net/CodeNearby`

- **Cloudinary**  
  → [Sign Up](https://cloudinary.com/users/register/free) → Dashboard → Get Cloud Name, API Key & Secret

- **Firebase Config**  
  → [Firebase Console](https://console.firebase.google.com/) → Create project  
  → Go to Project Settings → Web App → Copy config variables into `.env.local`

- **Gemini API Key**
  → [Google AI Studio](https://makersuite.google.com/app/apikey) → Get API Key for Gemini AI

---

## 🧠 Why CodeNearby?

- Find devs who **share your stack & mindset**
- Use **AI-powered search** to discover the perfect collaborators
- Connect with people around you, virtually or IRL
- Build real **technical relationships**
- Share your **coding journey**
- Stay updated with **local meetups & events**

---

## 🛠️ Getting Started (Local Development)

```bash
git clone https://github.com/yourusername/codenearby.git
cd codenearby
npm install
cp .env.example .env.local # then fill it with your credentials
npm run dev
```

---

## 🤝 Contributing

We welcome all contributions — from bug fixes to feature ideas. To get started:

1. Fork the repo
2. Create a new branch: `git checkout -b feature/your-feature`
3. Commit your changes
4. Push to your fork and create a PR

---

## 📌 Our Vision

> **Networking for developers should be effortless.**  
Whether you're looking for a mentor, co-founder, or hackathon buddy, **CodeNearby** makes it simple and personal.

---

## 🌍 Join the Movement

Let's make the developer community stronger, more collaborative, and accessible — together.

**⭐ Star this repo | 🍴 Fork it | 🤝 Contribute**

---

## 📣 Find us on

- [Product Hunt](https://www.producthunt.com/products/codenearby)
- [Twitter(X)](https://x.com/code_nearby)


---

> Built with ❤️ by [Subhadip](https://subhadip.me) and contributors.
