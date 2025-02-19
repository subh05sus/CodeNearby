import { Metadata } from "next";
import DiscoverPage from "./DiscoverPage";

export const metadata: Metadata = {
  title: "Discover Developers",
  description:
    "Explore a diverse community of developers from around the world. Find new connections, learn about different tech stacks, and expand your network.",
  openGraph: {
    title: "Discover Developers | CodeNearby",
    description:
      "Explore a diverse community of developers from around the world. Find new connections, learn about different tech stacks, and expand your network.",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "Discover Developers on CodeNearby",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Discover Developers | CodeNearby",
    description:
      "Explore a diverse community of developers from around the world. Find new connections, learn about different tech stacks, and expand your network.",
    images: "/og.png",
  },
};

export default function Page() {
  return <DiscoverPage />;
}
