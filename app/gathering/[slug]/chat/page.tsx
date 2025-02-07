/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Send, ImageIcon, Pin } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { db } from "@/lib/firebase";
import { ref, onChildAdded, onChildChanged, get } from "firebase/database";
import type { Session } from "next-auth";
import { CreateGatheringPoll } from "@/components/gatheringPoll";
import Image from "next/image";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";

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
      setIsHostOnly(data.hostOnly || false);
    } catch {
      console.error("Error checking host status");
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, []); // Updated useEffect dependency

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
      const suggestions = messages
        .filter((message) => message.senderName.toLowerCase().includes(query))
        .map((message) => message.senderName)
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
  };

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <h1 className="text-2xl font-bold mb-4">Please Sign In</h1>
        <p>You need to be signed in to view this chat.</p>
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

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            Chat
            {pinnedMessageId && (
              <Button
                variant="outline"
                size="sm"
                onClick={scrollToPinnedMessage}
              >
                <Pin className="h-4 w-4 mr-2" />
                View Pinned Message
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[60vh] overflow-y-auto mb-4 space-y-4">
            {messages.map((message) => {
              const isPoll = message.content.startsWith('{"type":"poll"');
              const pollContent = isPoll ? JSON.parse(message.content) : null;
              const pollData = pollContent ? polls[pollContent.pollId] : null;
              console.log(pollData);
              return (
                <div
                  key={message.id}
                  id={`message-${message.id}`}
                  className={`flex items-start space-x-2 ${
                    message.senderId === session.user.id
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  {(!message.isAnonymous ||
                    (isHost && message.realSenderInfo)) && (
                    <Avatar className="h-8 w-8">
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
                        {isHost && message.realSenderInfo
                          ? message.realSenderInfo.name[0]
                          : message.senderName[0]}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={`bg-muted p-2 rounded-lg ${
                      message.isPinned ? "border-2 border-yellow-500" : ""
                    }`}
                  >
                    {message.isAnonymous ? (
                      <p className="text-sm font-semibold">
                        Anonymous
                        {isHost && message.realSenderInfo && (
                          <span className="text-xs text-muted-foreground">
                            {" "}
                            ({message.realSenderInfo.name})
                          </span>
                        )}
                      </p>
                    ) : (
                      <p className="text-sm font-semibold">
                        {message.senderName}
                      </p>
                    )}
                    {isPoll && pollData ? (
                      <div className="space-y-2">
                        <p className="font-semibold">{pollData.question}</p>
                        {pollData.options.map((option, index) => (
                          <div key={index} className="space-y-1">
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full justify-between"
                              onClick={() =>
                                handlePollVote(pollData.pollId, index)
                              }
                              disabled={
                                pollData.votes &&
                                Object.values(pollData.votes).some((voters) =>
                                  (voters as any).includes(session.user.id)
                                )
                              }
                            >
                              <span>{option}</span>
                              <span>
                                {(pollData.votes?.[index] || []).length} votes
                              </span>
                            </Button>
                            <Progress
                              value={
                                ((pollData.votes?.[index] || []).length /
                                  (pollData?.totalVotes || 1)) *
                                100
                              }
                              className="h-2"
                            />
                          </div>
                        ))}
                      </div>
                    ) : message.content.startsWith("[Image](") ? (
                      <div>
                        <Image
                          height={200}
                          width={200}
                          src={
                            message.content.match(/\[Image\]$$(.*?)$$/)?.[1] ||
                            "" ||
                            "/placeholder.svg"
                          }
                          alt="Image"
                          className="max-w-[200px] rounded-lg"
                        />
                      </div>
                    ) : (
                      <p>{renderMessageContent(message.content)}</p>
                    )}

                    {isHost && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          message.isPinned
                            ? handleUnpinMessage(message.id)
                            : handlePinMessage(message.id)
                        }
                        className="mt-1"
                      >
                        {message.isPinned ? "Unpin" : "Pin"}
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
          <div className="relative">
            <Input
              value={inputMessage}
              onChange={handleInputChange}
              placeholder="Type your message..."
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSendMessage();
                } else if (e.key === "Tab" && mentionSuggestions.length > 0) {
                  e.preventDefault();
                  handleMentionSelect(mentionSuggestions[0]);
                }
              }}
              disabled={isHostOnly && !isHost}
            />
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
          </div>
          <div className="flex items-center space-x-2 mt-2">
            <Button
              onClick={() => handleSendMessage()}
              disabled={isHostOnly && !isHost}
            >
              <Send className="h-4 w-4" />
            </Button>
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={isHostOnly && !isHost}
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
            <CreateGatheringPoll
              gatheringSlug={params.slug as string}
              onPollCreated={(pollMessage) => handleSendMessage(pollMessage)}
            />
            <div className="flex items-center">
              <Switch
                checked={isAnonymous}
                onCheckedChange={setIsAnonymous}
                id="anonymous-mode"
              />
              <label htmlFor="anonymous-mode" className="ml-2">
                Send anonymously
              </label>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
