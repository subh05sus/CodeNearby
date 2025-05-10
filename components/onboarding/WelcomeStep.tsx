"use client";

import { useState } from "react";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

interface WelcomeStepProps {
  session: any;
}

export default function WelcomeStep({ session }: WelcomeStepProps) {
  const [animateSparkles, setAnimateSparkles] = useState(false);

  const avatarUrl = session?.user?.image || "/profile-placeholder.png";
  const userName = session?.user?.name || "Developer";
  const firstName = userName.split(" ")[0];

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
        className="text-center space-y-4"
      >
        <div className="relative mx-auto w-fit mb-6">
          <div className="relative w-20 h-20 mx-auto overflow-hidden rounded-full ring-4 ring-primary/20">
            <Image
              src={avatarUrl}
              alt={userName}
              fill
              className="object-cover"
              priority
            />
          </div>
          <motion.div
            className="absolute -top-2 -right-2 text-2xl"
            animate={{ rotate: animateSparkles ? [0, 15, -15, 0] : 0 }}
            transition={{ duration: 0.5 }}
          >
            ✨
          </motion.div>
        </div>

        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
          Welcome to{" "}
          <span
            className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60"
            onMouseEnter={() => setAnimateSparkles(true)}
            onMouseLeave={() => setAnimateSparkles(false)}
          >
            CodeNearby
          </span>
          , {firstName}!
        </h1>
        <p className="text-lg text-muted-foreground max-w-lg mx-auto">
          Let&apos;s set up your profile and preferences to help you connect
          with developers nearby and discover coding opportunities.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="overflow-hidden border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div className="bg-primary/10 rounded-full p-3 text-primary">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-users-2"
                  >
                    <path d="M14 19a6 6 0 0 0-12 0" />
                    <circle cx="8" cy="9" r="4" />
                    <path d="M22 19a6 6 0 0 0-6-6 4 4 0 1 0 0-8" />
                  </svg>
                </div>
                <div className="space-y-1">
                  <h3 className="font-medium">Connect with Developers</h3>
                  <p className="text-sm text-muted-foreground">
                    Find developers with similar interests and skills in your
                    area.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div className="bg-primary/10 rounded-full p-3 text-primary">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-map-pin"
                  >
                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                </div>
                <div className="space-y-1">
                  <h3 className="font-medium">Location-Based Gatherings</h3>
                  <p className="text-sm text-muted-foreground">
                    Join coding meetups and events happening in your vicinity.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div className="bg-primary/10 rounded-full p-3 text-primary">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-code"
                  >
                    <polyline points="16 18 22 12 16 6" />
                    <polyline points="8 6 2 12 8 18" />
                  </svg>
                </div>
                <div className="space-y-1">
                  <h3 className="font-medium">Skill Matching</h3>
                  <p className="text-sm text-muted-foreground">
                    Find projects and collaborators that match your programming
                    skills.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div className="bg-primary/10 rounded-full p-3 text-primary">
                  <Sparkles className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-medium">AI-Powered Suggestions</h3>
                  <p className="text-sm text-muted-foreground">
                    Get personalized recommendations for projects and
                    developers.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </div>
  );
}
