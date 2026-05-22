import React from "react";
import { Section, Text, Button } from "@react-email/components";
import { EmailLayout, styles, colors, APP_URL } from "./_layout";

interface DormantEmailProps {
  userName: string;
  daysSince: number;
  newFeatures?: string[];
}

const DEFAULT_FEATURES = [
  "AI-powered developer matching based on your stack",
  "Gathering polls and collaborative agenda planning",
  "QR code shareable profiles for meetups",
  "Enhanced feed with code snippet previews",
];

export function DormantEmail({
  userName,
  daysSince,
  newFeatures = DEFAULT_FEATURES,
}: DormantEmailProps) {
  const firstName = userName?.split(" ")[0] || "there";
  const months = Math.round(daysSince / 30);

  return (
    <EmailLayout previewText={`A lot has changed since you left, ${firstName} — here's what's new on CodeNearby`}>
      <Section>
        {/* Hero message */}
        <Section style={{
          backgroundColor: "rgba(255,92,26,0.06)",
          border: `1px solid rgba(255,92,26,0.2)`,
          borderRadius: "12px",
          padding: "24px",
          margin: "0 0 24px",
          textAlign: "center",
        }}>
          <Text style={{ fontSize: "36px", margin: "0 0 8px", lineHeight: "1" }}>🌟</Text>
          <Text style={{ fontSize: "18px", fontWeight: "700", color: colors.text, margin: "0 0 4px" }}>
            {months > 1 ? `${months} months` : "A month"} is a long time in dev-land
          </Text>
          <Text style={{ fontSize: "14px", color: colors.muted, margin: "0" }}>
            CodeNearby has grown a lot since you last visited, {firstName}.
          </Text>
        </Section>

        <Text style={styles.h1}>Here&apos;s what you&apos;ve missed</Text>
        <Text style={styles.body_text}>
          We&apos;ve been busy shipping features, growing the community, and making it easier than ever to connect with developers near you.
        </Text>

        {newFeatures.length > 0 && (
          <Section style={{
            backgroundColor: colors.bg,
            borderRadius: "12px",
            border: `1px solid ${colors.border}`,
            padding: "20px 24px",
            margin: "0 0 28px",
          }}>
            <Text style={{ fontSize: "13px", fontWeight: "600", color: colors.accent, margin: "0 0 14px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              New since you left
            </Text>
            {newFeatures.map((feature, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", marginBottom: i < newFeatures.length - 1 ? "10px" : "0" }}>
                <Text style={{ fontSize: "16px", margin: "0 10px 0 0", lineHeight: "1.5", flexShrink: 0 }}>✦</Text>
                <Text style={{ fontSize: "14px", color: "#d4d4d8", margin: "0", lineHeight: "1.5" }}>
                  {feature}
                </Text>
              </div>
            ))}
          </Section>
        )}

        <Section style={{ textAlign: "center" }}>
          <Button href={APP_URL} style={styles.ctaButton}>
            Come Back and Explore →
          </Button>
        </Section>

        <Text style={{ ...styles.body_text, marginTop: "20px", fontSize: "13px" }}>
          Your profile and connections are exactly as you left them. Just sign in with GitHub to continue.
        </Text>
      </Section>
    </EmailLayout>
  );
}

export default DormantEmail;
