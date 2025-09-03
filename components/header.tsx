/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { signIn, signOut, useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  ChevronDown,
  ChevronUp,
  Command,
  Globe,
  LogOut,
  Mail,
  MessageSquare,
  MessagesSquare,
  Monitor,
  MoonIcon,
  PlusCircle,
  RssIcon,
  Search,
  Sparkles,
  SunMediumIcon,
  User,
  UserPlus,
  Users,
  Key,
  Book,
  Zap,
  Menu,
} from "lucide-react";
import { SearchOverlay } from "./search-overlay";
import Image from "next/image";
import type { Session } from "next-auth";
import { toast } from "sonner";

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
import { useTheme } from "next-themes";
import Logo from "./logo";
import { RainbowButton } from "./magicui/rainbowbutton";
import { AuroraText } from "./magicui/aurora-text";

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session } = useSession() as { data: Session | null };
  const [showSearch, setShowSearch] = useState(false);
  const { theme, setTheme } = useTheme();
  const [currentTheme, setCurrentTheme] = useState("system");

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

  // Invite helpers
  const handleInviteUsersViaEmail = () => {
    const subject = encodeURIComponent("Join me on CodeNearby");
    const body = encodeURIComponent(
      `Hey! I'd like to invite you to join CodeNearby. Check it out!\n\n${
        window.location.origin
      }/invite${
        session?.user?.githubUsername ? `?ref=${session.user.githubUsername}` : ""
      }`
    );
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  const handleInviteUsersViaWhatsApp = () => {
    const text = encodeURIComponent(
      `Hey! Join me on CodeNearby: ${window.location.origin}/invite${
        session?.user?.githubUsername ? `?ref=${session.user.githubUsername}` : ""
      }`
    );
    window.open(`https://wa.me/?text=${text}`);
  };

  const handleInviteUsersViaLink = async () => {
    const link = `${window.location.origin}/invite${
      session?.user?.githubUsername ? `?ref=${session.user.githubUsername}` : ""
    }`;
    if (navigator.share) {
      try {
        await navigator.share({ title: "Join CodeNearby", text: "Hey! Join me on CodeNearby", url: link });
      } catch {}
    } else {
      navigator.clipboard
        .writeText(link)
        .then(() => toast.success("Invite link copied to clipboard!"))
        .catch(() => {});
    }
  };

  return (
    <>
      <header
        className="sticky top-0 inset-x-0 z-50 h-16 bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b"
        // sticky keeps the header in flow so content won't slide underneath
      >
        <div className="container mx-auto px-4 h-16 flex justify-between items-center">
          {/* Logo */}
          <Link href="/">
            <Logo />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:block">
            <ul className="flex space-x-2 items-center">
              {session ? (
                <>
                  {/* AI Connect */}
                  <li>
                    <Button variant="ghost" asChild className="xl:block hidden">
                      <Link href="/ai-connect">
                        <AuroraText>AI Connect</AuroraText>
                        <span className="ml-1 text-[0.65rem] px-1 py-0.5 bg-orange-600 rounded-md text-white font-semibold">
                          NEW
                        </span>
                      </Link>
                    </Button>
                    <Button variant="ghost" asChild size="icon" className="xl:hidden flex">
                      <Link href="/ai-connect">
                        <Sparkles />
                      </Link>
                    </Button>
                  </li>

                  {/* Discover */}
                  <li>
                    <Button variant="ghost" asChild className="xl:block hidden">
                      <Link href="/discover">Discover</Link>
                    </Button>
                    <Button variant="ghost" asChild size="icon" className="xl:hidden flex">
                      <Link href="/discover">
                        <Globe />
                      </Link>
                    </Button>
                  </li>

                  {/* Feed */}
                  <li>
                    <Button variant="ghost" asChild className="xl:block hidden">
                      <Link href="/feed">Feed</Link>
                    </Button>
                    <Button variant="ghost" asChild size="icon" className="xl:hidden flex">
                      <Link href="/feed">
                        <RssIcon />
                      </Link>
                    </Button>
                  </li>

                  {/* Gathering */}
                  <li>
                    <Button variant="ghost" asChild className="xl:block hidden">
                      <Link href="/gathering">Gathering</Link>
                    </Button>
                    <Button variant="ghost" asChild size="icon" className="xl:hidden flex">
                      <Link href="/gathering">
                        <Users />
                      </Link>
                    </Button>
                  </li>

                  {/* Requests */}
                  <li>
                    <Button variant="ghost" asChild className="xl:block hidden">
                      <Link href="/requests">Requests</Link>
                    </Button>
                    <Button variant="ghost" asChild size="icon" className="xl:hidden flex">
                      <Link href="/requests">
                        <Mail />
                      </Link>
                    </Button>
                  </li>

                  {/* Messages */}
                  <li>
                    <Button variant="ghost" asChild className="xl:block hidden">
                      <Link href="/messages">Messages</Link>
                    </Button>
                    <Button variant="ghost" asChild size="icon" className="xl:hidden flex">
                      <Link href="/messages">
                        <MessageSquare />
                      </Link>
                    </Button>
                  </li>

                  {/* API */}
                  <li>
                    <Button variant="ghost" asChild className="xl:block hidden">
                      <Link href="/api-dashboard">API</Link>
                    </Button>
                    <Button variant="ghost" asChild size="icon" className="xl:hidden flex">
                      <Link href="/api-dashboard">
                        <Key />
                      </Link>
                    </Button>
                  </li>

                  {/* Search */}
                  <li>
                    <Button variant="outline" size="sm" className="px-1 py-[18px] rounded-lg" onClick={() => setShowSearch(true)}>
                      <Search className="h-5 w-5 ml-2" />
                      <span className="mx-4">Search</span>
                      <div className="border rounded-md p-1 flex items-center gap-1 bg-muted text-muted-foreground">
                        <Command className="h-5 w-5" /> K
                      </div>
                    </Button>
                  </li>

                  {/* User dropdown */}
                  <li>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="flex items-center gap-2 h-fit">
                          <Image
                            height={20}
                            width={20}
                            src={session.user.image || "/placeholder.svg"}
                            alt={session.user.name || ""}
                            className="w-8 h-8 rounded-full"
                          />
                          <div className="text-left">
                            <p className="text-sm">{session.user.name}</p>
                            <p className="text-xs text-muted-foreground">@{session.user.githubUsername}</p>
                          </div>
                          <div className="flex flex-col items-center">
                            <ChevronUp size={5} />
                            <ChevronDown size={5} />
                          </div>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-56">
                        <DropdownMenuLabel>My Account</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link href="/profile"><User /> <span>Profile</span></Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href="/messages"><MessagesSquare /> <span>Messages</span></Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href="/requests"><Users /> <span>Requests</span></Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link href="/api-dashboard"><Key /> <span>API Dashboard</span></Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href="/api-docs"><Book /> <span>API Docs</span></Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href="/upgrade"><Zap /> <span>Upgrade</span></Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {/* Appearance */}
                        <DropdownMenuSub>
                          <DropdownMenuSubTrigger>
                            {currentTheme === "dark" && <MoonIcon size={16} />}
                            {currentTheme === "light" && <SunMediumIcon size={16} />}
                            {currentTheme === "system" && <Monitor size={16} />}
                            <span>Appearance</span>
                          </DropdownMenuSubTrigger>
                          <DropdownMenuPortal>
                            <DropdownMenuSubContent>
                              <DropdownMenuRadioGroup value={currentTheme} onValueChange={toggleMode}>
                                <DropdownMenuRadioItem value="system"><Monitor size={16} /> <span>System</span></DropdownMenuRadioItem>
                                <DropdownMenuRadioItem value="light"><SunMediumIcon size={16} /> <span>Light</span></DropdownMenuRadioItem>
                                <DropdownMenuRadioItem value="dark"><MoonIcon size={16} /> <span>Dark</span></DropdownMenuRadioItem>
                              </DropdownMenuRadioGroup>
                            </DropdownMenuSubContent>
                          </DropdownMenuPortal>
                        </DropdownMenuSub>
                        {/* Invite */}
                        <DropdownMenuSub>
                          <DropdownMenuSubTrigger>
                            <UserPlus /> <span>Invite users</span>
                          </DropdownMenuSubTrigger>
                          <DropdownMenuPortal>
                            <DropdownMenuSubContent>
                              <DropdownMenuItem onClick={handleInviteUsersViaEmail}><Mail /> <span>Email</span></DropdownMenuItem>
                              <DropdownMenuItem onClick={handleInviteUsersViaWhatsApp}><MessageSquare /> <span>WhatsApp</span></DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={handleInviteUsersViaLink}><PlusCircle /> <span>More...</span></DropdownMenuItem>
                            </DropdownMenuSubContent>
                          </DropdownMenuPortal>
                        </DropdownMenuSub>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/" })}>
                          <LogOut /> <span>Log out</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <Button variant="ghost" asChild>
                      <Link href="/about">About</Link>
                    </Button>
                  </li>
                  <li>
                    <Button variant="ghost" asChild>
                      <Link href="/explore">Explore</Link>
                    </Button>
                  </li>
                  <li>
                    <RainbowButton onClick={() => signIn("github")}>
                      Login with GitHub
                    </RainbowButton>
                  </li>
                </>
              )}
            </ul>
          </nav>

          {/* Mobile Menu */}
          <div className="lg:hidden flex items-center space-x-2">
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
                    <DropdownMenuItem onSelect={() => router.push("/ai-connect")}>
                      AI Connect <span className="ml-1 text-[0.6rem] px-1 bg-orange-600 rounded-md text-white font-semibold">NEW</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => router.push("/api-dashboard")}>
                      API Dashboard
                    </DropdownMenuItem>
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
          <SearchOverlay onClose={() => setShowSearch(false)} onSearch={handleSearch} />
        )}
      </header>
    </>
  );
}
