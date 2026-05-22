import React from "react";
import { Section, Text, Button, Img } from "@react-email/components";
import { EmailLayout, styles, colors, APP_URL } from "./_layout";

interface FriendRequestEmailProps {
  recipientName: string;
  senderName: string;
  senderUsername: string;
  senderAvatar?: string;
  senderBio?: string;
}

export function FriendRequestEmail({
  recipientName,
  senderName,
  senderUsername,
  senderAvatar,
  senderBio,
}: FriendRequestEmailProps) {
  const firstName = recipientName?.split(" ")[0] || "there";

  return (
    <EmailLayout previewText={`${senderName} wants to connect with you on CodeNearby`}>
      <Section>
        <Text style={styles.h1}>You have a new connection request</Text>
        <Text style={styles.body_text}>
          Hey {firstName}, <strong style={{ color: colors.text }}>{senderName}</strong> found you on CodeNearby and wants to connect.
        </Text>

        {/* Sender card */}
        <Section style={{
          backgroundColor: colors.bg,
          borderRadius: "12px",
          border: `1px solid ${colors.border}`,
          padding: "20px 24px",
          margin: "0 0 28px",
        }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            {senderAvatar && (
              <Img
                src={senderAvatar}
                alt={senderName}
                width={52}
                height={52}
                style={{ borderRadius: "50%", marginRight: "16px", flexShrink: 0 }}
              />
            )}
            <div>
              <Text style={{ fontSize: "16px", fontWeight: "700", color: colors.text, margin: "0 0 2px" }}>
                {senderName}
              </Text>
              <Text style={{ fontSize: "13px", color: colors.accent, margin: "0 0 6px" }}>
                @{senderUsername}
              </Text>
              {senderBio && (
                <Text style={{ fontSize: "13px", color: colors.muted, margin: "0", lineHeight: "1.5" }}>
                  {senderBio}
                </Text>
              )}
            </div>
          </div>
        </Section>

        <Section style={{ textAlign: "center" }}>
          <Button
            href={`${APP_URL}/friends/requests`}
            style={styles.ctaButton}
          >
            View Request →
          </Button>
        </Section>

        <Text style={{ ...styles.body_text, marginTop: "20px", fontSize: "13px" }}>
          Not interested? You can ignore the request and it will disappear.
        </Text>
      </Section>
    </EmailLayout>
  );
}

export default FriendRequestEmail;
