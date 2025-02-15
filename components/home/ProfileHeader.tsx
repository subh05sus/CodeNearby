/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

import Image from "next/image";
const ProfileHeader = ({ imageUrl }: { imageUrl: string }) => {
  return (
    // <div className={`h-48 ${gradient} relative`}>
    <div className={`h-48  rounded-xl relative`}>
      <div className="absolute -bottom-16 left-8">
        <Avatar className="h-32 w-32 border-4 border-background">
          <AvatarImage src={imageUrl || "/placeholder.svg"} alt="Profile" />
          <AvatarFallback>P</AvatarFallback>
        </Avatar>
      </div>
      <div className="absolute w-full h-full left-0 overflow-hidden -z-20 rounded-xl">
        <Image
          src="/bg.webp"
          alt="Background"
          layout="fill"
          objectFit="cover"
          objectPosition="center"
          className="filter blur-md duration-300 transition-all ease-in-out scale-110 animate-pulse"
          style={{ animation: "blurAnimation 10s infinite" }}
        />
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
