/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useId, useRef, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { useOutsideClick } from "@/hooks/use-outside-click";
import { Developer } from "@/types";
import {
  Calendar,
  GithubIcon,
  LinkIcon,
  MapPin,
  Twitter,
  X,
} from "lucide-react";

interface DeveloperDetails {
  created_at: any;
  twitter_username: any;
  name: string;
  bio: string;
  followers: number;
  following: number;
  public_repos: number;
  location: string;
  blog: string;
}

export default function ExploreDeveloperGrid({
  developers,
}: {
  developers: Developer[];
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
      setDetails(data);
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
                <X />
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
                    className="w-full h-80 relative"
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

                <div className="p-4">
                  <motion.div layoutId={`content-${active.login}-${id}`}>
                    <motion.div className="flex md:flex-1  justify-between gap-2">
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
                      <motion.button
                        layoutId={`view-github-${active.id}`}
                        className="h-8 w-8 rounded-md  text-center flex justify-center items-center text-xs border bg-background hover:bg-accent hover:text-accent-foreground"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(active.html_url, "_blank");
                        }}
                      >
                        <GithubIcon size={16} />
                      </motion.button>
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
                            <div className="text-center p-4 bg-muted rounded-lg">
                              <div className="font-bold text-xl">
                                {details.followers}
                              </div>
                              <div className="text-muted-foreground">
                                Followers
                              </div>
                            </div>
                            <div className="text-center p-4 bg-muted rounded-lg">
                              <div className="font-bold text-xl">
                                {details.following}
                              </div>
                              <div className="text-muted-foreground">
                                Following
                              </div>
                            </div>
                            <div className="text-center p-4 bg-muted rounded-lg">
                              <div className="font-bold text-xl">
                                {details.public_repos}
                              </div>
                              <div className="text-muted-foreground">Repos</div>
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {developers.map((developer) => (
          <motion.div
            layoutId={`card-${developer.login}-${id}`}
            key={developer.id}
            onClick={() => {
              setActive(developer);
              fetchDeveloperDetails(developer.login);
            }}
            className="bg-background rounded-lg shadow-sm border p-6 cursor-pointer hover:shadow-md transition-shadow"
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
                    layoutId={`view-github-${developer.id}`}
                    className="h-8 rounded-md px-3 text-xs border bg-background hover:bg-accent hover:text-accent-foreground"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(developer.html_url, "_blank");
                    }}
                  >
                    View GitHub
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
