"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

interface Gathering {
  id: string;
  name: string;
  slug: string;
  expiresAt: string;
  hostId: string;
}

export default function JoinGatheringPage() {
  const { data: session } = useSession();
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [gathering, setGathering] = useState<Gathering | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session) {
      fetchGathering();
    }
  }, [session]); // Removed params.slug from dependencies

  const fetchGathering = async () => {
    try {
      const response = await fetch(`/api/gathering/${params.slug}`);
      if (!response.ok) {
        throw new Error("Failed to fetch gathering");
      }
      const data = await response.json();
      setGathering(data);
    } catch {
      toast({
        title: "Error",
        description: "Failed to fetch gathering. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleJoinGathering = async () => {
    try {
      const response = await fetch("/api/gathering/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uniqueSlug: params.slug }),
      });

      if (!response.ok) {
        throw new Error("Failed to join gathering");
      }

      toast({
        title: "Success",
        description: "You have joined the gathering!",
      });
      router.push(`/gathering/${params.slug}`);
    } catch {
      toast({
        title: "Error",
        description: "Failed to join gathering. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <h1 className="text-2xl font-bold mb-4">Please Sign In</h1>
        <p>You need to be signed in to join a gathering.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!gathering) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <h1 className="text-2xl font-bold mb-4">Gathering Not Found</h1>
        <p>The requested gathering could not be found.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Join Gathering</CardTitle>
        </CardHeader>
        <CardContent>
          <h2 className="text-xl font-semibold mb-4">{gathering.name}</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Expires: {new Date(gathering.expiresAt).toLocaleString()}
          </p>
          <Button onClick={handleJoinGathering} className="w-full">
            Join Gathering
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
