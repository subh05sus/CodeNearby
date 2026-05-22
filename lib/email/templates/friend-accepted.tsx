import React from "react";
import { Section, Text, Button, Img } from "@react-email/components";
import { EmailLayout, styles, colors, APP_URL } from "./_layout";

interface FriendAcceptedEmailProps {
  recipientName: string;
  acceptorName: string;
  acceptorUsername: string;
  acceptorAvatar?: string;
}

export function FriendAcceptedEmail({
  recipientName,
  acceptorName,
  acceptorUsername,
  acceptorAvatar,
}: FriendAcceptedEmailProps) {
  const firstName = recipientName?.split(" ")[0] || "there";

  return (
    <EmailLayout previewText={`${acceptorName} accepted your connection request on CodeNearby 🎉`}>
      <Section>
        <Text style={{ ...styles.h1, fontSize: "26px" }}>
          🎉 You&apos;re now connected!
        </Text>
        <Text style={styles.body_text}>
          Great news, {firstName} —{" "}
          <strong style={{ color: colors.text }}>{acceptorName}</strong> accepted your connection request. Time to start collaborating!
        </Text>

        {/* Acceptor card */}
        <Section style={{
          backgroundColor: colors.bg,
          borderRadius: "12px",
          border: `1px solid ${colors.border}`,
          padding: "20px 24px",
          margin: "0 0 28px",
        }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            {acceptorAvatar && (
              <Img
                src={acceptorAvatar}
                alt={acceptorName}
                width={52}
                height={52}
                style={{ borderRadius: "50%", marginRight: "16px", flexShrink: 0 }}
              />
            )}
            <div>
              <Text style={{ fontSize: "16px", fontWeight: "700", color: colors.text, margin: "0 0 2px" }}>
                {acceptorName}
              </Text>
              <Text style={{ fontSize: "13px", color: colors.accent, margin: "0" }}>
                @{acceptorUsername}
              </Text>
            </div>
          </div>
        </Section>

        <Section style={{ textAlign: "center" }}>
          <Button
            href={`${APP_URL}/developers/${acceptorUsername}`}
            style={styles.ctaButton}
          >
            View Profile →
          </Button>
        </Section>
      </Section>
    </EmailLayout>
  );
}

export default FriendAcceptedEmail;
