import React from "react";
import { Section, Text, Button } from "@react-email/components";
import { EmailLayout, styles, colors, APP_URL } from "./_layout";

interface NewLookEmailProps {
  userName: string;
}

export function NewLookEmail({ userName }: NewLookEmailProps) {
  const firstName = userName?.split(" ")[0] || "there";

  return (
    <EmailLayout previewText={`CodeNearby just got a whole new look — come check it out, ${firstName}`}>
      <Section>
        {/* Hero */}
        <Section style={{
          background: `linear-gradient(135deg, rgba(255,92,26,0.12) 0%, rgba(255,92,26,0.04) 100%)`,
          border: `1px solid rgba(255,92,26,0.25)`,
          borderRadius: "14px",
          padding: "28px 24px",
          margin: "0 0 24px",
          textAlign: "center",
        }}>
          <Text style={{ fontSize: "40px", margin: "0 0 8px", lineHeight: "1" }}>✨</Text>
          <Text style={{
            fontSize: "22px",
            fontWeight: "800",
            color: colors.text,
            margin: "0 0 6px",
            letterSpacing: "-0.5px",
          }}>
            CodeNearby 2.0 is here
          </Text>
          <Text style={{ fontSize: "14px", color: colors.muted, margin: "0" }}>
            A fresh new look, and a lot more under the hood.
          </Text>
        </Section>

        <Text style={styles.h1}>Hey {firstName}, we&apos;ve been busy 👋</Text>
        <Text style={styles.body_text}>
          We&apos;ve redesigned CodeNearby from the ground up — cleaner UI, smoother interactions, and a bunch of new features to make connecting with developers near you even better.
        </Text>

        {/* Feature list */}
        <Section style={{
          backgroundColor: colors.bg,
          borderRadius: "12px",
          border: `1px solid ${colors.border}`,
          padding: "20px 24px",
          margin: "0 0 28px",
        }}>
          <Text style={{ fontSize: "13px", fontWeight: "600", color: colors.accent, margin: "0 0 14px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            What&apos;s new in 2.0
          </Text>
          {[
            ["✨", "Redesigned UI", "Refreshed visuals with better contrast, smoother animations, and consistent components"],
            ["📬", "Email notifications", "Stay in the loop — get notified on connection requests, comments, and milestones"],
            ["🏆", "Post milestones", "Celebrate when your posts hit 1, 10, 50, or 100 upvotes"],
            ["📅", "Gathering updates", "Hosts now get notified when someone joins their gathering"],
          ].map(([icon, title, desc]) => (
            <div key={title} style={{ display: "flex", marginBottom: "14px" }}>
              <Text style={{ fontSize: "20px", margin: "0 12px 0 0", lineHeight: "1.4", flexShrink: 0 }}>{icon}</Text>
              <div>
                <Text style={{ fontSize: "14px", fontWeight: "600", color: colors.text, margin: "0 0 2px" }}>{title}</Text>
                <Text style={{ fontSize: "13px", color: colors.muted, margin: "0", lineHeight: "1.5" }}>{desc}</Text>
              </div>
            </div>
          ))}
        </Section>

        <Section style={{ textAlign: "center" }}>
          <Button href={APP_URL} style={styles.ctaButton}>
            Check Out the New Look →
          </Button>
        </Section>

        <Text style={{ ...styles.body_text, marginTop: "24px", fontSize: "13px" }}>
          Your profile, friends, and posts are all still there — just sign in with GitHub to continue.
        </Text>
      </Section>
    </EmailLayout>
  );
}

export default NewLookEmail;
