"use client";
import Image from "next/image";
import React from "react";
import { Carousel, Card } from "@/components/ui/apple-cards-carousel";
import { AuroraText } from "../magicui/aurora-text";

export function Why() {
  const cards = data.map((card, index) => (
    <Card key={card.src} card={card} index={index} layout={true} />
  ));

  return (
    <div className="w-full h-full py-20">
      <h2 className="max-w-7xl pl-4 mx-auto text-xl md:text-5xl font-bold text-neutral-800 dark:text-neutral-200 font-sans">
        Why <AuroraText>CodeNearby.</AuroraText>
      </h2>
      <Carousel items={cards} />
    </div>
  );
}

const DummyContentNetworking = () => {
  return (
    <div className="bg-[#F5F5F7] dark:bg-neutral-800 p-8 md:p-14 rounded-3xl mb-4">
      <p className="text-neutral-600 dark:text-neutral-400 text-base md:text-2xl font-sans max-w-3xl mx-auto">
        <span className="font-bold text-neutral-700 dark:text-neutral-200">
          &quot;Your next coding partner is just a swipe away.&quot;
        </span>{" "}
        Whether you&apos;re looking for a co-founder, a mentor, or just someone
        to debug code with, Codenearby connects you with developers around you.
        Discover new people, share ideas, and build something amazing together!
      </p>
      <Image
        height="500"
        width="500"
        src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=3000&auto=format&fit=crop"
        alt="Developers networking"
        className="md:w-1/2  h-full w-full mx-auto object-cover mt-3  landscape:h-60 rounded-lg"
      />
    </div>
  );
};

const DummyContentCollaboration = () => {
  return (
    <div className="bg-[#F5F5F7] dark:bg-neutral-800 p-8 md:p-14 rounded-3xl mb-4">
      <p className="text-neutral-600 dark:text-neutral-400 text-base md:text-2xl font-sans max-w-3xl mx-auto">
        <span className="font-bold text-neutral-700 dark:text-neutral-200">
          &quot;Great projects start with great teams.&quot;
        </span>{" "}
        Find developers with similar interests and work together on real
        projects. Whether it&apos;s a hackathon, an open-source initiative, or a
        startup idea, Codenearby makes collaboration easy and fun.
      </p>
      <Image
        height="500"
        width="500"
        src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=3000&auto=format&fit=crop"
        alt="Developers collaborating on a project"
        className="md:w-1/2  h-full w-full mx-auto object-cover mt-3  landscape:h-60 rounded-lg"
      />
    </div>
  );
};
const DummyContentFeed = () => {
  return (
    <div className="bg-[#F5F5F7] dark:bg-neutral-800 p-8 md:p-14 rounded-3xl mb-4">
      <p className="text-neutral-600 dark:text-neutral-400 text-base md:text-2xl font-sans max-w-3xl mx-auto">
        <span className="font-bold text-neutral-700 dark:text-neutral-200">
          &quot;Your ideas, your voice, your space.&quot;
        </span>{" "}
        Share thoughts, post polls, upload code snippets, and start discussions
        with fellow developers. Whether it&apos;s debugging help or just a meme
        about JavaScript, the feed is where developers unite.
      </p>
      <Image
        height="500"
        width="500"
        src="https://images.unsplash.com/photo-1554177255-61502b352de3?q=80&w=3000&auto=format&fit=crop"
        alt="Online discussion forum"
        className="md:w-1/2  h-full w-full mx-auto object-cover mt-3  landscape:h-60 rounded-lg"
      />
    </div>
  );
};

const DummyContentMessaging = () => {
  return (
    <div className="bg-[#F5F5F7] dark:bg-neutral-800 p-8 md:p-14 rounded-3xl mb-4">
      <p className="text-neutral-600 dark:text-neutral-400 text-base md:text-2xl font-sans max-w-3xl mx-auto">
        <span className="font-bold text-neutral-700 dark:text-neutral-200">
          &quot;Code together, chat together.&quot;
        </span>{" "}
        Connect with fellow developers through real-time messaging. Share GitHub
        links, discuss new frameworks, and brainstorm ideas—all in one place.
      </p>
      <Image
        height="500"
        width="500"
        src="https://images.unsplash.com/photo-1611511574646-3c5a5824e12b?q=80&w=3000&auto=format&fit=crop"
        alt="Messaging interface"
        className="md:w-1/2  h-full w-full mx-auto object-cover mt-3  landscape:h-60 rounded-lg"
      />
    </div>
  );
};

const DummyContentGatherings = () => {
  return (
    <div className="bg-[#F5F5F7] dark:bg-neutral-800 p-8 md:p-14 rounded-3xl mb-4">
      <p className="text-neutral-600 dark:text-neutral-400 text-base md:text-2xl font-sans max-w-3xl mx-auto">
        <span className="font-bold text-neutral-700 dark:text-neutral-200">
          &quot;Meet, code, and connect.&quot;
        </span>{" "}
        Join or create developer meetups, coding sessions, and tech talks.
        Whether it&apos;s a virtual gathering or an in-person meetup, find
        events that match your interests.
      </p>
      <Image
        height="500"
        width="500"
        src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=3000&auto=format&fit=crop"
        alt="Developer gathering"
        className="md:w-1/2  h-full w-full mx-auto object-cover mt-3  landscape:h-60 rounded-lg"
      />
    </div>
  );
};

const DummyContentHackathons = () => {
  return (
    <div className="bg-[#F5F5F7] dark:bg-neutral-800 p-8 md:p-14 rounded-3xl mb-4">
      <p className="text-neutral-600 dark:text-neutral-400 text-base md:text-2xl font-sans max-w-3xl mx-auto">
        <span className="font-bold text-neutral-700 dark:text-neutral-200">
          &quot;Code. Compete. Conquer.&quot;
        </span>{" "}
        Join hackathons, find teammates, and build something extraordinary.
        Compete in coding challenges and showcase your skills on a global stage.
      </p>
      <Image
        height="500"
        width="500"
        src="https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=3000&auto=format&fit=crop"
        alt="Hackathon event"
        className="md:w-1/2  h-full w-full mx-auto object-cover mt-3  landscape:h-60 rounded-lg"
      />
    </div>
  );
};

const data = [
  {
    category: "Networking",
    title: "Find Developers Near You.",
    src: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=3000&auto=format&fit=crop",
    content: <DummyContentNetworking />,
  },
  {
    category: "Collaboration",
    title: "Build projects with like-minded developers.",
    src: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=3000&auto=format&fit=crop",
    content: <DummyContentCollaboration />,
  },
  {
    category: "Feed & Discussions",
    title: "Share your thoughts, code snippets, and polls.",
    src: "https://images.unsplash.com/photo-1554177255-61502b352de3?q=80&w=3000&auto=format&fit=crop",
    content: <DummyContentFeed />,
  },
  {
    category: "Messaging",
    title: "Chat with developers, share code, and brainstorm.",
    src: "https://images.unsplash.com/photo-1611511574646-3c5a5824e12b?q=80&w=3000&auto=format&fit=crop",
    content: <DummyContentMessaging />,
  },
  {
    category: "Gatherings",
    title: "Host and join live developer meetups.",
    src: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=3000&auto=format&fit=crop",
    content: <DummyContentGatherings />,
  },
  {
    category: "Hackathons",
    title: "Find and team up for the next big hackathon.",
    src: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=3000&auto=format&fit=crop",
    content: <DummyContentHackathons />,
  },
];
