/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Code, MapPin, Loader2, Info, UserPlus, Check, X } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";

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
  developers?: any[]; // Initial developers data from the server
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

  // Store availableDevelopers in a ref to prevent it from causing re-renders
  const availableDevelopersRef = useRef(developers);

  // Format developers to ensure they have all required fields
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
      githubLocation: dev.githubLocation || "Unknown Location",
      skills: Array.isArray(dev.skills) ? dev.skills : [],
    }));
  };

  // Function to send friend request
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
          toast.info(`You've already sent a request to ${developer.name}`);
          return;
        }
        throw new Error(errorData.error || "Failed to send friend request");
      }

      // Success
      setPendingRequests((prev) => ({ ...prev, [developer._id]: "success" }));
      toast.success(`Friend request sent to ${developer.name}`);
    } catch (err) {
      console.error("Error sending friend request:", err);
      setPendingRequests((prev) => ({ ...prev, [developer._id]: "error" }));
      toast.error(`Failed to send request to ${developer.name}`);
    }
  };

  // // Fetch existing friend requests on component mount
  useEffect(() => {
    const fetchExistingRequests = async () => {
      try {
        const response = await fetch("/api/friends/requests");
        if (response.ok) {
          const data = await response.json();

          // Create a map of pending requests for quick lookup
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
        console.error("Error fetching existing friend requests:", error);
      }
    };

    fetchExistingRequests();
  }, []); // Empty dependency array ensures this only runs once on mount

  // Fetch developers with similar skills when skills change
  useEffect(() => {
    const fetchDevelopers = async () => {
      if (skills.length === 0) {
        setIsRandomDevelopers(true);
      }

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/onboarding/developers?skills=${skills.join(",")}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch developers");
        }
        const data = await response.json();

        if (!data.developers || data.developers.length === 0) {
          // If no developers returned, use the initial data or mocks
          setFilteredDevelopers(
            formatDevelopers(availableDevelopersRef.current)
          );
          setIsRandomDevelopers(true);
        } else {
          // Format and sort developers by matching skills count (if skills are provided)
          const formattedDevs = formatDevelopers(data.developers);

          if (skills.length > 0 && !data.isRandom) {
            // Sort by number of matching skills
            formattedDevs.sort((a, b) => {
              const aMatches = a.skills.filter((skill) =>
                skills.includes(skill)
              ).length;
              const bMatches = b.skills.filter((skill) =>
                skills.includes(skill)
              ).length;
              return bMatches - aMatches;
            });
          }

          setFilteredDevelopers(formattedDevs);
          setIsRandomDevelopers(data.isRandom || false);
        }
      } catch (err) {
        console.error("Error fetching developers:", err);
        setError(
          "Could not load developers. Using default recommendations instead."
        );

        // Fall back to client-side filtering
        const formattedDevelopers = formatDevelopers(
          availableDevelopersRef.current
        );
        const filtered = formattedDevelopers.filter((dev) =>
          dev.skills.some((skill) => skills.includes(skill))
        );

        if (filtered.length === 0) {
          // If no matches, use random developers
          const randomDevelopers = [...formattedDevelopers]
            .sort(() => 0.5 - Math.random())
            .slice(0, 4);
          setFilteredDevelopers(randomDevelopers);
          setIsRandomDevelopers(true);
        } else {
          setFilteredDevelopers(filtered);
          setIsRandomDevelopers(false);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDevelopers();
  }, [skills]); // Remove availableDevelopers from dependencies

  // Get request status for a developer
  const getRequestStatus = (developer: Developer) => {
    return (
      pendingRequests[developer._id] ||
      pendingRequests[developer.githubUsername] ||
      null
    );
  };

  return (
    <div className="flex flex-col items-center">
      <motion.h2
        className="text-2xl font-bold mb-3 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        Developers With Similar Skills
      </motion.h2>
      <motion.p
        className="text-center text-muted-foreground mb-4 max-w-lg"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        {skills.length > 0
          ? "These developers share some of your skills. Connect with them to grow your network."
          : "Here are some developers in the CodeNearby community. Select some skills to find developers with similar interests."}
      </motion.p>
      {isRandomDevelopers && !loading && skills.length > 0 && (
        <motion.div
          className="w-full max-w-md mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.3 }}
        >
          <Alert className="bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900">
            <Info className="h-4 w-4 text-blue-500 dark:text-blue-400" />
            <AlertDescription className="text-sm text-blue-700 dark:text-blue-300">
              We couldn&apos;t find enough developers with your exact skills.
              Showing a mix of random developers from our community instead.
            </AlertDescription>
          </Alert>
        </motion.div>
      )}
      {loading && (
        <div className="flex items-center justify-center w-full py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-muted-foreground">
            Finding developers with similar skills...
          </span>
        </div>
      )}
      {error && (
        <motion.div
          className="bg-destructive/10 text-destructive px-4 py-2 rounded-md mb-4 text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {error}
        </motion.div>
      )}
      {!loading && (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full mt-2">
          <AnimatePresence>
            {filteredDevelopers.slice(0, 6).map((developer, index) => {
              const requestStatus = getRequestStatus(developer);
              return (
                <motion.div
                  key={developer._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: 0.1 + index * 0.1, duration: 0.3 }}
                  whileHover={{
                    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
                  }}
                >
                  <Card className="h-full border overflow-hidden">
                    <CardContent className="p-6">
                      <div className="flex flex-col items-center text-center">
                        {" "}
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          transition={{
                            type: "spring",
                            stiffness: 300,
                            damping: 20,
                          }}
                        >
                          <Avatar className="h-16 w-16 mb-4 border-2 border-primary/10">
                            <AvatarImage
                              src={developer.image}
                              alt={developer.name}
                            />
                            <AvatarFallback>
                              {developer.name[0]?.toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        </motion.div>
                        <h3 className="font-semibold text-base mb-1">
                          {developer.name}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          @{developer.githubUsername}
                        </p>
                        {developer.githubLocation && (
                          <div className="flex items-center justify-center text-xs text-muted-foreground mb-3">
                            <MapPin className="h-3 w-3 mr-1" />
                            <span>{developer.githubLocation}</span>
                          </div>
                        )}{" "}
                        {/* Display matched skills count with progress bar */}
                        {skills.length > 0 && (
                          <div className="mb-3 w-full px-2">
                            {(() => {
                              const matchCount = developer.skills.filter(
                                (skill) => skills.includes(skill)
                              ).length;

                              // Calculate match percentage based on user's selected skills
                              const totalSelected = skills.length;
                              const matchPercentage = Math.min(
                                100,
                                Math.round((matchCount / totalSelected) * 100)
                              );

                              return matchCount > 0 ? (
                                <div className="w-full">
                                  <div className="flex justify-between items-center mb-1">
                                    <Badge
                                      variant="secondary"
                                      className="text-xs px-2 py-0.5"
                                    >
                                      {matchCount} skill
                                      {matchCount !== 1 ? "s" : ""} matched
                                    </Badge>
                                    {matchPercentage >= 50 && (
                                      <span className="text-xs text-green-500 font-medium">
                                        {matchPercentage}% match
                                      </span>
                                    )}
                                  </div>
                                  <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                    <motion.div
                                      className="h-full bg-gradient-to-r from-green-400 to-green-500 rounded-full"
                                      initial={{ width: 0 }}
                                      animate={{ width: `${matchPercentage}%` }}
                                      transition={{
                                        duration: 0.8,
                                        delay: index * 0.1,
                                      }}
                                    />
                                  </div>
                                </div>
                              ) : null;
                            })()}
                          </div>
                        )}
                        <div className="flex flex-wrap gap-1 justify-center mb-4">
                          {developer.skills.slice(0, 3).map((skill) => {
                            const isMatched = skills.includes(skill);
                            return (
                              <motion.div
                                key={skill}
                                initial={{ scale: 1 }}
                                animate={
                                  isMatched && !isRandomDevelopers
                                    ? {
                                        scale: [1, 1.1, 1],
                                        transition: {
                                          repeat: 1,
                                          repeatType: "reverse",
                                          duration: 0.5,
                                          delay: index * 0.1 + 0.5,
                                        },
                                      }
                                    : {}
                                }
                              >
                                <Badge
                                  variant={
                                    isMatched && !isRandomDevelopers
                                      ? "default"
                                      : "outline"
                                  }
                                  className="text-xs"
                                >
                                  {skill}
                                </Badge>
                              </motion.div>
                            );
                          })}
                          {developer.skills.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{developer.skills.length - 3} more
                            </Badge>
                          )}
                        </div>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div>
                                {requestStatus === "success" ? (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-full"
                                    disabled
                                  >
                                    <Check className="h-4 w-4 mr-1 text-green-500" />
                                    Request Sent
                                  </Button>
                                ) : requestStatus === "exists" ? (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-full"
                                    disabled
                                  >
                                    <Check className="h-4 w-4 mr-1 text-green-500" />
                                    Request Sent
                                  </Button>
                                ) : requestStatus === "error" ? (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-full text-destructive"
                                    onClick={() => sendFriendRequest(developer)}
                                  >
                                    <X className="h-4 w-4 mr-1" />
                                    Try Again
                                  </Button>
                                ) : requestStatus === "pending" ? (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-full"
                                    disabled
                                  >
                                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                                    Sending...
                                  </Button>
                                ) : (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-full hover:bg-primary hover:text-primary-foreground"
                                    onClick={() => sendFriendRequest(developer)}
                                  >
                                    <UserPlus className="h-4 w-4 mr-1" />
                                    Connect
                                  </Button>
                                )}
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              {requestStatus === "success" ||
                              requestStatus === "exists" ? (
                                <p>Friend request already sent</p>
                              ) : requestStatus === "error" ? (
                                <p>
                                  Failed to send request. Click to try again.
                                </p>
                              ) : requestStatus === "pending" ? (
                                <p>Sending friend request...</p>
                              ) : (
                                <p>Send a friend request to {developer.name}</p>
                              )}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
      {!loading && filteredDevelopers.length === 0 && (
        <motion.div
          className="mt-6 text-center text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          No developers found in the system. As more users join CodeNearby,
          you&apos;ll see developers with matching skills here.
        </motion.div>
      )}{" "}
      {!loading && filteredDevelopers.length > 0 && (
        <motion.div
          className="mt-6 flex items-center justify-center text-sm text-muted-foreground bg-muted/50 px-4 py-2 rounded-full"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          <Code className="h-4 w-4 mr-2" />
          <span>
            {!isRandomDevelopers && skills.length > 0
              ? "Higher match percentage indicates better skill alignment"
              : "Select skills above to find better matches"}
          </span>
        </motion.div>
      )}
    </div>
  );
}
