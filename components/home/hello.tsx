"use client";

import React from "react";
import Image from "next/image";

interface HelloProps {
  name: string;
  picture: string;
}

function Hello({ name, picture }: HelloProps) {
  return (
    <div className="flex items-center gap-6 mb-8 cursor-default border-l-8 border-swiss-red pl-6 py-2">
      <Image
        src={picture || "/placeholder.svg"}
        alt={name || "User"}
        width={60}
        height={60}
        className="rounded-none border-4 border-black dark:border-white"
      />
      <div>
        <p className="text-xs font-black uppercase tracking-[0.4em] text-swiss-red mb-1">Authenticated Session</p>
        <h1 className="text-4xl font-black uppercase tracking-tighter text-black dark:text-white">
          HELLO, {name.split(" ")[0]}!
        </h1>
      </div>
    </div>
  );
}

export default Hello;
