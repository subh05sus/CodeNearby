/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import {
  MessageSquare,
  Calendar,
  Share2,
  Twitter,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { CommentThread } from "./comment-thread";
import { LocationPreview } from "./location-preview";
import { PollDisplay } from "./poll-display";
import type { Session } from "next-auth";
import { format, formatDistanceToNow } from "date-fns";
import { EmojiPicker } from "./emoji-picker";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import WhatsappIcon from "./whatsapp-icon";
import Link from "next/link";
import { LinkPreview } from "./ui/link-preview";
import { SharePost } from "./share-post";

interface Comment {
  _id: string;
  userId: string;
  content: string;
  createdAt: string;
  votes: { up: number; down: number };
  userVotes: Record<string, number>;
  replies: Comment[];
  user?: {
    name: string;
    image: string;
  };
}

interface Post {
  user: any;
  _id: string;
  userId: string;
  content: string;
  imageUrl?: string;
  createdAt: string;
  votes: { up: number; down: number };
  userVotes: Record<string, number>;
  comments: Comment[];
  poll?: Poll;
  location?: { lat: number; lng: number };
  schedule?: string;
}

interface Poll {
  question: string;
  options: string[];
  votes: Record<string, number>;
}

interface PostCardProps {
  post: Post;
  onVote: (postId: string, voteType: "up" | "down") => Promise<void>;
  onAddComment: (
    postId: string,
    content: string,
    parentCommentId?: string
  ) => Promise<void>;
  onVotePoll?: (postId: string, optionIndex: number) => Promise<void>;
  onCommentVote: (
    postId: string,
    commentId: string,
    voteType: "up" | "down"
  ) => Promise<void>;
}

export function PostCard({
  post,
  onVote,
  onAddComment,
  onVotePoll,
  onCommentVote,
}: PostCardProps) {
  const { data: session } = useSession() as { data: Session | null };
  const [commentContent, setCommentContent] = useState("");
  const [showComments, setShowComments] = useState(false);
  const [isVoting, setIsVoting] = useState(false);
  const [imageExpanded, setImageExpanded] = useState(false);
  const { toast } = useToast();

  const userVoteCount = (post.userVotes ?? {})[session?.user?.id || ""] || 0;
  const [canVote, setCanVote] = useState(!!session && userVoteCount < 10);

  useEffect(() => {
    setCanVote(!!session && userVoteCount < 10);
  }, [session, userVoteCount]);

  const handleVote = async (voteType: "up" | "down") => {
    if (!session) {
      toast({
        title: "Error",
        description: "You must be logged in to vote",
        variant: "destructive",
      });
      return;
    }

    if (!canVote || isVoting) return;

    setIsVoting(true);
    try {
      const updatedPost: any = await onVote(post._id, voteType);
      post.votes = updatedPost?.votes || post.votes;
      post.userVotes = updatedPost?.userVotes || post.userVotes;
    } finally {
      setIsVoting(false);
    }
  };

  const handleAddComment = async (parentCommentId?: string) => {
    if (!session) {
      toast({
        title: "Error",
        description: "You must be logged in to comment",
        variant: "destructive",
      });
      return;
    }

    if (!commentContent.trim()) return;

    try {
      await onAddComment(post._id, commentContent, parentCommentId);
      setCommentContent("");
      setShowComments(true);
    } catch {
      toast({
        title: "Error",
        description: "Failed to add comment",
        variant: "destructive",
      });
    }
  };

  const addToCalendar = () => {
    if (!post.schedule) return;
    const date = new Date(post.schedule);
    const encodedText = encodeURIComponent(post.content);
    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodedText}&dates=${
      date.toISOString().replace(/[-:]/g, "").split(".")[0]
    }Z/${date.toISOString().replace(/[-:]/g, "").split(".")[0]}Z`;
    window.open(googleCalendarUrl, "_blank");
  };

  const handleEmojiSelect = (emoji: string) => {
    setCommentContent((prev) => prev + emoji);
  };

  const shareOnTwitter = () => {
    const text = encodeURIComponent(post.content);
    const url = encodeURIComponent(
      `${window.location.origin}/posts/${post._id}`
    );
    window.open(
      `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
      "_blank"
    );
  };

  const shareOnWhatsApp = () => {
    const text = encodeURIComponent(post.content);
    const url = encodeURIComponent(
      `${window.location.origin}/posts/${post._id}`
    );
    window.open(`https://wa.me/?text=${text}%20${url}`, "_blank");
  };

  const [isShareMenuOpen, setIsShareMenuOpen] = useState(false);

  const sharePost = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Check out this post",
          text: post.content,
          url: `${window.location.origin}/posts/${post._id}`,
        });
      } catch (error) {
        console.log("Error sharing:", error);
      }
    } else {
      setIsShareMenuOpen(true);
    }
  };

  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* user details */}
          {/* User Avatar and Name */}
          <div className="flex items-center gap-2">
            <Link href={`/user/${post.user?.githubId ?? post.userId}`}>
              <div className="relative h-10 w-10">
                {post.user?.image ? (
                  <Image
                    src={post.user.image}
                    alt={post.user?.name || "User"}
                    fill
                    className="rounded-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full bg-muted  rounded-full" />
                )}
              </div>
            </Link>
            <div>
              <Link href={`/user/${post.user?.githubId ?? post.userId}`}>
                <p className="font-medium">{post.user?.name || "Anonymous"}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {post.user?.githubUsername && (
                    <>
                      <span>@{post.user.githubUsername}</span>
                      <span>{" | "}</span>
                    </>
                  )}
                  <span
                    title={
                      post.createdAt
                        ? format(new Date(post.createdAt), "PPpp")
                        : "Unknown date"
                    }
                  >
                    {post.createdAt
                      ? formatDistanceToNow(new Date(post.createdAt), {
                          addSuffix: true,
                        })
                      : "Unknown date"}
                  </span>
                </p>
              </Link>
            </div>
          </div>

          {/* Post Content */}
          <p className="break-words md:text-lg text-base">
            {(post.content || "").split(/\b(https?:\/\/\S+)/g).map((part) =>
              part.match(/^https?:\/\//) ? (
                <LinkPreview url={part} className="font-medium" key={part}>
                  {part}
                </LinkPreview>
              ) : (
                part
              )
            )}
          </p>

          {/* Image */}
          {post.imageUrl && (
            <motion.div
              className="relative w-full h-auto aspect-[4/3]"
              onClick={() => setImageExpanded(!imageExpanded)}
              layout
            >
              <motion.div className="relative w-full h-full" layout>
                <Image
                  src={post.imageUrl || "/placeholder.svg"}
                  alt="Post image"
                  fill
                  className={`rounded-lg cursor-pointer transition-all duration-300 ${
                    imageExpanded ? "object-contain" : "object-cover"
                  }`}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  priority={false}
                />
              </motion.div>
            </motion.div>
          )}

          {/* Poll */}
          {post.poll && (
            <PollDisplay
              poll={post.poll}
              postId={post._id}
              onVote={onVotePoll!}
            />
          )}

          {/* Location */}
          {post.location && (
            <LocationPreview lat={post.location.lat} lng={post.location.lng} />
          )}

          {/* Schedule */}
          {post.schedule && (
            <div className="mt-4 flex items-center justify-between bg-muted rounded-lg p-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                <div>
                  <p className="font-medium text-base">
                    {format(new Date(post.schedule), "PPPP")}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(post.schedule), "p")}
                  </p>
                </div>
              </div>
              <Button
                onClick={addToCalendar}
                size="sm"
                className="rounded-full"
              >
                Add to Calendar
              </Button>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="flex flex-col border-t">
        <div className="flex items-center justify-between w-full py-2">
          <div className="flex items-center gap-1">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => handleVote("up")}
              className={`p-2 rounded-full hover:bg-primary/10 ${
                !canVote && "opacity-50 cursor-not-allowed"
              }`}
              disabled={!canVote || isVoting}
            >
              <ArrowUp className="h-4 w-4" />
            </motion.button>
            <span className="text-sm font-medium">
              {(post.votes?.up ?? 0) - (post.votes?.down ?? 0)}
            </span>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => handleVote("down")}
              className={`p-2 rounded-full hover:bg-primary/10 ${
                !canVote && "opacity-50 cursor-not-allowed"
              }`}
              disabled={!canVote || isVoting}
            >
              <ArrowDown className="h-4 w-4" />
            </motion.button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowComments(!showComments)}
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              {post.comments?.length ?? 0} Comments
            </Button>
            <SharePost post={post} />
            <DropdownMenu
              open={isShareMenuOpen}
              onOpenChange={setIsShareMenuOpen}
            >
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" onClick={sharePost}>
                  <Share2 className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={shareOnWhatsApp}>
                  <div className="h-4 w-4 mr-2">
                    <WhatsappIcon />
                  </div>{" "}
                  WhatsApp
                </DropdownMenuItem>
                <DropdownMenuItem onClick={shareOnTwitter}>
                  <Twitter className="h-4 w-4 mr-2" /> Twitter
                </DropdownMenuItem>
                <DropdownMenuItem onClick={sharePost}>More...</DropdownMenuItem>
                {/* Add more share options here */}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {showComments && (
          <div className="w-full mt-4 space-y-4">
            <div className="flex gap-2">
              <div className="flex-1 flex gap-2">
                <Input
                  placeholder="Write a comment..."
                  value={commentContent}
                  onChange={(e) => setCommentContent(e.target.value)}
                />
                <EmojiPicker onChange={handleEmojiSelect} />
              </div>
              <Button onClick={() => handleAddComment()}>Comment</Button>
            </div>
            <div className="space-y-4">
              {post.comments?.map((comment) => (
                <CommentThread
                  key={comment._id}
                  comment={comment}
                  postId={post._id}
                  onVote={(commentId, voteType) =>
                    onCommentVote(post._id, commentId, voteType)
                  }
                  onReply={onAddComment}
                />
              ))}
            </div>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
