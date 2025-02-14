"use client";

import { motion } from "framer-motion";
import {
  Users,
  MessageSquare,
  Github,
  Globe,
  MessagesSquareIcon,
  MessageCircleCodeIcon,
} from "lucide-react";

function Features() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16 cursor-default">
      <FeatureCard
        icon={
          <Users className="w-8 h-8 mb-4 text-primary  transition-all duration-300 group-hover:text-primary/80 dark:group-hover:text-blue-200" />
        }
        title="Discover Developers"
        description="Find and connect with developers nearby. Filter by location, skills, and interests to discover potential collaborators in your area."
      />
      <FeatureCard
        icon={
          <MessageCircleCodeIcon className="w-8 h-8 mb-4 text-primary  transition-all duration-300 group-hover:text-primary/80 dark:group-hover:text-blue-200" />
        }
        title="Share Your Thoughts"
        description="Post updates about your coding journey, share technical insights, and engage with the developer community through meaningful content."
      />
      <FeatureCard
        icon={
          <MessageSquare className="w-8 h-8 mb-4 text-primary  transition-all duration-300 group-hover:text-primary/80 dark:group-hover:text-blue-200" />
        }
        title="Engage in Discussions"
        description="Start or join technical discussions, debug problems together, and exchange ideas with developers in your local community."
      />
      <FeatureCard
        icon={
          <Github className="w-8 h-8 mb-4 text-primary  transition-all duration-300 group-hover:text-primary/80 dark:group-hover:text-blue-200" />
        }
        title="GitHub Integration"
        description="Connect your GitHub profile to showcase your projects, track contributions, and find local developers with similar coding interests."
      />
      <FeatureCard
        icon={
          <MessagesSquareIcon className="w-8 h-8 mb-4 text-primary  transition-all duration-300 group-hover:text-primary/80 dark:group-hover:text-blue-200" />
        }
        title="Virtual Gatherings"
        description="Join online meetups, pair programming sessions, and code reviews with developers in your timezone and local area."
      />
      <FeatureCard
        icon={
          <Globe className="w-8 h-8 mb-4 text-primary  transition-all duration-300 group-hover:text-primary/80 dark:group-hover:text-blue-200" />
        }
        title="Global Community"
        description="Be part of a worldwide network while focusing on your local tech scene. Connect globally, interact locally with developers near you."
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
    <motion.div className="bg-background group border border-primary/5 hover:border-primary/10 text-card-foreground transition-all duration-300 rounded-xl shadow-lg p-6 flex  items-start text-center ">
      {icon}
      <div className="flex-1 text-left ml-6">
        <h2 className="text-xl font-semibold mb-2 group-hover:ml-3 group-hover:text-primary/80 dark:group-hover:text-blue-200  transition-all duration-300">
          {title}
        </h2>
        <p className="text-muted-foreground text-xs">{description}</p>
      </div>
    </motion.div>
  );
}
