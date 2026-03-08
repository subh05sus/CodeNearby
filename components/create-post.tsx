"use client";

import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { ImageIcon, Loader2, X, MapPin, Calendar, Clock, Smile } from "lucide-react";
import { cn } from "@/lib/utils";
import { CreatePoll } from "./create-poll";
import { ShareLocation } from "./share-location";
import { ShareSchedule } from "./share-schedule";
import { EmojiPicker } from "./emoji-picker";
import Image from "next/image";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { getLocationByIp } from "@/lib/location";
import { Session } from "next-auth";
import SwissButton from "./swiss/SwissButton";
import SwissCard from "./swiss/SwissCard";

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
  const { data: session } = useSession() as { data: Session | null };
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
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
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [city, setCity] = useState<string | null>(null);
  const [isCityLoading, setIsCityLoading] = useState(false);

  const isOnboarding = (searchParams?.get("source") || "") === "onboarding";
  const displayName = (session?.user?.name?.split(" ")[0] ||
    session?.user?.githubUsername ||
    "there") as string;

  useEffect(() => {
    if (!isOnboarding) return;
    let cancelled = false;
    (async () => {
      try {
        setIsCityLoading(true);
        const res = await getLocationByIp();
        if (!cancelled) setCity(res?.city || null);
      } catch {
        if (!cancelled) setCity(null);
      } finally {
        if (!cancelled) setIsCityLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isOnboarding]);

  const suggestions: string[] = [
    `👋 Hey, I'm ${displayName}! Just joined CodeNearby and excited to meet devs nearby.`,
    "🚀 Starting a new side project this week. Anyone up for pairing or quick code reviews?",
    "🤝 Looking to join a small weekend hack/build. Comment if you're interested!",
    `📍 I'm based in ${city ?? (isCityLoading ? "detecting your city..." : "<your city>")
    }. Who else is nearby and wants to connect?`,
  ];

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
      if (searchParams && searchParams.get("source")) {
        const params = new URLSearchParams(searchParams.toString());
        params.delete("source");
        const next = params.toString();
        router.replace(next ? `${pathname}?${next}` : pathname, {
          scroll: false,
        });
      }
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

  const handlePickSuggestion = (text: string) => {
    setContent(text);
    requestAnimationFrame(() => {
      textareaRef.current?.focus();
    });
  };

  return (
    <SwissCard variant="white" className="p-0 border-8">
      <div className="flex flex-col md:flex-row divide-y-8 md:divide-y-0 md:divide-x-8 divide-swiss-black">
        <div className="md:w-24 bg-swiss-muted flex items-center justify-center p-4">
          {session?.user?.image ? (
            <div className="relative w-16 h-16 border-4 border-swiss-black overflow-hidden bg-swiss-white">
              <Image
                src={session.user.image}
                alt={session.user.name || "User"}
                fill
                className="object-cover"
              />
            </div>
          ) : (
            <div className="w-16 h-16 border-4 border-swiss-black bg-swiss-black flex items-center justify-center text-swiss-white font-black text-2xl">
              {session?.user?.name?.charAt(0) || "U"}
            </div>
          )}
        </div>

        <div className="flex-1 flex flex-col">
          {isOnboarding && !content.trim() && (
            <div className="p-6 border-b-4 border-swiss-black">
              <p className="text-xs font-black uppercase tracking-widest mb-4">Prompt Ideas / Start here</p>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => handlePickSuggestion(s)}
                    className="text-left p-3 text-xs font-bold uppercase border-2 border-swiss-black hover:bg-swiss-black hover:text-swiss-white transition-colors"
                  >
                    {i === suggestions.length - 1 && isCityLoading && !city ? (
                      <Loader2 className="inline mr-2 h-3 w-3 animate-spin" />
                    ) : null}
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          <textarea
            placeholder="WHAT IS HAPPENING?!"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            ref={textareaRef}
            className="w-full min-h-[160px] p-6 text-2xl font-black uppercase tracking-tighter placeholder:text-swiss-muted bg-transparent focus:bg-swiss-muted transition-colors outline-none resize-none leading-none"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 px-6 mb-6">
            {poll && (
              <SwissCard variant="muted" className="border-4 p-4 relative h-full">
                <p className="text-xs font-black uppercase tracking-widest mb-3">Poll Active</p>
                <h4 className="text-sm font-black uppercase mb-4">{poll.question}</h4>
                <div className="space-y-2">
                  {poll.options.map((opt, i) => (
                    <div key={i} className="p-2 border-2 border-swiss-black bg-swiss-white text-[10px] font-bold uppercase">{opt}</div>
                  ))}
                </div>
                <button
                  className="absolute -top-2 -right-2 w-6 h-6 bg-swiss-red text-white flex items-center justify-center border-2 border-swiss-black hover:bg-swiss-black"
                  onClick={() => setPoll(null)}
                >
                  <X className="h-4 w-4" />
                </button>
              </SwissCard>
            )}

            {location && (
              <SwissCard variant="muted" className="border-4 p-4 relative h-full">
                <p className="text-xs font-black uppercase tracking-widest mb-3">Geo-Location</p>
                <div className="flex items-center gap-2">
                  <MapPin className="h-6 w-6 text-swiss-red" />
                  <p className="text-xs font-black">{location.lat.toFixed(4)}, {location.lng.toFixed(4)}</p>
                </div>
                <button
                  className="absolute -top-2 -right-2 w-6 h-6 bg-swiss-red text-white flex items-center justify-center border-2 border-swiss-black hover:bg-swiss-black"
                  onClick={() => setLocation(null)}
                >
                  <X className="h-4 w-4" />
                </button>
              </SwissCard>
            )}

            {schedule && (
              <SwissCard variant="muted" className="border-4 p-4 relative h-full">
                <p className="text-xs font-black uppercase tracking-widest mb-3">Temporal Tag</p>
                <div className="flex items-center gap-2">
                  <Calendar className="h-6 w-6 text-swiss-red" />
                  <p className="text-xs font-black uppercase">{schedule.toLocaleDateString()} {schedule.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
                <button
                  className="absolute -top-2 -right-2 w-6 h-6 bg-swiss-red text-white flex items-center justify-center border-2 border-swiss-black hover:bg-swiss-black"
                  onClick={() => setSchedule(null)}
                >
                  <X className="h-4 w-4" />
                </button>
              </SwissCard>
            )}

            {image && (
              <div className="relative border-4 border-swiss-black bg-swiss-black aspect-square max-w-[120px] overflow-hidden">
                <Image src={URL.createObjectURL(image)} alt="Upload preview" fill className="object-cover opacity-80" />
                <button
                  className="absolute top-1 right-1 w-6 h-6 bg-swiss-red text-white flex items-center justify-center border-2 border-swiss-black hover:bg-swiss-black"
                  onClick={() => setImage(null)}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>

          <div className="mt-auto border-t-8 border-swiss-black p-4 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex flex-wrap gap-2 justify-center md:justify-start">
              <button
                title="Add Image"
                onClick={() => document.getElementById("image-input")?.click()}
                className="w-12 h-12 flex items-center justify-center border-4 border-swiss-black hover:bg-swiss-black hover:text-swiss-white transition-colors"
              >
                <ImageIcon className="h-6 w-6" />
              </button>
              <input id="image-input" type="file" accept="image/*" className="hidden" onChange={(e) => setImage(e.target.files?.[0] || null)} />

              <CreatePoll onCreatePoll={handleCreatePoll} />
              <ShareLocation onShareLocation={handleShareLocation} />
              <ShareSchedule onShareSchedule={handleShareSchedule} />
              <EmojiPicker onChange={handleEmojiSelect} />
            </div>

            <SwissButton
              onClick={handleSubmit}
              disabled={(!content.trim() && !image && !poll && !location && !schedule) || isSubmitting}
              variant="primary"
              size="xl"
              className="w-full md:w-auto"
            >
              {isSubmitting ? (
                <><Loader2 className="mr-3 h-6 w-6 animate-spin" /> BROADCASTING...</>
              ) : (
                "SEND POST"
              )}
            </SwissButton>
          </div>
        </div>
      </div>
    </SwissCard>
  );
}
