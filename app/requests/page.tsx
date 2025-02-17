"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Check, X } from "lucide-react";
import Image from "next/image";
import type { FriendRequest } from "@/types";
import type { Session } from "next-auth";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import Link from "next/link";

export default function RequestsPage() {
  const { data: session } = useSession() as { data: Session | null };
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (session) {
      fetchRequests();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  const fetchRequests = async () => {
    try {
      const response = await fetch("/api/friends/requests");
      const data = await response.json();
      setRequests(data.reverse());
    } catch {
      toast({
        title: "Error",
        description: "Failed to fetch requests.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRequest = async (
    requestId: string,
    action: "accept" | "reject"
  ) => {
    try {
      const response = await fetch(`/api/friends/request/${requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: action === "accept" ? "accepted" : "rejected",
        }),
      });

      if (!response.ok) throw new Error("Failed to update request");

      toast({
        title: "Success",
        description: `Request ${action}ed successfully!`,
      });

      fetchRequests();
    } catch {
      toast({
        title: "Error",
        description: `Failed to ${action} request.`,
        variant: "destructive",
      });
    }
  };

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <h1 className="text-2xl font-bold mb-4">Please Sign In</h1>
        <p>You need to be signed in to view requests.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <motion.h1
        className="text-4xl font-bold mb-8 text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Friend Requests
      </motion.h1>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Tabs defaultValue="received" className=" portrait:w-full">
          <TabsList className="portrait:grid portrait:w-full portrait:grid-cols-2">
            <TabsTrigger value="received">Received</TabsTrigger>
            <TabsTrigger value="sent">Sent</TabsTrigger>
          </TabsList>

          <TabsContent value="received">
            <AnimatePresence>
              {requests
                .filter(
                  (req) =>
                    String(req.receiverGithubId) ===
                      String(session?.user?.githubId) &&
                    req.status === "pending"
                )
                .map((request, index) => (
                  <motion.div
                    key={request._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <Card className="mb-4">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-4">
                          <Image
                            src={
                              request.otherUser?.image ||
                              request.otherUser?.avatar_url ||
                              "/placeholder.svg"
                            }
                            alt={request.otherUser?.name || ""}
                            width={40}
                            height={40}
                            className="rounded-full"
                          />
                          {request.otherUser?.githubUsername ||
                            request.senderGithubUsername}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">
                          Received on:{" "}
                          {format(
                            new Date(request.createdAt),
                            "PPP 'at' h:mm a"
                          )}
                        </p>
                        <div className="md:flex gap-2 grid grid-cols-2 ">
                          <Button asChild className="col-span-2 md:grid-cols-1">
                            <Link
                              href={
                                `/user/${request.otherUser?.githubId}` || "#"
                              }
                              className="inline-block"
                            >
                              View Profile
                            </Link>
                          </Button>
                          <Button
                            onClick={() =>
                              handleRequest(request._id!, "accept")
                            }
                          >
                            <Check className="mr-2 h-4 w-4" />
                            Accept
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() =>
                              handleRequest(request._id!, "reject")
                            }
                          >
                            <X className="mr-2 h-4 w-4" />
                            Reject
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
            </AnimatePresence>
          </TabsContent>

          <TabsContent value="sent">
            <AnimatePresence>
              {requests
                .filter((req) => req.senderId === session?.user?.id)
                .map((request, index) => (
                  <motion.div
                    key={request._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <Card className="mb-4">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-4">
                          <Image
                            src={
                              request.otherUser?.avatar_url ||
                              request.otherUser?.image ||
                              "/placeholder.svg" ||
                              "/placeholder.svg"
                            }
                            alt={request.otherUser?.name || ""}
                            width={40}
                            height={40}
                            className="rounded-full"
                          />
                          {request.otherUser?.githubUsername ||
                            request.receiverGithubUsername}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-2">
                          Sent on:{" "}
                          {format(
                            new Date(request.createdAt),
                            "PPP 'at' h:mm a"
                          )}
                        </p>
                        <p className="text-sm text-muted-foreground mb-4">
                          Status:{" "}
                          <span className="capitalize font-semibold">
                            {request.status}
                          </span>
                        </p>
                        {request.otherUserInCodeNearby ? (
                          <div className="grid grid-cols-2 gap-2 md:flex md:gap-2">
                            <Button asChild variant="default">
                              <Link
                                href={
                                  `/user/${request.otherUser?.githubId}` || "#"
                                }
                                className="inline-block"
                              >
                                View Profile
                              </Link>
                            </Button>
                            <Button asChild variant="outline">
                              <Link
                                href={
                                  request.otherUser?.githubProfileUrl || "#"
                                }
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-block"
                              >
                                View GitHub
                              </Link>
                            </Button>
                          </div>
                        ) : (
                          <div className="mt-2">
                            <p className="text-sm text-muted-foreground mb-2">
                              Not in CodeNearby
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
            </AnimatePresence>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}
