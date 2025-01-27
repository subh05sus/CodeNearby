"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { signIn, signOut, useSession } from "next-auth/react"
import Image from "next/image"

export default function Header() {
  const { data: session } = useSession()

  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold">
          CodeNearby
        </Link>
        <nav>
          <ul className="flex space-x-4 items-center">
            <li>
              <Link href="/explore">Explore</Link>
            </li>
            <li>
              <Link href="/search">Search</Link>
            </li>
            <li>
              <Link href="/connect">Connect</Link>
            </li>
            {session ? (
              <>
                <li>
                  <Link href="/requests">Requests</Link>
                </li>
                <li>
                  <Link href="/profile">
                    <Image
                      src={session?.user?.image || "/placeholder.svg"}
                      alt={session?.user?.name || ""}
                      className="w-8 h-8 rounded-full"
                      width={32}
                      height={32}
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
    </header>
  )
}

