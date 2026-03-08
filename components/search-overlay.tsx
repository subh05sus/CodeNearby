/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect, useRef } from "react";
import {
  Search,
  X,
  Home,
  Globe,
  Bell,
  MessageSquare,
  User,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import SwissCard from "./swiss/SwissCard";

interface SearchOverlayProps {
  onClose: () => void;
  onSearch: (query: string) => void;
}

interface NavigationItem {
  icon: React.ReactNode;
  label: string;
  shortcut: string;
  path: string;
}

export function SearchOverlay({ onClose, onSearch }: SearchOverlayProps) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const navigationItems: NavigationItem[] = [
    {
      icon: <Home className="h-5 w-5" />,
      label: "FEED_STREAM",
      shortcut: "F",
      path: "/feed",
    },
    {
      icon: <Globe className="h-5 w-5" />,
      label: "DISCOVER_NODES",
      shortcut: "D",
      path: "/discover",
    },
    {
      icon: <Bell className="h-5 w-5" />,
      label: "PEER_REQUESTS",
      shortcut: "R",
      path: "/requests",
    },
    {
      icon: <Users className="h-5 w-5" />,
      label: "GATHERING_LIST",
      shortcut: "G",
      path: "/gathering",
    },
    {
      icon: <MessageSquare className="h-5 w-5" />,
      label: "COMM_TERMINAL",
      shortcut: "M",
      path: "/messages",
    },
    {
      icon: <User className="h-5 w-5" />,
      label: "CORE_PROFILE",
      shortcut: "P",
      path: "/profile",
    },
  ];

  const filteredItems = navigationItems.filter((item) =>
    item.label.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    inputRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.altKey && e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < filteredItems.length - 1 ? prev + 1 : prev
        );
      } else if (e.altKey && e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (selectedIndex >= 0 && filteredItems.length > 0) {
          const selectedItem = filteredItems[selectedIndex];
          if (selectedItem) {
            router.push(selectedItem.path);
            onClose();
          }
        } else if (query.trim()) {
          router.push(`/search?q=${encodeURIComponent(query.trim())}`);
          onClose();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose, selectedIndex, router, query, filteredItems]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  return (
    <div className="fixed inset-0 z-[100] bg-swiss-black/90 backdrop-blur-md p-4 md:p-24">
      <div
        className="absolute inset-0 opacity-[0.05] pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '32px 32px' }}
      />

      <div className="max-w-3xl mx-auto relative h-full flex flex-col">
        <SwissCard className="p-0 border-8 border-swiss-black shadow-[16px_16px_0_0_rgba(255,0,0,1)] bg-swiss-white overflow-hidden flex flex-col h-fit max-h-full">
          {/* Search Input Area */}
          <div className="flex items-center p-8 border-b-8 border-swiss-black bg-swiss-black">
            <Search className="h-10 w-10 text-swiss-red mr-6 shrink-0" />
            <form onSubmit={handleSubmit} className="flex-1">
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="INITIALIZE_SEARCH_QUERY..."
                className="w-full bg-transparent text-4xl font-black uppercase tracking-tighter italic text-swiss-white placeholder:text-swiss-white/20 outline-none"
              />
            </form>
            <button
              onClick={onClose}
              className="ml-6 p-2 hover:bg-swiss-red text-swiss-white transition-colors border-4 border-swiss-white/10"
            >
              <X className="h-8 w-8" />
            </button>
          </div>

          {/* Results / Commands Area */}
          <div className="flex-1 overflow-y-auto bg-swiss-white p-4">
            <div className="space-y-2">
              <div className="px-4 py-2 text-[10px] font-black uppercase tracking-[0.4em] opacity-40 mb-2">
                SYSTEM_COMMANDS // {filteredItems.length}_FOUND
              </div>

              {filteredItems.map((item, index) => (
                <button
                  key={index}
                  onClick={() => {
                    router.push(item.path);
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={cn(
                    "flex w-full items-center justify-between p-6 transition-all border-4",
                    selectedIndex === index
                      ? "bg-swiss-black text-swiss-white border-swiss-black shadow-[8px_8px_0_0_rgba(255,0,0,1)] translate-x-1 -translate-y-1"
                      : "bg-transparent text-swiss-black border-transparent hover:bg-swiss-muted/30"
                  )}
                >
                  <div className="flex items-center gap-6">
                    <div className={cn(
                      "p-3 border-4 transition-colors",
                      selectedIndex === index ? "border-swiss-white bg-swiss-red" : "border-swiss-black bg-swiss-white"
                    )}>
                      {item.icon}
                    </div>
                    <span className="text-2xl font-black uppercase tracking-tight italic">
                      {item.label}
                    </span>
                  </div>

                  <div className="flex items-center gap-4">
                    <kbd className={cn(
                      "px-3 py-1 font-black text-xs border-4",
                      selectedIndex === index ? "border-swiss-white text-swiss-white" : "border-swiss-black text-swiss-black opacity-20"
                    )}>
                      {item.shortcut}
                    </kbd>
                  </div>
                </button>
              ))}

              {query && filteredItems.length === 0 && (
                <div className="p-12 text-center">
                  <p className="text-xl font-black uppercase  opacity-20 italic">
                    NO_MATCHING_COMMANDS_FOR: &quot;{query}&quot;
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Shortcuts Footer */}
          <div className="p-6 border-t-8 border-swiss-black bg-swiss-muted/50 flex flex-wrap gap-8 items-center justify-center">
            <div className="flex items-center gap-3">
              <kbd className="px-2 py-0.5 border-2 border-swiss-black text-[10px] font-black uppercase">ESC</kbd>
              <span className="text-[10px] font-black uppercase  opacity-40">TERMINATE</span>
            </div>
            <div className="flex items-center gap-3">
              <kbd className="px-2 py-0.5 border-2 border-swiss-black text-[10px] font-black uppercase">ENTER</kbd>
              <span className="text-[10px] font-black uppercase  opacity-40">EXECUTE</span>
            </div>
            <div className="flex items-center gap-3">
              <kbd className="px-2 py-0.5 border-2 border-swiss-black text-[10px] font-black uppercase">ALT + ↑↓</kbd>
              <span className="text-[10px] font-black uppercase  opacity-40">NAVIGATE</span>
            </div>
          </div>
        </SwissCard>
      </div>
    </div>
  );
}
