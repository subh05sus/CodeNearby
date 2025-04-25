"use client";
import AIChatInterface from "@/components/ai-chat-interface";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { Session } from "next-auth";
import { InfoIcon } from "lucide-react";
import { useRouter } from "next/navigation";

export default function FindYourPairPage() {
  const { data: session } = useSession() as { data: Session | null };
  const user = session?.user;
  const router = useRouter();
  const handleInfoClick = () => {
    router.push("/about/ai-connect");
  };

  return (
    <main className="container mx-auto px-0 sm:px-6 md:px-8 py-0 max-w-5xl">
      <div className="mb-4  text-center space-y-2 sm:space-y-3">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">
          Find Your Perfect Developer Match{" "}
          <InfoIcon
            className="inline h-6 w-6 cursor-pointer hover:text-muted-foreground transition-all duration-200"
            onClick={handleInfoClick}
          />
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
          Chat with our AI assistant to discover developers that match your
          specific requirements
        </p>
        <div className="flex items-center justify-center space-x-2">
          <span className="text-sm text-muted-foreground">Powered by</span>
          <Image
            src="/gemini-logo.svg"
            alt="Gemini AI"
            width={80}
            height={24}
            className="h-5 mb-1.5 w-auto"
          />
        </div>
      </div>

      <div className="w-full h-full">
        {user ? (
          <AIChatInterface />
        ) : (
          <div className="relative h-[calc(100vh-16rem)] sm:h-[calc(100vh-18rem)] md:h-[calc(100vh-20rem)]">
            <div className="absolute inset-0 backdrop-blur-md bg-background/50 flex flex-col items-center justify-center rounded-xl border shadow-lg">
              <h3 className="text-xl font-semibold mb-4">
                Sign in to continue
              </h3>
              <p className="text-muted-foreground mb-6 text-center max-w-md px-4">
                Please sign in to chat with our AI assistant and find your
                perfect developer match
              </p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
