"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { signIn, signOut, useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Command, Search } from "lucide-react";
import { SearchOverlay } from "./search-overlay";
import Image from "next/image";
import type { Session } from "next-auth";
// import { ThemeToggle } from "./theme-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu } from "lucide-react";
// import { ThemeSwitch } from "./ThemeSwitch";

export default function Header() {
  const router = useRouter();
  const { data: session } = useSession() as { data: Session | null };
  const [showSearch, setShowSearch] = useState(false);

  const handleSearch = (query: string) => {
    router.push(`/search?q=${encodeURIComponent(query)}`);
    setShowSearch(false);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setShowSearch(true);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <header className="border-b bg-background">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold">
          CodeNearby
        </Link>
        <nav className="hidden md:block">
          <ul className="flex space-x-3 items-center">
            {/* <li> */}
            {/* <ThemeToggle /> */}
            {/* <ThemeSwitch /> */}
            {/* </li> */}
            <li>
              <Button
                variant="outline"
                size="sm"
                className="px-1 py-4"
                onClick={() => setShowSearch(true)}
              >
                <Search className="h-5 w-5 ml-2" />
                <span className="mx-4">Search</span>
                <div className="border rounded p-1 flex text-center items-center justify-center gap-1">
                  <Command className="h-5 w-5 inline-block" /> K
                </div>
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
                    <Link href="/gathering">Gathering</Link>
                  </Button>
                </li>
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
        <div className="md:hidden flex items-center space-x-2">
          {/* <ThemeToggle /> */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => setShowSearch(true)}>
                <Search className="mr-2 h-4 w-4" />
                <span>Search</span>
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => router.push("/explore")}>
                Explore
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => router.push("/discover")}>
                Discover
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => router.push("/feed")}>
                Feed
              </DropdownMenuItem>
              {session ? (
                <>
                  <DropdownMenuItem onSelect={() => router.push("/requests")}>
                    Requests
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => router.push("/messages")}>
                    Messages
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => router.push("/profile")}>
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={() => signOut()}>
                    Logout
                  </DropdownMenuItem>
                </>
              ) : (
                <DropdownMenuItem onSelect={() => signIn("github")}>
                  Login with GitHub
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      {showSearch && (
        <SearchOverlay
          onClose={() => setShowSearch(false)}
          onSearch={handleSearch}
        />
      )}
    </header>
  );
}
