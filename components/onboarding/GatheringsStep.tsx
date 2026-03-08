"use client";

import { motion } from "framer-motion";
import SwissCard from "@/components/swiss/SwissCard";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Users, MapPin, Calendar, ArrowRight, InfoIcon } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface GatheringsStepProps {
  onJoinChange: (join: boolean) => void;
  isJoining: boolean;
}

export default function GatheringsStep({
  onJoinChange,
  isJoining,
}: GatheringsStepProps) {
  return (
    <div className="flex flex-col items-center space-y-12">
      <div className="text-center space-y-4">
        <motion.h2
          className="text-4xl md:text-6xl font-black uppercase tracking-tighter italic leading-none border-b-8 border-swiss-red pb-4 text-black dark:text-white"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          COMMUNITY_GATHERINGS
        </motion.h2>

        <motion.p
          className="text-xl font-bold uppercase tracking-tight opacity-40 dark:opacity-60 italic max-w-xl mx-auto text-black dark:text-white"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          INITIALIZING_NETWORK_INTEGRATION // GROUP_ID: ALL_DEVELOPERS
        </motion.p>
      </div>

      <motion.div
        className="w-full max-w-3xl"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{
          delay: 0.3,
          duration: 0.5,
        }}
      >
        <SwissCard className={cn(
          "border-8 transition-all duration-500 bg-swiss-white dark:bg-black p-10 shadow-[24px_24px_0_0_rgba(0,0,0,1)] dark:shadow-[24px_24px_0_0_rgba(255,255,255,1)]",
          isJoining ? "border-swiss-black dark:border-white" : "border-swiss-red shadow-[24px_24px_0_0_rgba(255,0,0,1)]"
        )}>
          <div className="flex flex-col gap-8">
            <div className="flex justify-between items-start flex-col md:flex-row md:items-center gap-4">
              <h3 className="text-3xl font-black uppercase tracking-tighter italic flex items-center gap-4 text-black dark:text-white">
                <Users className="h-10 w-10 text-swiss-red" />
                ALL_DEVELOPERS_GATHERING
              </h3>

              <div className={cn(
                "px-4 py-2 text-sm font-black uppercase tracking-widest border-4",
                isJoining
                  ? "bg-swiss-black dark:bg-white text-swiss-white dark:text-black border-swiss-black dark:border-white"
                  : "bg-swiss-white dark:bg-black text-swiss-red border-swiss-red"
              )}>
                {isJoining ? "ACTIVE_MEMBER" : "INACTIVE_STATUS"}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-y-4 border-swiss-black dark:border-white py-8">
              <div className="flex items-center gap-4 text-black dark:text-white">
                <div className="bg-swiss-black dark:bg-white text-swiss-white dark:text-black p-2">
                  <MapPin className="h-6 w-6" />
                </div>
                <span className="text-xl font-black uppercase tracking-tighter italic">GLOBAL // VIRTUAL</span>
              </div>

              <div className="flex items-center gap-4 text-black dark:text-white">
                <div className="bg-swiss-black dark:bg-white text-swiss-white dark:text-black p-2">
                  <Calendar className="h-6 w-6" />
                </div>
                <span className="text-xl font-black uppercase tracking-tighter italic">ALWAYS_ACTIVE</span>
              </div>
            </div>

            <div className="bg-black dark:bg-neutral-900 text-white p-8">
              <p className="text-xs font-black uppercase tracking-[0.2em] leading-relaxed">
                PRIMARY_RESOURCE_NODE_FOR_COMMUNITY_SYNCHRONIZATION. ACCESS_GRANTED_FOR_IDEA_EXCHANGE, PROBLEM_SOLVING, AND_SPECIALIZED_INTERACTION_DISCOVERY.
              </p>
            </div>

            <div className="flex items-center text-swiss-red font-black uppercase tracking-tighter italic group cursor-default">
              <span className="text-xl border-b-4 border-swiss-red">
                ACCESS_PENDING_ONBOARDING_COMPLETION
              </span>
              <ArrowRight className="h-6 w-6 ml-2 transition-transform group-hover:translate-x-2" />
            </div>
          </div>
        </SwissCard>
      </motion.div>

      <motion.div
        className="flex flex-col items-center pt-12 w-full max-w-xl space-y-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.5 }}
      >
        <div className="flex items-center justify-center gap-8 bg-swiss-black dark:bg-white text-swiss-white dark:text-black p-8 border-4 border-swiss-black dark:border-white w-full shadow-[12px_12px_0_0_rgba(255,0,0,1)]">
          <div className="flex items-center gap-4">
            <Switch
              id="join-gathering"
              checked={isJoining}
              onCheckedChange={onJoinChange}
              className="data-[state=checked]:bg-swiss-red data-[state=unchecked]:bg-swiss-white dark:data-[state=unchecked]:bg-black h-8 w-14"
            />
            <Label
              htmlFor="join-gathering"
              className="text-xl font-black uppercase tracking-tighter italic cursor-pointer min-w-[240px]"
            >
              {isJoining ? "KEEP_MEMBERSHIP_ACTIVE" : "INITIALIZE_LATER"}
            </Label>
          </div>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="p-2 border-2 border-swiss-white dark:border-black hover:bg-swiss-white dark:hover:bg-black hover:text-swiss-black dark:hover:text-white transition-colors cursor-help">
                  <InfoIcon className="h-6 w-6" />
                </div>
              </TooltipTrigger>
              <TooltipContent className="bg-swiss-black dark:bg-white text-swiss-white dark:text-black border-2 border-swiss-white dark:border-black p-4 max-w-xs rounded-none">
                <p className="text-[10px] font-black uppercase tracking-widest">
                  MEMBERSHIP_STATUS_CAN_BE_MODIFIED_IN_CORE_NETWORK_SETTINGS_POST_ONBOARDING.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <p className="text-center text-[10px] font-black uppercase tracking-[0.3em] opacity-40 dark:opacity-60 leading-loose max-w-md text-black dark:text-white">
          SPECIALIZED_NODES_AND_CUSTOM_GATHERING_CREATION_AVAILABLE_UPON_SYSTEM_INITIALIZATION.
        </p>
      </motion.div>
    </div>
  );
}
