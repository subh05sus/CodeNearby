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
import io from "socket.io-client";
import { Session } from "next-auth";
import Image from "next/image";
import Link from "next/link";

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: Date;
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
  const socketRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (session && params.id) {
      fetchMessages();
      fetchFriend();
      initializeSocket();
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [params.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]); 

  const initializeSocket = () => {
    socketRef.current = io("http://localhost:5000", {
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
    socketRef.current.on("connect", () => {
      console.log("Connected to socket server");
      console.log(
        "Joining room:",
        minimum(
          params.id as string,
          String(session?.user?.githubId).toString()
        ) +
          maximum(
            params.id as string,
            String(session?.user?.githubId).toString()
          )
      );
      socketRef.current.emit(
        "join",
        minimum(
          params.id as string,
          String(session?.user?.githubId).toString()
        ) +
          maximum(
            params.id as string,
            String(session?.user?.githubId).toString()
          )
      );
    });

    socketRef.current.on("message", (message: Message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });
  };

  const fetchMessages = async () => {
    try {
      const response = await fetch(`/api/messages/${params.id}`);
      const data = await response.json();
      setMessages(data);
    } catch {
      toast({
        title: "Error",
        description: "Failed to fetch messages.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
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
    if (inputMessage.trim() === "") return;

    const messageData = {
      roomId:
        minimum(
          params.id as string,
          String(session?.user?.githubId).toString()
        ) +
        maximum(
          params.id as string,
          String(session?.user?.githubId).toString()
        ),
      senderId: String(session?.user?.githubId),
      receiverId: (params.id as string).replace(
        String(session?.user?.githubId),
        ""
      ),
      content: inputMessage,
    };
    console.log("Sending message:", messageData);

    socketRef.current.emit("message", messageData);
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
            <Link href={`/user/${friend.githubId}`} className="flex items-center gap-2">

            <Image
            src={friend?.image || "/placeholder.svg"}
            alt={friend?.name || ""}
            className="w-10 h-10 rounded-full"
            height={40}
            width={40}
            
            />
            <span>

            {friend?.name || "Chat"}
            </span>
            </Link>
            </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[60vh] overflow-y-auto mb-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`mb-2 ${
                  message.senderId === String(session.user?.githubId)
                    ? "text-right"
                    : "text-left"
                }`}
              >
                <span
                  className={`inline-block p-2 rounded-lg ${
                    message.senderId === String(session.user?.githubId)
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 dark:bg-zinc-900 text-black dark:text-white"
                  }`}
                >
                  {message.content}
                </span>
              </div>
            ))}
            <div ref={messagesEndRef} />
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
