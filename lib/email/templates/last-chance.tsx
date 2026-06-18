import React from "react";
import { Section, Text, Button } from "@react-email/components";
import { EmailLayout, colors, APP_URL } from "./_layout";

interface LastChanceEmailProps {
  userName: string;
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
    subject: () => `your account is being archived in 24 hours`,
    preview: () => "this is not a real threat. but also.",
    headline: () => "This is not a real threat.",
    body: (_f, daysSince) => {
      const months = Math.round(daysSince / 30);
      return `We're not actually archiving your account. But you've been gone for ${daysSince} days (${months > 1 ? `${months} months` : "about a month"}) and we figured some light existential pressure couldn't hurt. Your profile is still there. Your friends too.`;
    },
    cta: "I'm back →",
  },
  {
    subject: () => `wait did you delete us or did we delete you`,
    preview: () => "genuinely unclear at this point.",
    headline: () => "Genuinely unclear at this point.",
    body: (_f, daysSince) => {
      const months = Math.round(daysSince / 30);
      return `${daysSince} days. ${months > 1 ? `${months} months` : "About a month"}. We tried at the 7-day mark. The 30-day mark. This is us at ${daysSince} days, officially confused about who ghosted who here.`;
    },
    cta: "It was mutual →",
  },
  {
    subject: () => `everything changed. you missed all of it.`,
    preview: (_f, daysSince) => {
      const months = Math.round(daysSince / 30);
      return `${months > 1 ? `${months} months` : "a lot of time"} in developer years is forever.`;
    },
    headline: (_f, daysSince) => {
      const months = Math.round(daysSince / 30);
      return `${months > 1 ? `${months} months` : "A long stretch"} in developer years.`;
    },
    body: () =>
      `New features. New developers. Threads that went off. Gatherings that happened. Connections formed. You weren't there for any of it. Come be there for what's next.`,
    cta: "Show me what I missed →",
  },
];

const ARCHIVE_ITEMS = [
  ["Account", "Your username and profile"],
  ["Friends", "All connections intact"],
  ["Posts", "Everything still there"],
  ["Status", "PENDING ARCHIVE *"],
  ["Deadline", "24 hours *"],
];

export function LastChanceEmail({ userName, daysSince, variant = 0 }: LastChanceEmailProps) {
  const firstName = userName?.split(" ")[0] || "hey";
  const v = VARIANTS[variant % VARIANTS.length];
  const months = Math.round(daysSince / 30);
  const today = new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });

  return (
    <EmailLayout
      previewText={v.preview(firstName, daysSince)}
      brandSub="Account Retention · Final Notice"
    >
      <Section>
        {/* Badge */}
        <div style={{ marginBottom: "20px" }}>
          <span style={{ fontSize: "11px", fontWeight: 700, color: "#f59e0b", textTransform: "uppercase" as const, letterSpacing: "1px", background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: "6px", padding: "4px 10px" }}>
            ⚠️ Account Archive Notice · Action Required
          </span>
        </div>

        {/* Document card */}
        <div style={{ background: "#111111", border: "1px solid #2a2a2a", borderRadius: "12px", padding: "24px 28px", marginBottom: "20px" }}>
          {/* Date + ref */}
          <table width="100%" cellPadding={0} cellSpacing={0} style={{ marginBottom: "16px" }}>
            <tbody>
              <tr>
                <td style={{ fontSize: "12px", color: "#52525b" }}>Date: {today}</td>
                <td style={{ fontSize: "12px", color: "#52525b", textAlign: "right" as const }}>Ref: CN/ARCHIVE/{String(daysSince).padStart(4, "0")}</td>
              </tr>
            </tbody>
          </table>

          <Text style={{ fontSize: "14px", color: colors.text, margin: "0 0 4px", fontWeight: 600 }}>
            Dear {firstName},
          </Text>

          {/* Hero */}
          <div style={{ background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.15)", borderRadius: "10px", padding: "16px 20px", margin: "16px 0" }}>
            <Text style={{ fontSize: "18px", fontWeight: 800, color: colors.text, margin: "0 0 4px", letterSpacing: "-0.3px" }}>
              {v.headline(firstName, daysSince)}
            </Text>
            <Text style={{ fontSize: "13px", color: "#71717a", margin: "0" }}>
              {months > 1 ? `${months} months` : "~1 month"} of inactivity detected.
            </Text>
          </div>

          {/* Archive table */}
          <table width="100%" cellPadding={0} cellSpacing={0} style={{ border: "1px solid #2a2a2a", borderRadius: "8px", overflow: "hidden", marginBottom: "16px" }}>
            <tbody>
              <tr style={{ background: "#1a1a1a" }}>
                <td style={{ padding: "9px 14px", fontSize: "11px", fontWeight: 700, color: "#71717a", textTransform: "uppercase" as const, letterSpacing: "0.5px", width: "40%" }}>Item</td>
                <td style={{ padding: "9px 14px", fontSize: "11px", fontWeight: 700, color: "#71717a", textTransform: "uppercase" as const, letterSpacing: "0.5px" }}>Details</td>
              </tr>
              {ARCHIVE_ITEMS.map(([label, val], i) => (
                <tr key={label} style={{ borderTop: "1px solid #2a2a2a", background: i % 2 ? "#161616" : "transparent" }}>
                  <td style={{ padding: "9px 14px", fontSize: "12px", color: "#71717a" }}>{label}</td>
                  <td style={{ padding: "9px 14px", fontSize: "13px", color: label === "Status" ? "#f59e0b" : "#d4d4d8", fontWeight: label === "Status" || label === "Deadline" ? 700 : 400 }}>{val}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <Text style={{ fontSize: "14px", color: "#a1a1aa", lineHeight: "1.7", margin: "0" }}>
            {v.body(firstName, daysSince)}
          </Text>
        </div>

        {/* Signature */}
        <table width="100%" cellPadding={0} cellSpacing={0} style={{ marginBottom: "24px" }}>
          <tbody>
            <tr>
              <td>
                <Text style={{ fontSize: "13px", color: "#a1a1aa", margin: "0 0 2px" }}>Regards,</Text>
                <Text style={{ fontSize: "14px", fontWeight: 600, color: colors.text, margin: "0 0 2px" }}>Subhadip Saha</Text>
                <Text style={{ fontSize: "12px", color: "#52525b", margin: "0" }}>Founder, CodeNearby</Text>
              </td>
              <td style={{ textAlign: "right" as const, verticalAlign: "bottom" as const }}>
                <Text style={{ fontSize: "11px", color: "#3f3f46", margin: "0", fontStyle: "italic" }}>Digitally authorised</Text>
                <Text style={{ fontSize: "22px", fontWeight: 800, color: colors.accent, margin: "0", fontStyle: "italic" }}>CN</Text>
              </td>
            </tr>
          </tbody>
        </table>

        <Section style={{ textAlign: "center" }}>
          <Button href={APP_URL} style={{ display: "inline-block", background: colors.accent, color: "#fff", fontSize: "15px", fontWeight: 700, padding: "13px 28px", borderRadius: "10px", textDecoration: "none" }}>
            {v.cta}
          </Button>
        </Section>

        <Text style={{ fontSize: "11px", color: "#3f3f46", textAlign: "center" as const, margin: "16px 0 0", lineHeight: "1.6" }}>
          * We&apos;re not actually archiving your account. Please don&apos;t email us.
        </Text>
      </Section>
    </EmailLayout>
  );
}

export default LastChanceEmail;
