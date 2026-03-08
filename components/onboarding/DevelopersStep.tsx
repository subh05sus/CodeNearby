/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SwissCard from "@/components/swiss/SwissCard";
import SwissButton from "@/components/swiss/SwissButton";
import { Code, MapPin, Loader2, Info, UserPlus, Check, X } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface Developer {
  _id: string;
  name: string;
  image: string;
  githubUsername: string;
  githubId?: number;
  githubLocation?: string;
  skills: string[];
}

interface DevelopersStepProps {
  skills: string[];
  developers?: any[];
}

export default function DevelopersStep({
  skills,
  developers = [],
}: DevelopersStepProps) {
  const [filteredDevelopers, setFilteredDevelopers] = useState<Developer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRandomDevelopers, setIsRandomDevelopers] = useState(false);
  const [pendingRequests, setPendingRequests] = useState<{
    [key: string]: string;
  }>({});

  const availableDevelopersRef = useRef(developers);

  const formatDevelopers = (devs: any[]): Developer[] => {
    return devs.map((dev) => ({
      _id: dev._id?.toString() || Math.random().toString(),
      name: dev.name || "Anonymous Developer",
      image:
        dev.image ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(
          dev.name || "User"
        )}&background=random`,
      githubUsername: dev.githubUsername || "developer",
      githubId: dev.githubId || null,
      githubLocation: dev.githubLocation || "UNKNOWN_LOCATION",
      skills: Array.isArray(dev.skills) ? dev.skills : [],
    }));
  };

  const sendFriendRequest = async (developer: Developer) => {
    try {
      setPendingRequests((prev) => ({ ...prev, [developer._id]: "pending" }));

      const response = await fetch("/api/friends/request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: developer.githubId,
          login: developer.githubUsername,
          avatar_url: developer.image,
          html_url: `https://github.com/${developer.githubUsername}`,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.error === "Request already sent") {
          setPendingRequests((prev) => ({
            ...prev,
            [developer._id]: "exists",
          }));
          toast.info(`ALREADY_SENT_TO_${developer.name.toUpperCase()}`);
          return;
        }
        throw new Error(errorData.error || "FAILED_TO_SEND");
      }

      setPendingRequests((prev) => ({ ...prev, [developer._id]: "success" }));
      toast.success(`REQUEST_SENT_TO_${developer.name.toUpperCase()}`);
    } catch (err) {
      console.error("Error sending friend request:", err);
      setPendingRequests((prev) => ({ ...prev, [developer._id]: "error" }));
      toast.error(`FAILED_TO_SEND_TO_${developer.name.toUpperCase()}`);
    }
  };

  useEffect(() => {
    const fetchExistingRequests = async () => {
      try {
        const response = await fetch("/api/friends/requests");
        if (response.ok) {
          const data = await response.json();
          const requestMap: { [key: string]: string } = {};
          data.forEach((request: any) => {
            if (
              request.status === "pending" &&
              request.receiverGithubUsername
            ) {
              requestMap[request.receiverGithubUsername] = "exists";
            }
          });
          setPendingRequests(requestMap);
        }
      } catch (error) {
        console.error("Error fetching requests:", error);
      }
    };
    fetchExistingRequests();
  }, []);

  useEffect(() => {
    const fetchDevelopers = async () => {
      if (skills.length === 0) setIsRandomDevelopers(true);
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/onboarding/developers?skills=${skills.join(",")}`
        );
        if (!response.ok) throw new Error("FETCH_FAILED");
        const data = await response.json();

        if (!data.developers || data.developers.length === 0) {
          setFilteredDevelopers(formatDevelopers(availableDevelopersRef.current));
          setIsRandomDevelopers(true);
        } else {
          const formattedDevs = formatDevelopers(data.developers);
          if (skills.length > 0 && !data.isRandom) {
            formattedDevs.sort((a, b) => {
              const aMatches = a.skills.filter((skill) => skills.includes(skill)).length;
              const bMatches = b.skills.filter((skill) => skills.includes(skill)).length;
              return bMatches - aMatches;
            });
          }
          setFilteredDevelopers(formattedDevs);
          setIsRandomDevelopers(data.isRandom || false);
        }
      } catch (err) {
        setFilteredDevelopers(formatDevelopers(availableDevelopersRef.current).slice(0, 6));
        setIsRandomDevelopers(true);
      } finally {
        setLoading(false);
      }
    };
    fetchDevelopers();
  }, [skills]);

  const getRequestStatus = (developer: Developer) => {
    return pendingRequests[developer._id] || pendingRequests[developer.githubUsername] || null;
  };

  return (
    <div className="flex flex-col items-center space-y-12">
      <div className="text-center space-y-4">
        <motion.h2
          className="text-4xl md:text-6xl font-black uppercase tracking-tighter italic leading-none border-b-8 border-swiss-red pb-4 text-black dark:text-white"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          SIMILAR_TECHNICAL_IDENTITIES
        </motion.h2>
        <motion.p
          className="text-xl font-bold uppercase tracking-tight opacity-40 dark:opacity-60 italic max-w-xl mx-auto text-black dark:text-white"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {skills.length > 0
            ? "IDENTIFYING_SYSTEMS_WITH_MATCHING_STACK_PARAMETERS"
            : "GENERAL_COMMUNITY_IDENTITIES_DETECTED // SELECT_SKILLS_FOR_PRECISION"}
        </motion.p>
      </div>

      {isRandomDevelopers && !loading && skills.length > 0 && (
        <Alert className="max-w-xl border-4 border-swiss-black dark:border-white bg-swiss-red text-swiss-white rounded-none">
          <Info className="h-4 w-4" />
          <AlertDescription className="font-black uppercase tracking-tighter text-xs">
            INSUFFICIENT_EXACT_MATCHES // DISPLAYING_MIXED_NEURAL_PROFILES
          </AlertDescription>
        </Alert>
      )}

      {loading && (
        <div className="flex flex-col items-center justify-center p-20 space-y-4 text-black dark:text-white">
          <Loader2 className="h-12 w-12 animate-spin text-swiss-red" />
          <span className="text-xl font-black uppercase tracking-tighter italic">SCANNING_NETWORK...</span>
        </div>
      )}

      {!loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 w-full">
          <AnimatePresence>
            {filteredDevelopers.slice(0, 6).map((developer, index) => {
              const requestStatus = getRequestStatus(developer);
              const matchCount = developer.skills.filter(s => skills.includes(s)).length;
              const matchPercentage = skills.length > 0 ? Math.min(100, Math.round((matchCount / skills.length) * 100)) : 0;

              return (
                <motion.div
                  key={developer._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <SwissCard className="h-full border-4 border-swiss-black dark:border-white p-8 bg-swiss-white dark:bg-black shadow-[12px_12px_0_0_rgba(0,0,0,1)] dark:shadow-[12px_12px_0_0_rgba(255,255,255,1)] hover:shadow-[12px_12px_0_0_rgba(255,0,0,1)] transition-all flex flex-col items-center text-center">
                    <div className="relative w-24 h-24 mb-6 ring-4 ring-swiss-black dark:ring-white grayscale group-hover:grayscale-0 transition-all overflow-hidden border-4 border-swiss-white dark:border-black shadow-[8px_8px_0_0_rgba(0,0,0,1)] dark:shadow-[8px_8px_0_0_rgba(255,255,255,1)]">
                      <Image src={developer.image} alt={developer.name} fill className="object-cover" />
                    </div>

                    <div className="space-y-1 mb-4">
                      <h3 className="text-xl font-black uppercase tracking-tighter italic leading-none text-black dark:text-white">{developer.name}</h3>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 dark:opacity-60 italic text-black dark:text-white">@{developer.githubUsername}</p>
                    </div>

                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest opacity-60 mb-6 bg-swiss-muted dark:bg-white dark:text-black px-3 py-1 border-2 border-swiss-black dark:border-white">
                      <MapPin className="h-3 w-3" />
                      {(developer.githubLocation || "UNKNOWN_LOCATION").toUpperCase()}
                    </div>

                    {skills.length > 0 && matchCount > 0 && (
                      <div className="w-full space-y-2 mb-6 text-black dark:text-white">
                        <div className="flex justify-between items-end">
                          <span className="text-[10px] font-black uppercase tracking-widest leading-none">MATCH_PRECISION</span>
                          <span className="text-xl font-black uppercase tracking-tighter italic leading-none">{matchPercentage}%</span>
                        </div>
                        <div className="h-4 w-full bg-swiss-muted dark:bg-white/10 border-2 border-swiss-black dark:border-white group overflow-hidden">
                          <motion.div
                            className="h-full bg-swiss-red"
                            initial={{ width: 0 }}
                            animate={{ width: `${matchPercentage}%` }}
                            transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                          />
                        </div>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-2 justify-center mb-8 h-20 overflow-hidden">
                      {developer.skills.slice(0, 4).map(skill => (
                        <div key={skill} className={cn(
                          "px-2 py-1 text-[8px] font-black uppercase tracking-[0.2em] border-2",
                          skills.includes(skill)
                            ? "bg-swiss-black dark:bg-white text-swiss-white dark:text-black border-swiss-black dark:border-white"
                            : "border-swiss-muted dark:border-white/20 opacity-40 dark:opacity-20 text-black dark:text-white"
                        )}>
                          {skill}
                        </div>
                      ))}
                    </div>

                    <div className="w-full mt-auto">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="w-full">
                              <SwissButton
                                variant={requestStatus === "success" || requestStatus === "exists" ? "secondary" : "primary"}
                                className="w-full h-12 text-sm"
                                disabled={requestStatus === "pending" || requestStatus === "success" || requestStatus === "exists"}
                                onClick={() => sendFriendRequest(developer)}
                              >
                                {requestStatus === "pending" ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                {requestStatus === "success" || requestStatus === "exists" ? "UPLINK_ESTABLISHED" : "INITIALIZE_CONNECT"}
                              </SwissButton>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent className="bg-swiss-black dark:bg-white text-swiss-white dark:text-black border-2 border-swiss-white dark:border-black p-4 rounded-none">
                            <p className="text-[10px] font-black uppercase tracking-widest italic">
                              {requestStatus === "success" || requestStatus === "exists" ? "ACCESS_GRANTED" : `SEND_REQUEST_TO_${developer.name.toUpperCase()}`}
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </SwissCard>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {!loading && filteredDevelopers.length === 0 && (
        <div className="text-center p-12 border-4 border-swiss-black dark:border-white border-dotted max-w-xl text-black dark:text-white">
          <p className="text-xl font-black uppercase tracking-tighter italic">NO_VALID_IDENTITIES_FOUND_IN_SYSTEM_CACHE</p>
        </div>
      )}

      {!loading && filteredDevelopers.length > 0 && (
        <motion.div
          className="mt-12 flex items-center gap-4 bg-swiss-black dark:bg-white text-swiss-white dark:text-black px-8 py-4 border-4 border-swiss-black dark:border-white shadow-[8px_8px_0_0_rgba(255,0,0,1)]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Code className="h-6 w-6 text-swiss-red" />
          <span className="font-black uppercase tracking-[0.3em] text-xs leading-none">
            {!isRandomDevelopers && skills.length > 0
              ? "MATCH_ACCURACY_QUANTIFIED_VIA_NEURAL_ALIGNMENT"
              : "DEFINE_TECHNICAL_PARAMETERS_TO_INCREASE_PRECISION"}
          </span>
        </motion.div>
      )}
    </div>
  );
}
