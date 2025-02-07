/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

export default function UserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

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
        toast({
          title: "Error",
          description: data.error || "Failed to fetch profile.",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to fetch profile.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return loading ? (
    <div className="flex justify-center items-center min-h-[50vh]">
      <Loader2 className="h-8 w-8 animate-spin" />
    </div>
  ) : null;
}
