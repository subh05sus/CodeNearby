/* eslint-disable @typescript-eslint/no-explicit-any */
import GithubProvider from "next-auth/providers/github";
import { MongoDBAdapter } from "@next-auth/mongodb-adapter";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      image: string;
      githubUsername: string;
      githubId: string;
      friends: any[];
      githubLocation?: string;
      githubBio?: string;
      githubProfileUrl?: string;
    };
  }
}

export const authOptions = {
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID || "",
      clientSecret: process.env.GITHUB_SECRET || "",
      allowDangerousEmailAccountLinking: true,

      authorization: {
        params: {
          scope: "read:user user:email",
        },
      },
    }),
  ],
  callbacks: {
    async signIn({
      user,
      account,
      profile,
    }: {
      user: any;
      account: any | null;
      profile?: any;
    }) {
      if (account?.provider === "github" && profile) {
        const client = await clientPromise;
        const db = client.db();

        const existingUser = await db
          .collection("users")
          .findOne({ email: user.email });

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
            }
          );
        } else {
          // Create new user
          const result = await db.collection("users").insertOne({
            name: user.name,
            email: user.email,
            image: user.image,
            githubId: profile.id,
            githubUsername: profile.login,
            githubProfileUrl: profile.html_url,
            githubBio: profile.bio,
            githubLocation: profile.location,
            friends: [],
            onboardingCompleted: false,
          });

          // Add the user to the default gathering
          const userId = result.insertedId;
          const gatheringId = process.env.ALL_GATHERING_ID; // Default gathering ID

          // Update the gathering to add the user to participants
          if (gatheringId) {
            await db.collection("gatherings").updateOne(
              { _id: new ObjectId(gatheringId) },
              { $addToSet: { participants: userId } }
            );
          }
        }
      }
      return true;
    },
    async session({ session, user }: { session: any; user: any }) {
      if (session.user) {
        session.user.id = user.id;
        session.user.githubUsername = user.githubUsername;
        session.user.githubId = user.githubId;
        session.user.friends = user.friends || [];
        session.user.githubLocation = user.githubLocation;
        session.user.githubBio = user.githubBio;
        session.user.githubProfileUrl = user.githubProfileUrl;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  secret: process.env.NEXT_AUTH_SECRET,
};
