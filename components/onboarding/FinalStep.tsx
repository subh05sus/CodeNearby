"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Home, UserCog, Users, MessageSquare } from "lucide-react";
import { useRouter } from "next/navigation";

const paths = [
  {
    icon: <Home className="h-6 w-6" />,
    title: "Explore Platform",
    description: "Discover all that CodeNearby has to offer.",
    path: "/",
    color: "bg-blue-100 dark:bg-blue-900/20",
    textColor: "text-blue-600 dark:text-blue-400",
  },
  {
    icon: <UserCog className="h-6 w-6" />,
    title: "Edit Profile",
    description: "Customize your profile to help others find you.",
    path: "/profile/update",
    color: "bg-purple-100 dark:bg-purple-900/20",
    textColor: "text-purple-600 dark:text-purple-400",
  },
  {
    icon: <Users className="h-6 w-6" />,
    title: "Jump to Gathering",
    description: "Connect with other developers in your area.",
    path: "/gathering",
    color: "bg-green-100 dark:bg-green-900/20",
    textColor: "text-green-600 dark:text-green-400",
  },
  {
    icon: <MessageSquare className="h-6 w-6" />,
    title: "Post Your First Post",
    description: "Share your thoughts with the community.",
    path: "/feed",
    color: "bg-orange-100 dark:bg-orange-900/20",
    textColor: "text-orange-600 dark:text-orange-400",
  },
];

export default function FinalStep() {
  const router = useRouter();
  return (
    <div className="flex flex-col items-center">
      <motion.h2
        className="text-2xl font-bold mb-3 text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Welcome to CodeNearby!
      </motion.h2>

      <motion.p
        className="text-center text-muted-foreground mb-8 max-w-lg"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        You&apos;re all set! Here are some paths to get you started on your
        journey.
      </motion.p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
        {paths.map((path, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: 0.3 + index * 0.1,
              duration: 0.5,
              type: "spring",
              stiffness: 100,
            }}
            whileHover={{
              scale: 1.03,
              boxShadow: "0 10px 30px -15px rgba(0, 0, 0, 0.2)",
            }}
            className="w-full"
          >
            <Link href={path.path} passHref>
              <Card className="h-full border cursor-pointer">
                <CardContent className="p-6 flex items-center">
                  <motion.div
                    className={`rounded-full p-3 mr-4 ${path.color}`}
                    whileHover={{ rotate: 5 }}
                  >
                    <div className={path.textColor}>{path.icon}</div>
                  </motion.div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">{path.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {path.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>

      <motion.div
        className="mt-8"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.8, duration: 0.5 }}
      >
        <Button
          size="lg"
          className="px-8"
          onClick={() => {
            router.push("/");
          }}
        >
          Get Started
        </Button>
      </motion.div>
    </div>
  );
}
