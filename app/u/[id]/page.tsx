/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function UserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

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
        toast.error("Error", {
          description: data.error || "Failed to fetch profile.",
        });
      }
    } catch {
      toast.error("Failed to fetch profile.");
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
