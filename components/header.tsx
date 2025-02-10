"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { signIn, signOut, useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronDown,
  ChevronUp,
  Command,
  LogOut,
  Mail,
  MessageSquare,
  MessagesSquare,
  Monitor,
  MoonIcon,
  PlusCircle,
  Search,
  Sticker,
  SunMediumIcon,
  User,
  UserPlus,
  Users,
} from "lucide-react";
import { SearchOverlay } from "./search-overlay";
import Image from "next/image";
import type { Session } from "next-auth";
// import { ThemeToggle } from "./theme-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu } from "lucide-react";
import { useTheme } from "next-themes";
import { useToast } from "./ui/use-toast";

const modes = ["system", "light", "dark"];

export default function Header() {
  const router = useRouter();
  const { data: session } = useSession() as { data: Session | null };
  const [showSearch, setShowSearch] = useState(false);
  const { theme, setTheme } = useTheme();
  const [currentTheme, setCurrentTheme] = useState("system");
  const { toast } = useToast();

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

  useEffect(() => {
    setCurrentTheme(theme || "system");
  }, [theme]);

  const toggleMode = (value: any) => {
    setCurrentTheme(value);
    setTheme(value);
  };

  // Add these functions before the return statement in the Header component
  const handleInviteUsersViaEmail = () => {
    // Create a mailto link with pre-filled content
    const subject = encodeURIComponent("Join me on CodeNearby");
    const body = encodeURIComponent(
      `Hey! I'd like to invite you to join CodeNearby. Check it out!\n\nhttps://codenearby.com/invite${
        session?.user?.githubUsername
          ? `?ref=${session.user.githubUsername}`
          : ""
      }`
    );
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  const handleInviteUsersViaWhatsApp = () => {
    // Create a WhatsApp share link
    const text = encodeURIComponent(
      `Hey! Join me on CodeNearby: https://codenearby.com/invite${
        session?.user?.githubUsername
          ? `?ref=${session.user.githubUsername}`
          : ""
      }`
    );
    window.open(`https://wa.me/?text=${text}`);
  };

  const handleInviteUsersViaLink = async () => {
    const link = `https://codenearby.com/invite${
      session?.user?.githubUsername ? `?ref=${session.user.githubUsername}` : ""
    }`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Join CodeNearby",
          text: "Hey! Join me on CodeNearby",
          url: link,
        });
      } catch (error) {
        console.error("Error sharing:", error);
      }
    } else {
      // Fallback to clipboard
      navigator.clipboard
        .writeText(link)
        .then(() => {
          toast({
            title: "Success",
            description: "Invite link copied to clipboard!",
          });
        })
        .catch((err) => {
          console.error("Failed to copy link:", err);
        });
    }
  };

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
                className="px-1 py-4 rounded-lg"
                onClick={() => setShowSearch(true)}
              >
                <Search className="h-5 w-5 ml-2" />
                <span className="mx-4">Search</span>
                <div className="border rounded-md p-1 flex text-center items-center justify-center gap-1 bg-muted text-muted-foreground">
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
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        className="flex items-center gap-2 h-fit"
                      >
                        <Image
                          height={20}
                          width={20}
                          src={session.user.image || "/placeholder.svg"}
                          alt={session.user.name || ""}
                          className="w-8 h-8 rounded-full"
                        />
                        <div className="text-left">
                          <p className="text-sm">{session.user.name}</p>
                          <p className="text-xs text-muted-foreground">
                            @{session.user.githubUsername}
                          </p>
                        </div>
                        <div className="flex  flex-col items-center">
                          <ChevronUp size={5} />
                          <ChevronDown size={5} />
                        </div>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56">
                      <DropdownMenuLabel>My Account</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {/* profile */}
                      <DropdownMenuItem asChild>
                        <Link href="/profile">
                          <User />
                          <span>Profile</span>
                        </Link>
                      </DropdownMenuItem>
                      {/* messages */}
                      <DropdownMenuItem asChild>
                        <Link href="/messages">
                          <MessagesSquare />
                          <span>Messages</span>
                        </Link>
                      </DropdownMenuItem>
                      {/* Requests */}
                      <DropdownMenuItem asChild>
                        <Link href="/requests">
                          <Users />
                          <span>Requests</span>
                        </Link>
                      </DropdownMenuItem>

                      {/* Projects */}

                      {/* Edit Profile */}

                      {/* apperance */}
                      <DropdownMenuSeparator />
                      <DropdownMenuSub>
                        <DropdownMenuSubTrigger>
                          <UserPlus />
                          <span>Appearance</span>
                        </DropdownMenuSubTrigger>
                        <DropdownMenuPortal>
                          <DropdownMenuSubContent>
                            <DropdownMenuRadioGroup
                              value={currentTheme}
                              onValueChange={toggleMode}
                            >
                              <DropdownMenuRadioItem
                                value="system"
                                className="flex items-center gap-2"
                              >
                                <Monitor size={16} />
                                <span>Systen</span>
                              </DropdownMenuRadioItem>
                              <DropdownMenuRadioItem
                                value="light"
                                className="flex items-center gap-2"
                              >
                                <SunMediumIcon size={16} />
                                <span>Light</span>
                              </DropdownMenuRadioItem>
                              <DropdownMenuRadioItem
                                value="dark"
                                className="flex items-center gap-2"
                              >
                                <MoonIcon size={16} />
                                <span>Dark</span>
                              </DropdownMenuRadioItem>
                            </DropdownMenuRadioGroup>
                          </DropdownMenuSubContent>
                        </DropdownMenuPortal>
                      </DropdownMenuSub>
                      {/* invite */}
                      <DropdownMenuSub>
                        <DropdownMenuSubTrigger>
                          <UserPlus />
                          <span>Invite users</span>
                        </DropdownMenuSubTrigger>
                        <DropdownMenuPortal>
                          <DropdownMenuSubContent>
                            <DropdownMenuItem
                              onClick={handleInviteUsersViaEmail}
                            >
                              <Mail />
                              <span>Email</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={handleInviteUsersViaWhatsApp}
                            >
                              <MessageSquare />
                              <span>WhatsApp</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={handleInviteUsersViaLink}
                            >
                              <PlusCircle />
                              <span>More...</span>
                            </DropdownMenuItem>
                          </DropdownMenuSubContent>
                        </DropdownMenuPortal>
                      </DropdownMenuSub>
                      {/* sign out */}
                      <DropdownMenuSeparator />

                      <DropdownMenuItem onClick={() => signOut()}>
                        <LogOut />
                        <span>Log out</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </li>
                {/* <li>
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
                </li> */}
              </>
            ) : (
              <li>
                <Button variant="secondary" onClick={() => signIn("github")}>
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
                  <DropdownMenuItem onSelect={() => router.push("/gathering")}>
                    Gathering
                  </DropdownMenuItem>
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
