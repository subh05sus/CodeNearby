"use client"

import Link from "next/link"
import { useSession, signIn, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"

export default function Navbar() {
  const { data: session } = useSession()

  return (
    <nav className="border-b border-border">
      <div className="container mx-auto flex justify-between items-center py-4">
        <Link href="/" className="text-xl font-bold">
          GitHub Nearby
        </Link>
        <div className="space-x-2">
          <Button variant="ghost" asChild>
            <Link href="/connect">Connect</Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/search">Search</Link>
          </Button>
          {session ? (
            <>
              <Button variant="ghost" asChild>
                <Link href="/requests">Requests</Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link href="/messaging">Messages</Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link href="/profile">Profile</Link>
              </Button>
              <Button variant="outline" onClick={() => signOut()}>
                Sign Out
              </Button>
            </>
          ) : (
            <Button onClick={() => signIn("github")}>Sign In</Button>
          )}
        </div>
      </div>
    </nav>
  )
}

