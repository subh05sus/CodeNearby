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
      className="rounded-full overflow-hidden  border-2 border-white z-20 cursor-pointer"
      style={{ width: size, height: size }}
    >
      <Image
        src={src || "/placeholder.svg"}
        alt={alt}
        width={size}
        height={size}
        className="object-cover"
      />
    </div>
  );
}
