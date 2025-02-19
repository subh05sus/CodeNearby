/* eslint-disable react-hooks/exhaustive-deps */

import { Metadata } from "next";
import GatheringPage from "./gatheringPage";

export const metadata: Metadata = {
  title: "Developer Gatherings",
  description:
    "Join or create developer gatherings on CodeNearby. Connect with like-minded programmers, attend meetups, collaborate on projects, and participate in hackathons.",
  keywords: [
    "developer gatherings",
    "coding meetups",
    "tech events",
    "hackathons",
    "programming community",
    "developer networking",
    "coding bootcamps",
    "software conferences",
    "collaborative coding",
    "CodeNearby events",
  ],
  openGraph: {
    title: "Developer Gatherings | CodeNearby",
    description:
      "Join or create developer gatherings on CodeNearby. Attend tech meetups, collaborate on projects, and participate in hackathons with fellow programmers.",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "Developer Gatherings on CodeNearby",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Developer Gatherings | CodeNearby",
    description:
      "Join or create developer gatherings on CodeNearby. Attend meetups, network with programmers, and participate in hackathons.",
    images: "/og.png",
  },
};

export default function Page() {
  return <GatheringPage />;
}
