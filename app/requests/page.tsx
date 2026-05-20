"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Loader2, Check, X, UserCheck, Clock, Github, ArrowRight } from "lucide-react";
import Image from "next/image";
import type { FriendRequest } from "@/types";
import type { Session } from "next-auth";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { toast } from "sonner";

export default function RequestsPage() {
  const { data: session } = useSession() as { data: Session | null };
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [activeTab, setActiveTab] = useState<"received" | "sent">("received");

  useEffect(() => {
    if (session) fetchRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  const fetchRequests = async () => {
    try {
      const response = await fetch("/api/friends/requests");
      const data = await response.json();
      setRequests(data.reverse());
    } catch {
      toast.error("Failed to fetch requests");
    } finally {
      setLoading(false);
    }
  };

  const handleRequest = async (requestId: string, action: "accept" | "reject") => {
    try {
      const response = await fetch(`/api/friends/request/${requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: action === "accept" ? "accepted" : "rejected" }),
      });
      if (!response.ok) throw new Error();
      toast.success(`Request ${action}ed!`);
      fetchRequests();
    } catch {
      toast.error(`Failed to ${action} request.`);
    }
  };

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 px-4">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center"
          style={{ background: "hsl(24 95% 53% / 0.10)", border: "1px solid hsl(24 95% 53% / 0.25)" }}
        >
          <UserCheck className="w-8 h-8 text-primary" />
        </div>
        <div className="text-center max-w-sm">
          <h2 className="font-heading text-2xl mb-2">Friend Requests</h2>
          <p className="text-sm text-muted-foreground">Sign in to manage your connection requests.</p>
        </div>
        <button
          onClick={() => signIn("github")}
          className="flex items-center gap-2.5 px-6 py-3 rounded-full font-semibold text-white transition-all hover:scale-[1.03] active:scale-[0.98]"
          style={{ background: "hsl(24 95% 53%)" }}
        >
          <Github className="w-4 h-4" />
          Sign in with GitHub
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  const received = requests.filter(
    (req) =>
      String(req.receiverGithubId) === String(session?.user?.githubId) &&
      req.status === "pending"
  );
  const sent = requests.filter((req) => req.senderId === session?.user?.id);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: "hsl(24 95% 53% / 0.12)" }}
        >
          <UserCheck className="w-4 h-4 text-primary" />
        </div>
        <div>
          <h1 className="font-heading text-lg leading-tight">Friend Requests</h1>
          <p className="text-[11px] text-muted-foreground">
            {received.length} pending · {sent.length} sent
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 p-1 rounded-2xl bg-muted/60">
        {(["received", "sent"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="flex-1 py-2 text-sm font-semibold rounded-xl capitalize transition-all relative"
            style={
              activeTab === tab
                ? { background: "hsl(24 95% 53%)", color: "white" }
                : { color: "hsl(var(--muted-foreground))" }
            }
          >
            {tab === "received" ? "Received" : "Sent"}
            {tab === "received" && received.length > 0 && (
              <span
                className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center text-white"
                style={{ background: "hsl(24 95% 53%)", display: activeTab === "received" ? "none" : "flex" }}
              >
                {received.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Received */}
      {activeTab === "received" && (
        <div className="space-y-3">
          <AnimatePresence>
            {received.length === 0 ? (
              <div className="text-center py-12">
                <UserCheck className="w-10 h-10 text-muted-foreground/20 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No pending requests</p>
              </div>
            ) : (
              received.map((request, index) => (
                <motion.div
                  key={request._id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16, height: 0 }}
                  transition={{ duration: 0.25, delay: index * 0.06 }}
                  className="flex items-center gap-4 p-4 rounded-2xl border border-border bg-card"
                >
                  <Image
                    src={request.otherUser?.image || request.otherUser?.avatar_url || "/placeholder.svg"}
                    alt={request.otherUser?.name || ""}
                    width={44}
                    height={44}
                    className="rounded-full flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">
                      {request.otherUser?.githubUsername || request.senderGithubUsername}
                    </p>
                    <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                      <Clock className="h-3 w-3" />
                      {format(new Date(request.createdAt), "MMM d, yyyy")}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Link
                      href={`/user/${request.otherUser?.githubId}` || "#"}
                      className="text-[11px] font-semibold text-primary hover:underline hidden sm:block"
                    >
                      Profile
                    </Link>
                    <button
                      onClick={() => handleRequest(request._id!, "accept")}
                      className="h-8 px-3 rounded-full text-xs font-semibold text-white flex items-center gap-1 hover:opacity-90 transition-opacity"
                      style={{ background: "hsl(24 95% 53%)" }}
                    >
                      <Check className="h-3 w-3" />
                      Accept
                    </button>
                    <button
                      onClick={() => handleRequest(request._id!, "reject")}
                      className="h-8 w-8 rounded-full border border-border flex items-center justify-center hover:border-destructive/40 hover:text-destructive transition-colors"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Sent */}
      {activeTab === "sent" && (
        <div className="space-y-3">
          <AnimatePresence>
            {sent.length === 0 ? (
              <div className="text-center py-12">
                <UserCheck className="w-10 h-10 text-muted-foreground/20 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No sent requests</p>
              </div>
            ) : (
              sent.map((request, index) => (
                <motion.div
                  key={request._id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: index * 0.06 }}
                  className="flex items-center gap-4 p-4 rounded-2xl border border-border bg-card"
                >
                  <Image
                    src={request.otherUser?.avatar_url || request.otherUser?.image || "/placeholder.svg"}
                    alt={request.otherUser?.name || ""}
                    width={44}
                    height={44}
                    className="rounded-full flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">
                      {request.otherUser?.githubUsername || request.receiverGithubUsername}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full font-mono capitalize ${
                          request.status === "accepted"
                            ? "bg-green-500/10 text-green-500"
                            : request.status === "rejected"
                            ? "bg-destructive/10 text-destructive"
                            : "bg-primary/10 text-primary"
                        }`}
                      >
                        {request.status}
                      </span>
                      <p className="text-[11px] text-muted-foreground">
                        {format(new Date(request.createdAt), "MMM d")}
                      </p>
                    </div>
                  </div>
                  {request.otherUserInCodeNearby && (
                    <div className="flex gap-2 flex-shrink-0">
                      <Link
                        href={`/user/${request.otherUser?.githubId}` || "#"}
                        className="h-7 px-3 rounded-full text-xs font-semibold border border-border hover:border-primary/30 hover:text-primary transition-colors flex items-center"
                      >
                        Profile
                      </Link>
                    </div>
                  )}
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
