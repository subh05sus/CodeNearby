/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Loader2, Users, Clock, ArrowRight, Sparkles } from "lucide-react";
import LoginButton from "@/components/login-button";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import confetti from "canvas-confetti";
import { toast } from "sonner";
import { Session } from "next-auth";

interface Gathering {
  id: string;
  name: string;
  slug: string;
  expiresAt: string;
  hostId: string;
  host: {
    name: string;
    image: string;
  };
  participants: Array<{
    name: string;
    image: string;
    _id: string;
  }>;
}

const container = {
  hidden: { opacity: 0, scale: 0.95 },
  show: {
    opacity: 1,
    scale: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function JoinGatheringPage() {
  const { data: session } = useSession() as { data: Session | null };
  const params = useParams();
  const router = useRouter();
  const [gathering, setGathering] = useState<Gathering | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    if (session) {
      fetchGathering();
    }
  }, [session]);

  const fetchGathering = async () => {
    try {
      const response = await fetch(`/api/gathering/${params.slug}`);
      if (!response.ok) {
        throw new Error("Failed to fetch gathering");
      }
      const data = await response.json();
      setGathering(data);
    } catch {
      toast.error("Failed to fetch gathering. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleJoinGathering = async () => {
    setJoining(true);
    try {
      const response = await fetch("/api/gathering/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uniqueSlug: params.slug }),
      });

      if (!response.ok) {
        throw new Error("Failed to join gathering");
      }

      toast.success("Gathering joined successfully!");
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
      router.push(`/gathering/${params.slug}`);
    } catch {
      toast.error("Failed to join gathering. Please try again.");
    } finally {
      setJoining(false);
    }
  };

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh]">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Welcome to Gatherings</CardTitle>
            <CardDescription>
              Sign in to join this gathering with other developers
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <LoginButton />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[80vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!gathering) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh]">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle className="text-2xl">Gathering Not Found</CardTitle>
            <CardDescription>
              The gathering you&apos;re looking for doesn&apos;t exist or has
              expired
            </CardDescription>
          </CardHeader>
          <CardFooter className="justify-center">
            <Button variant="outline" onClick={() => router.push("/gathering")}>
              View All Gatherings
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (
    gathering.participants?.find(
      (participant) => participant._id === session?.user?.id
    )
  ) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh]">
        <Card className="w-full max-w-md text-center pb-6">
          <CardHeader>
            <CardTitle className="text-2xl">Already Joined</CardTitle>
            <CardDescription>
              You have already joined this gathering
            </CardDescription>
          </CardHeader>
          <CardFooter className="justify-center">
            <Button
              variant="outline"
              onClick={() => router.push(`/gathering/${gathering.slug}`)}
            >
              View Gathering
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  const timeLeft =
    new Date(gathering.expiresAt).getTime() - new Date().getTime();
  const isExpired = timeLeft <= 0;

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8 min-h-[80vh] flex items-center justify-center">
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="w-full max-w-lg"
      >
        <Card className="relative overflow-hidden pb-4">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-background" />
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />

          <CardHeader className="relative">
            <motion.div variants={item} className="space-y-2">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <Badge variant="secondary">Active Gathering</Badge>
              </div>
              <CardTitle className="text-3xl font-bold">
                {gathering.name}
              </CardTitle>
              <CardDescription className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                {isExpired
                  ? "This gathering has expired"
                  : `Expires ${formatDistanceToNow(
                      new Date(gathering.expiresAt),
                      {
                        addSuffix: true,
                      }
                    )}`}
              </CardDescription>
            </motion.div>
          </CardHeader>

          <CardContent className="relative space-y-6">
            <motion.div variants={item} className="space-y-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 border-2 border-background">
                  <AvatarImage src={gathering.host?.image} />
                  <AvatarFallback>H</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm text-muted-foreground">Hosted by</p>
                  <p className="font-medium">{gathering.host?.name}</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {gathering.participants?.length || 0} participants
                  </span>
                </div>
                <div className="flex -space-x-2">
                  {gathering.participants?.slice(0, 5).map((participant, i) => (
                    <Avatar
                      key={i}
                      className="border-2 border-background h-8 w-8"
                    >
                      <AvatarImage src={participant.image} />
                      <AvatarFallback>{participant.name?.[0]}</AvatarFallback>
                    </Avatar>
                  ))}
                  {gathering.participants?.length > 5 && (
                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-sm border-2 border-background">
                      +{gathering.participants.length - 5}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </CardContent>

          <CardFooter className="relative">
            <motion.div variants={item} className="w-full">
              <Button
                onClick={handleJoinGathering}
                className="w-full relative overflow-hidden group hover:scale-[1.02] transition-transform"
                size="lg"
                disabled={joining || isExpired}
              >
                {joining && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {joining ? (
                  "Joining..."
                ) : isExpired ? (
                  "Gathering has expired"
                ) : (
                  <>
                    Join Gathering
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
                <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/25 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Button>
            </motion.div>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
