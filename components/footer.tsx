"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ThemeSwitch } from "./ThemeSwitch";
import { githubUrl } from "@/consts/BASIC";

export default function Footer() {
  const router = useRouter();
  return (
    <footer className="border-t border-muted-foreground/10 bg-background">
    <div className="container mx-auto px-4 py-6 md:py-8">
  <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-6 items-start">
          {/* Left: Brand */}
          <div className="flex flex-col md:items-start items-center text-center md:text-left">
            <Link href="/" className="text-2xl font-extrabold tracking-tight text-foreground">
              CodeNearby
            </Link>
            <span className="text-sm text-muted-foreground mt-1">
              © {new Date().getFullYear()} CodeNearby - All rights reserved
            </span>
            <p className="mt-2 max-w-sm text-xs text-muted-foreground hidden md:block">
              A friendly community for developers to discover projects, collaborate, and share ideas.
            </p>
          </div>

          {/* Middle: Navigation links */}
          <div className="flex justify-center">
            <ul className="grid grid-cols-2 sm:grid-cols-3 gap-y-2 gap-x-6 text-sm md:text-sm justify-items-start text-left">
              <li>
                <Link href="/about" className="text-muted-foreground hover:text-foreground hover:underline transition">
                  About
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-muted-foreground hover:text-foreground hover:underline transition">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-muted-foreground hover:text-foreground hover:underline transition">
                  Privacy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-muted-foreground hover:text-foreground hover:underline transition">
                  Terms
                </Link>
              </li>
              <li>
                <Link href="/refunds" className="text-muted-foreground hover:text-foreground hover:underline transition">
                  Refunds
                </Link>
              </li>
              <li>
                <Link href="/changelog" className="text-muted-foreground hover:text-foreground hover:underline transition">
                  Changelog
                </Link>
              </li>
            </ul>
          </div>

          {/* Right: Theme + Socials */}
          <div className="flex flex-col md:items-end items-center space-y-2">
            <div className="flex flex-wrap items-center justify-center md:justify-end gap-2 mb-1">
              <span className="sr-only">Follow CodeNearby</span>
              <a href={githubUrl} target="_blank" rel="noopener noreferrer" aria-label="CodeNearby on GitHub" className="p-1 rounded-md hover:bg-muted-foreground/8 transition">
                <img src="/github.svg" alt="GitHub" className="h-5 w-5 dark:invert" />
              </a>

              <a href="https://x.com/code_nearby" target="_blank" rel="noopener noreferrer" aria-label="CodeNearby on X (Twitter)" className="p-1 rounded-md hover:bg-muted-foreground/8 transition">
                <svg className="h-5 w-5 text-sky-500 dark:text-sky-400" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M22 5.92c-.64.28-1.33.46-2.05.55.74-.44 1.3-1.14 1.57-1.97-.69.41-1.46.71-2.28.87A3.5 3.5 0 0012.5 9c0 .27.03.53.09.78-2.91-.15-5.49-1.54-7.22-3.66-.3.52-.47 1.12-.47 1.76 0 1.22.62 2.29 1.57 2.92-.58-.02-1.12-.18-1.6-.44v.04c0 1.7 1.21 3.12 2.82 3.45-.3.08-.62.12-.95.12-.23 0-.45-.02-.66-.06.46 1.45 1.79 2.5 3.36 2.53A7.02 7.02 0 014 18.58a9.94 9.94 0 005.39 1.58c6.47 0 10.01-5.36 10.01-10.01v-.46c.69-.5 1.28-1.12 1.75-1.83-.64.28-1.33.46-2.05.55z" />
                </svg>
              </a>
              <a href="https://www.linkedin.com/company/codenearby" target="_blank" rel="noopener noreferrer" aria-label="CodeNearby on LinkedIn" className="p-1 rounded-md hover:bg-muted-foreground/8 transition">
                <svg className="h-5 w-5 text-muted-foreground" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M4.98 3.5C4.98 4.88 3.87 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1 4.98 2.12 4.98 3.5zM.5 8h4v14h-4V8zm7 0h3.6v2h.05c.5-.95 1.72-1.95 3.55-1.95C20.8 8.05 22 10 22 13.6V22h-4v-7.5c0-1.8-.03-4.1-2.5-4.1-2.5 0-2.88 1.95-2.88 4v7.6h-4V8z" />
                </svg>
              </a>
              <a href="https://www.instagram.com/CodeNearby" target="_blank" rel="noopener noreferrer" aria-label="CodeNearby on Instagram" className="p-1 rounded-md hover:bg-muted-foreground/8 transition">
                <svg className="h-5 w-5 text-pink-600 dark:text-pink-400" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.2" fill="none" />
                  <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.2" fill="none" />
                  <circle cx="17.5" cy="6.5" r="0.7" fill="currentColor" />
                </svg>
              </a>
            </div>

            <div className="p-0.5 rounded-md bg-muted-foreground/6 mt-0.5">
              <ThemeSwitch />
            </div>

            <button
              type="button"
              onClick={() => router.push('/report-issue')}
              className="inline-flex items-center gap-2 px-2 py-1 rounded-md text-sm text-muted-foreground border border-muted-foreground/12 hover:border-muted-foreground/20 hover:bg-muted-foreground/2 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Report an issue"
            >
              Report an Issue
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
