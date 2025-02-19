import { Metadata } from "next";
import FeedPage from "./FeedPage";

export const metadata: Metadata = {
  title: "Developer Feed",
  description:
    "Stay updated with the latest posts, projects, and discussions from developers in your network. Engage with the community on CodeNearby.",
  openGraph: {
    title: "Developer Feed | CodeNearby",
    description:
      "Stay updated with the latest posts, projects, and discussions from developers in your network. Engage with the community on CodeNearby.",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "Developer Feed on CodeNearby",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Developer Feed | CodeNearby",
    description:
      "Stay updated with the latest posts, projects, and discussions from developers in your network. Engage with the community on CodeNearby.",
    images: "/og.png",
  },
  keywords: [
    "Developer feed",
    "Latest developer posts",
    "Coding discussions",
    "Software development updates",
    "Tech news for developers",
    "Programming community",
    "Code snippets sharing",
    "Developer blogs",
    "Open-source contributions",
    "Collaborate with developers",
    "Find coding partners",
    "Software projects showcase",
    "Networking for programmers",
    "Reddit for developers",
    "Tech discussions",
    "Developer forums",
    "Developer social network",
    "Post coding updates",
  ],
};

export default function Page() {
  return <FeedPage />;
}
