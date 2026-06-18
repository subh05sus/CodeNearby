import React from "react";
import { Section, Text, Button, Img } from "@react-email/components";
import { EmailLayout, colors, APP_URL } from "./_layout";

interface SuggestedDev {
  name?: string;
  githubUsername: string;
  githubBio?: string;
  image?: string;
}

interface NoFriendsEmailProps {
  userName: string;
  daysSince: number;
  suggestedDevs?: SuggestedDev[];
  variant?: number;
}

type VariantDef = {
  subject: (firstName: string, daysSince: number) => string;
  preview: (firstName: string, daysSince: number) => string;
  headline: (firstName: string, daysSince: number) => string;
  body: (firstName: string, daysSince: number) => string;
  cta: string;
  showDevs: boolean;
};

export const VARIANTS: VariantDef[] = [
  {
    subject: (firstName) => `${firstName}, you have zero connections. this is awkward for everyone.`,
    preview: () => "even the 404 page has more friends.",
    headline: () => "Even the 404 page has more friends.",
    body: (_f, daysSince) =>
      `${daysSince} day${daysSince !== 1 ? "s" : ""} on CodeNearby. Zero connections made. We're not judging. (We're a little judging.) Developers near you are connecting. You could join them.`,
    cta: "Find a developer →",
    showDevs: true,
  },
  {
    subject: () => `CodeNearby isn't for everyone, honestly`,
    preview: () => "it's okay to just... not.",
    headline: () => "It's okay to just... not.",
    body: (_f, daysSince) =>
      `Some people aren't the "connect with developers nearby" type. Maybe that's you. Or maybe it's the ${daysSince} days without a single connection attempt. Could be both.`,
    cta: "Prove me wrong →",
    showDevs: false,
  },
  {
    subject: (firstName) => `a dev near you has 12 connections. you have 0. just data, ${firstName}.`,
    preview: () => "the scoreboard exists. you're not on it.",
    headline: () => "The scoreboard exists. You're not on it.",
    body: () =>
      `We don't like to compare. But the numbers are right there. Someone near you is building their local network while you're not here. No pressure.`,
    cta: "Get on the board →",
    showDevs: true,
  },
];

// Fake leaderboard entries to make the user's 0 feel worse
const FAKE_BOARD = [
  { rank: 1, handle: "dev_nearby", count: 12 },
  { rank: 2, handle: "codemaster99", count: 9 },
  { rank: 3, handle: "buildfast_io", count: 6 },
];

function Bar({ count, max }: { count: number; max: number }) {
  const pct = Math.round((count / max) * 100);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px", flex: 1 }}>
      <div style={{ flex: 1, height: "6px", background: "#1f1f1f", borderRadius: "3px", overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: colors.accent, borderRadius: "3px" }} />
      </div>
      <span style={{ fontSize: "12px", color: "#d4d4d8", fontWeight: 700, minWidth: "20px", textAlign: "right" as const }}>{count}</span>
    </div>
  );
}

