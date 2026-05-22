import React from "react";
import { Section, Text, Button } from "@react-email/components";
import { EmailLayout, styles, colors, APP_URL } from "./_layout";

interface WelcomeEmailProps {
  name: string;
}

export function WelcomeEmail({ name }: WelcomeEmailProps) {
  const firstName = name?.split(" ")[0] || "there";

  return (
    <EmailLayout previewText={`Welcome to CodeNearby, ${firstName}! Your developer journey starts here.`}>
      <Section>
        <Text style={{ ...styles.body_text, fontSize: "28px", fontWeight: "700", color: colors.text, margin: "0 0 8px" }}>
          👋 Welcome, {firstName}!
        </Text>
        <Text style={styles.h1}>
          Your developer community is waiting.
        </Text>
        <Text style={styles.body_text}>
          CodeNearby connects you with developers in your area — find collaborators, join gatherings, share your work, and make real connections with people who code.
        </Text>

        <Section style={{ backgroundColor: colors.bg, borderRadius: "12px", border: `1px solid ${colors.border}`, padding: "20px 24px", margin: "0 0 28px" }}>
          <Text style={{ fontSize: "13px", fontWeight: "600", color: colors.accent, margin: "0 0 12px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            Get started in 3 steps
          </Text>
          {[
            ["🧑‍💻", "Complete your profile", "Add your skills and bio so developers nearby can find you"],
            ["🔍", "Discover developers", "Browse coders near your location and send connection requests"],
            ["📅", "Join a gathering", "Find or create local meetups and hackathons"],
          ].map(([icon, title, desc]) => (
            <div key={title} style={{ display: "flex", marginBottom: "12px" }}>
              <Text style={{ fontSize: "18px", margin: "0 12px 0 0", lineHeight: "1.4" }}>{icon}</Text>
              <div>
                <Text style={{ fontSize: "14px", fontWeight: "600", color: colors.text, margin: "0 0 2px" }}>{title}</Text>
                <Text style={{ fontSize: "13px", color: colors.muted, margin: "0" }}>{desc}</Text>
              </div>
            </div>
          ))}
        </Section>

        <Section style={{ textAlign: "center" }}>
          <Button href={`${APP_URL}/onboarding`} style={styles.ctaButton}>
            Complete Your Profile →
          </Button>
        </Section>

        <Text style={{ ...styles.body_text, marginTop: "24px", fontSize: "13px" }}>
          Questions? Just reply to this email — we&apos;re happy to help.
        </Text>
      </Section>
    </EmailLayout>
  );
}

export default WelcomeEmail;
