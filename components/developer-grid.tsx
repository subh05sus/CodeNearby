/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useId, useRef, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { useOutsideClick } from "@/hooks/use-outside-click";
import type { Developer } from "@/types";
import { GithubIcon, X } from "lucide-react";
import { Calendar, LinkIcon, MapPin, Twitter } from "lucide-react";

interface DeveloperDetails {
  name: string;
  bio: string;
  followers: number;
  following: number;
  public_repos: number;
  location: string;
  blog: string;
  twitter_username: string;
  created_at: string;
}

export default function DeveloperGrid({
  developers,
  handleAddFriend,
  session,
}: {
  developers: Developer[];
  handleAddFriend: (developer: Developer) => void;
  session: any;
}) {
  const [active, setActive] = useState<Developer | null>(null);
  const [details, setDetails] = useState<DeveloperDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const id = useId();

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setActive(null);
        setDetails(null);
      }
    }

    if (active) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [active]);

  useOutsideClick(ref, () => {
    setActive(null);
    setDetails(null);
  });

  const fetchDeveloperDetails = async (username: string) => {
    setLoading(true);
    try {
      const response = await fetch(`https://api.github.com/users/${username}`);
      const data = await response.json();
      setDetails({
        name: data.name,
        bio: data.bio,
        followers: data.followers,
        following: data.following,
        public_repos: data.public_repos,
        location: data.location,
        blog: data.blog,
        twitter_username: data.twitter_username,
        created_at: data.created_at,
      });
    } catch (error) {
      console.error("Error fetching developer details:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <AnimatePresence>
        {active && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 z-50"
            />
            <div className="fixed inset-0 grid place-items-center z-[100]">
              <motion.button
                key={`button-${active.login}-${id}`}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{
                  opacity: 0,
                  transition: { duration: 0.05 },
                }}
                className="flex absolute z-50 top-2 right-2 lg:hidden items-center justify-center bg-white rounded-full h-6 w-6"
                onClick={() => {
                  setActive(null);
                  setDetails(null);
                }}
              >
                <X color="#000" size={12} />
              </motion.button>
              <motion.div
                layoutId={`card-${active.login}-${id}`}
                ref={ref}
                className="w-full max-w-[500px] h-full md:h-fit md:max-h-[90%] flex flex-col bg-white dark:bg-neutral-900 sm:rounded-3xl overflow-hidden"
              >
                <motion.div
                  layoutId={`image-container-${active.login}-${id}`}
                  className="relative"
                >
                  <motion.div
                    layoutId={`image-${active.login}-${id}`}
                    className="w-full h-60 relative"
                  >
                    <Image
                      src={active.avatar_url || "/placeholder.svg"}
                      alt={active.login}
                      fill
                      className="object-cover"
                      priority
                    />
                  </motion.div>
                </motion.div>

                <div className="p-6">
                  <motion.div layoutId={`content-${active.login}-${id}`}>
                    <motion.div className="flex items-center gap-2 flex-col md:flex-row md:justify-between mb-4">
                      <motion.div className="flex flex-col md:flex-1 md:w-auto w-full ">
                        <motion.h2
                          layoutId={`name-${active.login}-${id}`}
                          className="text-xl font-bold md:flex-1"
                        >
                          {details?.name || active.login}
                        </motion.h2>
                        {details?.name && (
                          <motion.h4 className="text-muted-foreground text-xs">
                            @{active.login}
                          </motion.h4>
                        )}
                      </motion.div>

                      <motion.div className="grid grid-cols-2 items-center gap-2 md:flex w-full md:w-auto ">
                        {active.id !== session.user.githubId && (
                          <motion.button
                            className="h-9 px-4 rounded-md text-sm font-medium bg-primary text-primary-foreground shadow hover:bg-primary/90"
                            onClick={() => {
                              handleAddFriend(active);
                              const btn = document.getElementById(
                                `add-friend-${active.id}`
                              ) as HTMLButtonElement;
                              if (btn) {
                                btn.innerHTML = "Request Sent";
                                btn.disabled = true;
                              }
                            }}
                            id={`add-friend-${active.id}`}
                            layoutId={`add-friend-${active.id}`}
                          >
                            Add Friend
                          </motion.button>
                        )}
                        <motion.button
                          layoutId={`view-github-${active.id}`}
                          className="h-9 rounded-md px-3 text-sm font-medium border bg-background hover:bg-accent hover:text-accent-foreground"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(active.html_url, "_blank");
                          }}
                        >
                          <span className="flex items-center text-center justify-center">
                            <GithubIcon size={15} className="mr-1 md:mr-0" />
                            <span className="md:hidden">View GitHub</span>
                          </span>
                          <span></span>
                        </motion.button>
                      </motion.div>
                    </motion.div>

                    {loading ? (
                      <div className="space-y-4">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                        <div className="grid grid-cols-3 gap-4">
                          <Skeleton className="h-16 w-full" />
                          <Skeleton className="h-16 w-full" />
                          <Skeleton className="h-16 w-full" />
                        </div>
                      </div>
                    ) : (
                      details && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="space-y-6"
                        >
                          <p className="text-muted-foreground">
                            {details.bio || "No bio available"}
                          </p>

                          <div className="grid grid-cols-3 gap-4">
                            <div className="flex flex-col items-center justify-center p-4 bg-muted rounded-lg">
                              <span className="text-xl font-bold">
                                {details.followers}
                              </span>
                              <span className="text-sm text-muted-foreground">
                                Followers
                              </span>
                            </div>
                            <div className="flex flex-col items-center justify-center p-4 bg-muted rounded-lg">
                              <span className="text-xl font-bold">
                                {details.following}
                              </span>
                              <span className="text-sm text-muted-foreground">
                                Following
                              </span>
                            </div>
                            <div className="flex flex-col items-center justify-center p-4 bg-muted rounded-lg">
                              <span className="text-xl font-bold">
                                {details.public_repos}
                              </span>
                              <span className="text-sm text-muted-foreground">
                                Repos
                              </span>
                            </div>
                          </div>

                          <div className="space-y-2">
                            {details.location && (
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <MapPin size={16} />
                                <span>{details.location}</span>
                              </div>
                            )}
                            {details.blog && (
                              <div className="flex items-center gap-2 text-sm">
                                <LinkIcon size={16} />
                                <a
                                  href={details.blog}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-primary hover:underline"
                                >
                                  {details.blog}
                                </a>
                              </div>
                            )}
                            {details.twitter_username && (
                              <div className="flex items-center gap-2 text-sm">
                                <Twitter size={16} />
                                <a
                                  href={`https://twitter.com/${details.twitter_username}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-primary hover:underline"
                                >
                                  @{details.twitter_username}
                                </a>
                              </div>
                            )}
                            {details.created_at && (
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Calendar size={16} />
                                <span>
                                  Joined{" "}
                                  {new Date(
                                    details.created_at
                                  ).toLocaleDateString()}
                                </span>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )
                    )}
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 h-[60vh] no-scrollbar overflow-y-scroll">
        {developers.map((developer) => (
          <motion.div
            layoutId={`card-${developer.login}-${id}`}
            key={developer.id}
            onClick={() => {
              setActive(developer);
              fetchDeveloperDetails(developer.login);
            }}
            className="bg-card text-card-foreground rounded-lg shadow-sm border p-6 cursor-pointer hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-4">
              <motion.div
                layoutId={`image-container-${developer.login}-${id}`}
                className="relative"
              >
                <motion.div
                  layoutId={`image-${developer.login}-${id}`}
                  className="w-16 h-16 relative"
                >
                  <Image
                    src={developer.avatar_url || "/placeholder.svg"}
                    alt={developer.login}
                    fill
                    className="rounded-full object-cover"
                  />
                </motion.div>
              </motion.div>

              <motion.div
                layoutId={`content-${developer.login}-${id}`}
                className="flex-1"
              >
                <motion.h2
                  layoutId={`name-${developer.login}-${id}`}
                  className="text-xl font-semibold mb-3"
                >
                  {developer.login}
                </motion.h2>
                <div className="flex gap-2">
                  <motion.button
                    layoutId={`add-friend-${developer.id}`}
                    className="h-8 rounded-md px-3 text-xs bg-primary text-primary-foreground shadow hover:bg-primary/90"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddFriend(developer);
                      const btn = e.currentTarget;
                      btn.innerHTML =
                        '<span class="flex items-center"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg><span class="ml-1">Request Sent</span></span>';
                      btn.disabled = true;
                    }}
                    id={`add-friend-${developer.id}`}
                  >
                    Add Friend
                  </motion.button>
                  <motion.button
                    layoutId={`view-github-${developer.id}`}
                    className="h-8 rounded-md px-3 text-xs border bg-background hover:bg-accent hover:text-accent-foreground"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(developer.html_url, "_blank");
                    }}
                  >
                    <span className="flex items-center">
                      <GithubIcon size={12} className="mr-1" />
                      View GitHub
                    </span>
                  </motion.button>
                </div>
              </motion.div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
