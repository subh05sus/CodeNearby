/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import type React from "react";
import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Loader2,
  Send,
  ImageIcon,
  Pin,
  Calendar,
  BarChart,
  MapPin,
  MessageSquare,
  EyeOff,
  ArrowLeft,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { db } from "@/lib/firebase";
import { ref, onChildAdded, onChildChanged, get } from "firebase/database";
import type { Session } from "next-auth";
import { CreateGatheringPoll } from "@/components/gatheringPoll";
import Image from "next/image";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";
import { AnonymousSwitch } from "@/components/ui/AnonymousSwitch";
import { format } from "date-fns";
import LoginButton from "@/components/login-button";
import { motion, AnimatePresence } from "framer-motion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderImage: string;
  content: string;
  timestamp: number;
  isAnonymous: boolean;
  isPinned: boolean;
  realSenderInfo?: { name: string; image: string };
}

interface PollData {
  pollId: string;
  question: string;
  options: string[];
  votes: any;
  totalVotes: number;
  creatorId: string;
  creatorName: string;
  createdAt: number;
}

export default function GatheringChatPage() {
  const { data: session } = useSession() as { data: Session | null };
  const router = useRouter();
  const params = useParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [polls, setPolls] = useState<{ [key: string]: PollData }>({});
  const [inputMessage, setInputMessage] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isHostOnly, setIsHostOnly] = useState(false);
  const [isHost, setIsHost] = useState(false);
  const [pinnedMessageId, setPinnedMessageId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [mentionSuggestions, setMentionSuggestions] = useState<string[]>([]);
  const [gathering, setGathering] = useState<any>(null);
  const [participants, setParticipants] = useState<any>(null);

  useEffect(() => {
    let unsubscribe: () => void;
    if (session) {
      fetchMessages().then((cleanup) => { unsubscribe = cleanup; });
      checkHostStatus();
      return () => { if (unsubscribe) unsubscribe(); };
    }
  }, [session]);

  const fetchMessages = async () => {
    const messagesRef = ref(db, `messages/${params.slug}`);
    const unsubscribe = onChildAdded(messagesRef, (snapshot) => {
      const message = snapshot.val();
      setMessages((prev) => {
        if (!prev.some((m) => m.id === snapshot.key)) {
          return [...prev, { ...message, id: snapshot.key }];
        }
        return prev;
      });
      if (message.content.startsWith('{"type":"poll"')) {
        const pollContent = JSON.parse(message.content);
        fetchPollData(pollContent.pollId);
      }
    });
    const updateUnsubscribe = onChildChanged(messagesRef, (snapshot) => {
      const updatedMessage = snapshot.val();
      setMessages((prev) =>
        prev.map((m) => (m.id === snapshot.key ? { ...m, ...updatedMessage } : m))
      );
      if (updatedMessage.isPinned) {
        setPinnedMessageId(snapshot.key);
      } else if (snapshot.key === pinnedMessageId) {
        setPinnedMessageId(null);
      }
    });
    setIsLoading(false);
    return () => { unsubscribe(); updateUnsubscribe(); };
  };

  const fetchPollData = async (pollId: string) => {
    const pollRef = ref(db, `polls/${params.slug}/${pollId}`);
    const snapshot = await get(pollRef);
    if (snapshot.exists()) {
      const pollData = snapshot.val();
      setPolls((prev) => ({ ...prev, [pollId]: { ...pollData, pollId } }));
    }
  };

  const checkHostStatus = async () => {
    try {
      const response = await fetch(`/api/gathering/${params.slug}`);
      if (!response.ok) throw new Error();
      const data = await response.json();
      setIsHost(data.hostId === session?.user?.id);
      setIsHostOnly(data.hostOnly || false);
      setGathering(data);
      setParticipants(data.participants);
    } catch {
      console.error("Error checking host status");
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSendMessage = async (pollMessage?: string) => {
    if ((!inputMessage.trim() && !pollMessage) || !session) return;
    try {
      const response = await fetch(`/api/gathering/${params.slug}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: pollMessage || inputMessage, isAnonymous, isPoll: !!pollMessage }),
      });
      if (!response.ok) throw new Error();
      setInputMessage("");
    } catch {
      toast.error("Failed to send message.");
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    try {
      const response = await fetch("/api/upload", { method: "POST", body: formData });
      if (!response.ok) throw new Error();
      const { imageUrl } = await response.json();
      await fetch(`/api/gathering/${params.slug}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: `[Image](${imageUrl})`, isAnonymous }),
      });
    } catch {
      toast.error("Failed to upload image.");
    }
  };

  const handlePinMessage = async (messageId: string) => {
    try {
      const response = await fetch(`/api/gathering/${params.slug}/chat/pin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messageId }),
      });
      if (!response.ok) throw new Error();
      toast.success("Message pinned.");
    } catch {
      toast.error("Failed to pin message.");
    }
  };

  const handleUnpinMessage = async (messageId: string) => {
    try {
      const response = await fetch(`/api/gathering/${params.slug}/chat/unpin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messageId }),
      });
      if (!response.ok) throw new Error();
      toast.success("Message unpinned.");
      setPinnedMessageId(null);
    } catch {
      toast.error("Failed to unpin message.");
    }
  };

  const handlePollVote = async (pollId: string, optionIndex: number) => {
    if (!session?.user?.id) return;
    try {
      const response = await fetch(`/api/gathering/${params.slug}/polls/${pollId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ optionIndex }),
      });
      if (!response.ok) throw new Error();
      setPolls((prev) => {
        const updatedPoll = { ...prev[pollId] };
        const userId = session.user.id;
        if (!Array.isArray(updatedPoll.votes)) {
          updatedPoll.votes = Array(updatedPoll.options.length).fill([]);
        }
        updatedPoll.votes = updatedPoll.votes.map((voters: any) =>
          voters.filter((id: string) => id !== userId)
        );
        updatedPoll.votes[optionIndex] = [...(updatedPoll.votes[optionIndex] || []), userId];
        updatedPoll.totalVotes = updatedPoll.votes.reduce(
          (sum: any, voters: any) => sum + voters.length, 0
        );
        return { ...prev, [pollId]: updatedPoll };
      });
      toast.success("Vote recorded!");
    } catch {
      toast.error("Failed to vote.");
    }
  };

  const scrollToPinnedMessage = () => {
    document.getElementById(`message-${pinnedMessageId}`)?.scrollIntoView({ behavior: "smooth" });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputMessage(e.target.value);
    const lastWord = e.target.value.split(" ").pop() || "";
    if (lastWord.startsWith("@") && lastWord.length > 1 && participants) {
      const query = lastWord.slice(1).toLowerCase();
      const suggestions = participants
        .filter((p: any) => p.githubUsername?.toLowerCase().includes(query))
        .map((p: any) => p.githubUsername)
        .filter((u: string | undefined): u is string => u !== undefined)
        .slice(0, 3);
      setMentionSuggestions(suggestions);
    } else {
      setMentionSuggestions([]);
    }
  };

  const handleMentionSelect = (name: string) => {
    const words = inputMessage.split(" ");
    words[words.length - 1] = `@${name}`;
    setInputMessage(words.join(" "));
    setMentionSuggestions([]);
  };

  const renderMessageContent = (content: string) => {
    try {
      const jsonContent = JSON.parse(content);
      if (jsonContent.type === "post") {
        return (
          <div
            className="bg-black/20 rounded-xl p-3 cursor-pointer mt-1 border border-white/10"
            onClick={() => router.push(`/posts/${jsonContent.postId}`)}
          >
            <p className="text-sm mb-2 line-clamp-2">{jsonContent.postContent}</p>
            {jsonContent.postImage && (
              <div className="relative w-full aspect-video h-28 rounded-lg overflow-hidden">
                <Image src={jsonContent.postImage || "/placeholder.svg"} alt="Post" fill className="object-cover" />
              </div>
            )}
            {jsonContent.postPoll && (
              <div className="flex items-center text-xs opacity-70 mt-1">
                <BarChart className="h-3 w-3 mr-1" />
                Poll: {jsonContent.postPoll.question}
              </div>
            )}
            {jsonContent.postLocation && (
              <div className="flex items-center text-xs opacity-70 mt-1">
                <MapPin className="h-3 w-3 mr-1" />
                Location attached
              </div>
            )}
            {jsonContent.postSchedule && (
              <div className="flex items-center text-xs text-muted-foreground mt-1">
                <Calendar className="h-3 w-3 mr-1" />
                {format(new Date(jsonContent.postSchedule), "PPp")}
              </div>
            )}
          </div>
        );
      }
    } catch {
      const mentionRegex = /@(\w+)/g;
      const parts = content.split(mentionRegex);
      return parts.map((part, index) => {
        if (index % 2 === 1) {
          return (
            <Link key={index} href={`/u/${part}`} className="font-bold text-primary hover:underline">
              @{part}
            </Link>
          );
        }
        return part;
      });
    }
  };

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 text-center px-4">
        <h2 className="font-heading text-xl">Sign in to view this chat</h2>
        <LoginButton />
      </div>
    );
  }

  if (!gathering && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3 text-center px-4">
        <h2 className="font-heading text-xl">Gathering Not Found</h2>
        <p className="text-sm text-muted-foreground">The gathering you&apos;re looking for does not exist.</p>
      </div>
    );
  }

  if (
    gathering?.participants &&
    !gathering.participants.some((p: any) => p._id === session.user.id)
  ) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 text-center px-4">
        <h2 className="font-heading text-xl">Not a participant</h2>
        <p className="text-sm text-muted-foreground mb-2">
          Would you like to join this gathering?
        </p>
        <Link
          href={`/gathering/join/${params.slug}`}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-sm text-white"
          style={{ background: "hsl(24 95% 53%)" }}
        >
          Join Gathering
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (gathering?.blockedUsers?.includes(session.user.id)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3 text-center px-4">
        <h2 className="font-heading text-xl">You are blocked</h2>
        <p className="text-sm text-muted-foreground">You are blocked from this gathering.</p>
      </div>
    );
  }

  const isMuted = gathering?.mutedUsers?.includes(session.user.id);
  const canSend = !((isHostOnly && !isHost) || isMuted);

  return (
    <div className="px-2 sm:px-4 w-full max-w-4xl mx-auto">
      <div className="rounded-2xl border border-border bg-card overflow-hidden flex flex-col" style={{ height: "calc(100dvh - 10rem)" }}>
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <Link
              href={`/gathering/${params.slug}`}
              className="p-1.5 rounded-lg hover:bg-muted transition-colors mr-1"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: "hsl(24 95% 53% / 0.12)" }}
            >
              <MessageSquare className="h-3.5 w-3.5 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-sm">{gathering?.name || "Chat Room"}</p>
              <p className="text-[10px] text-muted-foreground font-mono">
                {messages.length} messages
              </p>
            </div>
          </div>
          {pinnedMessageId && (
            <button
              onClick={scrollToPinnedMessage}
              className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
            >
              <Pin className="h-3.5 w-3.5" />
              Pinned
            </button>
          )}
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 w-full">
          <div className="flex flex-col gap-3 p-4">
            <AnimatePresence initial={false}>
              {messages.map((message) => {
                const isPoll = message.content.startsWith('{"type":"poll"');
                const pollContent = isPoll ? JSON.parse(message.content) : null;
                const pollData = pollContent ? polls[pollContent.pollId] : null;
                const isOwnMessage = message.senderId === session?.user?.id;

                return (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    id={`message-${message.id}`}
                    className={`flex items-end gap-2.5 ${isOwnMessage ? "flex-row-reverse" : ""}`}
                  >
                    {(!message.isAnonymous || (isHost && message.realSenderInfo)) && (
                      <Avatar className="h-7 w-7 flex-shrink-0 mb-1">
                        <AvatarImage
                          src={
                            isHost && message.realSenderInfo
                              ? message.realSenderInfo.image
                              : message.senderImage
                          }
                        />
                        <AvatarFallback className="text-[10px]">
                          {(isHost && message.realSenderInfo
                            ? message.realSenderInfo.name
                            : message.senderName
                          ).charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    )}

                    <div
                      className={`group relative max-w-[75%] flex flex-col ${isOwnMessage ? "items-end" : "items-start"}`}
                    >
                      <span className="text-[10px] text-muted-foreground mb-1 px-1">
                        {message.isAnonymous ? (
                          <span className="flex items-center gap-1">
                            <EyeOff className="h-2.5 w-2.5" />
                            Anonymous
                            {isHost && message.realSenderInfo && (
                              <span className="opacity-50">({message.realSenderInfo.name})</span>
                            )}
                          </span>
                        ) : (
                          message.senderName
                        )}
                      </span>

                      <div
                        className={`relative rounded-2xl px-4 py-2.5 ${
                          isOwnMessage
                            ? "rounded-br-sm text-white"
                            : "rounded-bl-sm bg-muted"
                        } ${message.isPinned ? "ring-2 ring-yellow-500/50" : ""}`}
                        style={isOwnMessage ? { background: "hsl(24 95% 53%)" } : {}}
                      >
                        {isPoll && pollData ? (
                          <div className="space-y-2.5 min-w-[200px]">
                            <p className="font-semibold text-sm">{pollData.question}</p>
                            {pollData.options.map((option, index) => (
                              <div key={index} className="space-y-1">
                                <Button
                                  variant={isOwnMessage ? "secondary" : "outline"}
                                  size="sm"
                                  className="w-full justify-between h-8 text-xs rounded-xl"
                                  onClick={() => handlePollVote(pollData.pollId, index)}
                                  disabled={
                                    pollData.votes &&
                                    Object.values(pollData.votes).some((voters) =>
                                      (voters as any).includes(session?.user?.id)
                                    )
                                  }
                                >
                                  <span>{option}</span>
                                  <span>{(pollData.votes?.[index] || []).length} votes</span>
                                </Button>
                                <Progress
                                  value={((pollData.votes?.[index] || []).length / (pollData?.totalVotes || 1)) * 100}
                                  className="h-1"
                                />
                              </div>
                            ))}
                          </div>
                        ) : message.content.startsWith("[Image](") ? (
                          <div className="rounded-xl overflow-hidden">
                            <Image
                              height={200}
                              width={200}
                              src={message.content.match(/\[Image\]\((.*?)\)/)?.[1] || "/placeholder.svg"}
                              alt="Shared image"
                              className="max-w-[200px] rounded-xl"
                            />
                          </div>
                        ) : (
                          <p className="whitespace-pre-wrap break-words text-sm">
                            {renderMessageContent(message.content)}
                          </p>
                        )}

                        {message.isPinned && (
                          <div className="absolute -top-2 -right-2">
                            <Badge variant="secondary" className="gap-1 text-[10px] h-5">
                              <Pin className="h-2.5 w-2.5" />
                              Pinned
                            </Badge>
                          </div>
                        )}

                        <p
                          className={`text-[10px] font-mono mt-1 ${
                            isOwnMessage ? "text-white/50 text-right" : "text-muted-foreground"
                          }`}
                        >
                          {format(new Date(message.timestamp), "HH:mm")}
                        </p>
                      </div>

                      {isHost && (
                        <div
                          className={`absolute ${isOwnMessage ? "-left-9" : "-right-9"} bottom-2 opacity-0 transition-opacity group-hover:opacity-100`}
                        >
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 rounded-lg"
                                  onClick={() =>
                                    message.isPinned
                                      ? handleUnpinMessage(message.id)
                                      : handlePinMessage(message.id)
                                  }
                                >
                                  <Pin className={`h-3.5 w-3.5 ${message.isPinned ? "text-yellow-500" : ""}`} />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>{message.isPinned ? "Unpin" : "Pin"} message</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input area */}
        <div className="border-t border-border bg-background/95 backdrop-blur flex-shrink-0">
          <div className="p-3 space-y-2">
            {/* Mention suggestions */}
            {mentionSuggestions.length > 0 && (
              <div className="absolute bottom-full left-4 right-4 bg-card border border-border rounded-xl shadow-lg overflow-hidden mb-1 z-30">
                {Array.from(new Set(mentionSuggestions))
                  .filter((name) => name.toLowerCase() !== "anonymous")
                  .map((name, index) => (
                    <div
                      key={name}
                      className={`px-4 py-2 hover:bg-muted cursor-pointer text-sm transition-colors ${index === 0 ? "bg-muted/50" : ""}`}
                      onClick={() => handleMentionSelect(name)}
                      onKeyDown={(e) => {
                        if (e.key === "Tab" && index === 0) {
                          e.preventDefault();
                          handleMentionSelect(name);
                        }
                      }}
                    >
                      @{name}
                    </div>
                  ))}
              </div>
            )}

            {/* Status text */}
            <AnimatePresence>
              {(isHostOnly && !isHost) || isMuted ? (
                <motion.p
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-xs text-muted-foreground text-center"
                >
                  {isMuted ? "You are muted in this gathering." : "Only the host can send messages."}
                </motion.p>
              ) : isAnonymous ? (
                <motion.p
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-xs text-muted-foreground"
                >
                  Anonymous mode on — host can still see your identity.
                </motion.p>
              ) : (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-xs text-muted-foreground"
                >
                  Be respectful… or at least try to be.
                </motion.p>
              )}
            </AnimatePresence>

            {/* Main input row */}
            <div className="flex items-center gap-2 relative">
              <div className="flex-1 flex items-center gap-2 bg-muted rounded-2xl px-4 py-2.5 focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                <Input
                  value={inputMessage}
                  onChange={handleInputChange}
                  placeholder={canSend ? "Type your message..." : "Sending disabled"}
                  className="border-0 bg-transparent p-0 h-auto text-sm focus-visible:ring-0 shadow-none placeholder:text-muted-foreground/50"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSendMessage();
                    else if (e.key === "Tab" && mentionSuggestions.length > 0) {
                      e.preventDefault();
                      handleMentionSelect(mentionSuggestions[0]);
                    }
                  }}
                  disabled={!canSend}
                />
                <AnonymousSwitch
                  checked={isAnonymous}
                  onCheckedChange={setIsAnonymous}
                  id="anonymous-mode"
                  className="flex-shrink-0"
                />
              </div>

              {/* Desktop extras */}
              <div className="hidden md:flex items-center gap-1.5">
                {canSend && (
                  <>
                    <Button
                      variant="secondary"
                      size="icon"
                      className="h-10 w-10 rounded-xl"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={!canSend}
                    >
                      <ImageIcon className="h-4 w-4" />
                    </Button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageUpload}
                      accept="image/*"
                      className="hidden"
                    />
                    <Button asChild variant="secondary" size="icon" className="h-10 w-10 rounded-xl">
                      <CreateGatheringPoll
                        gatheringSlug={params.slug as string}
                        onPollCreated={(pollMessage) => handleSendMessage(pollMessage)}
                        canCreatePoll={!canSend}
                      />
                    </Button>
                  </>
                )}
              </div>

              <button
                onClick={() => handleSendMessage()}
                disabled={!canSend || !inputMessage.trim()}
                className="h-10 w-10 rounded-xl flex items-center justify-center text-white flex-shrink-0 transition-all hover:opacity-90 active:scale-95 disabled:opacity-40"
                style={{ background: "hsl(24 95% 53%)" }}
              >
                <Send className="h-4 w-4" />
              </button>
            </div>

            {/* Mobile extras */}
            {canSend && (
              <div className="md:hidden flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  className="flex-1 rounded-xl"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={!canSend}
                >
                  <ImageIcon className="h-4 w-4 mr-1" />
                  Image
                </Button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  className="hidden"
                />
                <Button asChild variant="secondary" size="sm" className="flex-1 rounded-xl">
                  <CreateGatheringPoll
                    gatheringSlug={params.slug as string}
                    onPollCreated={(pollMessage) => handleSendMessage(pollMessage)}
                    canCreatePoll={!canSend}
                  />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
