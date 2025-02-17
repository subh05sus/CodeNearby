/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import type React from "react";

import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
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
  const { toast } = useToast();
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

      // If it's a poll message, fetch the poll data
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
      setIsHostOnly(data.hostOnly || false);
    } catch {
      console.error("Error checking host status");
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]); // Updated dependency

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
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
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

      // Send message with image URL
      await fetch(`/api/gathering/${params.slug}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: `[Image](${imageUrl})`,
          isAnonymous,
        }),
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handlePinMessage = async (messageId: string) => {
    try {
      const response = await fetch(`/api/gathering/${params.slug}/chat/pin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messageId }),
      });

      if (!response.ok) {
        throw new Error("Failed to pin message");
      }

      toast({
        title: "Success",
        description: "Message pinned successfully.",
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to pin message. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleUnpinMessage = async (messageId: string) => {
    try {
      const response = await fetch(`/api/gathering/${params.slug}/chat/unpin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messageId }),
      });

      if (!response.ok) {
        throw new Error("Failed to unpin message");
      }

      toast({
        title: "Success",
        description: "Message unpinned successfully.",
      });
      setPinnedMessageId(null);
    } catch {
      toast({
        title: "Error",
        description: "Failed to unpin message. Please try again.",
        variant: "destructive",
      });
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

      // Update local state
      setPolls((prevPolls) => {
        const updatedPoll = { ...prevPolls[pollId] };
        const userId = session.user.id;

        // Initialize votes array if it doesn't exist
        if (!Array.isArray(updatedPoll.votes)) {
          updatedPoll.votes = Array(updatedPoll.options.length).fill([]);
        }

        // Remove previous vote if exists
        updatedPoll.votes = updatedPoll.votes.map((voters: any) =>
          voters.filter((voterId: string) => voterId !== userId)
        );

        // Add new vote
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

      toast({
        title: "Success",
        description: "Vote recorded successfully",
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to vote on poll. Please try again.",
        variant: "destructive",
      });
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
        .filter((participant: any) =>
          participant.githubUsername?.toLowerCase().includes(query)
        )
        .map((participant: any) => participant.githubUsername)
        .filter(
          (username: string | undefined): username is string =>
            username !== undefined
        )
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
    // Try to parse as JSON first
    try {
      const jsonContent = JSON.parse(content);
      if (jsonContent.type === "post") {
        return (
          <div
            className="text-inherit bg-black p-2 rounded-lg cursor-pointer mt-2"
            onClick={() => router.push(`/posts/${jsonContent.postId}`)}
          >
            <p className="text-sm mb-2 line-clamp-2">
              {jsonContent.postContent}
            </p>
            {jsonContent.postImage && (
              <div className="relative w-full aspect-video h-32 ">
                <Image
                  src={jsonContent.postImage || "/placeholder.svg"}
                  alt="Post image"
                  fill
                  className="rounded-md object-cover"
                />
              </div>
            )}
            {jsonContent.postPoll && (
              <div className="flex items-center text-sm opacity-70">
                <BarChart className="h-4 w-4 mr-1" />
                Poll: {jsonContent.postPoll.question}
              </div>
            )}
            {jsonContent.postLocation && (
              <div className="flex items-center text-sm opacity-70">
                <MapPin className="h-4 w-4 mr-1" />
                Location attached
              </div>
            )}
            {jsonContent.postSchedule && (
              <div className="flex items-center text-sm text-muted-foreground">
                <Calendar className="h-4 w-4 mr-1" />
                {jsonContent.postSchedule &&
                  format(new Date(jsonContent.postSchedule), "PPp")}
              </div>
            )}
          </div>
        );
      }
    } catch {
      // If parsing fails, handle as regular message with mentions
      const mentionRegex = /@(\w+)/g;
      const parts = content.split(mentionRegex);

      return parts.map((part, index) => {
        if (index % 2 === 1) {
          return (
            <Link
              key={index}
              href={`/u/${part}`}
              className="font-bold text-primary hover:underline"
            >
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
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <h1 className="text-2xl font-bold mb-4">Please Sign In</h1>
        <p>You need to be signed in to view this chat.</p>
        <LoginButton />
      </div>
    );
  }

  if (!gathering) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <h1 className="text-2xl font-bold mb-4">Gathering Not Found</h1>
        <p>The gathering you are looking for does not exist.</p>
      </div>
    );
  }

  if (
    gathering.participants &&
    !gathering.participants.some(
      (participant: any) => participant._id === session.user.id
    )
  ) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <h1 className="text-2xl font-bold mb-4">Unauthorized</h1>
        <p>You are not a participant of this gathering.</p>
        <p className="mb-4">Would you like to join this gathering?</p>
        <Button asChild>
          <Link href={`/gathering/join/${params.slug}`}>Join Gathering</Link>
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (gathering.blockedUsers?.includes(session.user.id)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <h1 className="text-2xl font-bold mb-4">You are blocked</h1>
        <p>You are blocked from this gathering.</p>
      </div>
    );
  }

  return (
    <div className="px-1 w-full mx-auto">
      <Card className="relative overflow-hidden">
        <div className="absolute inset-0 " />

        <CardHeader className="relative border-b portrait:p-3 ">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 portrait:h-4 portrait:w-4 text-primary" />
              Chat Room
            </CardTitle>
            {pinnedMessageId && (
              <Button
                variant="ghost"
                size="sm"
                onClick={scrollToPinnedMessage}
                className="gap-2"
              >
                <Pin className="h-4 w-4" />
                View Pinned
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="relative p-0">
          <ScrollArea className="h-[calc(100vh-20rem)] w-full">
            <div className="flex flex-col space-y-4 p-4">
              <AnimatePresence initial={false}>
                {messages.map((message) => {
                  const isPoll = message.content.startsWith('{"type":"poll"');
                  const pollContent = isPoll
                    ? JSON.parse(message.content)
                    : null;
                  const pollData = pollContent
                    ? polls[pollContent.pollId]
                    : null;
                  const isOwnMessage = message.senderId === session?.user?.id;

                  return (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      id={`message-${message.id}`}
                      className={`flex items-start space-x-3 ${
                        isOwnMessage ? "flex-row-reverse space-x-reverse" : ""
                      }`}
                    >
                      {(!message.isAnonymous ||
                        (isHost && message.realSenderInfo)) && (
                        <Avatar className="h-8 w-8 border-2 border-background">
                          <AvatarImage
                            src={
                              isHost && message.realSenderInfo
                                ? message.realSenderInfo.image
                                : message.senderImage
                            }
                            alt={
                              isHost && message.realSenderInfo
                                ? message.realSenderInfo.name
                                : message.senderName
                            }
                          />
                          <AvatarFallback>
                            {(isHost && message.realSenderInfo
                              ? message.realSenderInfo.name
                              : message.senderName
                            ).charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                      )}

                      <div
                        className={`group relative max-w-[75%] space-y-1 ${
                          isOwnMessage ? "items-end" : "items-start"
                        }`}
                      >
                        <div className="flex items-center gap-2 px-2">
                          <span
                            className={`text-sm font-medium ${
                              message.isAnonymous ? "text-muted-foreground" : ""
                            }`}
                          >
                            {message.isAnonymous ? (
                              <span className="flex items-center gap-1">
                                <EyeOff className="h-3 w-3" />
                                Anonymous
                                {isHost && message.realSenderInfo && (
                                  <span className="text-xs opacity-50">
                                    ({message.realSenderInfo.name})
                                  </span>
                                )}
                              </span>
                            ) : (
                              message.senderName
                            )}
                          </span>
                        </div>

                        <div
                          className={`relative rounded-lg bg-muted p-3 ${
                            message.isPinned ? "ring-2 ring-yellow-500/50" : ""
                          }`}
                        >
                          {isPoll && pollData ? (
                            <div className="space-y-3">
                              <p className="font-medium">{pollData.question}</p>
                              {pollData.options.map((option, index) => (
                                <div key={index} className="space-y-1">
                                  <Button
                                    variant={
                                      isOwnMessage ? "secondary" : "outline"
                                    }
                                    size="sm"
                                    className="w-full justify-between"
                                    onClick={() =>
                                      handlePollVote(pollData.pollId, index)
                                    }
                                    disabled={
                                      pollData.votes &&
                                      Object.values(pollData.votes).some(
                                        (voters) =>
                                          (voters as any).includes(
                                            session?.user?.id
                                          )
                                      )
                                    }
                                  >
                                    <span>{option}</span>
                                    <span>
                                      {(pollData.votes?.[index] || []).length}{" "}
                                      votes
                                    </span>
                                  </Button>
                                  <Progress
                                    value={
                                      ((pollData.votes?.[index] || []).length /
                                        (pollData?.totalVotes || 1)) *
                                      100
                                    }
                                    className="h-1"
                                  />
                                </div>
                              ))}
                            </div>
                          ) : message.content.startsWith("[Image](") ? (
                            <div className="rounded-md overflow-hidden">
                              <Image
                                height={200}
                                width={200}
                                src={
                                  message.content.match(
                                    /\[Image\]\((.*?)\)/
                                  )?.[1] || "/placeholder.svg"
                                }
                                alt="Shared image"
                                className="max-w-[200px] rounded-lg"
                              />
                            </div>
                          ) : (
                            <p className="whitespace-pre-wrap break-words">
                              {renderMessageContent(message.content)}
                            </p>
                          )}

                          {message.isPinned && (
                            <div className="absolute -top-2 -right-2">
                              <Badge variant="secondary" className="gap-1">
                                <Pin className="h-3 w-3" />
                                Pinned
                              </Badge>
                            </div>
                          )}
                        </div>

                        {isHost && (
                          <div
                            className={`absolute ${
                              isOwnMessage ? "-left-12" : "-right-12"
                            } top-8 opacity-0 transition-opacity group-hover:opacity-100`}
                          >
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0"
                                    onClick={() =>
                                      message.isPinned
                                        ? handleUnpinMessage(message.id)
                                        : handlePinMessage(message.id)
                                    }
                                  >
                                    <Pin
                                      className={`h-4 w-4 ${
                                        message.isPinned
                                          ? "text-yellow-500"
                                          : ""
                                      }`}
                                    />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  {message.isPinned ? "Unpin" : "Pin"} message
                                </TooltipContent>
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

          <div className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="relative mx-4 my-4 flex flex-col space-y-4">
              <div className="relative flex items-end space-x-2 z-30">
                <Input
                  value={inputMessage}
                  onChange={handleInputChange}
                  placeholder="Type your message..."
                  className="pr-16"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSendMessage();
                    } else if (
                      e.key === "Tab" &&
                      mentionSuggestions.length > 0
                    ) {
                      e.preventDefault();
                      handleMentionSelect(mentionSuggestions[0]);
                    }
                  }}
                  disabled={
                    (isHostOnly && !isHost) ||
                    gathering?.mutedUsers?.includes(session.user.id)
                  }
                />
                {/* <div className="flex items-center h-full "></div> */}

                {(!isHostOnly || isHost) && (
                  <div className=" space-x-2 mt-2  md:flex hidden">
                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={
                        (isHostOnly && !isHost) ||
                        gathering?.mutedUsers?.includes(session.user.id)
                      }
                      variant={"secondary"}
                    >
                      <ImageIcon className="h-4 w-4" />
                    </Button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageUpload}
                      accept="image/*"
                      style={{ display: "none" }}
                    />
                    <Button
                      asChild
                      disabled={
                        (isHostOnly && !isHost) ||
                        gathering?.mutedUsers?.includes(session.user.id)
                      }
                    >
                      <CreateGatheringPoll
                        gatheringSlug={params.slug as string}
                        onPollCreated={(pollMessage) =>
                          handleSendMessage(pollMessage)
                        }
                        canCreatePoll={
                          (isHostOnly && !isHost) ||
                          gathering?.mutedUsers?.includes(session.user.id)
                        }
                      />
                    </Button>
                  </div>
                )}
                <div className="flex space-x-2 mt-2 relative">
                  <Button
                    onClick={() => handleSendMessage()}
                    disabled={
                      (isHostOnly && !isHost) ||
                      gathering?.mutedUsers?.includes(session.user.id)
                    }
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                  <AnonymousSwitch
                    checked={isAnonymous}
                    onCheckedChange={setIsAnonymous}
                    id="anonymous-mode"
                    className="absolute -left-[380%] top-0 mt-1.5"
                  />
                </div>

                {mentionSuggestions.length > 0 && (
                  <div className="absolute bottom-full left-0 bg-background border rounded-md shadow-lg">
                    {Array.from(new Set(mentionSuggestions))
                      .filter((name) => name.toLowerCase() !== "anonymous")
                      .map((name, index) => (
                        <div
                          key={name}
                          className={`px-4 py-2 hover:bg-muted cursor-pointer ${
                            index === 0 ? "bg-muted" : ""
                          }`}
                          onClick={() => handleMentionSelect(name)}
                          onKeyDown={(e) => {
                            if (e.key === "Tab" && index === 0) {
                              e.preventDefault();
                              handleMentionSelect(name);
                            }
                          }}
                        >
                          {name}
                        </div>
                      ))}
                  </div>
                )}
                {isAnonymous && (
                  <motion.p
                    className="text-xs absolute bottom-9 text-muted-foreground p-1"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    You&apos;re anonymous, but the host sees everything.
                  </motion.p>
                )}
                {!isAnonymous && (
                  <motion.p
                    className="text-xs absolute bottom-9 text-muted-foreground p-1"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    Be respectful… or atleast try to be.
                  </motion.p>
                )}
              </div>
              <div className="md:hidden gap-2 grid grid-cols-2">
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={
                    (isHostOnly && !isHost) ||
                    gathering?.mutedUsers?.includes(session.user.id)
                  }
                  variant={"secondary"}
                >
                  <ImageIcon className="h-4 w-4" />
                </Button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  style={{ display: "none" }}
                />
                <Button
                  asChild
                  disabled={
                    (isHostOnly && !isHost) ||
                    gathering?.mutedUsers?.includes(session.user.id)
                  }
                >
                  <CreateGatheringPoll
                    gatheringSlug={params.slug as string}
                    onPollCreated={(pollMessage) =>
                      handleSendMessage(pollMessage)
                    }
                    canCreatePoll={
                      (isHostOnly && !isHost) ||
                      gathering?.mutedUsers?.includes(session.user.id)
                    }
                  />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
