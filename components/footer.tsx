import Link from "next/link";
import { ThemeSwitch } from "./ThemeSwitch";
import { githubUrl } from "@/consts/BASIC";
import Logo from "./logo";

export default function Footer() {
  const footerLinks = [
    { href: "/about", label: "ABOUT_CORE" },
    { href: "/contact", label: "CONTACT_SYNC" },
    { href: "/privacy", label: "PRIVACY_PROTOCOL" },
    { href: "/terms", label: "TERMS_OF_SERVICE" },
    { href: "/refunds", label: "REFUND_POLICY" },
    { href: "/report-issue", label: "REPORT_STASH" },
  ];

  return (
    <footer className="bg-swiss-white dark:bg-swiss-dark border-t-8 border-swiss-black dark:border-swiss-white py-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-start">

          {/* Logo + Info */}
          <div className="md:col-span-5 space-y-8">
            <Link
              href="/"
              className="inline-block hover:opacity-80 transition-opacity"
            >
              <Logo />
            </Link>

            <p className="text-sm font-bold uppercase tracking-widest leading-relaxed max-w-sm text-swiss-black dark:text-swiss-white">
              Connecting nodes in the local development cluster.
              Built for high-performance peer discovery.
            </p>

            <div className="flex items-center gap-6">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 text-swiss-black dark:text-swiss-white">
                © {new Date().getFullYear()} CODENEARBY_SYSTEMS
              </span>

              <ThemeSwitch />
            </div>
          </div>

          {/* Navigation */}
          <div className="md:col-span-7">
            <nav className="grid grid-cols-2 sm:grid-cols-3 gap-8">
              {footerLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-xs font-black uppercase tracking-[0.2em] italic 
                  text-swiss-black dark:text-swiss-white 
                  hover:text-swiss-red transition-colors"
                >
                  {link.label}
                </Link>
              ))}

              <a
                href={githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-black uppercase tracking-[0.2em] italic 
                text-swiss-black dark:text-swiss-white 
                hover:text-swiss-red transition-colors 
                flex items-center gap-2 group"
              >
                GITHUB_SRC
                <img
                  src="/github.svg"
                  alt="GitHub"
                  className="h-4 w-4 grayscale dark:invert group-hover:invert transition-all"
                />
              </a>
            </nav>
          </div>
        </div>
      </div>
    </footer>
  );
}