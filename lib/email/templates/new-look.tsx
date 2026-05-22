import React from "react";
import { Section, Text, Button } from "@react-email/components";
import { EmailLayout, styles, colors, APP_URL } from "./_layout";

interface NewLookEmailProps {
  userName: string;
}

export function NewLookEmail({ userName }: NewLookEmailProps) {
  const firstName = userName?.split(" ")[0] || "there";

  return (
    <EmailLayout previewText={`Hey ${firstName}, CodeNearby got a new look. Come see.`}>
      <Section>
        <Text style={styles.h1}>Hey {firstName},</Text>
        <Text style={styles.body_text}>
          We shipped a redesign. The whole thing looks different now — cleaner, faster, easier to use. We also added email notifications so you actually know when something happens on your account.
        </Text>

        <Text style={styles.body_text}>
          Things that are new:
        </Text>

        <Section style={{
          backgroundColor: colors.bg,
          borderRadius: "10px",
          border: `1px solid ${colors.border}`,
          padding: "16px 20px",
          margin: "0 0 28px",
        }}>
          {[
            "New UI — different fonts, layout, colors. Just looks better.",
            "Email notifications for friend requests, comments, and when someone joins your gathering.",
            "Your post gets a like? You'll know. Hits 10, 50, or 100? You'll know that too.",
          ].map((item, i) => (
            <div key={i} style={{ display: "flex", marginBottom: i < 2 ? "10px" : "0" }}>
              <Text style={{ fontSize: "14px", color: colors.accent, margin: "0 10px 0 0", lineHeight: "1.6", flexShrink: 0 }}>—</Text>
              <Text style={{ fontSize: "14px", color: "#d4d4d8", margin: "0", lineHeight: "1.6" }}>{item}</Text>
            </div>
          ))}
        </Section>

        <Text style={{ ...styles.body_text, marginBottom: "28px" }}>
          Everything else is the same. Your profile, friends, posts — all still there.
        </Text>

        <Section style={{ textAlign: "center" }}>
          <Button href={APP_URL} style={styles.ctaButton}>
            Take a look →
          </Button>
        </Section>

        <Text style={{ ...styles.body_text, marginTop: "24px", fontSize: "13px" }}>
          — The CodeNearby team
        </Text>
      </Section>
    </EmailLayout>
  );
}

export default NewLookEmail;
