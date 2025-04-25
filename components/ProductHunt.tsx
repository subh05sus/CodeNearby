"use client";
import Image from "next/image";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

function ProductHunt() {
  const { resolvedTheme } = useTheme();
  const [currentTheme, setCurrentTheme] = useState("light");

  useEffect(() => {
    // Use resolvedTheme which gives the actual applied theme
    setCurrentTheme(resolvedTheme === "dark" ? "dark" : "light");
  }, [resolvedTheme]);

  return (
    <div className="mt-4 flex justify-center">
      <a
        href="https://www.producthunt.com/posts/codenearby?utm_source=badge-featured&utm_medium=badge&utm_souce=badge-codenearby"
        target="_blank"
        rel="noopener noreferrer"
      >
        <Image
          src={`https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=909199&theme=${currentTheme}&t=1740385272040`}
          alt="CodeNearby - Find coding partners & build together—Tinder for developers!"
          width={200}
          height={40}
        />
      </a>
    </div>
  );
}

export default ProductHunt;
