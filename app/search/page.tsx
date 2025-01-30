/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { Suspense,useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, UserPlus } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { PostCard } from "@/components/post-card";
import { MasonryGrid } from "@/components/masonry-grid";
import { useInView } from "react-intersection-observer";

export default function SearchPage() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const [loading, setLoading] = useState(false);
  const [developers, setDevelopers] = useState([]);
  const [posts, setPosts] = useState<Array<any>>([]);
  const [page, setPage] = useState(1);
  const { toast } = useToast();
  const { ref, inView } = useInView();

  useEffect(() => {
    if (query) {
      searchDevelopers();
      searchPosts();
    }
  }, [query]);

  useEffect(() => {
    if (inView) {
      loadMorePosts();
    }
  }, [inView]);

  const searchDevelopers = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/search?q=${encodeURIComponent(query)}`
      );
      const data = await response.json();
      setDevelopers(data.slice(0, 10));
    } catch {
      toast({
        title: "Error",
        description: "Failed to search developers. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const searchPosts = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/posts/search?q=${encodeURIComponent(query)}&page=1`
      );
      const data = await response.json();
      setPosts(Array.isArray(data) ? data : []);
      setPage(2);
    } catch {
      toast({
        title: "Error",
        description: "Failed to search posts. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadMorePosts = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const response = await fetch(
        `/api/posts/search?q=${encodeURIComponent(query)}&page=${page}`
      );
      const newPosts = await response.json();
      setPosts((prevPosts) => [
        ...prevPosts,
        ...(Array.isArray(newPosts) ? newPosts : []),
      ]);
      setPage((prevPage) => prevPage + 1);
    } catch {
      toast({
        title: "Error",
        description: "Failed to load more posts",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const sendFriendRequest = async (developer: any) => {
    try {
      const response = await fetch("/api/friends/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(developer),
      });

      if (!response.ok) throw new Error("Failed to send friend request");

      toast({
        title: "Success",
        description: "Friend request sent!",
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to send friend request.",
        variant: "destructive",
      });
    }
  };

  const handleVote = async (postId: string, voteType: "up" | "down") => {
    if (!session) {
      toast({
        title: "Error",
        description: "You must be logged in to vote",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch(`/api/posts/${postId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ voteType }),
      });

      if (!response.ok) {
        throw new Error("Failed to vote");
      }

      const updatedPost = await response.json();
      setPosts((prevPosts) =>
        prevPosts.map((post) => {
          if (post._id === postId) {
            return {
              ...post,
              votes: updatedPost.votes,
              userVotes: updatedPost.userVotes,
            };
          }
          return post;
        })
      );
    } catch {
      toast({
        title: "Error",
        description: "Failed to vote",
        variant: "destructive",
      });
    }
  };

  const handleAddComment = async (
    postId: string,
    content: string,
    parentCommentId?: string
  ) => {
    if (!session) {
      toast({
        title: "Error",
        description: "You must be logged in to comment",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, parentCommentId }),
      });

      if (!response.ok) {
        throw new Error("Failed to add comment");
      }

      const updatedPost = await response.json();
      setPosts((prevPosts) =>
        prevPosts.map((post) => {
          if (post._id === postId) {
            return updatedPost;
          }
          return post;
        })
      );

      toast({
        title: "Success",
        description: "Comment added successfully",
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to add comment",
        variant: "destructive",
      });
    }
  };
  const handleVotePoll = async (postId: string, optionIndex: number) => {
    if (!session) {
      toast({
        title: "Error",
        description: "You must be logged in to vote",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch(`/api/posts/${postId}/poll-vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ optionIndex }),
      });

      if (!response.ok) {
        throw new Error("Failed to vote on poll");
      }

      const updatedPost = await response.json();
      setPosts((prevPosts) =>
        prevPosts.map((post) => {
          if (post._id === postId) {
            return { ...post, poll: updatedPost.poll };
          }
          return post;
        })
      );
    } catch {
      toast({
        title: "Error",
        description: "Failed to vote on poll",
        variant: "destructive",
      });
    }
  };
  return (
    <Suspense fallback={<div>Loading...</div>}>
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">
        Search Results for &quot;{query}&quot;
      </h1>

      <div className="space-y-8">
        <section>
          <h2 className="text-2xl font-semibold mb-4">GitHub Profiles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {developers.map((dev: any) => (
              <Card key={dev.id}>
                <CardHeader>
                  <CardTitle>{dev.login}</CardTitle>
                </CardHeader>
                <CardContent>
                  <Image
                    src={dev.avatar_url || "/placeholder.svg"}
                    alt={dev.login}
                    width={80}
                    height={80}
                    className="rounded-full mb-2"
                  />
                  <p className="text-sm text-muted-foreground mb-2">
                    Name: {dev.name || "N/A"}
                  </p>
                  <p className="text-sm text-muted-foreground mb-2">
                    Location: {dev.location || "N/A"}
                  </p>
                  <p className="text-sm text-muted-foreground mb-2">
                    Public Repos: {dev.public_repos || "N/A"}
                  </p>
                  <div className="flex space-x-2 mt-4">
                    <Link
                      href={dev.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button variant="outline" size="sm">
                        View Profile
                      </Button>
                    </Link>
                    {session && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => sendFriendRequest(dev)}
                      >
                        <UserPlus className="h-4 w-4 mr-2" />
                        Add Friend
                      </Button>
                    )}
                  </div>
                  {!dev.isOnCodeNearby && (
                    <p className="text-sm text-muted-foreground mt-2">
                      Not on CodeNearby
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Posts</h2>
          <MasonryGrid>
            {posts.map((post) => (
              <PostCard
                key={post._id}
                post={post}
                onVote={handleVote}
                onAddComment={handleAddComment}
                onVotePoll={handleVotePoll}
              />
            ))}
          </MasonryGrid>
          {loading && (
            <div className="flex justify-center my-4">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          )}
          <div ref={ref} className="h-10" />
        </section>
      </div>
    </div>
    </Suspense>
  );
}
