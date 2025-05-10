"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import {
  Code,
  Users,
  Map,
  Calendar,
  MessageCircle,
  Sparkles,
} from "lucide-react";
import { GlowingEffect } from "@/components/ui/glowing-effect";

const features = [
  {
    icon: <Users className="h-6 w-6" />,
    title: "Connect with Developers",
    description:
      "Find developers with similar interests and skills in your area.",
  },
  {
    icon: <Map className="h-6 w-6" />,
    title: "Location-Based Gatherings",
    description: "Join coding meetups and events happening in your vicinity.",
  },
  {
    icon: <Code className="h-6 w-6" />,
    title: "Skill Matching",
    description:
      "Find projects and collaborators that match your programming skills.",
  },
  {
    icon: <Sparkles className="h-6 w-6" />,
    title: "AI-Powered Suggestions",
    description:
      "Get personalized recommendations for projects and developers.",
  },
  {
    icon: <Calendar className="h-6 w-6" />,
    title: "Developer Feed",
    description:
      "Stay updated with a personalized feed of projects, discussions, and activities from local developers.",
  },
  {
    icon: <MessageCircle className="h-6 w-6" />,
    title: "Community Chat",
    description:
      "Join topic-based discussions and get real-time help from local developers.",
  },
];

export default function FeaturesStep() {
  return (
    <div className="flex flex-col items-center">
      <motion.h2
        className="text-2xl font-bold mb-3 text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Discover CodeNearby Features
      </motion.h2>

      <motion.p
        className="text-center text-muted-foreground mb-8 max-w-lg"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        Here are some key features to help you connect with developers in your
        area.
      </motion.p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
        {features.map((feature, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: 0.2 + index * 0.1,
              duration: 0.5,
              type: "spring",
              stiffness: 100,
            }}
            className="w-full"
          >
            <Card className="h-full border relative">
              <GlowingEffect
                spread={40}
                glow={true}
                disabled={false}
                proximity={64}
                inactiveZone={0.01}
              />
              <CardContent className="p-6 flex flex-col items-center text-center">
                <motion.div
                  className="rounded-full bg-primary/10 p-3 mb-4"
                  whileHover={{ rotate: 5 }}
                >
                  {feature.icon}
                </motion.div>
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
