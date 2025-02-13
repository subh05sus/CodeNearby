import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/options";
import Image from "next/image";
import { BlurFade } from "@/components/magicui/blur-fade";

export default async function Home() {
  const session = await getServerSession(authOptions);

  return (
    <div className="flex flex-col items-center justify-center  p-4 h-[-webkit-fill-available]">
      <div className="text-center mb-8">
        {session ? (
          <div className="flex items-center gap-4 mb-4">
            <Image
              src={session.user.image || "/placeholder.svg"}
              alt={session.user.name || "User"}
              width={50}
              height={50}
              className="rounded-full"
            />
            <h1 className="text-3xl font-bold portrait:text-left">
              Hello, {session.user.name}!
            </h1>
          </div>
        ) : (
          <BlurFade delay={0.01} inView>
            <h1 className="text-5xl font-bold mb-4">Welcome to CodeNearby</h1>
          </BlurFade>
        )}
        <p className="text-xl mb-8">
          Connect with developers, share ideas, and collaborate on projects.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl w-full">
        <FeatureCard
          title="Discover Developers"
          description="Find and connect with developers in your area or around the world."
          buttonText="Explore Nearby"
          buttonLink="/explore"
        />
        <FeatureCard
          title="Share Your Thoughts"
          description="Post updates, share code snippets, and engage with the community."
          buttonText="Go to Feed"
          buttonLink="/feed"
        />
        <FeatureCard
          title="Collaborate with Others"
          description="Find exciting people around you to work on projects together."
          buttonText="Discover New People"
          buttonLink="/discover"
        />
        <FeatureCard
          title="Stay Connected"
          description="Chat with fellow developers and build your professional network."
          buttonText="View Messages"
          buttonLink="/messages"
        />
      </div>
    </div>
  );
}

function FeatureCard({
  title,
  description,
  buttonText,
  buttonLink,
}: {
  title: string;
  description: string;
  buttonText: string;
  buttonLink: string;
}) {
  return (
    <div className="bg-card text-card-foreground rounded-lg shadow-lg p-6 flex flex-col justify-between">
      <div>
        <h2 className="text-2xl font-semibold mb-2">{title}</h2>
        <p className="text-muted-foreground mb-4">{description}</p>
      </div>
      <Button asChild className="w-full">
        <Link href={buttonLink}>{buttonText}</Link>
      </Button>
    </div>
  );
}
