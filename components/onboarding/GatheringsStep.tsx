"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Users, MapPin, Calendar, ArrowRight, InfoIcon } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { GlowingEffect } from "@/components/ui/glowing-effect";

interface GatheringsStepProps {
  onJoinChange: (join: boolean) => void;
  isJoining: boolean;
}

export default function GatheringsStep({
  onJoinChange,
  isJoining,
}: GatheringsStepProps) {
  return (
    <div className="flex flex-col items-center">
      <motion.h2
        className="text-2xl font-bold mb-3 text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Join Our Community Gatherings
      </motion.h2>

      <motion.p
        className="text-center text-muted-foreground mb-8 max-w-lg"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        You&apos;ve been added to the &quot;All Developers&quot; gathering -
        your starting point to connect with the entire community.
      </motion.p>

      <motion.div
        className="w-full max-w-2xl"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{
          delay: 0.3,
          duration: 0.5,
          type: "spring",
          stiffness: 100,
        }}
      >
        <Card className="border shadow-md overflow-hidden relative hover:shadow-lg transition-all duration-300">
          <GlowingEffect
            spread={60}
            glow={isJoining}
            disabled={false}
            proximity={80}
            inactiveZone={0.01}
          />
          <div
            className={`absolute inset-0 bg-gradient-to-r ${
              isJoining ? "from-primary/5 to-primary/10" : ""
            } transition-all duration-500`}
          ></div>

          <CardContent className="p-6 relative z-10">
            <div className="flex flex-col gap-4">
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="flex justify-between items-start flex-col md:flex-row md:items-center  "
              >
                <h3 className="text-xl font-semibold flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  All Developers Gathering
                </h3>

                <motion.div
                  animate={{ scale: isJoining ? 1 : 0.95, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <Badge
                    variant={isJoining ? "default" : "outline"}
                    className={`${
                      isJoining
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground"
                    } transition-all duration-300`}
                  >
                    {isJoining ? "Active Member" : "Not Joined"}
                  </Badge>
                </motion.div>
              </motion.div>

              <div className="space-y-2 mt-1">
                <motion.div
                  className="flex items-center text-muted-foreground"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                >
                  <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span>Global (Virtual)</span>
                </motion.div>

                <motion.div
                  className="flex items-center text-muted-foreground"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.6, duration: 0.5 }}
                >
                  <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span>Always active</span>
                </motion.div>
              </div>

              <motion.div
                className="bg-muted/50 p-4 rounded-lg my-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7, duration: 0.5 }}
              >
                <p className="text-sm">
                  This is our main community gathering where all developers can
                  connect, share ideas, ask for help, and discover other
                  specialized gatherings.
                </p>
              </motion.div>

              <motion.div
                className="mt-2 flex items-center text-primary"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9, duration: 0.5 }}
                whileHover={{ x: 5 }}
              >
                <span className="text-sm font-medium">
                  You&apos;ll have access after onboarding
                </span>
                <ArrowRight className="h-4 w-4 ml-1" />
              </motion.div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        className="flex flex-col items-center pt-6 w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.5 }}
      >
        <div className="flex items-center justify-center gap-2 min-h-[28px] w-full">
          <div className="flex items-center justify-end w-[60px]">
            <Switch
              id="join-gathering"
              checked={isJoining}
              onCheckedChange={onJoinChange}
            />
          </div>

          <div className="w-[180px] relative h-[24px]">
            <div className="absolute inset-0 flex items-center">
              <Label
                htmlFor="join-gathering"
                className={`cursor-pointer text-sm transition-opacity duration-300 whitespace-nowrap ${
                  isJoining ? "opacity-100" : "opacity-0"
                }`}
              >
                Keep me in this gathering
              </Label>
            </div>
            <div className="absolute inset-0 flex items-center">
              <Label
                htmlFor="join-gathering"
                className={`cursor-pointer text-sm transition-opacity duration-300 whitespace-nowrap ${
                  !isJoining ? "opacity-100" : "opacity-0"
                }`}
              >
                I&apos;ll join later
              </Label>
            </div>
          </div>

          <div className="w-[24px] flex justify-center">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <InfoIcon className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>
                    You can always join or leave gatherings later through your
                    profile settings.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        <motion.p
          className="text-center text-sm text-muted-foreground mt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1, duration: 0.5 }}
        >
          You can join more specialized gatherings or create your own after
          completing onboarding.
        </motion.p>
      </motion.div>
    </div>
  );
}
