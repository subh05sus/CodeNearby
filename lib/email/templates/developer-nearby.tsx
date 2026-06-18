import React from "react";
import { Section, Text, Button } from "@react-email/components";
import { EmailLayout, colors, APP_URL } from "./_layout";

interface DeveloperNearbyEmailProps {
  userName: string;
  daysSince: number;
  newDevCount: number;
  userLocation?: string;
  variant?: number;
}

type VariantDef = {
  subject: (firstName: string, daysSince: number, count: number, location?: string) => string;
  preview: (firstName: string, daysSince: number, count: number, location?: string) => string;
  headline: (firstName: string, daysSince: number, count: number, location?: string) => string;
  body: (firstName: string, daysSince: number, count: number, location?: string) => string;
  cta: string;
};

export const VARIANTS: VariantDef[] = [
  {
    subject: (_f, _d, count) =>
      `${count} devs joined near you. one of them is better than you. probably.`,
    preview: () => "your local scene just got more competitive.",
    headline: () => "Your local scene just got more competitive.",
    body: (_f, _d, count, location) =>
      `${count} new developers joined CodeNearby${location ? ` near ${location}` : ""} in the last month. They have profiles. They're connecting. Some build the same stuff as you.`,
    cta: "Check who joined →",
  },
  {
    subject: () => `someone near you is building something. you don't know what it is.`,
    preview: () => "they won't tell you. you're not on here.",
    headline: () => "They won't tell you. You're not on here.",
    body: (_f, _d, count, location) =>
      `${count} new devs joined${location ? ` near ${location}` : " your area"} recently. At least one is building something interesting. You could connect and find out. Or stay curious forever.`,
    cta: "Find out →",
  },
  {
    subject: () => `a dev near you asked if you're free to collab. we said we'd check.`,
    preview: () => "someone wants to work with you. possibly.",
    headline: () => "Someone wants to work with you. Possibly.",
    body: (_f, daysSince, count, location) =>
      `${count} developers joined near ${location || "you"} recently. At least one is looking for someone with your kind of stack. We'd introduce you, but you haven't logged in in ${daysSince} days.`,
    cta: "See who →",
  },
];

export function DeveloperNearbyEmail({
  userName,
  daysSince,
  newDevCount,
  userLocation,
  variant = 0,
}: DeveloperNearbyEmailProps) {
  const firstName = userName?.split(" ")[0] || "hey";
  const v = VARIANTS[variant % VARIANTS.length];

  return (
    <EmailLayout
      previewText={v.preview(firstName, daysSince, newDevCount, userLocation)}
      brandSub="Signal Detection · Nearby Developers"
    >
      <Section>
        {/* Badge */}
        <div style={{ marginBottom: "20px" }}>
          <span style={{ fontSize: "11px", fontWeight: 700, color: "#10b981", textTransform: "uppercase" as const, letterSpacing: "1px", background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: "6px", padding: "4px 10px" }}>
            📡 New Signal Detected{userLocation ? ` · ${userLocation}` : ""}
          </span>
        </div>

        {/* Big count hero */}
        <div style={{ background: "rgba(255,92,26,0.06)", border: "1px solid rgba(255,92,26,0.2)", borderRadius: "12px", padding: "28px 24px", marginBottom: "20px", textAlign: "center" as const }}>
          <Text style={{ fontSize: "52px", fontWeight: 900, color: colors.accent, margin: "0", lineHeight: "1", letterSpacing: "-2px" }}>
            {newDevCount.toLocaleString()}
          </Text>
          <Text style={{ fontSize: "14px", color: "#a1a1aa", margin: "8px 0 0" }}>
            new developers joined CodeNearby in the last 30 days
          </Text>
        </div>

        {/* Radar table */}
        <table width="100%" cellPadding={0} cellSpacing={0} style={{ border: "1px solid #2a2a2a", borderRadius: "10px", overflow: "hidden", marginBottom: "20px" }}>
          <tbody>
            <tr style={{ background: "#1a1a1a" }}>
              <td style={{ padding: "9px 16px", fontSize: "11px", fontWeight: 700, color: "#71717a", textTransform: "uppercase" as const, letterSpacing: "0.5px", width: "40%" }}>Signal</td>
              <td style={{ padding: "9px 16px", fontSize: "11px", fontWeight: 700, color: "#71717a", textTransform: "uppercase" as const, letterSpacing: "0.5px" }}>Reading</td>
            </tr>
            {[
              ["Location", userLocation || "Not set"],
              ["New Devs (30d)", `${newDevCount} joined`],
              ["Your Status", `OFFLINE · ${daysSince} days`],
              ["Suggested Action", "Come back"],
            ].map(([label, val], i) => (
              <tr key={label} style={{ borderTop: "1px solid #2a2a2a", background: i % 2 ? "#161616" : "transparent" }}>
                <td style={{ padding: "10px 16px", fontSize: "12px", color: "#71717a" }}>{label}</td>
                <td style={{ padding: "10px 16px", fontSize: "13px", color: label === "Your Status" ? "#f59e0b" : "#d4d4d8", fontWeight: label === "Your Status" ? 700 : 400 }}>{val}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Headline + body */}
        <Text style={{ fontSize: "20px", fontWeight: 700, color: colors.text, margin: "0 0 8px", letterSpacing: "-0.3px" }}>
          {v.headline(firstName, daysSince, newDevCount, userLocation)}
        </Text>
        <Text style={{ fontSize: "14px", color: "#a1a1aa", lineHeight: "1.7", margin: "0 0 24px" }}>
          {v.body(firstName, daysSince, newDevCount, userLocation)}
        </Text>

        <Section style={{ textAlign: "center" }}>
          <Button href={`${APP_URL}/developers`} style={{ display: "inline-block", background: colors.accent, color: "#fff", fontSize: "15px", fontWeight: 700, padding: "13px 28px", borderRadius: "10px", textDecoration: "none" }}>
            {v.cta}
          </Button>
        </Section>
      </Section>
    </EmailLayout>
  );
}

export default DeveloperNearbyEmail;
