import React from "react";
import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Section,
  Img,
  Text,
  Link,
  Hr,
} from "@react-email/components";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://codenearby.space";

const colors = {
  bg: "#000000",
  surface: "#0d0d0d",
  border: "#1f1f1f",
  accent: "#FF5C1A",
  accentHover: "#e04e10",
  text: "#fafafa",
  muted: "#a1a1aa",
};

const styles = {
  body: {
    backgroundColor: colors.bg,
    fontFamily: '-apple-system,"Segoe UI",Roboto,Helvetica,Arial,sans-serif',
    margin: "0",
    padding: "0",
  },
  container: {
    maxWidth: "560px",
    margin: "0 auto",
    padding: "40px 16px",
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: "16px",
    border: `1px solid ${colors.border}`,
    padding: "40px 36px",
  },
  header: {
    textAlign: "center" as const,
    paddingBottom: "28px",
    borderBottom: `1px solid ${colors.border}`,
    marginBottom: "28px",
  },
  logoWrapper: {
    display: "inline-block",
  },
  logo: {
    width: "52px",
    height: "52px",
    borderRadius: "12px",
  },
  brandName: {
    fontSize: "20px",
    fontWeight: "700",
    color: colors.text,
    margin: "8px 0 0",
    letterSpacing: "-0.3px",
  },
  brandSub: {
    fontSize: "13px",
    color: colors.muted,
    margin: "2px 0 0",
  },
  h1: {
    fontSize: "22px",
    fontWeight: "700",
    color: colors.text,
    margin: "0 0 12px",
    lineHeight: "1.3",
    letterSpacing: "-0.3px",
  },
  body_text: {
    fontSize: "15px",
    color: colors.muted,
    lineHeight: "1.6",
    margin: "0 0 24px",
  },
  ctaButton: {
    display: "inline-block",
    backgroundColor: colors.accent,
    color: "#ffffff",
    fontSize: "15px",
    fontWeight: "600",
    padding: "13px 28px",
    borderRadius: "10px",
    textDecoration: "none",
    letterSpacing: "0.1px",
  },
  footer: {
    textAlign: "center" as const,
    marginTop: "28px",
    paddingTop: "20px",
    borderTop: `1px solid ${colors.border}`,
  },
  footerText: {
    fontSize: "12px",
    color: colors.muted,
    lineHeight: "1.6",
    margin: "0",
  },
  footerLink: {
    color: colors.muted,
    textDecoration: "underline",
  },
  divider: {
    borderColor: colors.border,
    margin: "24px 0",
  },
};

interface EmailLayoutProps {
  previewText: string;
  children: React.ReactNode;
}

export function EmailLayout({ previewText, children }: EmailLayoutProps) {
  return (
    <Html lang="en">
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <div style={styles.card}>
            {/* Header */}
            <Section style={styles.header}>
              <div style={styles.logoWrapper}>
                <Img
                  src={`${APP_URL}/logo.png`}
                  alt="CodeNearby"
                  width={52}
                  height={52}
                  style={styles.logo}
                />
              </div>
              <Text style={styles.brandName}>CodeNearby</Text>
              <Text style={styles.brandSub}>Connect with developers nearby</Text>
            </Section>

            {/* Content */}
            {children}

            {/* Footer */}
            <Section style={styles.footer}>
              <Hr style={styles.divider} />
              <Text style={styles.footerText}>
                You&apos;re receiving this because you have a CodeNearby account.{" "}
                <Link
                  href={`${APP_URL}/settings/notifications`}
                  style={styles.footerLink}
                >
                  Unsubscribe
                </Link>
                {" · "}
                <Link href={APP_URL} style={styles.footerLink}>
                  codenearby.space
                </Link>
              </Text>
            </Section>
          </div>
        </Container>
      </Body>
    </Html>
  );
}

export { styles, colors, APP_URL };
