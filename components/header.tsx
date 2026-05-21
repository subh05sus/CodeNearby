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
import { Menu } from "lucide-react";
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

  const handleInviteUsersViaEmail = () => {
    const subject = encodeURIComponent("Join me on CodeNearby");
    const body = encodeURIComponent(
      `Hey! I'd like to invite you to join CodeNearby. Check it out!\n\n${window.location.origin}/invite${
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
      } catch (error) {
        console.error("Error sharing:", error);
      }
    } else {
      navigator.clipboard.writeText(link).then(() => {
        toast.success("Invite link copied to clipboard!");
      }).catch((err) => {
        console.error("Failed to copy link:", err);
      });
    }
  };

  const isHome = pathname === "/";

  // Nav link style helper
  const navBtnVariant = (active: boolean) =>
    isHome && theme === "light" ? (active ? "secondary" : "ghost") : active ? "secondary" : "ghost";

  return (
    <header className={`${isHome ? "" : "border-b bg-background/95 backdrop-blur-sm"} sticky top-0 z-40`}>
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/">
          <Logo />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {session ? (
              <>
                {/* AI Connect */}
                <li>
                  <Button
                    variant="ghost"
                    asChild
                    size="sm"
                    className="xl:flex hidden items-center gap-1.5 rounded-xl"
                  >
                    <Link href="/ai-connect">
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>AI Connect</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-primary text-white font-bold ml-0.5">
                        NEW
                      </span>
                    </Link>
                  </Button>
                  <Button variant="ghost" size="icon" className="xl:hidden h-9 w-9 rounded-xl" asChild>
                    <Link href="/ai-connect"><Sparkles className="h-4 w-4" /></Link>
                  </Button>
                </li>

                {/* Discover */}
                <li>
                  <Button variant="ghost" size="sm" className="xl:flex hidden rounded-xl" asChild>
                    <Link href="/discover"><Globe className="h-3.5 w-3.5 mr-1.5" />Discover</Link>
                  </Button>
                  <Button variant="ghost" size="icon" className="xl:hidden h-9 w-9 rounded-xl" asChild>
                    <Link href="/discover"><Globe className="h-4 w-4" /></Link>
                  </Button>
                </li>

                {/* Feed */}
                <li>
                  <Button variant="ghost" size="sm" className="xl:flex hidden rounded-xl" asChild>
                    <Link href="/feed"><RssIcon className="h-3.5 w-3.5 mr-1.5" />Feed</Link>
                  </Button>
                  <Button variant="ghost" size="icon" className="xl:hidden h-9 w-9 rounded-xl" asChild>
                    <Link href="/feed"><RssIcon className="h-4 w-4" /></Link>
                  </Button>
                </li>

                {/* Gathering */}
                <li>
                  <Button variant="ghost" size="sm" className="xl:flex hidden rounded-xl" asChild>
                    <Link href="/gathering"><Users className="h-3.5 w-3.5 mr-1.5" />Gathering</Link>
                  </Button>
                  <Button variant="ghost" size="icon" className="xl:hidden h-9 w-9 rounded-xl" asChild>
                    <Link href="/gathering"><Users className="h-4 w-4" /></Link>
                  </Button>
                </li>

                {/* Requests */}
                <li>
                  <Button variant="ghost" size="sm" className="xl:flex hidden rounded-xl" asChild>
                    <Link href="/requests"><Mail className="h-3.5 w-3.5 mr-1.5" />Requests</Link>
                  </Button>
                  <Button variant="ghost" size="icon" className="xl:hidden h-9 w-9 rounded-xl" asChild>
                    <Link href="/requests"><Mail className="h-4 w-4" /></Link>
                  </Button>
                </li>

                {/* Messages */}
                <li>
                  <Button variant="ghost" size="sm" className="xl:flex hidden rounded-xl" asChild>
                    <Link href="/messages"><MessageSquare className="h-3.5 w-3.5 mr-1.5" />Messages</Link>
                  </Button>
                  <Button variant="ghost" size="icon" className="xl:hidden h-9 w-9 rounded-xl" asChild>
                    <Link href="/messages"><MessageSquare className="h-4 w-4" /></Link>
                  </Button>
                </li>

                {/* API */}
                <li>
                  <Button variant="ghost" size="sm" className="xl:flex hidden rounded-xl" asChild>
                    <Link href="/api-dashboard"><Key className="h-3.5 w-3.5 mr-1.5" />API</Link>
                  </Button>
                  <Button variant="ghost" size="icon" className="xl:hidden h-9 w-9 rounded-xl" asChild>
                    <Link href="/api-dashboard"><Key className="h-4 w-4" /></Link>
                  </Button>
                </li>

                {/* Search */}
                <li>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-xl h-9 px-3 gap-2 border-border/60 bg-background/70"
                    onClick={() => setShowSearch(true)}
                  >
                    <Search className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-muted-foreground text-xs hidden xl:inline">Search...</span>
                    <div className="hidden xl:flex items-center gap-0.5 ml-1 border rounded-lg px-1 py-0.5 bg-background text-muted-foreground text-[10px] font-mono">
                      <Command className="h-3 w-3" />K
                    </div>
                  </Button>
                </li>

                {/* User dropdown */}
                <li>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-xl h-9 pl-1.5 pr-2.5 gap-2 border-border/60"
                      >
                        <Image
                          height={24}
                          width={24}
                          src={session.user.image || "/placeholder.svg"}
                          alt={session.user.name || ""}
                          className="w-6 h-6 rounded-full ring-1 ring-border"
                        />
                        <span className="text-sm font-medium hidden xl:block max-w-[120px] truncate">
                          {session.user.name}
                        </span>
                        <ChevronDown className="h-3 w-3 text-muted-foreground" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56 rounded-2xl p-1.5" align="end">
                      <div className="px-2 py-2 mb-1">
                        <p className="text-sm font-semibold truncate">{session.user.name}</p>
                        <p className="text-xs text-muted-foreground font-mono truncate">
                          @{session.user.githubUsername}
                        </p>
                      </div>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild className="rounded-xl">
                        <Link href="/profile"><User className="h-4 w-4" /><span>Profile</span></Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild className="rounded-xl">
                        <Link href="/messages"><MessagesSquare className="h-4 w-4" /><span>Messages</span></Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild className="rounded-xl">
                        <Link href="/requests"><Users className="h-4 w-4" /><span>Requests</span></Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild className="rounded-xl">
                        <Link href="/api-dashboard">
                          <Key className="h-4 w-4" />
                          <span>API Dashboard</span>
                          <span className="ml-auto text-[9px] px-1.5 py-0.5 rounded-full bg-primary text-white font-bold">NEW</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild className="rounded-xl">
                        <Link href="/api-docs"><Book className="h-4 w-4" /><span>API Docs</span></Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild className="rounded-xl">
                        <Link href="/upgrade"><Zap className="h-4 w-4" /><span>Upgrade</span></Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuSub>
                        <DropdownMenuSubTrigger className="rounded-xl">
                          {currentTheme === "dark" && <MoonIcon className="h-4 w-4" />}
                          {currentTheme === "light" && <SunMediumIcon className="h-4 w-4" />}
                          {currentTheme === "system" && <Monitor className="h-4 w-4" />}
                          <span>Appearance</span>
                        </DropdownMenuSubTrigger>
                        <DropdownMenuPortal>
                          <DropdownMenuSubContent className="rounded-2xl">
                            <DropdownMenuRadioGroup value={currentTheme} onValueChange={toggleMode}>
                              <DropdownMenuRadioItem value="system" className="rounded-xl">
                                <Monitor className="h-4 w-4" /><span>System</span>
                              </DropdownMenuRadioItem>
                              <DropdownMenuRadioItem value="light" className="rounded-xl">
                                <SunMediumIcon className="h-4 w-4" /><span>Light</span>
                              </DropdownMenuRadioItem>
                              <DropdownMenuRadioItem value="dark" className="rounded-xl">
                                <MoonIcon className="h-4 w-4" /><span>Dark</span>
                              </DropdownMenuRadioItem>
                            </DropdownMenuRadioGroup>
                          </DropdownMenuSubContent>
                        </DropdownMenuPortal>
                      </DropdownMenuSub>
                      <DropdownMenuSub>
                        <DropdownMenuSubTrigger className="rounded-xl">
                          <UserPlus className="h-4 w-4" /><span>Invite users</span>
                        </DropdownMenuSubTrigger>
                        <DropdownMenuPortal>
                          <DropdownMenuSubContent className="rounded-2xl">
                            <DropdownMenuItem onClick={handleInviteUsersViaEmail} className="rounded-xl">
                              <Mail className="h-4 w-4" /><span>Email</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={handleInviteUsersViaWhatsApp} className="rounded-xl">
                              <MessageSquare className="h-4 w-4" /><span>WhatsApp</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={handleInviteUsersViaLink} className="rounded-xl">
                              <PlusCircle className="h-4 w-4" /><span>More...</span>
                            </DropdownMenuItem>
                          </DropdownMenuSubContent>
                        </DropdownMenuPortal>
                      </DropdownMenuSub>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => signOut({ callbackUrl: "/" })}
                        className="rounded-xl text-red-500 focus:text-red-500 focus:bg-red-50 dark:focus:bg-red-950/30"
                      >
                        <LogOut className="h-4 w-4" /><span>Log out</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Button variant="ghost" size="sm" className="rounded-xl" asChild>
                    <Link href="/about">About</Link>
                  </Button>
                </li>
                <li>
                  <Button variant="ghost" size="sm" className="rounded-xl" asChild>
                    <Link href="/explore">Explore</Link>
                  </Button>
                </li>
                <li>
                  <RainbowButton onClick={() => signIn("github")} className="text-secondary">
                    Login with GitHub
                  </RainbowButton>
                </li>
              </>
            )}
          </ul>
        </nav>

        {/* Mobile hamburger */}
        <div className="lg:hidden flex items-center gap-2">
          {session && (
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 rounded-xl border-border/60"
              onClick={() => setShowSearch(true)}
            >
              <Search className="h-4 w-4" />
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="h-9 w-9 rounded-xl border-border/60">
                <Menu className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52 rounded-2xl p-1.5">
              <DropdownMenuItem onSelect={() => router.push("/explore")} className="rounded-xl">
                Explore
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => router.push("/discover")} className="rounded-xl">
                Discover
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => router.push("/feed")} className="rounded-xl">
                Feed
              </DropdownMenuItem>
              {session ? (
                <>
                  <DropdownMenuItem onSelect={() => router.push("/ai-connect")} className="rounded-xl">
                    AI Connect
                    <span className="ml-auto text-[9px] px-1.5 py-0.5 rounded-full bg-primary text-white font-bold">NEW</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => router.push("/api-dashboard")} className="rounded-xl">
                    API Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => router.push("/gathering")} className="rounded-xl">
                    Gathering
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => router.push("/requests")} className="rounded-xl">
                    Requests
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => router.push("/messages")} className="rounded-xl">
                    Messages
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => router.push("/profile")} className="rounded-xl">
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={() => signOut()} className="rounded-xl text-red-500">
                    Logout
                  </DropdownMenuItem>
                </>
              ) : (
                <DropdownMenuItem onSelect={() => signIn("github")} className="rounded-xl">
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
  );
}
