/* eslint-disable @typescript-eslint/no-explicit-any */
import { fetchGitHubData } from "@/lib/github";
import { Loader2, Plus, Github, MapPin, UserX } from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import SwissCard from "./swiss/SwissCard";
import SwissButton from "./swiss/SwissButton";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Session } from "next-auth";

function GithubUsernameCard({ username }: { username: string }) {
  const { data: session } = useSession() as { data: Session | null };
  const [githubUser, setGithubUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadGithubUser = async () => {
      try {
        const user = await fetchGitHubData(username);
        setGithubUser(user);
      } catch (error) {
        console.error("Failed to fetch GitHub user:", error);
      } finally {
        setLoading(false);
      }
    };

    loadGithubUser();
  }, [username]);

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[60vh] gap-8">
        <Loader2 className="h-16 w-16 animate-spin text-swiss-red" />
        <h2 className="text-4xl font-black uppercase tracking-tighter italic">SYNCHRONIZING_MODULE_DATA...</h2>
      </div>
    );
  }

  if (!githubUser || githubUser.message === "Not Found") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-12 text-center bg-swiss-white border-8 border-swiss-black shadow-[16px_16px_0_0_rgba(255,0,0,1)]">
        <UserX className="h-24 w-24 mb-6 text-swiss-red" />
        <h1 className="text-6xl font-black uppercase tracking-tighter mb-4 italic">IDENTITY_NOT_FOUND</h1>
        <p className="text-xl font-bold uppercase tracking-tight max-w-md opacity-60">
          THE_REQUESTED_USERNAME_COULD_NOT_BE_RESOLVED_WITHIN_THE_PRIMARY_NODE.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] w-full max-w-2xl mx-auto p-4">
      <SwissCard variant="white" className="w-full p-12 shadow-[16px_16px_0_0_rgba(0,0,0,1)] relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4">
          <Github className="h-12 w-12 opacity-5 italic" />
        </div>

        <div className="flex flex-col items-center gap-8">
          <div className="relative">
            <div className="absolute inset-0 bg-swiss-red translate-x-3 translate-y-3 -z-10" />
            <img
              src={githubUser.avatar_url}
              alt={githubUser.login}
              className="w-48 h-48 border-8 border-swiss-black grayscale hover:grayscale-0 transition-all duration-500 object-cover"
            />
          </div>

          <div className="text-center space-y-4">
            <h2 className="text-5xl font-black uppercase tracking-tighter leading-none italic underline decoration-8 decoration-swiss-red">
              {githubUser.name || githubUser.login}
            </h2>
            <div className="flex justify-center gap-4">
              <span className="font-black bg-swiss-black text-swiss-white px-4 py-1 text-xl tracking-widest uppercase">
                @{githubUser.login}
              </span>
            </div>
            {githubUser.bio && (
              <p className="text-lg font-bold uppercase tracking-tight leading-tight max-w-md opacity-80 border-l-8 border-swiss-black pl-6 mx-auto text-left">
                {githubUser.bio}
              </p>
            )}
            {githubUser.location && (
              <p className="flex items-center justify-center gap-2 font-black uppercase tracking-widest text-sm text-swiss-red">
                <MapPin className="h-4 w-4" /> {githubUser.location}
              </p>
            )}
          </div>

          <div className="w-full space-y-8 pt-8 border-t-8 border-swiss-black">
            <div className="bg-swiss-muted/10 p-6 border-4 border-dashed border-swiss-black/20 text-center">
              <p className="font-black text-xl uppercase tracking-tighter italic">
                STATUS: EXTERNAL_NODE_DETECTED
              </p>
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-40 mt-1">
                CODENEARBY_PROTOCOLS_ARE_NOT_YET_ACTIVE_FOR_THIS_ENTITY
              </p>
            </div>

            <div className="flex flex-col gap-4">
              {session && (
                <SwissButton
                  variant="primary"
                  size="lg"
                  className="w-full text-xl h-16 shadow-[8px_8px_0_0_rgba(255,0,0,1)]"
                  onClick={() => {
                    navigator.clipboard.writeText(
                      `${window.location.origin}/invite?ref=${session.user.githubUsername}`
                    );
                    toast.success("SYSTEM_NOTICE", { description: "INVITATION_LINK_ENCRYPTED_TO_CLIPBOARD" });
                  }}
                >
                  <Plus className="h-6 w-6 mr-3" /> INITIALIZE_INVITE
                </SwissButton>
              )}
              <Link
                href={githubUser.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full"
              >
                <SwissButton variant="secondary" className="w-full h-16 text-lg">
                  <Github className="h-6 w-6 mr-3" /> GITHUB_REPOSITORY
                </SwissButton>
              </Link>
            </div>
          </div>
        </div>
      </SwissCard>
    </div>
  );
}

export default GithubUsernameCard;
