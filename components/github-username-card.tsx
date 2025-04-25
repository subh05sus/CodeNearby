import { fetchGitHubData } from "@/lib/github";
import { Loader2, Plus, Github } from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
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
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!githubUser) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <h1 className="text-2xl font-bold mb-4">User Not Found</h1>
        <p>
          The requested user profile could not be found on GitHub or our
          platform.
        </p>
      </div>
    );
  }

  if (githubUser.message === "Not Found") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <h1 className="text-2xl font-bold mb-4">User Not Found</h1>
        <p>
          The requested user profile could not be found on GitHub or our
          platform.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] max-w-md mx-auto">
      <Card className="w-full">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center gap-4">
            <img
              src={githubUser.avatar_url}
              alt={githubUser.login}
              className="w-24 h-24 rounded-full"
            />
            <div className="text-center">
              <h2 className="text-2xl font-bold">
                {githubUser.name || githubUser.login}
              </h2>
              <p className="text-muted-foreground">@{githubUser.login}</p>
              {githubUser.bio && <p className="mt-2">{githubUser.bio}</p>}
              {githubUser.location && (
                <p className="text-sm text-muted-foreground mt-1">
                  {githubUser.location}
                </p>
              )}
            </div>
            <div className="w-full mt-4 pt-4 border-t flex justify-center">
              <p className="text-center text-muted-foreground mb-4">
                This user is not on CodeNearby yet.
              </p>
            </div>
            {session && (
              <Button
                variant="default"
                className="w-full"
                onClick={() => {
                  navigator.clipboard.writeText(
                    `${window.location.origin}/invite?ref=${session.user.githubUsername}`
                  );
                  toast.success("Invite link copied to clipboard!");
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Invite to CodeNearby
              </Button>
            )}
            <Link
              href={githubUser.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full"
            >
              <Button variant="outline" className="w-full">
                <Github className="h-4 w-4 mr-2" />
                View on GitHub
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default GithubUsernameCard;
