"use client";

import { useState } from "react";
import Image from "next/image";
import SwissCard from "@/components/swiss/SwissCard";
import { motion } from "framer-motion";
import { Sparkles, Users2, MapPin, Code, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface WelcomeStepProps {
  session: any;
}

export default function WelcomeStep({ session }: WelcomeStepProps) {
  const [animateSparkles, setAnimateSparkles] = useState(false);

  const avatarUrl = session?.user?.image || "/profile-placeholder.png";
  const userName = session?.user?.name || "Developer";
  const firstName = userName.split(" ")[0].toUpperCase();

  const features = [
    {
      title: "CONNECT_WITH_DEVELOPERS",
      description: "FIND_DEVELOPERS_ACCORDING_TO_PROXIMITY_AND_STACK",
      icon: Users2,
    },
    {
      title: "LOCATION_BASED_GATHERINGS",
      description: "JOIN_REAL_WORLD_SYNCHRONIZATION_EVENTS",
      icon: MapPin,
    },
    {
      title: "SKILL_MATCHING_ENGINE",
      description: "OPTIMIZE_COLLABORATION_VIA_TECHNICAL_SYNERGY",
      icon: Code,
    },
    {
      title: "AI_POWERED_SUGGESTIONS",
      description: "NEURAL_NETWORK_DRIVEN_IDENTIFICATION",
      icon: Zap,
    },
  ];

  return (
    <div className="space-y-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
        className="text-center space-y-6"
      >
        <div className="relative mx-auto w-fit mb-8">
          <div className="relative w-32 h-32 mx-auto grayscale dark:grayscale-0 border-4 border-swiss-black dark:border-white shadow-[12px_12px_0_0_rgba(255,0,0,1)]">
            <Image
              src={avatarUrl}
              alt={userName}
              fill
              className="object-cover"
              priority
            />
          </div>
          <motion.div
            className="absolute -top-4 -right-4 text-4xl bg-swiss-white dark:bg-black border-4 border-swiss-black dark:border-white p-1 shadow-[4px_4px_0_0_rgba(0,0,0,1)] dark:shadow-[4px_4px_0_0_rgba(255,255,255,1)]"
            animate={{ rotate: animateSparkles ? [0, 15, -15, 0] : 0 }}
            transition={{ duration: 0.5 }}
          >
            ✨
          </motion.div>
        </div>

        <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter italic leading-none text-black dark:text-white">
          WELCOME_TO{" "}
          <span
            className="text-swiss-red"
            onMouseEnter={() => setAnimateSparkles(true)}
            onMouseLeave={() => setAnimateSparkles(false)}
          >
            CODENEARBY
          </span>
          , {firstName}!
        </h1>
        <p className="text-xl font-bold uppercase tracking-tight max-w-2xl mx-auto border-y-4 border-swiss-black dark:border-white py-4 text-black dark:text-white">
          ESTABLISHING_USER_PARAMETERS // SELECT_PROTOCOLS_TO_PROCEED
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature, idx) => (
            <SwissCard key={idx} className="p-6 border-4 border-swiss-black dark:border-white hover:bg-swiss-red hover:text-swiss-white transition-colors group">
              <div className="flex items-start space-x-6">
                <div className="bg-swiss-black dark:bg-white text-swiss-white dark:text-black p-4 group-hover:bg-swiss-white dark:group-hover:bg-black group-hover:text-swiss-black dark:group-hover:text-white transition-colors border-2 border-swiss-black dark:border-white">
                  <feature.icon className="h-8 w-8" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-black uppercase tracking-tighter leading-tight italic text-black dark:text-white group-hover:text-inherit">
                    {feature.title}
                  </h3>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 dark:opacity-40 group-hover:opacity-100 group-hover:text-inherit">
                    {feature.description}
                  </p>
                </div>
              </div>
            </SwissCard>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
