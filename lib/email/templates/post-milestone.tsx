import React from "react";
import { Section, Text, Button } from "@react-email/components";
import { EmailLayout, styles, colors, APP_URL } from "./_layout";

interface PostMilestoneEmailProps {
  authorName: string;
  postTitle?: string;
  postId: string;
  milestone: number;
}

const milestoneMessages: Record<number, { emoji: string; headline: string; sub: string }> = {
  1: {
    emoji: "❤️",
    headline: "Someone liked your post!",
    sub: "You got your first upvote. The community is noticing your work.",
  },
  10: {
    emoji: "🚀",
    headline: "Your post just hit 10 votes!",
    sub: "You're gaining momentum. The community loves your content.",
  },
  50: {
    emoji: "🔥",
    headline: "50 votes — your post is on fire!",
    sub: "Your post is trending on CodeNearby. Keep the great content coming.",
  },
  100: {
    emoji: "🏆",
    headline: "100 votes! You're a legend.",
    sub: "One of the most upvoted posts on CodeNearby. Incredible work.",
  },
};

export function PostMilestoneEmail({
  authorName,
  postTitle,
  postId,
  milestone,
}: PostMilestoneEmailProps) {
  const firstName = authorName?.split(" ")[0] || "there";
  const msg = milestoneMessages[milestone] ?? {
    emoji: "⭐",
    headline: `Your post hit ${milestone} votes!`,
    sub: "The community is really enjoying your content.",
  };

  return (
    <EmailLayout previewText={`${msg.emoji} ${msg.headline} Check it out on CodeNearby.`}>
      <Section>
        {/* Big milestone number */}
        <Section style={{
          textAlign: "center",
          backgroundColor: colors.bg,
          borderRadius: "16px",
          border: `1px solid ${colors.border}`,
          padding: "28px 24px",
          margin: "0 0 24px",
        }}>
          <Text style={{ fontSize: "48px", margin: "0 0 4px", lineHeight: "1" }}>{msg.emoji}</Text>
          <Text style={{
            fontSize: "52px",
            fontWeight: "800",
            color: colors.accent,
            margin: "0",
            lineHeight: "1",
            letterSpacing: "-2px",
          }}>
            {milestone}
          </Text>
          <Text style={{ fontSize: "14px", color: colors.muted, margin: "6px 0 0", fontWeight: "600", textTransform: "uppercase", letterSpacing: "1px" }}>
            votes
          </Text>
        </Section>

        <Text style={styles.h1}>{msg.headline}</Text>
        <Text style={styles.body_text}>
          Hey {firstName}, {msg.sub}
          {postTitle && (
            <> Your post <strong style={{ color: colors.text }}>&ldquo;{postTitle}&rdquo;</strong> is making waves.</>
          )}
        </Text>

        <Section style={{ textAlign: "center" }}>
          <Button
            href={`${APP_URL}/posts/${postId}`}
            style={styles.ctaButton}
          >
            See Your Post →
          </Button>
        </Section>
      </Section>
    </EmailLayout>
  );
}

export default PostMilestoneEmail;
