"use client";

import type React from "react";

import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import SwissButton from "@/components/swiss/SwissButton";
import { Input } from "@/components/ui/input";
import {
  Send,
  ImageIcon,
  Pin,
  BarChart,
  MessageSquare,
  EyeOff,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { db } from "@/lib/firebase";
import { ref, onChildAdded, onChildChanged, get } from "firebase/database";
import type { Session } from "next-auth";
import { CreateGatheringPoll } from "@/components/gatheringPoll";
import Image from "next/image";
import Link from "next/link";
import { AnonymousSwitch } from "@/components/ui/AnonymousSwitch";
import { format } from "date-fns";
import LoginButton from "@/components/login-button";
import { motion, AnimatePresence } from "framer-motion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderImage: string;
  content: string;
  timestamp: number;
  isAnonymous: boolean;
  isPinned: boolean;
  realSenderInfo?: {
    name: string;
    image: string;
  };
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
      fetchMessages().then((cleanup) => {
        unsubscribe = cleanup;
      });
      checkHostStatus();
      return () => {
        if (unsubscribe) {
          unsubscribe();
        }
      };
    }
  }, [session]);

  const fetchMessages = async () => {
    const messagesRef = ref(db, `messages/${params.slug}`);
    const unsubscribe = onChildAdded(messagesRef, (snapshot) => {
      const message = snapshot.val();
      setMessages((prevMessages) => {
        if (!prevMessages.some((m) => m.id === snapshot.key)) {
          return [...prevMessages, { ...message, id: snapshot.key }];
        }
        return prevMessages;
      });

      if (message.content.startsWith('{"type":"poll"')) {
        const pollContent = JSON.parse(message.content);
        fetchPollData(pollContent.pollId);
      }
    });

    const updateUnsubscribe = onChildChanged(messagesRef, (snapshot) => {
      const updatedMessage = snapshot.val();
      setMessages((prevMessages) =>
        prevMessages.map((message) =>
          message.id === snapshot.key
            ? { ...message, ...updatedMessage }
            : message
        )
      );
      if (updatedMessage.isPinned) {
        setPinnedMessageId(snapshot.key);
      } else if (snapshot.key === pinnedMessageId) {
        setPinnedMessageId(null);
      }
    });

    setIsLoading(false);
    return () => {
      unsubscribe();
      updateUnsubscribe();
    };
  };

  const fetchPollData = async (pollId: string) => {
    const pollRef = ref(db, `polls/${params.slug}/${pollId}`);
    const snapshot = await get(pollRef);
    if (snapshot.exists()) {
      const pollData = snapshot.val();
      setPolls((prevPolls) => ({
        ...prevPolls,
        [pollId]: { ...pollData, pollId },
      }));
    }
  };

  const checkHostStatus = async () => {
    try {
      const response = await fetch(`/api/gathering/${params.slug}`);
      if (!response.ok) {
        throw new Error("Failed to fetch gathering");
      }
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
        body: JSON.stringify({
          content: pollMessage || inputMessage,
          isAnonymous,
          isPoll: !!pollMessage,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      setInputMessage("");
    } catch {
      toast.error("Failed to send message. Please try again.");
    }
  };

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload image");
      }

      const { imageUrl } = await response.json();

      await fetch(`/api/gathering/${params.slug}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: `[Image](${imageUrl})`,
          isAnonymous,
        }),
      });
    } catch {
      toast.error("Failed to upload image. Please try again.");
    }
  };

  const handlePinAction = async (messageId: string, action: "pin" | "unpin") => {
    try {
      const response = await fetch(`/api/gathering/${params.slug}/chat/${action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messageId }),
      });

      if (!response.ok) {
        throw new Error(`Failed to ${action} message`);
      }

      toast.success(`Message ${action}ned successfully.`);
      if (action === "unpin") setPinnedMessageId(null);
    } catch {
      toast.error(`Failed to ${action} message. Please try again.`);
    }
  };

  const handlePollVote = async (pollId: string, optionIndex: number) => {
    if (!session?.user?.id) return;

    try {
      const response = await fetch(
        `/api/gathering/${params.slug}/polls/${pollId}/vote`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ optionIndex }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to vote on poll");
      }

      setPolls((prevPolls) => {
        const updatedPoll = { ...prevPolls[pollId] };
        const userId = session.user.id;

        if (!Array.isArray(updatedPoll.votes)) {
          updatedPoll.votes = Array(updatedPoll.options.length).fill([]);
        }

        updatedPoll.votes = updatedPoll.votes.map((voters: any) =>
          voters.filter((voterId: string) => voterId !== userId)
        );

        updatedPoll.votes[optionIndex] = [
          ...(updatedPoll.votes[optionIndex] || []),
          userId,
        ];
        updatedPoll.totalVotes = updatedPoll.votes.reduce(
          (sum: any, voters: any) => sum + voters.length,
          0
        );

        return { ...prevPolls, [pollId]: updatedPoll };
      });

      toast.success("Vote recorded successfully");
    } catch {
      toast.error("Failed to vote on poll. Please try again.");
    }
  };

  const scrollToPinnedMessage = () => {
    const pinnedMessage = document.getElementById(`message-${pinnedMessageId}`);
    if (pinnedMessage) {
      pinnedMessage.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputMessage(e.target.value);
    const lastWord = e.target.value.split(" ").pop() || "";
    if (lastWord.startsWith("@") && lastWord.length > 1) {
      const query = lastWord.slice(1).toLowerCase();
      const suggestions = participants
        ?.filter((participant: any) =>
          participant.githubUsername?.toLowerCase().includes(query)
        )
        .map((participant: any) => participant.githubUsername)
        .filter(
          (username: string | undefined): username is string =>
            username !== undefined
        )
        .slice(0, 3);
      setMentionSuggestions(suggestions || []);
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
            className="bg-black dark:bg-white text-white dark:text-black p-4 border-2 border-white dark:border-black cursor-pointer mt-2 hover:bg-swiss-red dark:hover:bg-swiss-red hover:text-white transition-colors"
            onClick={() => router.push(`/posts/${jsonContent.postId}`)}
          >
            <p className="font-bold text-xs uppercase tracking-tight mb-2 line-clamp-2">
              {jsonContent.postContent}
            </p>
            {jsonContent.postImage && (
              <div className="relative w-full aspect-video h-32 border-2 border-white dark:border-black grayscale mb-2 transition-colors">
                <Image
                  src={jsonContent.postImage || "/placeholder.svg"}
                  alt="Post image"
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <div className="flex flex-col gap-1 font-black text-[8px] uppercase tracking-widest opacity-70">
              {jsonContent.postPoll && <span>POLL_ATTACHED: {jsonContent.postPoll.question}</span>}
              {jsonContent.postLocation && <span>GEODATA_SIGNAL_DETECTED</span>}
              {jsonContent.postSchedule && <span>SCHEDULED: {format(new Date(jsonContent.postSchedule), "PPp")}</span>}
            </div>
          </div>
        );
      }
    } catch {
      const mentionRegex = /@(\w+)/g;
      const parts = content.split(mentionRegex);

      return parts.map((part, index) => {
        if (index % 2 === 1) {
          return (
            <Link
              key={index}
              href={`/u/${part}`}
              className="font-black text-swiss-red hover:underline"
            >
              @{part.toUpperCase()}
            </Link>
          );
        }
        return part;
      });
    }
  };

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] p-8 bg-white dark:bg-black transition-colors duration-300">
        <div className="border-8 border-black dark:border-white p-12 bg-white dark:bg-black text-center shadow-[12px_12px_0_0_rgba(0,0,0,1)] dark:shadow-[12px_12px_0_0_rgba(255,255,255,1)] transition-colors">
          <h1 className="font-black text-6xl uppercase tracking-tighter mb-6 leading-none text-black dark:text-white">
            ACCESS<br />RESTRICTED
          </h1>
          <p className="font-bold uppercase tracking-tight text-xl mb-8 opacity-60 text-black dark:text-white">
            SIGN IN TO ACCESS CHAT
          </p>
          <div className="flex justify-center">
            <LoginButton />
          </div>
        </div>
      </div>
    );
  }

  if (isLoading || !gathering) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] bg-white dark:bg-black transition-colors duration-300">
        <div className="w-32 h-32 bg-black dark:bg-white animate-pulse border-8 border-gray-100 dark:border-gray-900 transition-colors" />
        <p className="font-black mt-6 uppercase tracking-widest text-xs text-black dark:text-white transition-colors">SYNCING_NODE...</p>
      </div>
    );
  }

  if (gathering.blockedUsers?.includes(session.user.id)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] p-8 bg-white dark:bg-black transition-colors duration-300">
        <div className="border-8 border-black dark:border-white p-12 bg-white dark:bg-black text-center shadow-[12px_12px_0_0_rgba(0,0,0,1)] dark:shadow-[12px_12px_0_0_rgba(255,255,255,1)] transition-colors">
          <h1 className="font-black text-6xl uppercase tracking-tighter mb-6 text-black dark:text-white">BLOCKED</h1>
          <p className="font-bold uppercase tracking-tight text-xl opacity-60 text-black dark:text-white">ACCESS_PERMANENTLY_TERMINATED</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-black min-h-screen flex flex-col transition-colors duration-300">
      {/* Swiss Chat Header */}
      <div className="border-b-8 border-black dark:border-white bg-white dark:bg-black sticky top-0 z-20 transition-colors">
        <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="bg-black dark:bg-white text-white dark:text-black p-3 rotate-[-3deg] shadow-[4px_4px_0_0_rgba(255,0,0,1)] transition-colors">
              <MessageSquare className="h-8 w-8" />
            </div>
            <div>
              <h1 className="font-black text-4xl uppercase tracking-tighter leading-none text-black dark:text-white">
                {gathering.name}_ROOM
              </h1>
              <p className="font-bold uppercase tracking-[0.2em] text-[10px] text-swiss-red mt-1">
                SECURE_CHANNEL / V_4.2 / ACTIVE_STREAM
              </p>
            </div>
          </div>

          {pinnedMessageId && (
            <button
              onClick={scrollToPinnedMessage}
              className="bg-swiss-red text-swiss-white px-6 py-3 font-black uppercase tracking-widest text-xs flex items-center gap-3 hover:translate-y-[-2px] transition-transform shadow-[4px_4px_0_0_rgba(0,0,0,1)]"
            >
              <Pin className="h-4 w-4 fill-swiss-white" /> VIEW_PINNED_NODE
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 max-w-7xl mx-auto w-full px-6 py-8 flex flex-col min-h-[calc(100vh-250px)]">
        <div className="flex-1 border-8 border-black dark:border-white bg-white dark:bg-black shadow-[16px_16px_0_0_rgba(0,0,0,1)] dark:shadow-[16px_16px_0_0_rgba(255,255,255,1)] flex flex-col overflow-hidden transition-colors">
          <ScrollArea className="flex-1 bg-gray-50/10 dark:bg-gray-950/10 p-8 transition-colors">
            <div className="space-y-12">
              <AnimatePresence initial={false}>
                {messages.map((message) => {
                  const isPoll = message.content.startsWith('{"type":"poll"');
                  const pollData = isPoll && polls[JSON.parse(message.content).pollId];
                  const isOwnMessage = message.senderId === session?.user?.id;

                  return (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, x: isOwnMessage ? 20 : -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      id={`message-${message.id}`}
                      className={cn("flex items-start gap-4", isOwnMessage ? "flex-row-reverse" : "flex-row")}
                    >
                      <div className="shrink-0 relative">
                        <div className={cn("w-14 h-14 border-4 border-black dark:border-white grayscale group-hover:grayscale-0 transition-all", isOwnMessage ? "bg-black dark:bg-white" : "bg-white dark:bg-black")}>
                          <Avatar className="w-full h-full rounded-none">
                            <AvatarImage
                              src={isHost && message.realSenderInfo ? message.realSenderInfo.image : message.senderImage}
                              className="rounded-none object-cover"
                            />
                            <AvatarFallback className="rounded-none font-black text-black dark:text-white">
                              {(isHost && message.realSenderInfo ? message.realSenderInfo.name : message.senderName).charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                        {message.isAnonymous && <div className="absolute -top-2 -right-2 bg-swiss-red p-1 border-2 border-black dark:border-white transition-colors"><EyeOff className="h-3 w-3 text-white" /></div>}
                      </div>

                      <div className={cn("max-w-[70%] group", isOwnMessage ? "text-right" : "text-left")}>
                        <div className="mb-2 flex items-center gap-3 px-1 text-black dark:text-white">
                          <span className="font-black text-[10px] uppercase tracking-widest">
                            {message.isAnonymous ? "ANONYMOUS_USER" : message.senderName}
                            {isHost && message.realSenderInfo && <span className="text-swiss-red ml-2">[ID: {message.realSenderInfo.name.toUpperCase()}]</span>}
                          </span>
                          <span className="font-bold text-[8px] opacity-30 uppercase">{format(message.timestamp, "HH:mm")}</span>
                        </div>

                        <div className={cn(
                          "relative p-6 border-4 border-black dark:border-white shadow-[8px_8px_0_0_rgba(0,0,0,1)] dark:shadow-[8px_8px_0_0_rgba(255,255,255,1)] transition-colors",
                          isOwnMessage ? "bg-black dark:bg-white text-white dark:text-black rounded-l-2xl" : "bg-white dark:bg-black text-black dark:text-white rounded-r-2xl",
                          message.isPinned && "border-swiss-red"
                        )}>
                          {isPoll && pollData ? (
                            <div className="space-y-6 min-w-[300px]">
                              <div className="border-l-4 border-swiss-red pl-4">
                                <h3 className="font-black text-xl uppercase tracking-tighter">{pollData.question}</h3>
                                <p className="font-bold text-[8px] uppercase tracking-widest opacity-60">POLL_PROTOCOL_ACTIVE</p>
                              </div>
                              <div className="space-y-3">
                                {pollData.options.map((option, index) => {
                                  const votes = (pollData.votes?.[index] || []).length;
                                  const percent = (votes / (pollData?.totalVotes || 1)) * 100;
                                  return (
                                    <div key={index} className="space-y-2">
                                      <button
                                        onClick={() => handlePollVote(pollData.pollId, index)}
                                        disabled={pollData.votes && Object.values(pollData.votes).some((v: any) => v.includes(session?.user?.id))}
                                        className={cn(
                                          "w-full flex justify-between p-3 font-black uppercase text-xs border-2 border-black dark:border-white transition-all",
                                          isOwnMessage ? "bg-white dark:bg-black text-black dark:text-white hover:bg-swiss-red hover:text-white" : "bg-gray-100 dark:bg-gray-900 text-black dark:text-white hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black"
                                        )}
                                      >
                                        <span>{option}</span>
                                        <span>{votes} V_SYNC</span>
                                      </button>
                                      <div className="h-2 bg-gray-200 dark:bg-gray-800 border border-black dark:border-white transition-colors">
                                        <div
                                          className="h-full bg-swiss-red transition-all duration-500"
                                          style={{ width: `${percent}%` }}
                                        />
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          ) : message.content.startsWith("[Image](") ? (
                            <div className="border-4 border-black dark:border-white grayscale hover:grayscale-0 transition-all cursor-pointer">
                              <Image
                                height={300}
                                width={300}
                                src={message.content.match(/\[Image\]\((.*?)\)/)?.[1] || "/placeholder.svg"}
                                alt="Shared image"
                                className="w-full h-auto"
                              />
                            </div>
                          ) : (
                            <div className="font-bold text-sm uppercase tracking-tight leading-relaxed">
                              {renderMessageContent(message.content)}
                            </div>
                          )}

                          {message.isPinned && (
                            <div className="absolute -top-4 -right-4 bg-swiss-red text-white p-2 border-2 border-black dark:border-white transition-colors">
                              <Pin className="h-4 w-4 fill-white" />
                            </div>
                          )}

                          {isHost && (
                            <button
                              onClick={() => handlePinAction(message.id, message.isPinned ? "unpin" : "pin")}
                              className={cn(
                                "absolute top-0 opacity-0 group-hover:opacity-100 transition-all w-10 h-10 flex items-center justify-center bg-white dark:bg-black border-2 border-black dark:border-white text-black dark:text-white hover:bg-swiss-red hover:text-white",
                                isOwnMessage ? "-left-14" : "-right-14"
                              )}
                            >
                              <Pin className={cn("h-5 w-5", message.isPinned && "fill-current")} />
                            </button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Input Console */}
          <div className="p-6 border-t-8 border-black dark:border-white bg-white dark:bg-black transition-colors">
            <div className="relative flex flex-col gap-6">
              {mentionSuggestions.length > 0 && (
                <div className="absolute bottom-full left-0 mb-4 bg-white dark:bg-black border-4 border-black dark:border-white shadow-[8px_8px_0_0_rgba(0,0,0,1)] dark:shadow-[8px_8px_0_0_rgba(255,255,255,1)] z-30 min-w-[200px] transition-colors">
                  {mentionSuggestions.map((name, index) => (
                    <button
                      key={name}
                      onClick={() => handleMentionSelect(name)}
                      className={cn(
                        "w-full px-6 py-3 text-left font-black uppercase tracking-widest text-xs border-b-2 border-black dark:border-white last:border-b-0 transition-colors",
                        index === 0 ? "bg-swiss-red text-white" : "hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black text-black dark:text-white"
                      )}
                    >
                      @{name}
                    </button>
                  ))}
                </div>
              )}

              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <Input
                    value={inputMessage}
                    onChange={handleInputChange}
                    placeholder="ENTER_MESSAGE_COORDINATES..."
                    className="h-20 px-8 bg-white dark:bg-black text-black dark:text-white border-4 border-black dark:border-white rounded-none font-black uppercase tracking-tight text-xl outline-none focus:bg-gray-100 dark:focus:bg-gray-900 transition-all"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSendMessage();
                      else if (e.key === "Tab" && mentionSuggestions.length > 0) {
                        e.preventDefault();
                        handleMentionSelect(mentionSuggestions[0]);
                      }
                    }}
                    disabled={(isHostOnly && !isHost) || gathering?.mutedUsers?.includes(session.user.id)}
                  />
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 flex gap-3">
                    <AnonymousSwitch
                      checked={isAnonymous}
                      onCheckedChange={setIsAnonymous}
                      id="anonymous-mode"
                      className="scale-125 data-[state=checked]:bg-swiss-red"
                    />
                    <span className="font-black text-[8px] uppercase tracking-widest self-center opacity-40 text-black dark:text-white transition-colors">ANON_PROTO</span>
                  </div>
                </div>

                <SwissButton
                  onClick={() => handleSendMessage()}
                  disabled={(isHostOnly && !isHost) || gathering?.mutedUsers?.includes(session.user.id)}
                  className="h-20 px-10"
                >
                  <Send className="h-8 w-8 stroke-[3]" />
                </SwissButton>
              </div>

              <div className="flex items-center justify-between border-t-4 border-black dark:border-white pt-6 transition-colors">
                <div className="flex gap-4">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={(isHostOnly && !isHost) || gathering?.mutedUsers?.includes(session.user.id)}
                    className="h-14 px-6 border-4 border-black dark:border-white font-black uppercase text-xs flex items-center gap-3 hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black text-black dark:text-white transition-all active:translate-y-1"
                  >
                    <ImageIcon className="h-5 w-5" /> UPLOAD_DATA
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    accept="image/*"
                    className="hidden"
                  />

                  <CreateGatheringPoll
                    gatheringSlug={params.slug as string}
                    onPollCreated={(pollMessage) => handleSendMessage(pollMessage)}
                    canCreatePoll={!isHostOnly || isHost}
                  >
                    <button className="h-14 px-6 border-4 border-black dark:border-white font-black uppercase text-xs flex items-center gap-3 hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black text-black dark:text-white transition-all active:translate-y-1">
                      <BarChart className="h-5 w-5" /> INITIATE_POLL
                    </button>
                  </CreateGatheringPoll>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex -space-x-2 grayscale transition-all">
                    {gathering.participants.slice(0, 5).map((p: any) => (
                      <div key={p.id} className="w-8 h-8 border-2 border-black dark:border-white overflow-hidden bg-white dark:bg-black">
                        <Image src={p.image} width={32} height={32} alt={p.name} />
                      </div>
                    ))}
                  </div>
                  <span className="font-black text-[10px] uppercase tracking-widest text-swiss-red animate-pulse">
                    {gathering.participants.length}_NODE_STREAM_ACTIVE
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
