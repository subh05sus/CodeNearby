import React from "react";
import { Section, Text, Button, Img } from "@react-email/components";
import { EmailLayout, styles, colors, APP_URL } from "./_layout";

interface PostCommentEmailProps {
  authorName: string;
  commenterName: string;
  commenterUsername: string;
  commenterAvatar?: string;
  postTitle?: string;
  commentPreview: string;
  postId: string;
}

export function PostCommentEmail({
  authorName,
  commenterName,
  commenterUsername,
  commenterAvatar,
  postTitle,
  commentPreview,
  postId,
}: PostCommentEmailProps) {
  const firstName = authorName?.split(" ")[0] || "there";
  const preview = commentPreview.length > 120 ? commentPreview.slice(0, 120) + "…" : commentPreview;

  return (
    <EmailLayout previewText={`${commenterName} commented on your post on CodeNearby`}>
      <Section>
        <Text style={styles.h1}>Someone commented on your post</Text>
        <Text style={styles.body_text}>
          Hey {firstName},{" "}
          <strong style={{ color: colors.text }}>{commenterName}</strong> left a comment on{" "}
          {postTitle ? (
            <strong style={{ color: colors.text }}>&ldquo;{postTitle}&rdquo;</strong>
          ) : (
            "your post"
          )}.
        </Text>

        {/* Comment bubble */}
        <Section style={{
          backgroundColor: colors.bg,
          borderRadius: "12px",
          border: `1px solid ${colors.border}`,
          padding: "20px 24px",
          margin: "0 0 28px",
        }}>
          <div style={{ display: "flex" }}>
            {commenterAvatar && (
              <Img
                src={commenterAvatar}
                alt={commenterName}
                width={40}
                height={40}
                style={{ borderRadius: "50%", marginRight: "12px", flexShrink: 0, marginTop: "2px" }}
              />
            )}
            <div>
              <div style={{ display: "flex", alignItems: "center", marginBottom: "6px" }}>
                <Text style={{ fontSize: "14px", fontWeight: "700", color: colors.text, margin: "0 8px 0 0" }}>
                  {commenterName}
                </Text>
                <Text style={{ fontSize: "12px", color: colors.muted, margin: "0" }}>
                  @{commenterUsername}
                </Text>
              </div>
              <Text style={{
                fontSize: "14px",
                color: "#d4d4d8",
                margin: "0",
                lineHeight: "1.6",
                borderLeft: `3px solid ${colors.accent}`,
                paddingLeft: "12px",
              }}>
                {preview}
              </Text>
            </div>
          </div>
        </Section>

        <Section style={{ textAlign: "center" }}>
          <Button
            href={`${APP_URL}/posts/${postId}`}
            style={styles.ctaButton}
          >
            View Comment →
          </Button>
        </Section>
      </Section>
    </EmailLayout>
  );
}

export default PostCommentEmail;
