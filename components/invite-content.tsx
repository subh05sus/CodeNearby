"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Github } from "lucide-react";
import { signIn } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

interface InviteContentProps {
  referrer: string;
}

export default function InviteContent({ referrer }: InviteContentProps) {
  const [referrerData, setReferrerData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchReferrer() {
      try {
        const response = await fetch(`/api/user-by-github/${referrer}`);
        if (!response.ok) throw new Error("Failed to fetch referrer data");
        const data = await response.json();
        setReferrerData(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    if (referrer) {
      fetchReferrer();
    }
  }, [referrer]);

  if (loading) return <p>Loading...</p>;
  if (!referrerData) return <p>Referrer not found</p>;
  return (
    <div className="container flex items-center justify-center min-h-[calc(100vh-20rem)]">
      <Card className="w-full max-w-md p-4">
        <CardHeader>
          <CardTitle className="text-3xl font-semibold text-center">
            <Image
              src={referrerData.image}
              height={32}
              width={32}
              alt={""}
              className="inline mr-2"
            />
            <span className="font-bold">{referrerData.name || "Someone"}</span>{" "}
            invited you to join CodeNearby
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="mb-4">
            Discover GitHub developers in your area or search for specific users
            worldwide.
          </p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button
            variant="secondary"
            onClick={async () => {
              await signIn("github", {
                callbackUrl: `/user/${referrerData.githubId as string}`,
              });
            }}
          >
            <Github className="inline mr-2" />
            Login with GitHub
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
