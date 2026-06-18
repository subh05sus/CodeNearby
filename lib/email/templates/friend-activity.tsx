import React from "react";
import { Section, Text, Button } from "@react-email/components";
import { EmailLayout, colors, APP_URL } from "./_layout";

interface TrendingPost {
  title?: string;
  authorName: string;
  votes: number;
}

interface FriendActivityEmailProps {
  userName: string;
  daysSince: number;
  trendingPosts?: TrendingPost[];
  variant?: number;
}

type VariantDef = {
  subject: (firstName: string, daysSince: number) => string;
  preview: (firstName: string, daysSince: number) => string;
  headline: (firstName: string, daysSince: number) => string;
  body: (firstName: string, daysSince: number) => string;
  cta: string;
  showPosts: boolean;
};

export const VARIANTS: VariantDef[] = [
  {
    subject: (firstName) => `${firstName} thinks you ghosted them`,
    preview: () => "your network is wondering where you went.",
    headline: () => "Your network thinks you left.",
    body: (_f, daysSince) =>
      `${daysSince} day${daysSince !== 1 ? "s" : ""} of posts. Your friends showed up. You didn't. We told them you were busy. They gave us a look.`,
    cta: "Stop ghosting →",
    showPosts: false,
  },
  {
    subject: () => `the group chat went off. you weren't in it.`,
    preview: () => "a lot happened. you missed all of it.",
    headline: (_f, daysSince) => `${daysSince} days of the group chat without you.`,
    body: () =>
      `Threads. Hot takes. Someone definitely dunked on a JavaScript framework and everyone agreed. It was very funny. You missed the whole thing.`,
    cta: "Catch up →",
    showPosts: true,
  },
  {
    subject: () => `your friend just hit 47 upvotes. you weren't there to be jealous.`,
    preview: () => "congrats to them, we guess.",
    headline: () => "Congrats to them, we guess.",
    body: () =>
      `Someone in your network is eating. You were not at the table. We're not saying you'd have gotten more upvotes. We're also not NOT saying it.`,
    cta: "See the feed →",
    showPosts: true,
  },
];

const AVATARS = ["🧑‍💻", "👩‍💻", "🧑‍🔬", "👨‍💻"];

export function FriendActivityEmail({
  userName,
  daysSince,
  trendingPosts = [],
  variant = 0,
}: FriendActivityEmailProps) {
  const firstName = userName?.split(" ")[0] || "hey";
  const v = VARIANTS[variant % VARIANTS.length];
  const unreadCount = trendingPosts.length + Math.floor(daysSince * 2.3);

  return (
    <EmailLayout
      previewText={v.preview(firstName, daysSince)}
      brandSub="Notifications · Developer Network"
    >
      <Section>
        {/* Badge */}
        <div style={{ marginBottom: "20px" }}>
          <span style={{ fontSize: "11px", fontWeight: 700, color: "#3b82f6", textTransform: "uppercase" as const, letterSpacing: "1px", background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.2)", borderRadius: "6px", padding: "4px 10px" }}>
            🔔 {unreadCount}+ Unread Notifications · Developer Network
          </span>
        </div>

        {/* Headline */}
        <Text style={{ fontSize: "22px", fontWeight: 800, color: colors.text, margin: "0 0 8px", letterSpacing: "-0.4px" }}>
          {v.headline(firstName, daysSince)}
        </Text>
        <Text style={{ fontSize: "14px", color: "#a1a1aa", lineHeight: "1.7", margin: "0 0 20px" }}>
          {v.body(firstName, daysSince)}
        </Text>

        {/* Notification feed */}
        {v.showPosts && trendingPosts.length > 0 && (
          <div style={{ marginBottom: "24px" }}>
            <Text style={{ fontSize: "11px", fontWeight: 700, color: colors.accent, margin: "0 0 10px", textTransform: "uppercase" as const, letterSpacing: "1px" }}>
              While you were away
            </Text>
            <div style={{ border: "1px solid #2a2a2a", borderRadius: "10px", overflow: "hidden" }}>
              {trendingPosts.map((post, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 16px", background: i % 2 ? "#161616" : "#111111", borderTop: i > 0 ? "1px solid #2a2a2a" : "none" }}>
                  <span style={{ fontSize: "20px", flexShrink: 0 }}>{AVATARS[i % AVATARS.length]}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Text style={{ fontSize: "13px", color: "#d4d4d8", margin: "0 0 2px", fontWeight: 600 }}>
                      {post.authorName}
                    </Text>
                    <Text style={{ fontSize: "12px", color: "#71717a", margin: "0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const }}>
                      posted · {post.title || "Untitled post"}
                    </Text>
                  </div>
                  <span style={{ fontSize: "12px", color: colors.accent, fontWeight: 700, flexShrink: 0 }}>▲ {post.votes}</span>
                </div>
              ))}
              <div style={{ padding: "10px 16px", background: "#0d0d0d", borderTop: "1px solid #2a2a2a" }}>
                <Text style={{ fontSize: "12px", color: "#52525b", margin: "0", textAlign: "center" as const }}>
                  + {Math.max(0, unreadCount - trendingPosts.length)} more notifications waiting
                </Text>
              </div>
            </div>
          </div>
        )}

        {/* Ghost variant — show empty state */}
        {!v.showPosts && (
          <div style={{ border: "1px solid #2a2a2a", borderRadius: "10px", padding: "24px", marginBottom: "24px", textAlign: "center" as const, background: "#111111" }}>
            <Text style={{ fontSize: "32px", margin: "0 0 8px" }}>👻</Text>
            <Text style={{ fontSize: "13px", color: "#52525b", margin: "0" }}>
              Your notification inbox. Waiting for you since {daysSince} days ago.
            </Text>
          </div>
        )}

        <Section style={{ textAlign: "center" }}>
          <Button href={`${APP_URL}/feed`} style={{ display: "inline-block", background: colors.accent, color: "#fff", fontSize: "15px", fontWeight: 700, padding: "13px 28px", borderRadius: "10px", textDecoration: "none" }}>
            {v.cta}
          </Button>
        </Section>
      </Section>
    </EmailLayout>
  );
}

export default FriendActivityEmail;
