"use client";

import { useEffect, useId, useRef, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useOutsideClick } from "@/hooks/use-outside-click";
import type { Developer } from "@/types";
import { GithubIcon, X, Calendar, LinkIcon, MapPin, Zap } from "lucide-react";
import SwissButton from "./swiss/SwissButton";

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
    <div className="relative">
      <AnimatePresence>
        {active && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-swiss-black/40 backdrop-blur-sm z-[100]"
            />
            <div className="fixed inset-0 grid place-items-center z-[110] p-4">
              <motion.div
                layoutId={`card-${active.login}-${id}`}
                ref={ref}
                className="w-full max-w-2xl bg-swiss-white border-8 border-swiss-black shadow-[24px_24px_0_0_rgba(0,0,0,1)] overflow-hidden flex flex-col md:flex-row"
              >
                {/* Detail Image/Sidebar */}
                <div className="md:w-2/5 relative aspect-square md:aspect-auto border-b-8 md:border-b-0 md:border-r-8 border-swiss-black bg-swiss-muted">
                  <Image
                    src={active.avatar_url || "/placeholder.svg"}
                    alt={active.login}
                    fill
                    className="object-cover grayscale"
                    priority
                  />
                  <button
                    onClick={() => {
                      setActive(null);
                      setDetails(null);
                    }}
                    className="absolute top-4 left-4 w-10 h-10 bg-swiss-white border-4 border-swiss-black flex items-center justify-center hover:bg-swiss-red hover:text-swiss-white transition-colors"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <div className="md:w-3/5 p-8 flex flex-col max-h-[80vh] overflow-y-auto custom-scrollbar">
                  <div className="mb-6">
                    <h2 className="font-black text-5xl uppercase tracking-tighter leading-none mb-2">
                      {details?.name || active.login}
                    </h2>
                    <span className="font-bold uppercase  text-xs text-swiss-red">
                      GITHUB / @{active.login}
                    </span>
                  </div>

                  {loading ? (
                    <div className="space-y-6">
                      <div className="h-20 bg-swiss-muted border-4 border-swiss-black animate-pulse" />
                      <div className="grid grid-cols-3 gap-4">
                        <div className="h-20 bg-swiss-muted border-4 border-swiss-black animate-pulse" />
                        <div className="h-20 bg-swiss-muted border-4 border-swiss-black animate-pulse" />
                        <div className="h-20 bg-swiss-muted border-4 border-swiss-black animate-pulse" />
                      </div>
                    </div>
                  ) : details && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-8"
                    >
                      <p className="font-bold uppercase tracking-tight text-lg leading-tight p-4 bg-swiss-muted border-l-8 border-swiss-black">
                        {details.bio || "NO BIO PROVIDED BY USER."}
                      </p>

                      <div className="grid grid-cols-3 border-4 border-swiss-black divide-x-4 divide-swiss-black bg-swiss-black">
                        <div className="p-4 bg-swiss-white flex flex-col items-center">
                          <span className="font-black text-2xl">{details.followers}</span>
                          <span className="font-bold uppercase text-[10px]  text-swiss-red">FOLLOWERS</span>
                        </div>
                        <div className="p-4 bg-swiss-white flex flex-col items-center">
                          <span className="font-black text-2xl">{details.following}</span>
                          <span className="font-bold uppercase text-[10px]  text-swiss-red">FOLLOWING</span>
                        </div>
                        <div className="p-4 bg-swiss-white flex flex-col items-center">
                          <span className="font-black text-2xl">{details.public_repos}</span>
                          <span className="font-bold uppercase text-[10px]  text-swiss-red">REPOS</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {details.location && (
                          <div className="flex items-center gap-3 font-bold uppercase tracking-tight text-xs">
                            <MapPin className="h-5 w-5 text-swiss-red" />
                            {details.location}
                          </div>
                        )}
                        {details.blog && (
                          <a href={details.blog} target="_blank" rel="noreferrer" className="flex items-center gap-3 font-bold uppercase tracking-tight text-xs hover:text-swiss-red transition-colors">
                            <LinkIcon className="h-5 w-5 text-swiss-red" />
                            WEBSITE
                          </a>
                        )}
                        <div className="flex items-center gap-3 font-bold uppercase tracking-tight text-xs">
                          <Calendar className="h-5 w-5 text-swiss-red" />
                          JOINED {new Date(details.created_at).getFullYear()}
                        </div>
                      </div>

                      <div className="pt-6 border-t-4 border-swiss-black flex gap-4">
                        {active.id !== session.user.githubId && (
                          <SwissButton
                            onClick={() => {
                              handleAddFriend(active);
                              const btn = document.getElementById(`add-friend-detail-${active.id}`);
                              if (btn) btn.innerText = "REQUEST_SENT";
                            }}
                            id={`add-friend-detail-${active.id}`}
                            className="flex-1"
                          >
                            <Zap className="h-4 w-4 mr-2" />
                            ADD FRIEND
                          </SwissButton>
                        )}
                        <SwissButton
                          variant="secondary"
                          onClick={() => window.open(active.html_url, "_blank")}
                          className="flex-1"
                        >
                          <GithubIcon className="h-4 w-4 mr-2" />
                          GITHUB
                        </SwissButton>
                      </div>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar no-scrollbar">
        {developers.map((developer) => (
          <motion.div
            layoutId={`card-${developer.login}-${id}`}
            key={developer.id}
            onClick={() => {
              setActive(developer);
              fetchDeveloperDetails(developer.login);
            }}
            className="group bg-swiss-white border-4 border-swiss-black p-6 cursor-pointer hover:bg-swiss-muted transition-all shadow-[8px_8px_0_0_rgba(0,0,0,1)] hover:shadow-[12px_12px_0_0_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none"
          >
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 relative border-4 border-swiss-black grayscale group-hover:grayscale-0 transition-all">
                <Image
                  src={developer.avatar_url || "/placeholder.svg"}
                  alt={developer.login}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="flex-1">
                <h3 className="font-black text-2xl uppercase tracking-tighter leading-none mb-1">
                  {developer.login}
                </h3>
                <p className="font-bold uppercase  text-[8px] text-swiss-red mb-4">
                  DEV / ACTIVE_NODE
                </p>

                <div className="flex gap-2">
                  <SwissButton
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddFriend(developer);
                    }}
                    className="h-8 px-3 text-[10px]"
                  >
                    ADD
                  </SwissButton>
                  <SwissButton
                    size="sm"
                    variant="secondary"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(developer.html_url, "_blank");
                    }}
                    className="h-8 px-3 text-[10px]"
                  >
                    GITHUB
                  </SwissButton>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
