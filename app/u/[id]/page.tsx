/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import GithubUsernameCard from "@/components/github-username-card";

export default function UserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, [params.id]);

  const fetchProfile = async () => {
    try {
      const response = await fetch(`/api/user-by-githubId/${params.id}`);
      const data = await response.json();
      if (response.ok) {
        router.replace(`/user/${data.githubId}`); // Redirect directly
      } else {
        setNotFound(true);
        toast.error("Error", {
          description: data.error || "Failed to fetch profile.",
        });
      }
    } catch {
      setNotFound(true);
      toast.error("Failed to fetch profile.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[60vh] gap-8">
        <Loader2 className="h-16 w-16 animate-spin text-swiss-red" />
        <h2 className="text-4xl font-black uppercase tracking-tighter italic">RESOLVING_NETWORK_PATH...</h2>
      </div>
    );
  }

  if (notFound) {
    return <GithubUsernameCard username={params.id as string} />;
  }

  return null;
}
