import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function AuthError() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="w-[420px]">
        <CardHeader>
          <CardTitle>Authentication Error</CardTitle>
          <CardDescription>
            There was a problem authenticating with GitHub.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">
            This could be due to:
            <ul className="list-disc pl-4 mt-2">
              <li>Invalid or expired credentials</li>
              <li>Missing permissions</li>
              <li>Server configuration issues</li>
            </ul>
          </p>
          <Button asChild>
            <Link href="/">
              Try Again
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

