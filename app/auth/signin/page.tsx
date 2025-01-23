import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function SignIn() {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Sign In</CardTitle>
        </CardHeader>
        <CardContent>
          <Button className="w-full" variant="outline" asChild>
            <a href="/api/auth/signin/github">Continue with GitHub</a>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

