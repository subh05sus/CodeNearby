"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Spotlight } from "@/components/ui/spotlight-new";
import { LineShadowText } from "@/components/magicui/LineShadowText";
import { useTheme } from "next-themes";
import { HomeIcon, ArrowRight } from "lucide-react";

export default function NotFound() {
  const { resolvedTheme } = useTheme();
  const shadowColor = resolvedTheme === "dark" ? "white" : "black";

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100dvh-250px)] py-12 px-4">
      <div className="absolute top-0 right-0 w-full -z-50">
        <div className="h-[40rem] w-full rounded-md -z-50 flex md:items-center md:justify-center antialiased dark:bg-transparent bg-dot-black/[0.5] relative overflow-hidden">
          <Spotlight />
          <div className="absolute bottom-0 left-0 w-full right-0 h-96 bg-gradient-to-t from-white to-transparent dark:bg-transparent dark:hidden" />
        </div>
      </div>

      <Card className="border-primary/10 shadow-lg w-full max-w-2xl">
        <CardContent className="flex flex-col items-center p-8 text-center">
          <LineShadowText
            className="italic mx-2 text-nowrap text-9xl font-bold text-primary mb-2"
            shadowColor={shadowColor}
          >
            404
          </LineShadowText>

          <h2 className="text-2xl md:text-3xl font-semibold mb-6 text-nowrap">
            Page Not Found
          </h2>

          <p className="text-muted-foreground mb-8 max-w-md">
            Oops! The page you&apos;re looking for doesn&apos;t exist or has
            been moved.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button asChild>
              <Link href="/">
                <HomeIcon className="mr-2 h-4 w-4" />
                Back to Home
              </Link>
            </Button>

            <Button variant="outline" asChild>
              <Link href="/explore">
                Explore
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
