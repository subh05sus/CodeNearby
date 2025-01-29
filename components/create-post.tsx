/* eslint-disable jsx-a11y/alt-text */
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useSession } from "next-auth/react"
import { Image, Smile, Calendar, MapPin, BarChart2, FileImageIcon as FileGif } from "lucide-react"
import { cn } from "@/lib/utils"

interface CreatePostProps {
  onSubmit: (content: string, image: File | null) => Promise<void>
}

export function CreatePost({ onSubmit }: CreatePostProps) {
  const { data: session } = useSession()
  const [content, setContent] = useState("")
  const [image, setImage] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!content.trim()) return
    setIsSubmitting(true)
    try {
      await onSubmit(content, image)
      setContent("")
      setImage(null)
    } finally {
      setIsSubmitting(false)
    }
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
              <Button variant="ghost" size="icon" className="text-primary hover:bg-primary/10 rounded-full">
                <BarChart2 className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-primary hover:bg-primary/10 rounded-full">
                <Smile className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-primary hover:bg-primary/10 rounded-full">
                <Calendar className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-primary hover:bg-primary/10 rounded-full">
                <MapPin className="w-5 h-5" />
              </Button>
            </div>
            <Button
              onClick={handleSubmit}
              disabled={!content.trim() || isSubmitting}
              className={cn("rounded-full px-6", !content.trim() && "opacity-50")}
            >
              Post
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

