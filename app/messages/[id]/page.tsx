/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import {
  Loader2,
  Send,
  ArrowLeft,
  BarChart,
  MapPin,
  Calendar,
  ArrowDown,
} from "lucide-react";
import Image from "next/image";
import { ref, push, onChildAdded, off } from "firebase/database";
import { format } from "date-fns";
import type { Session } from "next-auth";
import { db as database } from "@/lib/firebase";
import LoginButton from "@/components/login-button";
import { useAutoScroll } from "@/hooks/use-auto-scroll";

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
  const { toast } = useToast();
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
      minimum(params.id as string, session.user.githubId) +
      maximum(params.id as string, session.user.githubId);

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
      toast({
        title: "Error",
        description: "Failed to fetch friend details.",
        variant: "destructive",
      });
    }
  };

  const sendMessage = () => {
    if (inputMessage.trim() === "" || !session?.user?.githubId || !params.id)
      return;

    const roomId = [session.user.githubId, params.id].sort().join("");

    const messagesRef = ref(database, `messages/${roomId}`);
    push(messagesRef, {
      senderId: session.user.githubId,
      content: inputMessage,
      timestamp: Date.now(),
    });

    setInputMessage("");
  };

  const { scrollRef, isAtBottom, scrollToBottom } =
    useAutoScroll({
      offset: 20,
      smooth: true,
      content: messages.length,
    });

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4">
        <h1 className="text-2xl font-bold mb-4">Please Sign In</h1>
        <p>You need to be signed in to view messages.</p>
        <LoginButton />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <>
      <div className="border-b border-gray-200 dark:border-gray-800 p-4 flex items-center">
        <Button
          variant="ghost"
          className="mr-2 md:hidden"
          onClick={() => router.push("/messages")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <Image
          src={friend?.image || "/placeholder.svg"}
          alt={friend?.name || ""}
          className="w-10 h-10 rounded-full mr-4"
          width={40}
          height={40}
        />
        <h2 className="text-xl font-semibold">{friend?.name || "Chat"}</h2>
      </div>
      <div
        className="flex-grow overflow-y-auto portrait:max-h-[65vh] no-scrollbar p-4"
        ref={scrollRef}
      >
        {messages.map((message) => {
          return (
            <div
              key={message.id}
              className={`mb-4 flex ${
                message.senderId === session.user.githubId
                  ? "justify-end"
                  : "justify-start"
              }`}
            >
              <div
                className={`max-w-[70%] p-3 rounded-lg ${
                  message.senderId === session.user.githubId
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 dark:bg-zinc-800"
                }`}
              >
                {(() => {
                  try {
                    const jsonContent = JSON.parse(message.content);
                    if (jsonContent.type === "post") {
                      return (
                        <div
                          className="text-inherit bg-black p-2 rounded-lg cursor-pointer mb-2"
                          onClick={() =>
                            router.push(`/posts/${jsonContent.postId}`)
                          }
                        >
                          <p className="text-sm mb-2 line-clamp-2">
                            {jsonContent.postContent}
                          </p>
                          {jsonContent.postImage && (
                            <div className="relative w-full aspect-video h-32 ">
                              <Image
                                src={
                                  jsonContent.postImage || "/placeholder.svg"
                                }
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
                                format(
                                  new Date(jsonContent.postSchedule),
                                  "PPp"
                                )}
                            </div>
                          )}
                        </div>
                      );
                    }
                  } catch {
                    // If parsing fails, treat as regular message
                    return <p>{message.content}</p>;
                  }
                })()}
                <p className="text-xs mt-1 opacity-70">
                  {format(new Date(message.timestamp), "HH:mm")}
                </p>
              </div>
            </div>
          );
        })}

        {/* <div ref={messagesEndRef} className="h-2" /> */}
      </div>
      <div className="border-t border-gray-200 dark:border-gray-800 p-4 flex relative">
        {!isAtBottom && (
          <Button
            size="icon"
            variant="outline"
            className="absolute bottom-20 right-4 rounded-full"
            onClick={scrollToBottom}
          >
            <ArrowDown className="h-4 w-4" />
          </Button>
        )}
        <Input
          type="text"
          placeholder="Type a message..."
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && sendMessage()}
          className="flex-grow mr-2"
        />
        <Button onClick={sendMessage}>
          <Send className="h-4 w-4 mr-2" />
          Send
        </Button>
      </div>
    </>
  );
}
