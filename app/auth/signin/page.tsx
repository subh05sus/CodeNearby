import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import AnimatedNetworkBackground from "@/components/ui/animated-network-background"

export default function SignIn() {
  return (
    <div className="relative min-h-screen flex items-center justify-center">
      <AnimatedNetworkBackground />
      <Card className="w-full max-w-md relative z-10">
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

