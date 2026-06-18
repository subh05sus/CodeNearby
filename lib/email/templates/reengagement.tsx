import React from "react";
import { Section, Text, Button } from "@react-email/components";
import { EmailLayout, colors, APP_URL } from "./_layout";

interface RecentPost {
  title?: string;
  authorName: string;
  votes: number;
}

interface ReengagementEmailProps {
  userName: string;
  recentPosts?: RecentPost[];
  daysSince: number;
  variant?: number;
}

type VariantDef = {
  subject: (firstName: string, daysSince: number) => string;
  preview: (firstName: string, daysSince: number) => string;
  headline: (firstName: string, daysSince: number) => string;
  body: (firstName: string, daysSince: number) => string;
  cta: string;
};

export const VARIANTS: VariantDef[] = [
  {
    subject: (firstName) => `${firstName}, you got the job`,
    preview: (firstName) => `wait. wrong email. sorry ${firstName}.`,
    headline: () => "Wait. Wrong email.",
    body: (firstName, daysSince) =>
      `That was for someone else on CodeNearby. They connected with the right developer at the right time and something happened. You've been gone for ${daysSince} days, ${firstName}. Just saying.`,
    cta: "See what's happening →",
  },
  {
    subject: (firstName) => `we told everyone you quit coding, ${firstName}`,
    preview: () => "RIP your dev career, probably. prove us wrong.",
    headline: () => "RIP your dev career, probably.",
    body: (_f, daysSince) =>
      `${daysSince} days of silence. We announced your retirement at the last gathering. Your profile is still up as a memorial. You can prove us wrong if you want.`,
    cta: "I didn't quit →",
  },
  {
    subject: (firstName) => `${firstName}, your dev community misses you (we're not going to cry about it)`,
    preview: (_f, daysSince) => `${daysSince} days. not that we're counting.`,
    headline: (_f, daysSince) => `${daysSince} days. Not that we're counting.`,
    body: () =>
      `New posts. New people. New discussions. The feed went off while you were gone. We saved your spot. Unfortunately.`,
    cta: "Come back →",
  },
];

const row = (label: string, value: string, alt: boolean) => (
  <tr key={label} style={{ borderTop: "1px solid #2a2a2a", background: alt ? "#161616" : "transparent" }}>
    <td style={{ padding: "10px 16px", fontSize: "12px", color: "#71717a", width: "38%", verticalAlign: "top" as const }}>{label}</td>
    <td style={{ padding: "10px 16px", fontSize: "13px", color: "#d4d4d8", lineHeight: "1.5" }}>{value}</td>
  </tr>
);

export function ReengagementEmail({
  userName,
  recentPosts = [],
  daysSince,
  variant = 0,
}: ReengagementEmailProps) {
  const firstName = userName?.split(" ")[0] || "hey";
  const v = VARIANTS[variant % VARIANTS.length];

  return (
    <EmailLayout
      previewText={v.preview(firstName, daysSince)}
      brandSub="Incident Response Team"
    >
      <Section>
        {/* Badge */}
        <div style={{ marginBottom: "20px" }}>
          <span style={{ fontSize: "11px", fontWeight: 700, color: colors.accent, textTransform: "uppercase" as const, letterSpacing: "1px", background: "rgba(255,92,26,0.1)", border: "1px solid rgba(255,92,26,0.25)", borderRadius: "6px", padding: "4px 10px" }}>
            🔴 Incident Report · Severity: Medium
          </span>
        </div>

        {/* Hero box */}
        <div style={{ background: "rgba(255,92,26,0.06)", border: "1px solid rgba(255,92,26,0.2)", borderRadius: "12px", padding: "22px 24px", marginBottom: "20px" }}>
          <Text style={{ fontSize: "11px", fontWeight: 700, color: colors.accent, margin: "0 0 8px", textTransform: "uppercase" as const, letterSpacing: "1px" }}>
            Confidential · For Addressee Only
          </Text>
          <Text style={{ fontSize: "22px", fontWeight: 800, color: colors.text, margin: "0 0 4px", letterSpacing: "-0.5px", lineHeight: "1.3" }}>
            {v.headline(firstName, daysSince)}
          </Text>
        </div>

        {/* Status table */}
        <table width="100%" cellPadding={0} cellSpacing={0} style={{ borderRadius: "10px", border: "1px solid #2a2a2a", overflow: "hidden", marginBottom: "20px" }}>
          <tbody>
            <tr style={{ background: "#1a1a1a" }}>
              <td style={{ padding: "10px 16px", fontSize: "11px", fontWeight: 700, color: "#71717a", textTransform: "uppercase" as const, letterSpacing: "0.5px", width: "38%" }}>Field</td>
              <td style={{ padding: "10px 16px", fontSize: "11px", fontWeight: 700, color: "#71717a", textTransform: "uppercase" as const, letterSpacing: "0.5px" }}>Details</td>
            </tr>
            {row("Incident Type", "Developer Absence", false)}
            {row("Affected User", firstName, true)}
            {row("Last Seen", `${daysSince} days ago`, false)}
            {row("Status", "UNRESOLVED ●", true)}
          </tbody>
        </table>

        {/* Body copy */}
        <Text style={{ fontSize: "14px", color: "#a1a1aa", lineHeight: "1.7", margin: "0 0 24px" }}>
          {v.body(firstName, daysSince)}
        </Text>

        {/* Trending posts for variant 2 */}
        {variant % VARIANTS.length === 2 && recentPosts.length > 0 && (
          <div style={{ marginBottom: "24px" }}>
            <Text style={{ fontSize: "11px", fontWeight: 700, color: colors.accent, margin: "0 0 10px", textTransform: "uppercase" as const, letterSpacing: "1px" }}>
              Activity log
            </Text>
            {recentPosts.map((post, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 16px", background: i % 2 ? "#161616" : "#111111", borderRadius: i === 0 ? "8px 8px 0 0" : i === recentPosts.length - 1 ? "0 0 8px 8px" : "0", border: "1px solid #2a2a2a", borderTop: i === 0 ? "1px solid #2a2a2a" : "none" }}>
                <Text style={{ fontSize: "13px", color: "#d4d4d8", margin: "0" }}>
                  — {post.title || "Untitled post"} <span style={{ color: "#52525b" }}>by {post.authorName}</span>
                </Text>
                <Text style={{ fontSize: "12px", color: colors.accent, fontWeight: 700, margin: "0", flexShrink: 0 }}>▲ {post.votes}</Text>
              </div>
            ))}
          </div>
        )}

        <Section style={{ textAlign: "center" }}>
          <Button href={`${APP_URL}/feed`} style={{ display: "inline-block", background: colors.accent, color: "#fff", fontSize: "15px", fontWeight: 700, padding: "13px 28px", borderRadius: "10px", textDecoration: "none", letterSpacing: "0.1px" }}>
            {v.cta}
          </Button>
        </Section>
      </Section>
    </EmailLayout>
  );
}

export default ReengagementEmail;
