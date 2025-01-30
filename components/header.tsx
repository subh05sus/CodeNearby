"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { signIn, signOut, useSession } from "next-auth/react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Search } from "lucide-react"
import { SearchOverlay } from "./search-overlay"
import Image from "next/image"
import { Session } from "next-auth"

export default function Header() {
  const router = useRouter()
  const { data: session } = useSession() as { data: Session | null }
  const [showSearch, setShowSearch] = useState(false)

  const handleSearch = (query: string) => {
    router.push(`/search?q=${encodeURIComponent(query)}`)
    setShowSearch(false)
  }

  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold">
          CodeNearby
        </Link>
        <nav>
          <ul className="flex space-x-4 items-center">
            <li>
              <Button variant="ghost" size="icon" onClick={() => setShowSearch(true)}>
                <Search className="h-5 w-5" />
              </Button>
            </li>
            <li>
              <Link href="/explore">Explore</Link>
            </li>
            <li>
              <Link href="/discover">Discover</Link>
            </li>
            <li>
              <Link href="/feed">Feed</Link>
            </li>
            {session ? (
              <>
                <li>
                  <Link href="/requests">Requests</Link>
                </li>
                <li>
                  <Link href="/messages">Messages</Link>
                </li>
                <li>
                  <Link href="/profile">
                    <Image
                    height={32}
                    width={32}
                      src={session.user.image || "/placeholder.svg"}
                      alt={session.user.name || ""}
                      className="w-8 h-8 rounded-full"
                    />
                  </Link>
                </li>
                <li>
                  <Button variant="outline" onClick={() => signOut()}>
                    Logout
                  </Button>
                </li>
              </>
            ) : (
              <li>
                <Button variant="outline" onClick={() => signIn("github")}>
                  Login with GitHub
                </Button>
              </li>
            )}
          </ul>
        </nav>
      </div>
      {showSearch && <SearchOverlay onClose={() => setShowSearch(false)} onSearch={handleSearch} />}
    </header>
  )
}

