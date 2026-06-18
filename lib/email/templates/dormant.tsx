import React from "react";
import { Section, Text, Button } from "@react-email/components";
import { EmailLayout, colors, APP_URL } from "./_layout";

interface DormantEmailProps {
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
    subject: (firstName) => `ngl ${firstName} we forgot you existed`,
    preview: () => "and then we remembered. awkward.",
    headline: () => "And then we remembered. Awkward.",
    body: (_f, daysSince) => {
      const months = Math.round(daysSince / 30);
      return `${daysSince} days. That's ${months > 1 ? `${months} months` : "about a month"}. The platform grew. Features shipped. A whole vibe happened. You missed it. But your account is still there, waiting.`;
    },
    cta: "I still exist →",
  },
  {
    subject: (firstName) => `we replaced you, ${firstName}. your replacement said hi.`,
    preview: () => "there's a new you in the community.",
    headline: () => "There's a new you in the community.",
    body: (_f, daysSince) =>
      `While you were gone (${daysSince} days, not that we're tracking), new developers joined with your exact stack. They're active. They're connecting. We're not comparing. (We're comparing.)`,
    cta: "Reclaim your spot →",
  },
  {
    subject: () => `your GitHub says you code. CodeNearby disagrees.`,
    preview: (firstName) => `two very different stories, ${firstName}.`,
    headline: () => "Two very different stories.",
    body: (_f, daysSince) =>
      `You've been committing. We can see the green squares. But CodeNearby? ${daysSince} days of radio silence. The developer community you were supposed to be part of is still here. Still going.`,
    cta: "Make the squares match →",
  },
];

export function DormantEmail({
  userName,
  daysSince,
  variant = 0,
}: DormantEmailProps) {
  const firstName = userName?.split(" ")[0] || "hey";
  const v = VARIANTS[variant % VARIANTS.length];
  const months = Math.round(daysSince / 30);
  const today = new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });

  return (
    <EmailLayout
      previewText={v.preview(firstName, daysSince)}
      brandSub="Account Status Office"
    >
      <Section>
        {/* Badge */}
        <div style={{ marginBottom: "20px" }}>
          <span style={{ fontSize: "11px", fontWeight: 700, color: "#a1a1aa", textTransform: "uppercase" as const, letterSpacing: "1px", background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: "6px", padding: "4px 10px" }}>
            👻 Account Status Notice · {months > 1 ? `${months}+ Months Inactive` : "1+ Month Inactive"}
          </span>
        </div>

        {/* Document card */}
        <div style={{ background: "#111111", border: "1px solid #2a2a2a", borderRadius: "12px", padding: "24px 28px", marginBottom: "20px" }}>
          {/* Date + ref */}
          <table width="100%" cellPadding={0} cellSpacing={0} style={{ marginBottom: "16px" }}>
            <tbody>
              <tr>
                <td style={{ fontSize: "12px", color: "#52525b" }}>Date: {today}</td>
                <td style={{ fontSize: "12px", color: "#52525b", textAlign: "right" as const }}>Ref: CN/STATUS/{String(daysSince).padStart(4, "0")}</td>
              </tr>
            </tbody>
          </table>

          <Text style={{ fontSize: "14px", color: colors.text, margin: "0 0 4px", fontWeight: 600 }}>
            Dear {firstName},
          </Text>

          {/* Hero line */}
          <div style={{ background: "rgba(255,92,26,0.06)", border: "1px solid rgba(255,92,26,0.15)", borderRadius: "10px", padding: "16px 20px", margin: "16px 0" }}>
            <Text style={{ fontSize: "18px", fontWeight: 800, color: colors.text, margin: "0", letterSpacing: "-0.3px" }}>
              {v.headline(firstName, daysSince)}
            </Text>
          </div>

          {/* Status table */}
          <table width="100%" cellPadding={0} cellSpacing={0} style={{ border: "1px solid #2a2a2a", borderRadius: "8px", overflow: "hidden", marginBottom: "16px" }}>
            <tbody>
              <tr style={{ background: "#1a1a1a" }}>
                <td style={{ padding: "9px 14px", fontSize: "11px", fontWeight: 700, color: "#71717a", textTransform: "uppercase" as const, letterSpacing: "0.5px", width: "38%" }}>Field</td>
                <td style={{ padding: "9px 14px", fontSize: "11px", fontWeight: 700, color: "#71717a", textTransform: "uppercase" as const, letterSpacing: "0.5px" }}>Value</td>
              </tr>
              {[
                ["Account", firstName],
                ["Days Inactive", `${daysSince} days`],
                ["Duration", months > 1 ? `${months} months` : "~1 month"],
                ["Status", "DORMANT"],
                ["Action Required", "Return to platform"],
              ].map(([label, val], i) => (
                <tr key={label} style={{ borderTop: "1px solid #2a2a2a", background: i % 2 ? "#161616" : "transparent" }}>
                  <td style={{ padding: "9px 14px", fontSize: "12px", color: "#71717a" }}>{label}</td>
                  <td style={{ padding: "9px 14px", fontSize: "13px", color: label === "Status" ? colors.accent : "#d4d4d8", fontWeight: label === "Status" ? 700 : 400 }}>{val}</td>
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
                <Text style={{ fontSize: "13px", color: "#a1a1aa", margin: "0 0 2px" }}>Warm regards,</Text>
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
      </Section>
    </EmailLayout>
  );
}

export default DormantEmail;
