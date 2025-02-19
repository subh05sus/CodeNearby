import { Metadata } from "next";
import ExplorePage from "./ExplorePage";

export const metadata: Metadata = {
  title: "Explore Nearby Developers",
  description:
    "Discover and connect with developers in your area. Find potential collaborators, mentors, or friends who share your passion for coding.",
  openGraph: {
    title: "Explore Nearby Developers | CodeNearby",
    description:
      "Discover and connect with developers in your area. Find potential collaborators, mentors, or friends who share your passion for coding.",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "Explore Nearby Developers on CodeNearby",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Explore Nearby Developers | CodeNearby",
    description:
      "Discover and connect with developers in your area. Find potential collaborators, mentors, or friends who share your passion for coding.",
    images: "/og.png",
  },
  keywords: [
    "codenearby",
    "code nearby",
    "codenearby.space",
    "connect with developers",
    "find developers near me",
    "social media for developers",
    "developer networking",
    "programming community",
    "developer social network",
    "coding meetups",
    "software engineers network",
    "join coding communities",
    "local developer meetups",
    "find coding partners",
    "developer collaboration",
    "remote coding partners",
    "best networking site for developers",
    "find programmers online",
    "connect with software engineers",
    "developer platform for startups",
    "find coding groups online",
    "free developer networking site",
    "discover programmers near me",
    "best platform for coding partners",
    "tech community for developers",
    "meet developers worldwide",
    "swipe to find coding partners",
    "developer swipe matchmaking",
    "Tinder for developers",
    "feed for developers",
    "chat with developers",
    "developer messaging platform",
    "create developer gatherings",
    "host coding events online",
    "anonymous developer meetups",
    "GitHub activity tracking",
    "explore GitHub-connected developers",
    "join developer discussion threads",
    "share programming knowledge",
    "networking app for programmers",
    "coding events and hackathons",
    "build your developer network",
  ],
};

export default function Page() {
  return <ExplorePage />;
}
