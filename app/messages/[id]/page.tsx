/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Loader2, Send, ArrowLeft, BarChart, MapPin, Calendar, Github } from "lucide-react";
import Image from "next/image";
import { ref, push, onChildAdded, off } from "firebase/database";
import { format } from "date-fns";
import type { Session } from "next-auth";
import { db as database } from "@/lib/firebase";
import LoginButton from "@/components/login-button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";

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
      minimum(params.id as string, session.user.githubId) +
      maximum(params.id as string, session.user.githubId);
    const messagesRef = ref(database, `messages/${roomId}`);
    off(messagesRef);
    onChildAdded(messagesRef, (snapshot) => {
      const message = { id: snapshot.key, ...snapshot.val() };
      setMessages((prev) => {
        if (prev.some((m) => m.id === message.id)) return prev;
        const updated = [...prev, message];
        setTimeout(scrollToBottom, 100);
        return updated;
      });
    });
    setLoading(false);
    return () => off(messagesRef);
  };

  const fetchFriend = async () => {
    try {
      const response = await fetch(`/api/user/${params.id}`);
      const data = await response.json();
      setFriend(data);
    } catch {
      toast.error("Failed to fetch friend details.");
    }
  };

  const sendMessage = () => {
    if (!inputMessage.trim() || !session?.user?.githubId || !params.id) return;
    const roomId = [session.user.githubId, params.id].sort().join("");
    const messagesRef = ref(database, `messages/${roomId}`);
    push(messagesRef, {
      senderId: session.user.githubId,
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
      <div className="flex flex-col items-center justify-center h-full gap-4 p-8 text-center">
        <h2 className="font-heading text-xl">Sign in to view messages</h2>
        <LoginButton />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  const renderContent = (content: string) => {
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
                <BarChart className="h-3.5 w-3.5 mr-1" />
                Poll: {jsonContent.postPoll.question}
              </div>
            )}
            {jsonContent.postLocation && (
              <div className="flex items-center text-xs opacity-70 mt-1">
                <MapPin className="h-3.5 w-3.5 mr-1" />
                Location attached
              </div>
            )}
            {jsonContent.postSchedule && (
              <div className="flex items-center text-xs opacity-70 mt-1">
                <Calendar className="h-3.5 w-3.5 mr-1" />
                {format(new Date(jsonContent.postSchedule), "PPp")}
              </div>
            )}
          </div>
        );
      }
    } catch {
      return <p className="whitespace-pre-wrap break-words">{content}</p>;
    }
  };

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border flex-shrink-0">
        <button
          className="md:hidden p-1.5 rounded-lg hover:bg-muted transition-colors"
          onClick={() => router.push("/messages")}
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        {friend?.image && (
          <Image
            src={friend.image || "/placeholder.svg"}
            alt={friend?.name || ""}
            width={36}
            height={36}
            className="rounded-full flex-shrink-0"
          />
        )}
        <div className="min-w-0">
          <p className="font-semibold text-sm truncate">{friend?.name || "Chat"}</p>
          {friend?.githubUsername && (
            <p className="text-[11px] text-muted-foreground font-mono truncate">
              @{friend.githubUsername}
            </p>
          )}
        </div>
        {friend?.githubUsername && (
          <a
            href={`https://github.com/${friend.githubUsername}`}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto p-2 rounded-xl hover:bg-muted transition-colors flex-shrink-0"
          >
            <Github className="h-4 w-4 text-muted-foreground" />
          </a>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-hidden min-h-0">
        <ScrollArea className="h-full w-full">
          <div className="flex flex-col p-4 gap-3 pb-2">
            {messages.length === 0 && (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground">
                  No messages yet. Say hello! 👋
                </p>
              </div>
            )}
            {messages.map((message) => {
              const isOwn = message.senderId === session.user.githubId;
              return (
                <div
                  key={message.id}
                  className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                      isOwn
                        ? "rounded-br-sm text-white"
                        : "rounded-bl-sm bg-muted"
                    }`}
                    style={isOwn ? { background: "hsl(24 95% 53%)" } : {}}
                  >
                    {renderContent(message.content)}
                    <p
                      className={`text-[10px] mt-1 font-mono ${
                        isOwn ? "text-white/60 text-right" : "text-muted-foreground"
                      }`}
                    >
                      {format(new Date(message.timestamp), "HH:mm")}
                    </p>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </div>

      {/* Input */}
      <div className="flex-shrink-0 border-t border-border p-3 flex items-center gap-2">
        <div className="flex-1 flex items-center bg-muted rounded-2xl px-4 py-2.5 focus-within:ring-2 focus-within:ring-primary/20 transition-all">
          <input
            type="text"
            placeholder="Type a message..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/50"
          />
        </div>
        <button
          onClick={sendMessage}
          disabled={!inputMessage.trim()}
          className="w-10 h-10 rounded-full flex items-center justify-center text-white transition-all hover:opacity-90 active:scale-95 disabled:opacity-40 flex-shrink-0"
          style={{ background: "hsl(24 95% 53%)" }}
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
