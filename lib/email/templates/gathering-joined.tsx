import React from "react";
import { Section, Text, Button, Img } from "@react-email/components";
import { EmailLayout, styles, colors, APP_URL } from "./_layout";

interface GatheringJoinedEmailProps {
  hostName: string;
  joinerName: string;
  joinerUsername: string;
  joinerAvatar?: string;
  gatheringName: string;
  gatheringSlug: string;
  participantCount: number;
}

export function GatheringJoinedEmail({
  hostName,
  joinerName,
  joinerUsername,
  joinerAvatar,
  gatheringName,
  gatheringSlug,
  participantCount,
}: GatheringJoinedEmailProps) {
  const firstName = hostName?.split(" ")[0] || "there";

  return (
    <EmailLayout previewText={`${joinerName} just joined your gathering "${gatheringName}"`}>
      <Section>
        <Text style={styles.h1}>
          New participant in your gathering!
        </Text>
        <Text style={styles.body_text}>
          Hey {firstName},{" "}
          <strong style={{ color: colors.text }}>{joinerName}</strong> just joined your gathering{" "}
          <strong style={{ color: colors.text }}>&ldquo;{gatheringName}&rdquo;</strong>.
          {participantCount > 1 && (
            <> You now have <strong style={{ color: colors.accent }}>{participantCount} participants</strong>.</>
          )}
        </Text>

        {/* Joiner card */}
        <Section style={{
          backgroundColor: colors.bg,
          borderRadius: "12px",
          border: `1px solid ${colors.border}`,
          padding: "20px 24px",
          margin: "0 0 16px",
        }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            {joinerAvatar && (
              <Img
                src={joinerAvatar}
                alt={joinerName}
                width={48}
                height={48}
                style={{ borderRadius: "50%", marginRight: "16px", flexShrink: 0 }}
              />
            )}
            <div>
              <Text style={{ fontSize: "15px", fontWeight: "700", color: colors.text, margin: "0 0 2px" }}>
                {joinerName}
              </Text>
              <Text style={{ fontSize: "13px", color: colors.accent, margin: "0" }}>
                @{joinerUsername}
              </Text>
            </div>
          </div>
        </Section>

        {/* Stat pill */}
        <Section style={{ marginBottom: "28px" }}>
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            backgroundColor: "rgba(255,92,26,0.1)",
            border: `1px solid rgba(255,92,26,0.25)`,
            borderRadius: "100px",
            padding: "6px 14px",
          }}>
            <Text style={{ fontSize: "13px", color: colors.accent, margin: "0", fontWeight: "600" }}>
              👥 {participantCount} {participantCount === 1 ? "participant" : "participants"} total
            </Text>
          </div>
        </Section>

        <Section style={{ textAlign: "center" }}>
          <Button
            href={`${APP_URL}/gathering/${gatheringSlug}`}
            style={styles.ctaButton}
          >
            View Gathering →
          </Button>
        </Section>
      </Section>
    </EmailLayout>
  );
}

export default GatheringJoinedEmail;
