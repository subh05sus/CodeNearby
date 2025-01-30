"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { signIn, signOut, useSession } from "next-auth/react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Command, Search } from "lucide-react"
import { SearchOverlay } from "./search-overlay"
import Image from "next/image"
import type { Session } from "next-auth"

export default function Header() {
  const router = useRouter()
  const { data: session } = useSession() as { data: Session | null }
  const [showSearch, setShowSearch] = useState(false)

  const handleSearch = (query: string) => {
    router.push(`/search?q=${encodeURIComponent(query)}`)
    setShowSearch(false)
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setShowSearch(true)
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [])

  return (
    <header className="border-b bg-background">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold">
          CodeNearby
        </Link>
        <nav>
          <ul className="flex space-x-4 items-center">
            <li>
              <Button variant="outline" size="sm" className="px-1 py-4" onClick={() => setShowSearch(true)}>
                <Search className="h-5 w-5 ml-2" />
                <span className="mx-4">Search</span>
                <div className="border rounded p-1 flex text-center items-center justify-center gap-1">
                  <Command className="h-5 w-5 inline-block" /> K
                </div>
              </Button>
            </li>
            <li>
              <Button variant="ghost" asChild>
                <Link href="/explore">Explore</Link>
              </Button>
            </li>
            <li>
              <Button variant="ghost" asChild>
                <Link href="/discover">Discover</Link>
              </Button>
            </li>
            <li>
              <Button variant="ghost" asChild>
                <Link href="/feed">Feed</Link>
              </Button>
            </li>
            {session ? (
              <>
                <li>
                  <Button variant="ghost" asChild>
                    <Link href="/requests">Requests</Link>
                  </Button>
                </li>
                <li>
                  <Button variant="ghost" asChild>
                    <Link href="/messages">Messages</Link>
                  </Button>
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

