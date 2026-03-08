"use client";

import { motion } from "framer-motion";
import SwissCard from "@/components/swiss/SwissCard";
import { Home, UserCog, Users, MessageSquare, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

const paths = [
  {
    icon: <Home className="h-8 w-8" />,
    title: "EXPLORE_PLATFORM",
    description: "DISCOVER_ALL_THAT_CODENEARBY_HAS_TO_OFFER.",
    path: "/",
  },
  {
    icon: <UserCog className="h-8 w-8" />,
    title: "EDIT_PROFILE",
    description: "CUSTOMIZE_YOUR_PROFILE_TO_HELP_OTHERS_FIND_YOU.",
    path: "/profile/edit",
  },
  {
    icon: <Users className="h-8 w-8" />,
    title: "JUMP_TO_GATHERING",
    description: "CONNECT_WITH_OTHER_DEVELOPERS_IN_YOUR_AREA.",
    path: "/gathering",
  },
  {
    icon: <MessageSquare className="h-8 w-8" />,
    title: "POST_YOUR_FIRST_POST",
    description: "SHARE_YOUR_THOUGHTS_WITH_THE_COMMUNITY.",
    path: "/feed?source=onboarding",
  },
];

export default function FinalStep() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const completeOnboarding = async (path: string) => {
    try {
      setIsLoading(true);
      await fetch("/api/user/complete-onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          skills: [],
          joinGathering: true,
        }),
      });

      localStorage.removeItem("onboardingStep");
      localStorage.removeItem("onboardingSkills");
      localStorage.removeItem("onboardingJoinGathering");

      router.push(path);
    } catch (error) {
      console.error("Error completing onboarding:", error);
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-12">
      <div className="text-center space-y-4">
        <motion.h2
          className="text-5xl md:text-8xl font-black uppercase tracking-tighter italic leading-none border-b-[12px] border-swiss-red pb-6 text-black dark:text-white"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          SYSTEM_DEPLOYMENT_READY
        </motion.h2>

        <motion.p
          className="text-2xl font-black uppercase tracking-tight opacity-40 dark:opacity-60 italic max-w-2xl mx-auto text-black dark:text-white"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          ALL_PARAMETERS_CALIBRATED // SELECT_INITIAL_UPLINK_PATH
        </motion.p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
        {paths.map((path, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 + index * 0.1 }}
            className="w-full h-full"
          >
            <SwissCard
              className="h-full border-4 border-black dark:border-white p-8 bg-white dark:bg-black hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black group transition-all cursor-pointer shadow-[12px_12px_0_0_rgba(0,0,0,1)] dark:shadow-[12px_12px_0_0_rgba(255,255,255,1)] hover:shadow-[12px_12px_0_0_rgba(255,0,0,1)] flex flex-col items-start"
              onClick={() => completeOnboarding(path.path)}
            >
              <div className="mb-6 p-4 border-2 border-black dark:border-white group-hover:border-white dark:group-hover:border-black transition-colors">
                {path.icon}
              </div>
              <div className="flex-1 space-y-2">
                <h3 className="font-black text-3xl uppercase tracking-tighter italic leading-none text-black dark:text-white group-hover:text-inherit">{path.title}</h3>
                <p className="text-xs font-black uppercase tracking-widest opacity-60 dark:opacity-40 italic group-hover:opacity-100 transition-opacity text-black dark:text-white group-hover:text-inherit">
                  {path.description}
                </p>
              </div>
              <div className="mt-8 flex items-center gap-2 font-black uppercase text-[10px] tracking-[0.4em] border-b-2 border-swiss-red group-hover:border-white dark:group-hover:border-black transition-colors text-black dark:text-white group-hover:text-inherit">
                INITIALIZE_BOOT_SEQUENCE
              </div>
            </SwissCard>
          </motion.div>
        ))}
      </div>

      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/90 dark:bg-black/95 backdrop-blur-xl z-[9999] flex flex-col items-center justify-center text-white space-y-4 transition-colors"
        >
          <div className="p-8 border-8 border-white bg-black shadow-[16px_16px_0_0_rgba(255,0,0,1)] text-center">
            <Loader2 className="h-16 w-16 animate-spin text-swiss-red mx-auto mb-6" />
            <h2 className="text-4xl font-black uppercase tracking-tighter italic">FINALIZING_SYSTEM_SYNC...</h2>
          </div>
        </motion.div>
      )}
    </div>
  );
}
