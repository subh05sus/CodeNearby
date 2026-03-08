import Image from "next/image";
import { useRouter } from "next/navigation";

interface ProfileCircleProps {
  size: number;
  src: string;
  alt: string;
  id: string;
}
export function ProfileCircle({ size, src, alt, id }: ProfileCircleProps) {
  const router = useRouter();
  return (
    <div
      onClick={() => router.push(`/u/${id}`)}
      className="rounded-none overflow-hidden border-4 border-black z-20 cursor-pointer shadow-[6px_6px_0_0_rgba(255,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all duration-100 flex items-center justify-center bg-white"
      style={{ width: size, height: size }}
    >
      <Image
        src={src || "/placeholder.svg"}
        alt={alt}
        width={size}
        height={size}
        className="object-cover grayscale hover:grayscale-0 transition-all duration-300"
      />
    </div>
  );
}
