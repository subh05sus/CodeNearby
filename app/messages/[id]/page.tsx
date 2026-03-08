/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Input } from "@/components/ui/input";
import SwissButton from "@/components/swiss/SwissButton";
import {
  Loader2,
  Send,
  ArrowLeft,
  BarChart,
  MapPin,
  Calendar,
  Zap,
} from "lucide-react";
import Image from "next/image";
import { ref, push, onChildAdded, off } from "firebase/database";
import { format } from "date-fns";
import type { Session } from "next-auth";
import { db as database } from "@/lib/firebase";
import LoginButton from "@/components/login-button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: number;
}

const minimum = (a: string, b: string) => (a < b ? a : b);
const maximum = (a: string, b: string) => (a > b ? a : b);

export default function MessagePage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession() as { data: Session | null };
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [friend, setFriend] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (session && params.id) {
      fetchMessages();
      fetchFriend();
    }
  }, [params.id, session]);

  const fetchMessages = async () => {
    if (!session?.user?.githubId || !params.id) return;

    setMessages([]);

    const roomId =
      minimum(params.id as string, session.user.githubId.toString()) +
      maximum(params.id as string, session.user.githubId.toString());

    const messagesRef = ref(database, `messages/${roomId}`);

    off(messagesRef);

    onChildAdded(messagesRef, (snapshot) => {
      const message = {
        id: snapshot.key,
        ...snapshot.val(),
      };

      setMessages((prevMessages) => {
        if (prevMessages.some((m) => m.id === message.id)) {
          return prevMessages;
        }
        const newMessages = [...prevMessages, message];
        setTimeout(scrollToBottom, 100);
        return newMessages;
      });
    });

    setLoading(false);

    return () => {
      off(messagesRef);
    };
  };

  const fetchFriend = async () => {
    try {
      const response = await fetch(`/api/user/${params.id}`);
      const data = await response.json();
      setFriend(data);
    } catch {
      toast.error("MISSION_FAILURE", { description: "FAILED_TO_FETCH_NODE_IDENTITY." });
    }
  };

  const sendMessage = () => {
    if (inputMessage.trim() === "" || !session?.user?.githubId || !params.id)
      return;

    const roomId = [session.user.githubId.toString(), params.id as string].sort().join("");

    const messagesRef = ref(database, `messages/${roomId}`);
    push(messagesRef, {
      senderId: session.user.githubId.toString(),
      content: inputMessage,
      timestamp: Date.now(),
    });

    setInputMessage("");
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-12 text-center bg-white dark:bg-black border-8 border-black dark:border-white shadow-[16px_16px_0_0_rgba(0,0,0,1)] dark:shadow-[16px_16px_0_0_rgba(255,255,255,1)] m-8 transition-colors duration-300">
        <Zap className="h-24 w-24 mb-6 text-swiss-red animate-pulse" />
        <h1 className="text-4xl font-black uppercase tracking-tighter mb-4 italic text-black dark:text-white">ACCESS_RESTRICTED</h1>
        <p className="text-xl font-bold uppercase tracking-tight max-w-sm opacity-60 mb-8 text-black dark:text-white">
          AUTHENTICATION_REQUIRED_TO_ACCESS_SECURE_COMMUNICATION_CHANNELS.
        </p>
        <LoginButton />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-full gap-8 bg-white dark:bg-black transition-colors duration-300">
        <Loader2 className="h-16 w-16 animate-spin text-swiss-red" />
        <h2 className="text-4xl font-black uppercase tracking-tighter italic text-black dark:text-white">CONNECTING_NODE...</h2>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-black transition-colors duration-300">
      {/* Header */}
      <div className="border-b-8 border-black dark:border-white p-6 bg-white dark:bg-black flex items-center justify-between z-10 sticky top-0 transition-colors">
        <div className="flex items-center">
          <SwissButton
            variant="secondary"
            className="mr-6 md:hidden h-12 w-12 p-0"
            onClick={() => router.push("/messages")}
          >
            <ArrowLeft className="h-6 w-6" />
          </SwissButton>
          <div className="relative">
            <div className="absolute inset-0 bg-swiss-red translate-x-1 translate-y-1 -z-10" />
            <Image
              src={friend?.image || "/placeholder.svg"}
              alt={friend?.name || ""}
              className="w-16 h-16 border-4 border-black dark:border-white grayscale object-cover transition-colors"
              width={64}
              height={64}
            />
          </div>
          <div className="ml-6 text-left">
            <h2 className="text-3xl font-black uppercase tracking-tighter italic leading-none text-black dark:text-white underline decoration-4 decoration-swiss-red transition-colors">
              {friend?.name || "ENCRYPTED_ID"}
            </h2>
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-40 mt-1 text-black dark:text-white">
              STATUS: SECURE_UPLINK_ESTABLISHED
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-grow overflow-hidden relative">
        <ScrollArea className="h-full w-full">
          <div className="p-8 space-y-8 max-w-5xl mx-auto">
            {messages.map((message) => {
              const isMe = message.senderId === session.user.githubId.toString();
              return (
                <div
                  key={message.id}
                  className={cn(
                    "flex flex-col group",
                    isMe ? "items-end" : "items-start"
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[85%] md:max-w-[70%] text-lg font-bold p-6 border-4 border-black dark:border-white shadow-[8px_8px_0_0_rgba(0,0,0,1)] dark:shadow-[8px_8px_0_0_rgba(255,255,255,1)] relative transition-all duration-200 group-hover:translate-x-1 group-hover:translate-y-1 group-hover:shadow-none",
                      isMe
                        ? "bg-swiss-red text-white text-right border-swiss-red"
                        : "bg-white dark:bg-black text-black dark:text-white text-left"
                    )}
                  >
                    {(() => {
                      try {
                        const jsonContent = JSON.parse(message.content);
                        if (jsonContent.type === "post") {
                          return (
                            <div
                              className="bg-black dark:bg-white text-white dark:text-black p-4 border-4 border-white dark:border-black mb-4 hover:bg-swiss-red dark:hover:bg-swiss-red hover:text-white transition-all duration-300 cursor-pointer"
                              onClick={() => router.push(`/posts/${jsonContent.postId}`)}
                            >
                              <div className="flex items-center gap-2 mb-3 border-b-2 border-white/20 dark:border-black/20 pb-2">
                                <Zap className="h-4 w-4" />
                                <span className="text-[10px] uppercase font-black  italic">EXTERNAL_OBJECT_LINK</span>
                              </div>
                              <p className="text-base font-black uppercase tracking-tight mb-4 italic leading-tight line-clamp-2">
                                {jsonContent.postContent}
                              </p>
                              {jsonContent.postImage && (
                                <div className="relative w-full aspect-video border-2 border-white dark:border-black mb-4 overflow-hidden">
                                  <Image
                                    src={jsonContent.postImage || "/placeholder.svg"}
                                    alt="Post image"
                                    fill
                                    className="object-cover grayscale hover:grayscale-0 transition-all duration-500"
                                  />
                                </div>
                              )}
                              <div className="flex flex-wrap gap-4 text-[10px] font-black uppercase  opacity-60">
                                {jsonContent.postPoll && (
                                  <div className="flex items-center">
                                    <BarChart className="h-3 w-3 mr-1" />
                                    POLL_DATA
                                  </div>
                                )}
                                {jsonContent.postLocation && (
                                  <div className="flex items-center">
                                    <MapPin className="h-3 w-3 mr-1" />
                                    LOC_SIGNAL
                                  </div>
                                )}
                                {jsonContent.postSchedule && (
                                  <div className="flex items-center">
                                    <Calendar className="h-3 w-3 mr-1" />
                                    COORD_TIME
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        }
                      } catch {
                        return <p className="uppercase leading-tight">{message.content}</p>;
                      }
                    })()}
                    <div className={cn(
                      "mt-4 text-[10px] font-black uppercase  opacity-40 italic",
                      isMe ? "text-right" : "text-left"
                    )}>
                      {format(new Date(message.timestamp), "HH:mm")}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </div>

      {/* Input Area */}
      <div className="p-8 border-t-8 border-black dark:border-white bg-white dark:bg-black z-20 transition-colors">
        <div className="max-w-5xl mx-auto flex gap-6">
          <div className="flex-grow relative group">
            <div className="absolute inset-0 bg-swiss-red translate-x-2 translate-y-2 -z-10 transition-transform group-focus-within:translate-x-1 group-focus-within:translate-y-1" />
            <Input
              type="text"
              placeholder="ENTER_MESSAGE_ENCRYPTION..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              className="h-20 bg-white dark:bg-black border-4 border-black dark:border-white rounded-none px-8 text-2xl font-black uppercase tracking-tighter italic placeholder:text-black/20 dark:placeholder:text-white/20 focus-visible:ring-0 focus-visible:ring-offset-0 text-black dark:text-white"
            />
          </div>
          <SwissButton
            variant="primary"
            className="h-20 w-32 shadow-[8px_8px_0_0_rgba(0,0,0,1)] dark:shadow-[8px_8px_0_0_rgba(255,255,255,1)]"
            onClick={sendMessage}
          >
            <Send className="h-8 w-8 italic" />
          </SwissButton>
        </div>
        <div className="max-w-5xl mx-auto mt-4 flex justify-between items-center px-2">
          <p className="text-[10px] font-black uppercase tracking-[0.5em] opacity-20 text-black dark:text-white">
            SECURE_KEY_EXCHANGE_ACTIVE
          </p>
          <div className="w-32 h-1 bg-black dark:bg-white opacity-10" />
        </div>
      </div>
    </div>
  );
}