export function NoFriendsEmail({
  userName,
  daysSince,
  suggestedDevs = [],
  variant = 0,
}: NoFriendsEmailProps) {
  const firstName = userName?.split(" ")[0] || "hey";
  const v = VARIANTS[variant % VARIANTS.length];
  const isScoreboard = variant % VARIANTS.length !== 1;

  return (
    <EmailLayout
      previewText={v.preview(firstName, daysSince)}
      brandSub="Community · Network Activity"
    >
      <Section>
        {/* Badge */}
        <div style={{ marginBottom: "20px" }}>
          <span style={{ fontSize: "11px", fontWeight: 700, color: "#a1a1aa", textTransform: "uppercase" as const, letterSpacing: "1px", background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: "6px", padding: "4px 10px" }}>
            🏆 Community Scoreboard · Your Network
          </span>
        </div>

        {/* Headline */}
        <Text style={{ fontSize: "22px", fontWeight: 800, color: colors.text, margin: "0 0 8px", letterSpacing: "-0.4px" }}>
          {v.headline(firstName, daysSince)}
        </Text>
        <Text style={{ fontSize: "14px", color: "#a1a1aa", lineHeight: "1.7", margin: "0 0 20px" }}>
          {v.body(firstName, daysSince)}
        </Text>

        {/* Leaderboard */}
        {isScoreboard && (
          <div style={{ border: "1px solid #2a2a2a", borderRadius: "10px", overflow: "hidden", marginBottom: "24px" }}>
            <div style={{ padding: "10px 16px", background: "#1a1a1a", borderBottom: "1px solid #2a2a2a" }}>
              <Text style={{ fontSize: "11px", fontWeight: 700, color: "#71717a", margin: "0", textTransform: "uppercase" as const, letterSpacing: "0.5px" }}>
                Connections · Near You
              </Text>
            </div>
            {FAKE_BOARD.map((entry, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 16px", background: i % 2 ? "#161616" : "#111111", borderTop: "1px solid #2a2a2a" }}>
                <span style={{ fontSize: "12px", color: "#52525b", width: "20px", textAlign: "center" as const }}>#{entry.rank}</span>
                <span style={{ fontSize: "13px", color: "#d4d4d8", fontWeight: 600, minWidth: "100px" }}>{entry.handle}</span>
                <Bar count={entry.count} max={12} />
              </div>
            ))}
            {/* User row — the brutal one */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 16px", background: "rgba(255,92,26,0.04)", borderTop: "2px solid rgba(255,92,26,0.2)" }}>
              <span style={{ fontSize: "12px", color: "#52525b", width: "20px", textAlign: "center" as const }}>—</span>
              <span style={{ fontSize: "13px", color: colors.accent, fontWeight: 700, minWidth: "100px" }}>{firstName}</span>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", flex: 1 }}>
                <div style={{ flex: 1, height: "6px", background: "#1f1f1f", borderRadius: "3px" }}>
                  <div style={{ width: "0%", height: "100%", background: "#52525b", borderRadius: "3px" }} />
                </div>
                <span style={{ fontSize: "12px", color: "#52525b", fontWeight: 700, minWidth: "20px", textAlign: "right" as const }}>0</span>
              </div>
            </div>
          </div>
        )}

        {/* Reverse psych variant — just a sad empty state */}
        {!isScoreboard && (
          <div style={{ border: "1px dashed #2a2a2a", borderRadius: "10px", padding: "28px", marginBottom: "24px", textAlign: "center" as const }}>
            <Text style={{ fontSize: "32px", margin: "0 0 8px" }}>🦗</Text>
            <Text style={{ fontSize: "13px", color: "#52525b", margin: "0" }}>
              0 connections · 0 friend requests sent · {daysSince} days on the platform
            </Text>
          </div>
        )}

        {/* Suggested devs */}
        {v.showDevs && suggestedDevs.length > 0 && (
          <div style={{ marginBottom: "24px" }}>
            <Text style={{ fontSize: "11px", fontWeight: 700, color: colors.accent, margin: "0 0 10px", textTransform: "uppercase" as const, letterSpacing: "1px" }}>
              People you could talk to
            </Text>
            {suggestedDevs.map((dev, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 16px", background: "#111111", border: "1px solid #2a2a2a", borderRadius: "8px", marginBottom: "6px" }}>
                {dev.image ? (
                  <Img src={dev.image} alt={dev.name || dev.githubUsername} width={36} height={36} style={{ borderRadius: "50%", flexShrink: 0 }} />
                ) : (
                  <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "#1f1f1f", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <span style={{ fontSize: "16px" }}>👤</span>
                  </div>
                )}
                <div>
                  <Text style={{ fontSize: "13px", fontWeight: 600, color: colors.text, margin: "0 0 2px" }}>
                    {dev.name || dev.githubUsername}
                  </Text>
                  {dev.githubBio && (
                    <Text style={{ fontSize: "12px", color: "#71717a", margin: "0" }}>
                      {dev.githubBio.length > 65 ? `${dev.githubBio.slice(0, 65)}…` : dev.githubBio}
                    </Text>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <Section style={{ textAlign: "center" }}>
          <Button href={`${APP_URL}/developers`} style={{ display: "inline-block", background: colors.accent, color: "#fff", fontSize: "15px", fontWeight: 700, padding: "13px 28px", borderRadius: "10px", textDecoration: "none" }}>
            {v.cta}
          </Button>
        </Section>
      </Section>
    </EmailLayout>
  );
}

export default NoFriendsEmail;
