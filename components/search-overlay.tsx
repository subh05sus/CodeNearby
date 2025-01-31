/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Search,
  X,
  Home,
  Globe,
  Bell,
  MessageSquare,
  User,
  Command,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

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
      label: "Go to Feed",
      shortcut: "F",
      path: "/feed",
    },
    {
      icon: <Globe className="h-5 w-5" />,
      label: "Discover",
      shortcut: "D",
      path: "/discover",
    },
    {
      icon: <Bell className="h-5 w-5" />,
      label: "View Requests",
      shortcut: "R",
      path: "/requests",
    },
    {
      icon: <MessageSquare className="h-5 w-5" />,
      label: "Open Messages",
      shortcut: "M",
      path: "/messages",
    },
    {
      icon: <User className="h-5 w-5" />,
      label: "Your Profile",
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
      } else if (
        (e.metaKey || e.ctrlKey) &&
        navigationItems.some(
          (item) => item.shortcut.toLowerCase() === e.key.toLowerCase()
        )
      ) {
        e.preventDefault();
        const item = navigationItems.find(
          (item) => item.shortcut.toLowerCase() === e.key.toLowerCase()
        );
        if (item) {
          router.push(item.path);
          onClose();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose, selectedIndex, router, navigationItems, query, filteredItems]);

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
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
      <div className="fixed inset-x-0 top-4 mx-auto max-w-2xl overflow-hidden rounded-xl border bg-background shadow-2xl">
        <div className="flex items-center w-full p-4">
          <Search className="mr-2 h-5 w-5 shrink-0 text-muted-foreground" />
          <form onSubmit={handleSubmit} className="flex-1">
            <Input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for commands..."
              className="w-full border-0 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-0"
            />
          </form>
          <Button
            onClick={onClose}
            variant="ghost"
            className="shrink-0 text-muted-foreground hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        <div className="border-t" />
        <div className="max-h-[60vh] overflow-y-auto px-2 pb-0">
          {filteredItems.map((item, index) => (
            <button
              key={index}
              onClick={() => {
                router.push(item.path);
                onClose();
              }}
              onMouseEnter={() => setSelectedIndex(index)}
              className={cn(
                "flex w-full my-1.5 items-center justify-between rounded-lg px-3 py-2 text-sm text-foreground transition-colors",
                selectedIndex === index
                  ? "bg-accent text-accent-foreground"
                  : "hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <div className="flex items-center gap-3">
                {item.icon}
                <span>{item.label}</span>
              </div>
              <div className="flex items-center gap-2">
                <kbd
                  className={cn(
                    "hidden rounded px-1.5 py-0.5 text-xs font-medium sm:inline-block",
                    selectedIndex === index
                      ? "bg-accent-foreground/10 text-accent-foreground"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  <Command className="h-3 w-3 inline-block mr-1" />{" "}
                  {item.shortcut}
                </kbd>
              </div>
            </button>
          ))}
        </div>
        <div className="border-t p-2">
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <kbd className="rounded bg-muted px-1.5 py-0.5 text-xs font-medium">
                alt
              </kbd>
              <span>+</span>
              <kbd className="rounded bg-muted px-1.5 py-0.5 text-xs font-medium">
                ↑
              </kbd>
              <span>/</span>
              <kbd className="rounded bg-muted px-1.5 py-0.5 text-xs font-medium">
                ↓
              </kbd>
              <span className="hidden sm:inline">to navigate</span>
            </div>
            <div className="flex items-center gap-1">
              <kbd className="rounded bg-muted px-1.5 py-0.5 text-xs font-medium">
                enter
              </kbd>
              <span className="hidden sm:inline">to select</span>
            </div>
            <div className="flex items-center gap-1">
              <kbd className="rounded bg-muted px-1.5 py-0.5 text-xs font-medium">
                esc
              </kbd>
              <span className="hidden sm:inline">to close</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
