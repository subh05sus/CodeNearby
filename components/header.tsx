/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  ChevronDown,
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
  X,
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
import { cn } from "@/lib/utils";
import SwissButton from "./swiss/SwissButton";

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session } = useSession() as { data: Session | null };
  const [showSearch, setShowSearch] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
      `Hey! I'd like to invite you to join CodeNearby. Check it out!\n\n${window.location.origin
      }/invite${session?.user?.githubUsername
        ? `?ref=${session.user.githubUsername}`
        : ""
      }`
    );
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  const handleInviteUsersViaWhatsApp = () => {
    const text = encodeURIComponent(
      `Hey! Join me on CodeNearby: ${window.location.origin}/invite${session?.user?.githubUsername
        ? `?ref=${session.user.githubUsername}`
        : ""
      }`
    );
    window.open(`https://wa.me/?text=${text}`);
  };

  const handleInviteUsersViaLink = async () => {
    const link = `${window.location.origin}/invite${session?.user?.githubUsername ? `?ref=${session.user.githubUsername}` : ""
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
      navigator.clipboard
        .writeText(link)
        .then(() => {
          toast.success("Invite link copied to clipboard!");
        })
        .catch((err) => {
          console.error("Failed to copy link:", err);
        });
    }
  };

  const navItems = session ? [
    { href: "/ai-connect", label: "AI_CONNECT", icon: Sparkles, badge: "NEW" },
    { href: "/discover", label: "DISCOVER", icon: Globe },
    { href: "/feed", label: "FEED", icon: RssIcon },
    { href: "/gathering", label: "GATHERING", icon: Users },
    { href: "/requests", label: "REQUESTS", icon: Mail },
    { href: "/messages", label: "MESSAGES", icon: MessageSquare },
    { href: "/api-dashboard", label: "API", icon: Key },
  ] : [
    { href: "/about", label: "ABOUT" },
    { href: "/explore", label: "EXPLORE" },
  ] as Array<{ href: string; label: string; icon?: any; badge?: string }>;

  return (
    <>
      <header className={cn(
        "sticky top-0 z-50 bg-swiss-white border-b-8 border-swiss-black transition-all",
        pathname === "/" && "border-b-0"
      )}>
        <div className="max-w-7xl mx-auto px-6 h-24 flex justify-between items-center">
          <Link href="/" className="hover:opacity-80 transition-opacity">
            <Logo />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-8">
            <ul className="flex items-center gap-1">
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "px-4 py-2 text-xs font-black uppercase tracking-[0.2em] italic transition-all relative group",
                      pathname === item.href ? "text-swiss-red" : "text-swiss-black hover:text-swiss-red"
                    )}
                  >
                    {item.label}
                    {item.badge && (
                      <span className="absolute -top-1 -right-2 bg-swiss-red text-[8px] px-1 text-swiss-white italic font-black">
                        {item.badge}
                      </span>
                    )}
                    <div className={cn(
                      "absolute bottom-0 left-4 right-4 h-1 bg-swiss-red scale-x-0 group-hover:scale-x-100 transition-transform origin-left",
                      pathname === item.href && "scale-x-100"
                    )} />
                  </Link>
                </li>
              ))}
            </ul>

            <div className="flex items-center gap-4 border-l-4 border-swiss-black pl-8">
              <button
                onClick={() => setShowSearch(true)}
                className="p-2 hover:bg-swiss-black hover:text-swiss-white transition-colors"
                title="Search (Cmd+K)"
              >
                <Search className="h-6 w-6" />
              </button>

              {session ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center border-4 border-swiss-black p-1 hover:shadow-[4px_4px_0_0_rgba(255,0,0,1)] transition-all outline-none">
                      <Image
                        height={40}
                        width={40}
                        src={session.user.image || "/placeholder.svg"}
                        alt={session.user.name || ""}
                        className="w-10 h-10 grayscale object-cover"
                      />
                      <ChevronDown className="h-4 w-4 mx-2" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-64 bg-swiss-white border-4 border-swiss-black rounded-none shadow-[8px_8px_0_0_rgba(0,0,0,1)] p-0">
                    <DropdownMenuLabel className="p-6 border-b-4 border-swiss-black bg-swiss-black text-swiss-white">
                      <p className="text-xl font-black uppercase italic tracking-tighter leading-none">{session.user.name}</p>
                      <p className="text-[10px] font-bold uppercase tracking-widest opacity-60 mt-2">@{session.user.githubUsername}</p>
                    </DropdownMenuLabel>

                    <div className="p-2 space-y-1">
                      <DropdownMenuItem asChild className="p-4 focus:bg-swiss-black focus:text-swiss-white cursor-pointer rounded-none uppercase font-black text-xs italic tracking-widest outline-none">
                        <Link href="/profile"><User className="mr-3 h-4 w-4" /> PROFILE_NODE</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild className="p-4 focus:bg-swiss-black focus:text-swiss-white cursor-pointer rounded-none uppercase font-black text-xs italic tracking-widest outline-none">
                        <Link href="/messages"><MessagesSquare className="mr-3 h-4 w-4" /> COMMS_LINK</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild className="p-4 focus:bg-swiss-black focus:text-swiss-white cursor-pointer rounded-none uppercase font-black text-xs italic tracking-widest outline-none">
                        <Link href="/requests"><Users className="mr-3 h-4 w-4" /> PEER_REQUESTS</Link>
                      </DropdownMenuItem>

                      <DropdownMenuSeparator className="bg-swiss-black/10 h-1 mx-2" />

                      <DropdownMenuItem asChild className="p-4 focus:bg-swiss-black focus:text-swiss-white cursor-pointer rounded-none uppercase font-black text-xs italic tracking-widest outline-none">
                        <Link href="/api-dashboard"><Key className="mr-3 h-4 w-4" /> API_MASTER</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild className="p-4 focus:bg-swiss-black focus:text-swiss-white cursor-pointer rounded-none uppercase font-black text-xs italic tracking-widest outline-none">
                        <Link href="/upgrade"><Zap className="mr-3 h-4 w-4" /> UPGRADE_SYNC</Link>
                      </DropdownMenuItem>

                      <DropdownMenuSeparator className="bg-swiss-black/10 h-1 mx-2" />

                      <DropdownMenuSub>
                        <DropdownMenuSubTrigger className="p-4 focus:bg-swiss-black focus:text-swiss-white cursor-pointer rounded-none uppercase font-black text-xs italic tracking-widest outline-none">
                          {currentTheme === "dark" && <MoonIcon className="mr-3 h-4 w-4" />}
                          {currentTheme === "light" && <SunMediumIcon className="mr-3 h-4 w-4" />}
                          {currentTheme === "system" && <Monitor className="mr-3 h-4 w-4" />}
                          VISUAL_MODE
                        </DropdownMenuSubTrigger>
                        <DropdownMenuPortal>
                          <DropdownMenuSubContent className="bg-swiss-white border-4 border-swiss-black rounded-none shadow-[8px_8px_0_0_rgba(0,0,0,1)] p-2">
                            <DropdownMenuRadioGroup value={currentTheme} onValueChange={toggleMode}>
                              <DropdownMenuRadioItem value="light" className="p-3 font-black uppercase text-[10px] tracking-widest cursor-pointer hover:bg-swiss-black hover:text-swiss-white outline-none">LIGHT_ARRAY</DropdownMenuRadioItem>
                              <DropdownMenuRadioItem value="dark" className="p-3 font-black uppercase text-[10px] tracking-widest cursor-pointer hover:bg-swiss-black hover:text-swiss-white outline-none">VOID_DOMAIN</DropdownMenuRadioItem>
                              <DropdownMenuRadioItem value="system" className="p-3 font-black uppercase text-[10px] tracking-widest cursor-pointer hover:bg-swiss-black hover:text-swiss-white outline-none">SYSTEM_SYNC</DropdownMenuRadioItem>
                            </DropdownMenuRadioGroup>
                          </DropdownMenuSubContent>
                        </DropdownMenuPortal>
                      </DropdownMenuSub>

                      <DropdownMenuSeparator className="bg-swiss-black/10 h-1 mx-2" />

                      <DropdownMenuItem
                        onClick={() => signOut({ callbackUrl: "/" })}
                        className="p-4 focus:bg-swiss-red focus:text-swiss-white cursor-pointer rounded-none uppercase font-black text-xs italic tracking-widest text-swiss-red outline-none"
                      >
                        <LogOut className="mr-3 h-4 w-4" /> TERMINATE_UPLINK
                      </DropdownMenuItem>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <SwissButton variant="primary" onClick={() => signIn("github")}>
                  LOGIN_GITHUB
                </SwissButton>
              )}
            </div>
          </nav>

          {/* Mobile Menu Toggle */}
          <button
            className="lg:hidden p-2 border-4 border-swiss-black"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-8 w-8" /> : <Menu className="h-8 w-8" />}
          </button>
        </div>
      </header>

      {/* Mobile Menu Backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-swiss-black/95 backdrop-blur-xl z-[100] lg:hidden flex flex-col items-center justify-center p-12 text-center"
          onClick={() => setMobileMenuOpen(false)}
        >
          <ul className="space-y-8">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-5xl font-black uppercase tracking-tighter italic text-swiss-white hover:text-swiss-red transition-colors"
                >
                  {item.label}
                </Link>
              </li>
            ))}
            {!session && (
              <li>
                <button
                  onClick={() => signIn("github")}
                  className="text-5xl font-black uppercase tracking-tighter italic text-swiss-red"
                >
                  INITIALIZE_AUTH
                </button>
              </li>
            )}
            {session && (
              <li>
                <button
                  onClick={() => signOut()}
                  className="text-5xl font-black uppercase tracking-tighter italic text-swiss-red"
                >
                  TERMINATE_SESSION
                </button>
              </li>
            )}
          </ul>
        </div>
      )}

      {showSearch && (
        <SearchOverlay
          onClose={() => setShowSearch(false)}
          onSearch={handleSearch}
        />
      )}
    </>
  );
}
