import "./globals.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import Header from "@/components/header"
import { NextAuthProvider } from "@/components/providers"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "CodeNearby",
  description: "Find GitHub developers near you",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <NextAuthProvider>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
            <Header />
            <main className="container mx-auto px-4 py-8">{children}</main>
          </ThemeProvider>
        </NextAuthProvider>
      </body>
    </html>
  )
}

