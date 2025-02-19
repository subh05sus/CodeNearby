import "./globals.css";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import Header from "@/components/header";
import { NextAuthProvider } from "@/components/providers";
import Footer from "@/components/footer";
import type { Metadata } from "next";
import { Toaster } from "@/components/ui/sonner";
import { Analytics } from "@vercel/analytics/next";

const inter = Inter({ subsets: ["latin"] });
export const metadata: Metadata = {
  metadataBase: new URL("https://codenearby.space"),

  title: "CodeNearby",
  description:
    "Find developers near you, share ideas, and build something awesome together.",
  authors: {
    name: "Subhadip Saha",
  },

  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-16x16.png", type: "image/png", sizes: "16x16" },
      { url: "/favicon-32x32.png", type: "image/png", sizes: "32x32" },
      {
        url: "/android-chrome-192x192.png",
        type: "image/png",
        sizes: "192x192",
      },
      {
        url: "/android-chrome-512x512.png",
        type: "image/png",
        sizes: "512x512",
      },
    ],
    apple: "/apple-touch-icon.png",
  },

  manifest: "/site.webmanifest",

  openGraph: {
    title: "CodeNearby",
    description:
      "Find developers near you, share ideas, and build something awesome together.",
    url: "https://codenearby.space",
    siteName: "CodeNearby",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "CodeNearby - Discover Developers Near You",
      },
      {
        url: "/logo.png",
        width: 500,
        height: 500,
        alt: "CodeNearby Logo",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CodeNearby",
    description:
      "Find developers near you, share ideas, and build something awesome together.",
    images: "/og.png",
    creator: "@SubhadipDev",
    site: "@SubhadipDev",
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },

  keywords: [
    "codenearby",
    "code nearby",
    "codenearby.space",
    "Subhadip Saha",
    "connect with developers",
    "find developers near me",
    "social media for developers",
    "developer networking",
    "programming community",
    "developer social network",
    "coding meetups",
    "software engineers network",
    "join coding communities",
    "local developer meetups",
    "find coding partners",
    "developer collaboration",
    "remote coding partners",
    "best networking site for developers",
    "find programmers online",
    "connect with software engineers",
    "developer platform for startups",
    "find coding groups online",
    "free developer networking site",
    "discover programmers near me",
    "best platform for coding partners",
    "tech community for developers",
    "meet developers worldwide",
    "swipe to find coding partners",
    "developer swipe matchmaking",
    "Tinder for developers",
    "feed for developers",
    "chat with developers",
    "developer messaging platform",
    "create developer gatherings",
    "host coding events online",
    "anonymous developer meetups",
    "GitHub activity tracking",
    "explore GitHub-connected developers",
    "join developer discussion threads",
    "share programming knowledge",
    "networking app for programmers",
    "coding events and hackathons",
    "build your developer network",
  ],

  alternates: {
    canonical: "https://codenearby.space",
  },
  other: {
    "application/ld+json": JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Product",
      name: "CodeNearby",
      url: "https://codenearby.space",
      image: "https://codenearby.space/logo.png",
      description:
        "Find and connect with developers nearby. Network and grow your career with CodeNearby.",
      author: {
        "@type": "Person",
        name: "Subhadip Saha",
        sameAs: [
          "https://twitter.com/SubhadipDev",
          "https://github.com/subh05sus",
        ],
      },
    }),
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <NextAuthProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <Header />
            <main className="flex-1 container mx-auto px-4 py-8 min-h-[calc(100vh-9rem)]">
              {children}
            </main>
            <Footer />
            <Analytics />

            <Toaster richColors position="bottom-right" closeButton />
          </ThemeProvider>
        </NextAuthProvider>
      </body>
    </html>
  );
}
