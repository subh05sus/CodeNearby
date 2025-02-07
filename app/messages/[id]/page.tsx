/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Send } from "lucide-react";
import Image from "next/image";
import { ref, push, onChildAdded, off } from "firebase/database";
import { format } from "date-fns";
import { Session } from "next-auth";
import { db as database } from "@/lib/firebase";

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

  useEffect(() => {
    scrollToBottom();
  }, [messagesEndRef]); //Corrected dependency

  const fetchMessages = async () => {
    if (!session?.user?.githubId || !params.id) return;

    setMessages([]); // Reset messages when fetching new ones

    const roomId =
      minimum(params.id as string, session.user.githubId) +
      maximum(params.id as string, session.user.githubId);

    const messagesRef = ref(database, `messages/${roomId}`);

    // Remove any existing listeners first
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
        setTimeout(scrollToBottom, 100); // Delay ensures DOM updates before scrolling
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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <h1 className="text-2xl font-bold mb-4">Please Sign In</h1>
        <p>You need to be signed in to view messages.</p>
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
        <Image
          src={friend?.image || "/placeholder.svg"}
          alt={friend?.name || ""}
          className="w-10 h-10 rounded-full mr-4"
          width={40}
          height={40}
        />
        <h2 className="text-xl font-semibold">{friend?.name || "Chat"}</h2>
      </div>
      <div className="flex-grow overflow-y-auto p-4">
        {messages.map((message) => (
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
              <p>{message.content}</p>
              <p className="text-xs mt-1 opacity-70">
                {format(new Date(message.timestamp), "HH:mm")}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} className="h-2" />
      </div>
      <div className="border-t border-gray-200 dark:border-gray-800 p-4 flex">
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
