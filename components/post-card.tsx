"use client";

import { useEffect, useState } from "react";
import {
  MessageSquare,
  Calendar,
  Share2,
  ArrowUp,
  ArrowDown,
  Clock,
  ExternalLink,
} from "lucide-react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import { CommentThread } from "./comment-thread";
import { LocationPreview } from "./location-preview";
import { PollDisplay } from "./poll-display";
import type { Session } from "next-auth";
import { format, formatDistanceToNow } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { LinkPreview } from "./ui/link-preview";
import { toast } from "sonner";
import SwissButton from "./swiss/SwissButton";
import SwissCard from "./swiss/SwissCard";

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
  compactView?: boolean;
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
  isGithubEvent?: boolean;
  column?: number;
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

  const userVoteCount = (post.userVotes ?? {})[session?.user?.id || ""] || 0;
  const [canVote, setCanVote] = useState(!!session && userVoteCount < 10);

  useEffect(() => {
    setCanVote(!!session && userVoteCount < 10);
  }, [session, userVoteCount]);

  const handleVote = async (voteType: "up" | "down") => {
    if (!session) {
      toast.error("Error", { description: "You must be logged in to vote" });
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
      toast.error("Error", { description: "You must be logged in to comment" });
      return;
    }
    if (!commentContent.trim()) return;
    try {
      await onAddComment(post._id, commentContent, parentCommentId);
      setCommentContent("");
      setShowComments(true);
    } catch {
      toast.error("Error", { description: "Failed to add comment" });
    }
  };

  const addToCalendar = () => {
    if (!post.schedule) return;
    const date = new Date(post.schedule);
    const encodedText = encodeURIComponent(post.content);
    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodedText}&dates=${date.toISOString().replace(/[-:]/g, "").split(".")[0]
      }Z/${date.toISOString().replace(/[-:]/g, "").split(".")[0]}Z`;
    window.open(googleCalendarUrl, "_blank");
  };


  const shareOnTwitter = () => {
    const text = encodeURIComponent(post.content);
    const url = encodeURIComponent(`${window.location.origin}/posts/${post._id}`);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, "_blank");
  };

  const shareOnWhatsApp = () => {
    const text = encodeURIComponent(post.content);
    const url = encodeURIComponent(`${window.location.origin}/posts/${post._id}`);
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

  const score = (post.votes?.up ?? 0) - (post.votes?.down ?? 0);

  return (
    <SwissCard variant="white" className="p-0 border-4 mb-8 overflow-hidden">
      {/* Header / User Info */}
      <div className="border-b-4 border-swiss-black bg-swiss-muted p-4 flex items-center justify-between">
        <Link href={`/user/${post.user?.githubId ?? post.userId}`} className="flex items-center gap-3">
          <div className="relative h-10 w-10 border-2 border-swiss-black bg-swiss-white overflow-hidden">
            {post.user?.image ? (
              <Image src={post.user.image} alt={post.user?.name || "User"} fill className="object-cover" />
            ) : (
              <div className="h-full w-full flex items-center justify-center bg-swiss-black text-swiss-white font-black uppercase tracking-tighter text-sm">
                {(post.user?.name || "U").charAt(0)}
              </div>
            )}
          </div>
          <div>
            <p className="font-black uppercase tracking-tighter leading-none text-sm">
              {post.user?.name || "Anonymous"}
            </p>
            {post.user?.githubUsername && (
              <p className="text-[10px] font-bold uppercase  text-swiss-red mt-1">
                @{post.user.githubUsername}
              </p>
            )}
          </div>
        </Link>
        <div className="text-[10px] font-bold uppercase  opacity-60 flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {post.createdAt ? formatDistanceToNow(new Date(post.createdAt), { addSuffix: true }) : "Unknown"}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="mb-6">
          {(() => {
            const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            const ghRepoRegex = /https?:\/\/(?:www\.)?github\.com\/([A-Za-z0-9-_.]+)\/([A-Za-z0-9-_.]+)(?:[\/#?].*)?/g;
            const content = post.content || "";
            const repoMap = new Map<string, string>();
            let m: RegExpExecArray | null;
            while ((m = ghRepoRegex.exec(content))) {
              const ownerRepo = `${m[1]}/${m[2]}`;
              if (!repoMap.has(ownerRepo)) repoMap.set(ownerRepo, m[0]);
            }

            const parts = content.split(/\b(https?:\/\/\S+)/g);
            const repoNames = Array.from(repoMap.keys());
            const replaceOwnerRepoMentions = (text: string) => {
              if (repoNames.length === 0) return text;
              let out = text;
              for (const name of repoNames) {
                const re = new RegExp(`\\b${escapeRegExp(name)}\\b`, "g");
                out = out.replace(re, "this repo");
              }
              return out;
            };

            const contentElement = (
              <div className="font-bold uppercase tracking-tight text-lg leading-[1.1] mb-4">
                {parts.map((part, idx) => {
                  if (part.match(/^https?:\/\//)) {
                    return <LinkPreview url={part} className="text-swiss-red underline decoration-4 underline-offset-4" key={idx}>{part}</LinkPreview>;
                  }
                  return <span key={idx}>{replaceOwnerRepoMentions(part)}</span>;
                })}
              </div>
            );

            return contentElement;
          })()}
        </div>

        {/* Media elements */}
        {post.imageUrl && (
          <div className="mb-6 border-4 border-swiss-black bg-swiss-black aspect-video relative overflow-hidden">
            <Image src={post.imageUrl} alt="Post media" fill className="object-cover opacity-90 transition-opacity hover:opacity-100 cursor-pointer" onClick={() => setImageExpanded(!imageExpanded)} />
          </div>
        )}

        {post.poll && (
          <div className="mb-6 border-l-8 border-swiss-black pl-6">
            <PollDisplay poll={post.poll} postId={post._id} onVote={onVotePoll!} />
          </div>
        )}

        {post.location && (
          <div className="mb-6">
            <LocationPreview lat={post.location.lat} lng={post.location.lng} />
          </div>
        )}

        {post.schedule && (
          <SwissCard variant="muted" className="mb-6 border-4 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Calendar className="h-8 w-8 text-swiss-red" />
              <div>
                <p className="text-sm font-black uppercase tracking-tighter">{format(new Date(post.schedule), "PPPP")}</p>
                <p className="text-xs font-bold uppercase  opacity-60">{format(new Date(post.schedule), "p")}</p>
              </div>
            </div>
            <SwissButton variant="secondary" size="sm" onClick={addToCalendar}>ADD</SwissButton>
          </SwissCard>
        )}
      </div>

      {/* Footer / Controls */}
      <div className="border-t-4 border-swiss-black grid grid-cols-12 divide-x-4 divide-swiss-black">
        {/* Voting Block */}
        <div className="col-span-4 flex items-center divide-x-4 divide-swiss-black">
          <button
            onClick={() => handleVote("up")}
            disabled={!canVote || isVoting}
            className={cn(
              "flex-1 aspect-square flex items-center justify-center transition-colors hover:bg-swiss-black hover:text-swiss-white",
              !canVote && "opacity-20 grayscale"
            )}
          >
            <ArrowUp className="h-6 w-6" />
          </button>
          <div className="flex-1 aspect-square flex flex-col items-center justify-center bg-swiss-white">
            <span className="text-2xl font-black tracking-tighter">{score}</span>
            <span className="text-[8px] font-black uppercase  opacity-40 -mt-1">Rank</span>
          </div>
          <button
            onClick={() => handleVote("down")}
            disabled={!canVote || isVoting}
            className={cn(
              "flex-1 aspect-square flex items-center justify-center transition-colors hover:bg-swiss-black hover:text-swiss-white",
              !canVote && "opacity-20 grayscale"
            )}
          >
            <ArrowDown className="h-6 w-6" />
          </button>
        </div>

        {/* Action Block */}
        <div className="col-span-8 flex items-center divide-x-4 divide-swiss-black">
          <button
            onClick={() => setShowComments(!showComments)}
            className="flex-1 flex flex-col items-center justify-center hover:bg-swiss-red hover:text-swiss-white transition-colors py-2"
          >
            <MessageSquare className="h-6 w-6 mb-1" />
            <span className="text-[10px] font-black uppercase ">{post.comments?.length || 0} Comments</span>
          </button>

          <DropdownMenu open={isShareMenuOpen} onOpenChange={setIsShareMenuOpen}>
            <DropdownMenuTrigger asChild>
              <button
                onClick={sharePost}
                className="w-16 flex items-center justify-center aspect-square hover:bg-swiss-black hover:text-swiss-white transition-colors"
              >
                <Share2 className="h-6 w-6" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-none border-4 border-swiss-black p-2 font-black uppercase  text-[10px]">
              <DropdownMenuItem onClick={shareOnWhatsApp} className="focus:bg-swiss-black focus:text-swiss-white">WhatsApp</DropdownMenuItem>
              <DropdownMenuItem onClick={shareOnTwitter} className="focus:bg-swiss-black focus:text-swiss-white">Twitter</DropdownMenuItem>
              <DropdownMenuItem onClick={sharePost} className="focus:bg-swiss-black focus:text-swiss-white">System Share</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Link href={`/posts/${post._id}`} className="w-16 flex items-center justify-center aspect-square hover:bg-swiss-black hover:text-swiss-white transition-colors">
            <ExternalLink className="h-6 w-6" />
          </Link>
        </div>
      </div>

      {/* Comments Drawer */}
      {showComments && (
        <div className="border-t-4 border-swiss-black bg-swiss-muted p-6">
          <div className="flex gap-4 mb-8">
            <input
              placeholder="ADD COMMENT..."
              value={commentContent}
              onChange={(e) => setCommentContent(e.target.value)}
              className="flex-1 bg-swiss-white border-4 border-swiss-black p-4 font-bold uppercase tracking-tight focus:bg-swiss-black focus:text-swiss-white transition-colors outline-none"
            />
            <SwissButton onClick={() => handleAddComment()} variant="primary">SEND</SwissButton>
          </div>
          <div className="space-y-6">
            {post.comments?.map((comment) => (
              <CommentThread
                key={comment._id}
                comment={comment}
                postId={post._id}
                onVote={(commentId, voteType) => onCommentVote(post._id, commentId, voteType)}
                onReply={onAddComment}
              />
            ))}
          </div>
        </div>
      )}
    </SwissCard>
  );
}
