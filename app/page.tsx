import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-4xl font-bold mb-6">Welcome to CodeNearby</h1>
      <p className="text-xl mb-8 text-center">Discover GitHub developers in your area or search for specific users.</p>
      <div className="space-x-4">
        <Button asChild>
          <Link href="/explore">Explore Nearby</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/search">Search Users</Link>
        </Button>
      </div>
    </div>
  )
}

