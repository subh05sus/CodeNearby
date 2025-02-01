/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { ArrowLeft, Loader2, Send } from "lucide-react";
import type { Session } from "next-auth";
import Image from "next/image";
import Link from "next/link";
import { getDatabase, ref, push, onChildAdded, off } from "firebase/database";
import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyABLK0zLU5bJ3D6YV-yIFuW-wPE8VBu5zU",
  authDomain: "codenearby-99.firebaseapp.com",
  projectId: "codenearby-99",
  storageBucket: "codenearby-99.firebasestorage.app",
  messagingSenderId: "725950504151",
  appId: "1:725950504151:web:964e851000f99319cf2492",
  measurementId: "G-4SP02T6P15",
  databaseURL: "https://codenearby-99-default-rtdb.firebaseio.com",
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

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

    const roomId =
      minimum(params.id as string, session.user.githubId) +
      maximum(params.id as string, session.user.githubId);

    const messagesRef = ref(database, `messages/${roomId}`);
    push(messagesRef, {
      senderId: session.user.githubId,
      receiverId: params.id,
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
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <h1 className="text-2xl font-bold mb-4">Please Sign In</h1>
        <p>You need to be signed in to view messages.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link href="/messages">
              <ArrowLeft className="h-6 w-6" />
            </Link>
            <Link
              href={friend ? `/user/${friend.githubId}` : "#"}
              className="flex items-center gap-2"
            >
              <Image
                src={friend?.image || "/placeholder.svg"}
                alt={friend?.name || ""}
                className="w-10 h-10 rounded-full"
                height={40}
                width={40}
              />
              <span>{friend?.name || "Chat"}</span>
            </Link>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[60vh] overflow-y-auto mb-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`mb-2 ${
                  message.senderId === session.user.githubId
                    ? "text-right"
                    : "text-left"
                }`}
              >
                <span
                  className={`inline-block p-2 rounded-lg ${
                    message.senderId === session.user.githubId
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 dark:bg-zinc-900 text-black dark:text-white"
                  }`}
                >
                  {message.content}
                </span>
              </div>
            ))}
            <div ref={messagesEndRef} className="h-2" />
          </div>
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Type a message..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && sendMessage()}
            />
            <Button onClick={sendMessage}>
              <Send className="h-4 w-4 mr-2" />
              Send
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
