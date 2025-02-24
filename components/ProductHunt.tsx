"use client";
import Image from "next/image";
import { useTheme } from "next-themes";

function ProductHunt() {
  const { theme } = useTheme();
  return (
    <div className="mt-4 flex justify-center">
      <a
        href="https://www.producthunt.com/posts/codenearby?embed=true&utm_source=badge-featured&utm_medium=badge&utm_souce=badge-codenearby"
        target="_blank"
      >
        <Image
          src={`https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=909199&theme=${theme}&t=1740385272040`}
          alt="CodeNearby - Find&#0032;coding&#0032;partners&#0032;&#0038;&#0032;build&#0032;together—Tinder&#0032;for&#0032;developers&#0033; | Product Hunt"
          width={200}
          height={40}
        />
      </a>
    </div>
  );
}

export default ProductHunt;
