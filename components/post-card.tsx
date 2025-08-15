/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { toast } from "sonner";

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
  isGithubEvent?: boolean; // Optional prop to indicate if this is a GitHub event
  column?: number;
}

export function PostCard({
  post,
  onVote,
  onAddComment,
  onVotePoll,
  onCommentVote,
  compactView = false,
  isGithubEvent = false,
  column,
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
      toast.error("Error", {
        description: "You must be logged in to vote",
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
      toast.error("Error", {
        description: "You must be logged in to comment",
      });
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

  const bottomMargin = column ? (column >= 3 ? "mb-4" : "mb-6") : "mb-6";

  return (
    <Card className={bottomMargin}>
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* user details */}
          {/* User Avatar and Name */}
          {!compactView ? (
            <>
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
                    <p className="font-medium">
                      {post.user?.name || "Anonymous"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1 min-w-0 flex items-center gap-1">
                      {post.user?.githubUsername && (
                        <>
                          <span className="truncate max-w-[160px]">
                            @{post.user.githubUsername}
                          </span>
                          <span className="shrink-0">•</span>
                        </>
                      )}
                      <span
                        className="shrink-0"
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
              {(() => {
                // Helper: escape regex special chars
                const escapeRegExp = (s: string) =>
                  s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
                // Helper: find GitHub repo links and corresponding owner/repo
                const ghRepoRegex =
                  /https?:\/\/(?:www\.)?github\.com\/([A-Za-z0-9-_.]+)\/([A-Za-z0-9-_.]+)(?:[\/#?].*)?/g;
                const content = post.content || "";
                const repoMap = new Map<string, string>(); // owner/repo -> url (first seen)
                let m: RegExpExecArray | null;
                while ((m = ghRepoRegex.exec(content))) {
                  const ownerRepo = `${m[1]}/${m[2]}`;
                  if (!repoMap.has(ownerRepo)) repoMap.set(ownerRepo, m[0]);
                }

                // Split into text and links
                const parts = content.split(/\b(https?:\/\/\S+)/g);
                // Replace owner/repo mentions in non-link text with "this repo"
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

                return (
                  <p className="break-words md:text-lg text-base">
                    {parts.map((part, idx) => {
                      if (part.match(/^https?:\/\//)) {
                        // If GitHub repo link, render icon
                        const match =
                          /https?:\/\/(?:www\.)?github\.com\/([A-Za-z0-9-_.]+)\/([A-Za-z0-9-_.]+)(?:[\/#?].*)?/.exec(
                            part
                          );
                        if (match) {
                          return (
                            <LinkPreview
                              key={`gh-${match[1]}-${match[2]}`}
                              url={part}
                              className="inline-flex items-center align-middle text-muted-foreground hover:text-foreground mx-1"
                            >
                              <svg
                                className="h-4 w-4"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                                aria-hidden="true"
                              >
                                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                              </svg>
                            </LinkPreview>
                          );
                        }
                        // Non-GitHub links use LinkPreview
                        return (
                          <LinkPreview
                            url={part}
                            className="font-medium"
                            key={`lnk-${part}-${idx}`}
                          >
                            {part}
                          </LinkPreview>
                        );
                      }
                      // Plain text with replacements
                      return (
                        <span key={`txt-${idx}`}>
                          {replaceOwnerRepoMentions(part)}
                        </span>
                      );
                    })}
                  </p>
                );
              })()}
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
            </>
          ) : (
            <div className="">
              <div className="flex gap-2 h-fit">
                <div className="flex-1 space-y-2 min-w-0">
                  <div className="flex items-start justify-between w-full gap-2 ">
                    <div className="flex items-center gap-2 ">
                      <Link
                        href={`/user/${post.user?.githubId ?? post.userId}`}
                      >
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
                        <Link
                          href={`/user/${post.user?.githubId ?? post.userId}`}
                        >
                          <p className="font-medium">
                            {post.user?.name || "Anonymous"}
                          </p>
                          <p className="text-[11px] leading-tight text-muted-foreground mt-1 min-w-0">
                            {post.user?.githubUsername && (
                              <span className="block truncate max-w-[120px]">
                                @{post.user.githubUsername}
                              </span>
                            )}
                            <span
                              className="block"
                              title={
                                post.createdAt
                                  ? format(new Date(post.createdAt), "PPpp")
                                  : "Unknown date"
                              }
                            >
                              {post.createdAt
                                ? formatDistanceToNow(
                                    new Date(post.createdAt),
                                    {
                                      addSuffix: true,
                                    }
                                  )
                                : "Unknown date"}
                            </span>
                          </p>
                        </Link>
                      </div>
                    </div>
                    {/* <Button asChild variant="ghost" className="w-fit h-full">
                      <Link
                        href={`/posts/${post._id}`}
                        className="w-fit h-full"
                      >
                        View Post
                      </Link>
                    </Button> */}
                  </div>

                  <p className="break-words md:text-base text-sm">
                    {(() => {
                      const escapeRegExp = (s: string) =>
                        s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
                      const ghRepoRegex =
                        /https?:\/\/(?:www\.)?github\.com\/([A-Za-z0-9-_.]+)\/([A-Za-z0-9-_.]+)(?:[\/#?].*)?/g;
                      const content = post.content || "";
                      const repoMap = new Map<string, string>();
                      let m: RegExpExecArray | null;
                      while ((m = ghRepoRegex.exec(content))) {
                        const ownerRepo = `${m[1]}/${m[2]}`;
                        if (!repoMap.has(ownerRepo))
                          repoMap.set(ownerRepo, m[0]);
                      }
                      const repoNames = Array.from(repoMap.keys());
                      const replaceOwnerRepoMentions = (text: string) => {
                        if (repoNames.length === 0) return text;
                        let out = text;
                        for (const name of repoNames) {
                          const re = new RegExp(
                            `\\b${escapeRegExp(name)}\\b`,
                            "g"
                          );
                          out = out.replace(re, "this repo");
                        }
                        return out;
                      };

                      // Split into parts
                      const parts = content.split(/\b(https?:\/\/\S+)/g);

                      // Truncate to ~150 chars while keeping links
                      let charCount = 0;
                      const limit = 147;
                      const truncatedParts: Array<string | { url: string }> =
                        [];
                      for (let i = 0; i < parts.length; i++) {
                        const part = parts[i];
                        const isLink = /^https?:\/\//.test(part);
                        if (!isLink) {
                          const replaced = replaceOwnerRepoMentions(part);
                          if (charCount + replaced.length > limit) {
                            const remaining = Math.max(0, limit - charCount);
                            if (remaining > 0)
                              truncatedParts.push(
                                replaced.substring(0, remaining) + "..."
                              );
                            break;
                          } else {
                            truncatedParts.push(replaced);
                            charCount += replaced.length;
                          }
                        } else {
                          // Count minimal length for repo link icons to avoid blowing the limit
                          const isGh =
                            /https?:\/\/(?:www\.)?github\.com\//.test(part);
                          const linkLen = isGh ? 2 : Math.min(20, part.length);
                          if (charCount + linkLen > limit) {
                            if (charCount < limit) truncatedParts.push("...");
                            break;
                          } else {
                            truncatedParts.push({ url: part });
                            charCount += linkLen;
                          }
                        }
                      }

                      // Render truncated parts
                      return truncatedParts.map((p, index) => {
                        if (typeof p === "string")
                          return <span key={`t-${index}`}>{p}</span>;
                        const url = p.url;
                        const match =
                          /https?:\/\/(?:www\.)?github\.com\/([A-Za-z0-9-_.]+)\/([A-Za-z0-9-_.]+)(?:[\/#?].*)?/.exec(
                            url
                          );
                        if (match) {
                          return (
                            <LinkPreview
                              key={`gh-${url}-${index}`}
                              url={url}
                              className="inline-flex items-center align-middle text-muted-foreground hover:text-foreground mx-1"
                            >
                              <svg
                                className="h-4 w-4"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                                aria-hidden="true"
                              >
                                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                              </svg>
                            </LinkPreview>
                          );
                        }
                        return (
                          <LinkPreview
                            url={url}
                            className="font-medium"
                            key={`lnk-${url}-${index}`}
                          >
                            {url.length > 14
                              ? url.substring(0, 14) + "..."
                              : url}
                          </LinkPreview>
                        );
                      });
                    })()}
                  </p>
                </div>
              </div>
              {post.imageUrl && (
                <div className="relative w-full aspect-[4/3] mt-2">
                  <Image
                    src={post.imageUrl || "/placeholder.svg"}
                    alt="Post image"
                    fill
                    className="rounded-lg object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    priority={false}
                  />
                </div>
              )}
            </div>
          )}

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

      {!isGithubEvent && (
        <CardFooter className="flex flex-col border-t">
          <div
            className={`${
              compactView
                ? "flex items-center justify-between w-full py-1 gap-2 flex-wrap"
                : "flex items-center justify-between w-full py-2"
            }`}
          >
            <div
              className={`flex items-center ${compactView ? "gap-1" : "gap-1"}`}
            >
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => handleVote("up")}
                className={`${
                  compactView ? "p-1" : "p-2"
                } rounded-full hover:bg-primary/10 ${
                  !canVote && "opacity-50 cursor-not-allowed"
                }`}
                disabled={!canVote || isVoting}
              >
                <ArrowUp className={`${compactView ? "h-3 w-3" : "h-4 w-4"}`} />
              </motion.button>
              <span
                className={`${compactView ? "text-xs" : "text-sm"} font-medium`}
              >
                {(post.votes?.up ?? 0) - (post.votes?.down ?? 0)}
              </span>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => handleVote("down")}
                className={`${
                  compactView ? "p-1" : "p-2"
                } rounded-full hover:bg-primary/10 ${
                  !canVote && "opacity-50 cursor-not-allowed"
                }`}
                disabled={!canVote || isVoting}
              >
                <ArrowDown
                  className={`${compactView ? "h-3 w-3" : "h-4 w-4"}`}
                />
              </motion.button>
            </div>

            <div
              className={`flex items-center ${compactView ? "gap-1" : "gap-2"}`}
            >
              {compactView ? (
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowComments(!showComments)}
                  >
                    <MessageSquare className="h-3.5 w-3.5" />
                  </Button>
                  <span className="text-[10px] leading-none">
                    {post.comments?.length ?? 0}
                  </span>
                </div>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowComments(!showComments)}
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  {post.comments?.length ?? 0} Comments
                </Button>
              )}

              {/* Hide SharePost in compact to save space */}
              {!compactView && <SharePost post={post} />}

              <DropdownMenu
                open={isShareMenuOpen}
                onOpenChange={setIsShareMenuOpen}
              >
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size={compactView ? "icon" : "icon"}
                    className={compactView ? "h-7 w-7" : undefined}
                    onClick={sharePost}
                  >
                    <Share2
                      className={compactView ? "h-3.5 w-3.5" : "h-4 w-4"}
                    />
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
                  <DropdownMenuItem onClick={sharePost}>
                    More...
                  </DropdownMenuItem>
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
      )}
    </Card>
  );
}
