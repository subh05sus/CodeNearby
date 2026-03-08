"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Loader2, Check, X } from "lucide-react";
import Image from "next/image";
import type { FriendRequest } from "@/types";
import type { Session } from "next-auth";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import Link from "next/link";
import { toast } from "sonner";
import SwissButton from "@/components/swiss/SwissButton";
import SwissCard from "@/components/swiss/SwissCard";
import SwissSection from "@/components/swiss/SwissSection";
import { cn } from "@/lib/utils";

export default function RequestsPage() {
  const { data: session } = useSession() as { data: Session | null };
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [activeTab, setActiveTab] = useState<"received" | "sent">("received");

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
      toast.error("Error", {
        description: "Failed to fetch requests",
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

      toast.success(`Request ${action}ed successfully!`);

      fetchRequests();
    } catch {
      toast.error("Error", {
        description: `Failed to ${action} request.`,
      });
    }
  };

  if (!session) {
    return (
      <div className="bg-white dark:bg-black min-h-screen flex flex-col items-center justify-center p-8 transition-colors duration-300">
        <SwissSection variant="white" number="!" title="ACCESS" className="text-center">
          <h1 className="text-6xl font-black uppercase tracking-tighter mb-8 text-black dark:text-white">PLEASE SIGN IN</h1>
          <p className="text-xl font-bold uppercase tracking-tight opacity-60 text-black dark:text-white">You need to be signed in to view requests.</p>
          <SwissButton variant="primary" className="mt-12" asChild>
            <Link href="/auth/signin">SIGN IN</Link>
          </SwissButton>
        </SwissSection>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-black min-h-screen flex justify-center items-center">
        <Loader2 className="h-12 w-12 animate-spin text-black dark:text-white text-swiss-red" />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-black min-h-screen transition-colors duration-300">
      <SwissSection
        number="01"
        title="REQUESTS"
        variant="white"
        pattern="grid"
      >
        <div className="max-w-4xl">
          <h1 className="text-7xl font-black uppercase tracking-tighter mb-16 italic underline decoration-8 decoration-swiss-red text-black dark:text-white">
            CONNECTION_QUEUE
          </h1>

          <div className="flex gap-2 mb-12 overflow-x-auto pb-4 scrollbar-hide">
            {[
              { id: "received", label: "RECEIVED_TASKS" },
              { id: "sent", label: "SENT_OUTBOUND" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "px-8 py-4 border-4 border-black dark:border-white font-black uppercase tracking-widest text-sm transition-all",
                  activeTab === tab.id
                    ? "bg-black dark:bg-white text-white dark:text-black shadow-[8px_8px_0_0_rgba(255,0,0,1)] -translate-y-2"
                    : "bg-white dark:bg-black text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-900"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="min-h-[400px]">
            <AnimatePresence mode="wait">
              {activeTab === "received" ? (
                <motion.div
                  key="received"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-6"
                >
                  {requests
                    .filter(
                      (req) =>
                        String(req.receiverGithubId) ===
                        String(session?.user?.githubId) &&
                        req.status === "pending"
                    ).length > 0 ? (
                    requests
                      .filter(
                        (req) =>
                          String(req.receiverGithubId) ===
                          String(session?.user?.githubId) &&
                          req.status === "pending"
                      )
                      .map((request, index) => (
                        <SwissCard key={request._id} className="p-8 border-4 border-black dark:border-white bg-white dark:bg-black shadow-[8px_8px_0_0_rgba(0,0,0,1)] dark:shadow-[8px_8px_0_0_rgba(255,255,255,1)]">
                          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                            <div className="flex items-center gap-6">
                              <div className="relative">
                                <Image
                                  src={request.otherUser?.image || request.otherUser?.avatar_url || "/placeholder.svg"}
                                  alt={request.otherUser?.name || ""}
                                  width={80}
                                  height={80}
                                  className="border-4 border-black dark:border-white grayscale hover:grayscale-0 transition-all cursor-pointer"
                                />
                                <div className="absolute -top-4 -left-4 bg-swiss-red text-white font-black px-2 py-1 text-xs">USER_ID: {request.otherUser?.githubId || "???"}</div>
                              </div>
                              <div>
                                <h3 className="text-3xl font-black uppercase tracking-tighter text-black dark:text-white">
                                  {request.otherUser?.githubUsername || request.senderGithubUsername}
                                </h3>
                                <p className="text-xs font-black uppercase tracking-widest opacity-40 text-black dark:text-white">
                                  RECEIVED_ON: {format(new Date(request.createdAt), "yyyy.MM.dd | HH:mm")}
                                </p>
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-4 w-full md:w-auto">
                              <SwissButton variant="secondary" asChild className="flex-1 md:flex-none">
                                <Link href={`/user/${request.otherUser?.githubId}`}>VIEW_PROFILE</Link>
                              </SwissButton>
                              <SwissButton
                                variant="primary"
                                className="flex-1 md:flex-none bg-green-500 hover:bg-green-600 border-green-700 text-white"
                                onClick={() => handleRequest(request._id!, "accept")}
                              >
                                <Check className="mr-2 h-5 w-5" /> ACCEPT
                              </SwissButton>
                              <SwissButton
                                variant="primary"
                                className="flex-1 md:flex-none bg-swiss-red hover:bg-red-700 border-red-900 text-white"
                                onClick={() => handleRequest(request._id!, "reject")}
                              >
                                <X className="mr-2 h-5 w-5" /> REJECT
                              </SwissButton>
                            </div>
                          </div>
                        </SwissCard>
                      ))
                  ) : (
                    <div className="border-8 border-black dark:border-white p-24 text-center opacity-10">
                      <p className="text-6xl font-black uppercase tracking-tighter text-black dark:text-white">QUEUE_EMPTY</p>
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="sent"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  {requests
                    .filter((req) => req.senderId === session?.user?.id).length > 0 ? (
                    requests
                      .filter((req) => req.senderId === session?.user?.id)
                      .map((request, index) => (
                        <SwissCard key={request._id} className="p-8 border-4 border-black dark:border-white bg-white dark:bg-black shadow-[8px_8px_0_0_rgba(0,0,0,1)] dark:shadow-[8px_8px_0_0_rgba(255,255,255,1)]">
                          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                            <div className="flex items-center gap-6">
                              <Image
                                src={request.otherUser?.avatar_url || request.otherUser?.image || "/placeholder.svg"}
                                alt={request.otherUser?.name || ""}
                                width={80}
                                height={80}
                                className="border-4 border-black dark:border-white grayscale"
                              />
                              <div>
                                <h3 className="text-3xl font-black uppercase tracking-tighter text-black dark:text-white">
                                  {request.otherUser?.githubUsername || request.receiverGithubUsername}
                                </h3>
                                <div className="flex items-center gap-4">
                                  <p className="text-xs font-black uppercase tracking-widest opacity-40 text-black dark:text-white">
                                    SENT_ON: {format(new Date(request.createdAt), "yyyy.MM.dd | HH:mm")}
                                  </p>
                                  <span className={cn(
                                    "px-2 py-0.5 text-[10px] font-black uppercase tracking-widest",
                                    request.status === "pending" ? "bg-yellow-500 text-black" :
                                      request.status === "accepted" ? "bg-green-500 text-white" : "bg-swiss-red text-white"
                                  )}>
                                    STATUS: {request.status}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-4 w-full md:w-auto">
                              {request.otherUserInCodeNearby && (
                                <SwissButton variant="secondary" asChild className="flex-1 md:flex-none">
                                  <Link href={`/user/${request.otherUser?.githubId}`}>VIEW_PROFILE</Link>
                                </SwissButton>
                              )}
                              <SwissButton variant="primary" asChild className="flex-1 md:flex-none">
                                <Link href={`https://github.com/${request.otherUser?.githubUsername || request.receiverGithubUsername}`} target="_blank">
                                  GITHUB_EXT
                                </Link>
                              </SwissButton>
                            </div>
                          </div>
                        </SwissCard>
                      ))
                  ) : (
                    <div className="border-8 border-black dark:border-white p-24 text-center opacity-10">
                      <p className="text-6xl font-black uppercase tracking-tighter text-black dark:text-white">LOG_EMPTY</p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </SwissSection>
    </div>
  );
}
