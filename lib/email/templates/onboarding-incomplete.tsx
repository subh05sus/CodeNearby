import React from "react";
import { Section, Text, Button } from "@react-email/components";
import { EmailLayout, colors, APP_URL } from "./_layout";

interface OnboardingIncompleteEmailProps {
  userName: string;
  variant?: number;
}

type VariantDef = {
  subject: (firstName: string) => string;
  preview: (firstName: string) => string;
  headline: (firstName: string) => string;
  body: (firstName: string) => string;
  cta: string;
};

export const VARIANTS: VariantDef[] = [
  {
    subject: () => `honestly don't bother finishing your profile`,
    preview: () => "we're not begging. (we're a little begging.)",
    headline: () => "We're not begging.",
    body: () =>
      `Other devs are connecting, forming collabs, showing up at gatherings. You have a name and a picture. That's fine. Totally your choice. We'll just be here.`,
    cta: "Fine, I'll finish it →",
  },
  {
    subject: (firstName) => `3 devs viewed your profile, ${firstName}. they left immediately.`,
    preview: () => "your profile raised some concerns.",
    headline: () => "Your profile raised some concerns.",
    body: () =>
      `Skills: missing. Bio: gone. Tech stack: a complete mystery. We covered for you and told them you're "between bios." You're welcome. Now please fix it.`,
    cta: "Fix the embarrassment →",
  },
  {
    subject: () => `you have a new connection request. (you can't see it yet)`,
    preview: () => "someone wants to connect. your profile is blocking it.",
    headline: () => "Someone wants to connect with you.",
    body: () =>
      `We put it on hold because your profile is incomplete. Finish setup and we'll let it through. Or leave it pending forever. The request will just sit there. Waiting. Staring.`,
    cta: "Unlock the request →",
  },
];

const ERRORS = [
  { field: "skills", value: "undefined", desc: "Tech stack not configured" },
  { field: "bio", value: "null", desc: "Developer bio is missing" },
  { field: "location", value: "missing", desc: "Location not set" },
];

const FIXES = [
  { icon: "🛠️", label: "Add your tech stack", cmd: "--add-skills" },
  { icon: "📍", label: "Confirm your location", cmd: "--set-location" },
  { icon: "🤝", label: "Send one friend request", cmd: "--connect" },
];

export function OnboardingIncompleteEmail({ userName, variant = 0 }: OnboardingIncompleteEmailProps) {
  const firstName = userName?.split(" ")[0] || "hey";
  const v = VARIANTS[variant % VARIANTS.length];

  return (
    <EmailLayout
      previewText={v.preview(firstName)}
      brandSub="Developer Tools · Build System"
    >
      <Section>
        {/* Badge */}
        <div style={{ marginBottom: "20px" }}>
          <span style={{ fontSize: "11px", fontWeight: 700, color: "#ef4444", textTransform: "uppercase" as const, letterSpacing: "1px", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "6px", padding: "4px 10px" }}>
            ❌ Profile Build Failed · 3 Errors
          </span>
        </div>

        {/* Terminal card */}
        <div style={{ background: "#0a0a0a", border: "1px solid #2a2a2a", borderRadius: "12px", padding: "20px 24px", marginBottom: "20px", fontFamily: "'Courier New', Courier, monospace" }}>
          {/* Terminal header */}
          <div style={{ display: "flex", gap: "6px", marginBottom: "16px" }}>
            <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#ef4444" }} />
            <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#f59e0b" }} />
            <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#10b981" }} />
          </div>

          <Text style={{ fontSize: "12px", color: "#52525b", margin: "0 0 12px", fontFamily: "monospace" }}>
            $ codenearby profile --validate --user {firstName}
          </Text>

          {ERRORS.map((e, i) => (
            <Text key={i} style={{ fontSize: "13px", color: "#ef4444", margin: "0 0 4px", fontFamily: "monospace" }}>
              ✗ ERROR &nbsp; {e.field}: {e.value} &nbsp;&nbsp;<span style={{ color: "#52525b" }}>// {e.desc}</span>
            </Text>
          ))}

          <Text style={{ fontSize: "12px", color: "#52525b", margin: "12px 0 0", borderTop: "1px solid #1f1f1f", paddingTop: "10px", fontFamily: "monospace" }}>
            Build failed. 3 validation errors. Exit code 1.
          </Text>
        </div>

        {/* Headline from variant */}
        <Text style={{ fontSize: "20px", fontWeight: 700, color: colors.text, margin: "0 0 10px", letterSpacing: "-0.3px" }}>
          {v.headline(firstName)}
        </Text>
        <Text style={{ fontSize: "14px", color: "#a1a1aa", lineHeight: "1.7", margin: "0 0 20px" }}>
          {v.body(firstName)}
        </Text>

        {/* Fix steps table */}
        <Text style={{ fontSize: "11px", fontWeight: 700, color: colors.accent, margin: "0 0 10px", textTransform: "uppercase" as const, letterSpacing: "1px" }}>
          Suggested fix — run in any order
        </Text>
        <table width="100%" cellPadding={0} cellSpacing={0} style={{ border: "1px solid #2a2a2a", borderRadius: "10px", overflow: "hidden", marginBottom: "24px" }}>
          <tbody>
            {FIXES.map((fix, i) => (
              <tr key={i} style={{ borderTop: i > 0 ? "1px solid #2a2a2a" : "none", background: i % 2 ? "#161616" : "transparent" }}>
                <td style={{ padding: "11px 16px", fontSize: "18px", width: "36px" }}>{fix.icon}</td>
                <td style={{ padding: "11px 16px", fontSize: "13px", color: "#d4d4d8" }}>{fix.label}</td>
                <td style={{ padding: "11px 16px", fontSize: "11px", color: "#52525b", textAlign: "right" as const, fontFamily: "monospace" }}>{fix.cmd}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <Section style={{ textAlign: "center" }}>
          <Button href={`${APP_URL}/onboarding`} style={{ display: "inline-block", background: colors.accent, color: "#fff", fontSize: "15px", fontWeight: 700, padding: "13px 28px", borderRadius: "10px", textDecoration: "none" }}>
            {v.cta}
          </Button>
        </Section>
      </Section>
    </EmailLayout>
  );
}

export default OnboardingIncompleteEmail;
