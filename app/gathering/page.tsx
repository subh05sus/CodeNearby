/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Plus } from "lucide-react";
import Link from "next/link";
import { GatheringList } from "@/components/gathering-list";
import LoginButton from "@/components/login-button";

interface Gathering {
  id: string;
  name: string;
  slug: string;
  expiresAt: string;
  hostId: string;
  participants: string[];
  createdAt: string;
}

export default function GatheringPage() {
  const { data: session } = useSession();
  const [gatherings, setGatherings] = useState<Gathering[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (session) {
      fetchGatherings();
    }
  }, [session]);

  const fetchGatherings = async () => {
    try {
      const response = await fetch("/api/gathering");
      if (!response.ok) {
        throw new Error("Failed to fetch gatherings");
      }
      const data = await response.json();
      setGatherings(data);
    } catch {
      toast({
        title: "Error",
        description: "Failed to fetch gatherings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <h1 className="text-2xl font-bold mb-4">Please Sign In</h1>
        <p>You need to be signed in to view and create gatherings.</p>
        <LoginButton />
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Gatherings</h1>
        {gatherings.length !== 0 && (
          <Button asChild>
            <Link href="/gathering/create">
              <Plus className="mr-2 h-4 w-4" /> Create Gathering
            </Link>
          </Button>
        )}
      </div>

      {gatherings.length === 0 ? (
        <Card className="bg-background">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-center">
              No Gatherings Yet
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground">
              You are not part of any gatherings yet. Create one to get started!
            </p>
            <div className="mt-4 flex justify-center">
              <Button asChild>
                <Link href="/gathering/create">
                  <Plus className="mr-2 h-4 w-4" /> Create Your First Gathering
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <GatheringList gatherings={gatherings} />
      )}
    </div>
  );
}
