/* eslint-disable @typescript-eslint/no-explicit-any */
import GithubProvider from "next-auth/providers/github";
import { MongoDBAdapter } from "@next-auth/mongodb-adapter";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { sendEmail } from "@/lib/email/send";
import { WelcomeEmail } from "@/lib/email/templates/welcome";
import React from "react";
import { redis } from "@/lib/redis";

/**
 * Sign-in errors only show up as "?error=OAuthCallback" in the browser. The
 * real reason (e.g. GitHub's "incorrect_client_credentials") goes to the logs
 * and, so it can be read without the Vercel dashboard, the last 20 are kept in
 * Redis under "codenearby:auth:errors" for a week.
 */
async function recordAuthError(code: string, detail: Record<string, unknown>) {
  try {
    const entry = JSON.stringify({ code, ...detail, at: new Date().toISOString() });
    await redis.lpush("codenearby:auth:errors", entry);
    await redis.ltrim("codenearby:auth:errors", 0, 19);
    await redis.expire("codenearby:auth:errors", 60 * 60 * 24 * 7);
  } catch {
    // Logging must never break sign-in.
  }
}

function describe(metadata: any) {
  const err = metadata && "error" in metadata ? metadata.error : metadata;
  return {
    provider: metadata?.providerId,
    message: err?.message ?? metadata?.message,
    oauthError: err?.error,
    description: err?.error_description,
  };
}

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
      // The same code-for-token request next-auth makes, done directly. next-auth's
      // built-in exchange broke (it reports every failure as "no access token
      // provided"); this works and keeps GitHub's real reason when it fails.
      token: {
        url: "https://github.com/login/oauth/access_token",
        async request({ params, provider }: { params: any; provider: any }) {
          const res = await fetch("https://github.com/login/oauth/access_token", {
            method: "POST",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
              client_id: provider.clientId ?? "",
              client_secret: provider.clientSecret ?? "",
              code: params.code ?? "",
              redirect_uri: provider.callbackUrl,
            }),
          });
          const tokens = await res.json().catch(() => ({}));
          if (!res.ok || tokens.error || !tokens.access_token) {
            const reason = tokens.error ?? `HTTP ${res.status}`;
            await recordAuthError("GITHUB_TOKEN_EXCHANGE", {
              oauthError: reason,
              description: tokens.error_description,
            });
            throw new Error(
              `GitHub token exchange failed: ${reason}${tokens.error_description ? ` (${tokens.error_description})` : ""}`
            );
          }
          return { tokens };
        },
      },

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

          // Send welcome email to new user
          sendEmail({
            to: user.email,
            subject: "Welcome to CodeNearby 👋",
            react: React.createElement(WelcomeEmail, { name: user.name || user.email }),
          }).catch(console.error);

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

        // Update lastSeenAt at most once per hour to avoid excess writes
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        if (!user.lastSeenAt || new Date(user.lastSeenAt) < oneHourAgo) {
          const client = await clientPromise;
          client
            .db()
            .collection("users")
            .updateOne(
              { _id: new ObjectId(user.id) },
              { $set: { lastSeenAt: new Date() } }
            )
            .catch(console.error);
        }
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  // Same order as before: NEXT_AUTH_SECRET, then next-auth's own NEXTAUTH_SECRET.
  secret: process.env.NEXT_AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
  logger: {
    error(code: string, metadata: any) {
      console.error(`[next-auth][error][${code}]`, metadata);
      void recordAuthError(code, describe(metadata));
    },
    warn(code: string) {
      console.warn(`[next-auth][warn][${code}]`);
    },
  },
};
