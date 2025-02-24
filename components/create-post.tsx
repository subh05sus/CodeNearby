/* eslint-disable jsx-a11y/alt-text */
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSession } from "next-auth/react";
import { ImageIcon, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { CreatePoll } from "./create-poll";
import { ShareLocation } from "./share-location";
import { ShareSchedule } from "./share-schedule";
import { EmojiPicker } from "./emoji-picker";
import Image from "next/image";

interface CreatePostProps {
  onSubmit: (
    content: string,
    image: File | null,
    poll?: { question: string; options: string[] },
    location?: { lat: number; lng: number },
    schedule?: Date
  ) => Promise<void>;
}

export function CreatePost({ onSubmit }: CreatePostProps) {
  const { data: session } = useSession();
  const [content, setContent] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [poll, setPoll] = useState<{
    question: string;
    options: string[];
  } | null>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(
    null
  );
  const [schedule, setSchedule] = useState<Date | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim() && !image && !poll && !location && !schedule) return;
    setIsSubmitting(true);
    try {
      await onSubmit(
        content,
        image,
        poll || undefined,
        location || undefined,
        schedule || undefined
      );
      setContent("");
      setImage(null);
      setPoll(null);
      setLocation(null);
      setSchedule(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreatePoll = (question: string, options: string[]) => {
    setPoll({ question, options });
  };

  const handleShareLocation = (lat: number, lng: number) => {
    setLocation({ lat, lng });
  };

  const handleShareSchedule = (date: Date) => {
    setSchedule(date);
  };

  const handleEmojiSelect = (emoji: string) => {
    setContent((prev) => prev + emoji);
  };

  return (
    <div className="bg-background border rounded-xl p-4">
      <div className="flex portrait:flex-col gap-4">
        <Avatar className="w-10 h-10">
          <AvatarImage src={session?.user?.image || ""} />
          <AvatarFallback>
            {session?.user?.name?.charAt(0) || "U"}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <Textarea
            placeholder="What is happening?!"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[100px] border-none focus-visible:ring-0 text-lg resize-none "
          />
          <div className="flex items-center portrait:flex-col portrait:items-start  portrait:w-full justify-between mt-4 border-t pt-4">
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="text-primary hover:bg-primary/10 rounded-full"
                onClick={() => document.getElementById("image-input")?.click()}
              >
                <ImageIcon className="w-5 h-5" />
              </Button>
              <input
                id="image-input"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => setImage(e.target.files?.[0] || null)}
              />
              <CreatePoll onCreatePoll={handleCreatePoll} />
              <ShareLocation onShareLocation={handleShareLocation} />
              <ShareSchedule onShareSchedule={handleShareSchedule} />
              <EmojiPicker onChange={handleEmojiSelect} />
            </div>
            <Button
              onClick={handleSubmit}
              disabled={
                (!content.trim() &&
                  !image &&
                  !poll &&
                  !location &&
                  !schedule) ||
                isSubmitting
              }
              className={cn(
                "rounded-full px-6 portrait:w-full portrait:mt-2",
                !content.trim() &&
                  !image &&
                  !poll &&
                  !location &&
                  !schedule &&
                  "opacity-50"
              )}
            >
              Post
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            {poll && (
              <div className="mt-2 space-y-2">
                <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-4 h-full relative">
                  <h4 className="text-sm font-semibold leading-none tracking-tight mb-3">
                    {poll.question}
                  </h4>
                  <div className="space-y-2">
                    {poll.options.map((option, index) => (
                      <div
                        key={index}
                        className="flex items-center p-2 rounded-md bg-muted/50 hover:bg-muted/80 transition-colors"
                      >
                        <span className="text-sm">{option}</span>
                      </div>
                    ))}
                  </div>
                  <X
                    className="absolute top-1 right-1 w-4 h-4 text-white bg-black/50 dark:bg-red-600/50 rounded-full cursor-pointer z-10"
                    onClick={() => setPoll(null)}
                  />
                </div>
              </div>
            )}
            <div
              className={`grid grid-cols-1 gap-2 ${
                location || schedule ? "" : "hidden"
              }`}
            >
              {location && (
                <div className="mt-2 rounded-lg border bg-card text-card-foreground shadow-sm p-4 relative">
                  <h4 className="text-sm font-semibold leading-none tracking-tight mb-3">
                    Location
                  </h4>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    <span>
                      {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                    </span>
                  </div>
                  <X
                    className="absolute top-1 right-1 w-4 h-4 text-white bg-black/50 dark:bg-red-600/50 rounded-full cursor-pointer z-10"
                    onClick={() => setLocation(null)}
                  />
                </div>
              )}
              {schedule && (
                <div className="mt-2 rounded-lg border bg-card text-card-foreground shadow-sm p-4 relative">
                  <h4 className="text-sm font-semibold leading-none tracking-tight mb-3">
                    Schedule
                  </h4>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                      <line x1="16" x2="16" y1="2" y2="6" />
                      <line x1="8" x2="8" y1="2" y2="6" />
                      <line x1="3" x2="21" y1="10" y2="10" />
                    </svg>
                    <span>
                      {schedule.toLocaleDateString()} at{" "}
                      {schedule.toLocaleTimeString()}
                    </span>
                  </div>
                  <X
                    className="absolute top-1 right-1 w-4 h-4 text-white bg-black/50 dark:bg-red-600/50 rounded-full cursor-pointer z-10"
                    onClick={() => setSchedule(null)}
                  />
                </div>
              )}
            </div>
            {image && (
              <div className="mt-2 relative h-20 aspect-square">
                <Image
                  src={URL.createObjectURL(image)}
                  className="object-cover rounded-lg"
                  alt=""
                  fill
                />
                <X
                  className="absolute top-1 right-1 w-4 h-4 text-white bg-black/50 dark:bg-red-600/50 rounded-full cursor-pointer z-10"
                  onClick={() => setImage(null)}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
