/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import Image from "next/image";
import { Button } from "../ui/button";
import { Pencil } from "lucide-react";
interface ProfileHeaderProps {
  imageUrl: string;
  bannerUrl?: string;
  editable?: boolean;
  appearance?: {
    theme: "default" | "blue" | "green" | "purple" | "orange";
    showActivity?: boolean;
    compactPosts?: boolean;
    highlightCode?: boolean;
  };
}

const ProfileHeader = ({
  imageUrl,
  bannerUrl,
  editable = false,
  appearance,
}: ProfileHeaderProps) => {
  const getThemeGradient = () => {
    switch (appearance?.theme) {
      case "blue":
        return "from-blue-500/30 via-blue-400/20 to-blue-600/10";
      case "green":
        return "from-green-500/30 via-green-400/20 to-green-600/10";
      case "purple":
        return "from-purple-500/30 via-purple-400/20 to-purple-600/10";
      case "orange":
        return "from-orange-500/30 via-orange-400/20 to-orange-600/10";
      default:
        return "from-primary/30 via-primary/20 to-primary/10";
    }
  };

  return (
    <div className={`h-48 rounded-xl relative`}>
      {editable && (
        <Button
          variant="outline"
          size="icon"
          asChild
          className="absolute top-4 right-4 z-10 rounded-full bg-background/70 backdrop-blur-md hover:bg-background/100 transition-all duration-300 ease-in-out"
        >
          <Link href="/profile/edit">
            <Pencil className="h-4 w-4" />
          </Link>
        </Button>
      )}
      <div className="absolute -bottom-16 left-8">
        <Avatar className="h-32 w-32 border-4 border-background">
          <AvatarImage src={imageUrl || "/placeholder.svg"} alt="Profile" />
          <AvatarFallback>P</AvatarFallback>
        </Avatar>
      </div>
      <div className="absolute w-full h-full left-0 overflow-hidden -z-20 rounded-2xl">
        {bannerUrl ? (
          <Image
            src={bannerUrl}
            alt="Background"
            layout="fill"
            objectFit="cover"
            objectPosition="center"
            // className="filter blur-md duration-300 transition-all ease-in-out scale-110 animate-pulse"
            // style={{ animation: "blurAnimation 10s infinite" }}
          />
        ) : (
          <div
            className={`w-full h-full bg-gradient-to-br ${getThemeGradient()}`}
          ></div>
        )}
      </div>
      <style jsx>
        {`
          @keyframes blurAnimation {
            0% {
              filter: blur(15px);
            }
            25% {
              filter: blur(10px);
            }
            50% {
              filter: blur(6px);
            }
            75% {
              filter: blur(10px);
            }
            100% {
              filter: blur(15px);
            }
          }
        `}
      </style>
    </div>
  );
};

export default ProfileHeader;
