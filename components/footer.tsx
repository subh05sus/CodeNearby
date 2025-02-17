import Link from "next/link";
import { ThemeSwitch } from "./ThemeSwitch";

export default function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-4">
            <Link href="/" className="font-semibold">
              CodeNearby
            </Link>
            <span className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} All rights reserved
            </span>
          </div>
          <div className="flex items-center space-x-6 mt-4 md:mt-0">
            <ThemeSwitch />
            <Link
              href="/about"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              About
            </Link>
            <Link
              href="/privacy"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Terms
            </Link>
            <Link
              href="/changelog"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Changelog
            </Link>
            <Link
              href="/report-issue"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Report an Issue
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
