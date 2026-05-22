import React from "react";
import { Section, Text, Button } from "@react-email/components";
import { EmailLayout, styles, colors, APP_URL } from "./_layout";

interface RecentPost {
  title?: string;
  authorName: string;
  votes: number;
}

interface ReengagementEmailProps {
  userName: string;
  recentPosts?: RecentPost[];
  daysSince: number;
}

export function ReengagementEmail({
  userName,
  recentPosts = [],
  daysSince,
}: ReengagementEmailProps) {
  const firstName = userName?.split(" ")[0] || "there";

  return (
    <EmailLayout previewText={`${firstName}, your developer community misses you — see what's new on CodeNearby`}>
      <Section>
        <Text style={styles.h1}>
          We miss you, {firstName} 👋
        </Text>
        <Text style={styles.body_text}>
          It&apos;s been {daysSince} day{daysSince !== 1 ? "s" : ""} since you last visited CodeNearby. A lot has happened — new posts, new developers in your area, upcoming gatherings.
        </Text>

        {recentPosts.length > 0 && (
          <>
            <Text style={{ fontSize: "13px", fontWeight: "600", color: colors.accent, margin: "0 0 12px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Trending this week
            </Text>
            <Section style={{ margin: "0 0 24px" }}>
              {recentPosts.map((post, i) => (
                <div key={i} style={{
                  backgroundColor: colors.bg,
                  borderRadius: "10px",
                  border: `1px solid ${colors.border}`,
                  padding: "14px 18px",
                  marginBottom: "8px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}>
                  <div>
                    <Text style={{ fontSize: "14px", fontWeight: "600", color: colors.text, margin: "0 0 2px" }}>
                      {post.title || "Untitled post"}
                    </Text>
                    <Text style={{ fontSize: "12px", color: colors.muted, margin: "0" }}>
                      by {post.authorName}
                    </Text>
                  </div>
                  <Text style={{ fontSize: "13px", color: colors.accent, fontWeight: "700", margin: "0" }}>
                    ▲ {post.votes}
                  </Text>
                </div>
              ))}
            </Section>
          </>
        )}

        <Section style={{ textAlign: "center" }}>
          <Button href={`${APP_URL}/feed`} style={styles.ctaButton}>
            Back to CodeNearby →
          </Button>
        </Section>

        <Text style={{ ...styles.body_text, marginTop: "20px", fontSize: "13px" }}>
          Want to explore? Check out{" "}
          <a href={`${APP_URL}/developers`} style={{ color: colors.accent, textDecoration: "none" }}>
            developers near you
          </a>{" "}
          or{" "}
          <a href={`${APP_URL}/gathering`} style={{ color: colors.accent, textDecoration: "none" }}>
            upcoming gatherings
          </a>.
        </Text>
      </Section>
    </EmailLayout>
  );
}

export default ReengagementEmail;
