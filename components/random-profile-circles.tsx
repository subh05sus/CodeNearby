"use client";

import { useState, useEffect } from "react";
import { ProfileCircle } from "./profile-circle";
import { useSession } from "next-auth/react";
import { Session } from "next-auth";

export function RandomProfileCircles({
  profiles,
  OwnProfileImage,
  OwnProfileImageSize,
}: {
  profiles: { image: string; id: string }[];
  OwnProfileImage: string;
  OwnProfileImageSize: number;
}) {
  const { data: session } = useSession() as { data: Session | null };
  const [randomProfiles, setRandomProfiles] = useState<
    { image: string; id: string }[]
  >([]);

  useEffect(() => {
    const shuffled = [...profiles].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 9);

    setRandomProfiles(selected);
  }, [profiles]);

  return (
    <div className="absolute inset-0 z-10">
      {randomProfiles.map((profile, index) => {
        const angle = (index / randomProfiles.length) * 2 * Math.PI;
        const radius = 120;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;

        return (
          <div
            key={index}
            className="absolute z-20"
            style={{
              transform: `translate(${x}px, ${y}px)`,
              left: "calc(50% - 20px)",
              top: "calc(50% - 20px)",
              scale: `${0.7 + Math.random() * 0.4}`,
            }}
          >
            <ProfileCircle
              size={50}
              id={profile.id}
              src={profile.image}
              alt={`Profile ${index + 1}`}
            />
          </div>
        );
      })}
      <div className="absolute w-full h-full flex items-center z-[9] justify-center">
        <ProfileCircle
          id={session?.user.githubUsername as string}
          size={OwnProfileImageSize}
          src={OwnProfileImage}
          alt="Your Profile"
        />
      </div>
    </div>
  );
}
