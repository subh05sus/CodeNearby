"use client";

import {
  Users,
  MessageSquare,
  Github,
  Globe,
  MessagesSquareIcon,
  Bot,
} from "lucide-react";
import SwissCard from "../swiss/SwissCard";

function Features() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16 px-8">
      <FeatureCard
        icon={<Users size={32} />}
        title="Discover Developers"
        description="Filter by location, skills, and interests to discover potential collaborators in your immediate quadrant."
      />
      <FeatureCard
        icon={<Bot size={32} />}
        title="AI-Connect"
        description="Intelligent search protocols powered by advanced AI to find GitHub developers based on specific requirements."
      />
      <FeatureCard
        icon={<MessageSquare size={32} />}
        title="Engage in Discussions"
        description="Synchronous technical discourse and collective problem solving within your local developer community."
      />
      <FeatureCard
        icon={<Github size={32} />}
        title="GitHub Integration"
        description="Bi-directional project synchronization and contribution tracking to identify similar coding patterns."
      />
      <FeatureCard
        icon={<MessagesSquareIcon size={32} />}
        title="Virtual Gatherings"
        description="Host and join encrypted live meetups, pair programming sessions, and collaborative code reviews."
      />
      <FeatureCard
        icon={<Globe size={32} />}
        title="Global Community"
        description="Universal network connectivity with a focus on local tech clusters. Macro reach, micro interaction."
      />
    </div>
  );
}

export default Features;

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <SwissCard variant="white" pattern="grid" className="group">
      <div className="flex flex-col h-full">
        <div className="mb-6 p-4 border-2 border-black dark:border-white bg-black dark:bg-white text-white dark:text-black w-fit group-hover:bg-swiss-red dark:group-hover:bg-swiss-red transition-colors">
          {icon}
        </div>
        <h2 className="text-2xl font-black uppercase  mb-4 leading-none text-black dark:text-white">
          {title}
        </h2>
        <p className="text-xs font-bold uppercase  opacity-60 dark:opacity-80 leading-relaxed italic text-black dark:text-white/60">
          {description}
        </p>
        <div className="mt-auto pt-8 flex items-center gap-2">
          <div className="w-8 h-1 bg-swiss-red" />
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-black dark:text-white">Active</span>
        </div>
      </div>
    </SwissCard>
  );
}
