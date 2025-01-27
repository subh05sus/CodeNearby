/* eslint-disable @typescript-eslint/no-explicit-any */
// import NextAuth from "next-auth"

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

  interface User {
    id: string
    name: string
    email: string
    image: string
    githubId: string
    githubUsername: string
    githubProfileUrl: string
    githubBio?: string
    githubLocation?: string
    friends: any[]
  }
}

