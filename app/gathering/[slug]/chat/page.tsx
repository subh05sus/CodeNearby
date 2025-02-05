"use client";

import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Send, ImageIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { db } from "@/lib/firebase";
import { ref, onChildAdded, off } from "firebase/database";
import { Session } from "next-auth";
import { CreateGatheringPoll } from "@/components/gatheringPoll";
import Image from "next/image";
interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderImage: string;
  content: string;
  timestamp: number;
  isAnonymous: boolean;
  isPinned: boolean;
}

export default function GatheringChatPage() {
  const { data: session } = useSession() as { data: Session | null };
  const params = useParams();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isHostOnly, setIsHostOnly] = useState(false);
  const [isHost, setIsHost] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (session) {
      fetchMessages();
      checkHostStatus();
    }
    return () => {
      const messagesRef = ref(db, `messages/${params.slug}`);
      off(messagesRef);
    };
  }, [session, params.slug]);

  const fetchMessages = async () => {
    const messagesRef = ref(db, `messages/${params.slug}`);
    onChildAdded(messagesRef, (snapshot) => {
      const message = snapshot.val();
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    setIsLoading(false);
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
    } catch {
      console.error("Error checking host status");
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, []); //Fixed useEffect dependency

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !session) return;

    try {
      const response = await fetch(`/api/gathering/${params.slug}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: inputMessage,
          isAnonymous,
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

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <h1 className="text-2xl font-bold mb-4">Please Sign In</h1>
        <p>You need to be signed in to view this chat.</p>
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
          <CardTitle>Chat</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[60vh] overflow-y-auto mb-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start space-x-2 ${
                  message.senderId === session.user.id
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                {!message.isAnonymous && (
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={message.senderImage}
                      alt={message.senderName}
                    />
                    <AvatarFallback>{message.senderName[0]}</AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={`bg-muted p-2 rounded-lg ${
                    message.isPinned ? "border-2 border-yellow-500" : ""
                  }`}
                >
                  {message.isAnonymous ? (
                    <p className="text-sm font-semibold">Anonymous</p>
                  ) : (
                    <p className="text-sm font-semibold">
                      {message.senderName}
                    </p>
                  )}
                  {message.content.startsWith("[Image](") ? (
                    <Image
                      height={200}
                      width={200}
                      src={
                        message.content.match(/\[Image\]\((.*?)\)/)?.[1] || ""
                      }
                      alt="Shared image"
                      className="max-w-[200px] rounded-lg"
                    />
                  ) : (
                    <p>{message.content}</p>
                  )}

                  {isHost && !message.isPinned && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handlePinMessage(message.id)}
                      className="mt-1"
                    >
                      Pin
                    </Button>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <div className="flex items-center space-x-2">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Type your message..."
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              disabled={isHostOnly && !isHost}
            />
            <Button
              onClick={handleSendMessage}
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
            <CreateGatheringPoll gatheringSlug={params.slug as string} />
          </div>
          <div className="flex items-center mt-2">
            <Switch
              checked={isAnonymous}
              onCheckedChange={setIsAnonymous}
              id="anonymous-mode"
            />
            <label htmlFor="anonymous-mode" className="ml-2">
              Send anonymously
            </label>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
