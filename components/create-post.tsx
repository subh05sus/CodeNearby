/* eslint-disable jsx-a11y/alt-text */
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useSession } from "next-auth/react"
import { Image, Smile, FileImageIcon as FileGif } from "lucide-react"
import { cn } from "@/lib/utils"
import { CreatePoll } from "./create-poll"
import { ShareLocation } from "./share-location"
import { ShareSchedule } from "./share-schedule"

interface CreatePostProps {
  onSubmit: (
    content: string,
    image: File | null,
    poll?: { question: string; options: string[] },
    location?: { lat: number; lng: number },
    schedule?: Date,
  ) => Promise<void>
}

export function CreatePost({ onSubmit }: CreatePostProps) {
  const { data: session } = useSession()
  const [content, setContent] = useState("")
  const [image, setImage] = useState<File | null>(null)
  const [poll, setPoll] = useState<{ question: string; options: string[] } | null>(null)
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [schedule, setSchedule] = useState<Date | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!content.trim() && !image && !poll && !location && !schedule) return
    setIsSubmitting(true)
    try {
      await onSubmit(content, image, poll || undefined, location || undefined, schedule || undefined)
      setContent("")
      setImage(null)
      setPoll(null)
      setLocation(null)
      setSchedule(null)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCreatePoll = (question: string, options: string[]) => {
    setPoll({ question, options })
  }

  const handleShareLocation = (lat: number, lng: number) => {
    setLocation({ lat, lng })
  }

  const handleShareSchedule = (date: Date) => {
    setSchedule(date)
  }

  return (
    <div className="bg-background border rounded-lg p-4">
      <div className="flex gap-4">
        <Avatar className="w-10 h-10">
          <AvatarImage src={session?.user?.image || ""} />
          <AvatarFallback>{session?.user?.name?.charAt(0) || "U"}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <Textarea
            placeholder="What is happening?!"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[100px] border-none focus-visible:ring-0 text-lg resize-none"
          />
          <div className="flex items-center justify-between mt-4 border-t pt-4">
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="text-primary hover:bg-primary/10 rounded-full"
                onClick={() => document.getElementById("image-input")?.click()}
              >
                <Image className="w-5 h-5" />
              </Button>
              <input
                id="image-input"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => setImage(e.target.files?.[0] || null)}
              />
              <Button variant="ghost" size="icon" className="text-primary hover:bg-primary/10 rounded-full">
                <FileGif className="w-5 h-5" />
              </Button>
              <CreatePoll onCreatePoll={handleCreatePoll} />
              <ShareLocation onShareLocation={handleShareLocation} />
              <ShareSchedule onShareSchedule={handleShareSchedule} />
              <Button variant="ghost" size="icon" className="text-primary hover:bg-primary/10 rounded-full">
                <Smile className="w-5 h-5" />
              </Button>
            </div>
            <Button
              onClick={handleSubmit}
              disabled={(!content.trim() && !image && !poll && !location && !schedule) || isSubmitting}
              className={cn(
                "rounded-full px-6",
                !content.trim() && !image && !poll && !location && !schedule && "opacity-50",
              )}
            >
              Post
            </Button>
          </div>
          {poll && (
            <div className="mt-2 p-2 bg-muted rounded-md">
              <p className="font-semibold">{poll.question}</p>
              <ul className="list-disc list-inside">
                {poll.options.map((option, index) => (
                  <li key={index}>{option}</li>
                ))}
              </ul>
            </div>
          )}
          {location && (
            <div className="mt-2 p-2 bg-muted rounded-md">
              <p>
                Location: Lat {location.lat.toFixed(6)}, Lng {location.lng.toFixed(6)}
              </p>
            </div>
          )}
          {schedule && (
            <div className="mt-2 p-2 bg-muted rounded-md">
              <p>Schedule: {schedule.toLocaleString()}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

