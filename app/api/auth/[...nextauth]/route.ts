/* eslint-disable @typescript-eslint/no-explicit-any */
import { default as NextAuth } from "next-auth/next"
import GithubProvider from "next-auth/providers/github"
import { MongoDBAdapter } from "@next-auth/mongodb-adapter"
import clientPromise from "@/lib/mongodb"

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
    }
  }
}

export const authOptions = {
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID || "",
      clientSecret: process.env.GITHUB_SECRET || "",
      authorization: {
        params: {
          scope: "read:user user:email",
        },
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }: { user: any; account: any | null; profile?: any }) {
      if (account?.provider === "github" && profile) {
        const client = await clientPromise
        const db = client.db()

        const existingUser = await db.collection("users").findOne({ email: user.email })

        if (existingUser) {
          // Update existing user
          await db.collection("users").updateOne(
            { email: user.email },
            {
              $set: {
                name: user.name,
                email: user.email,
                image: user.image,
                githubId: profile.id,
                githubUsername: profile.login,
                githubProfileUrl: profile.html_url,
                githubBio: profile.bio,
                githubLocation: profile.location,
              },
            },
          )
        } else {
          // Create new user
          await db.collection("users").insertOne({
            name: user.name,
            email: user.email,
            image: user.image,
            githubId: profile.id,
            githubUsername: profile.login,
            githubProfileUrl: profile.html_url,
            githubBio: profile.bio,
            githubLocation: profile.location,
            friends: [],
          })
        }
      }
      return true
    },
    async session({ session, user }: { session: any; user: any }) {
      if (session.user) {
        session.user.id = user.id
        session.user.githubUsername = user.githubUsername
        session.user.githubId = user.githubId
        session.user.friends = user.friends || []
      }
      return session
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }

