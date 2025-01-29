/* eslint-disable @typescript-eslint/no-explicit-any */
import { default as NextAuth } from "next-auth/next"
import { authOptions } from "@/app/options"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name: string
      email: string
      image: string
      githubUsername: string
      githubId: string
      friends: any[]
      githubLocation?: string
      githubBio?: string
      githubProfileUrl?: string
      
    }
  }
}



const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }

