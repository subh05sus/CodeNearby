"use client";

import React from "react";
import Image from "next/image";

interface HelloProps {
  name: string;
  picture: string;
}

function Hello({ name, picture }: HelloProps) {
  return (
    <div className="flex items-center gap-4 mb-4 cursor-default">
      <Image
        src={picture || "/placeholder.svg"}
        alt={name || "User"}
        width={50}
        height={50}
        className="rounded-full"
      />
      <div className="relative">
        <h1 className="text-3xl font-bold portrait:text-left">
          Hello, {name.split(" ")[0]}!
        </h1>
      </div>
    </div>
  );
}

export default Hello;
