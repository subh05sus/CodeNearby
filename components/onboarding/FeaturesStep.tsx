"use client";

import { motion } from "framer-motion";
import SwissCard from "@/components/swiss/SwissCard";
import {
  Code,
  Users,
  Map,
  Calendar,
  MessageCircle,
  Zap,
} from "lucide-react";

const features = [
  {
    icon: <Users className="h-8 w-8" />,
    title: "CONNECT_WITH_DEVELOPERS",
    description: "FIND_LOCAL_TALENT_VIA_NEURAL_PROXIMITY",
  },
  {
    icon: <Map className="h-8 w-8" />,
    title: "LOCATION_GATHERINGS",
    description: "REAL_WORLD_SYNCHRONIZATION_EVENTS",
  },
  {
    icon: <Code className="h-8 w-8" />,
    title: "SKILL_MATCHING",
    description: "OPTIMIZE_TECHNICAL_SYNERGY",
  },
  {
    icon: <Zap className="h-8 w-8" />,
    title: "AI_SUGGESTIONS",
    description: "IDENTIFY_HIDDEN_OPPORTUNITIES",
  },
  {
    icon: <Calendar className="h-8 w-8" />,
    title: "DEVELOPER_FEED",
    description: "CHRONOLOGICAL_ACTIVITY_STREAM",
  },
  {
    icon: <MessageCircle className="h-8 w-8" />,
    title: "COMMUNITY_CHAT",
    description: "REAL_TIME_DATA_EXCHANGE",
  },
];

export default function FeaturesStep() {
  return (
    <div className="flex flex-col items-center space-y-12">
      <div className="text-center space-y-4">
        <motion.h2
          className="text-4xl md:text-6xl font-black uppercase tracking-tighter italic leading-none border-b-8 border-swiss-red pb-4 text-black dark:text-white"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          CORE_FEATURES_OVERVIEW
        </motion.h2>

        <motion.p
          className="text-xl font-bold uppercase tracking-tight opacity-40 dark:opacity-60 italic max-w-xl mx-auto text-black dark:text-white"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          IDENTIFYING_SYSTEM_CAPABILITIES // UNDERSTANDING_PROTOCOLS
        </motion.p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
        {features.map((feature, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              delay: 0.2 + index * 0.05,
              duration: 0.4,
            }}
            className="w-full"
          >
            <SwissCard className="h-full border-4 border-swiss-black dark:border-white p-8 bg-swiss-white dark:bg-black flex flex-col items-center text-center space-y-6 hover:bg-swiss-black dark:hover:bg-white hover:text-swiss-white dark:hover:text-black transition-all group shadow-[12px_12px_0_0_rgba(255,0,0,1)]">
              <div className="bg-swiss-black dark:bg-white text-swiss-white dark:text-black p-4 border-2 border-swiss-black dark:border-white group-hover:bg-swiss-white dark:group-hover:bg-black group-hover:text-swiss-black dark:group-hover:text-white transition-colors">
                {feature.icon}
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-black uppercase tracking-tighter leading-tight italic text-black dark:text-white group-hover:text-inherit">
                  {feature.title}
                </h3>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 dark:opacity-40 group-hover:opacity-100 leading-normal text-black dark:text-white group-hover:text-inherit">
                  {feature.description}
                </p>
              </div>
            </SwissCard>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
