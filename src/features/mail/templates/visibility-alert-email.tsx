import * as React from "react";
import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface VisibilityAlertEmailProps {
  userName: string;
  keyword: string;
  currentScore: number;
  previousScore: number;
  dropPercent: number;
  dashboardUrl: string;
}

export function VisibilityAlertEmail({
  userName,
  keyword,
  currentScore,
  previousScore,
  dropPercent,
  dashboardUrl,
}: VisibilityAlertEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>
        {`Alert: AI visibility for "${keyword}" dropped ${dropPercent}%`}
      </Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Visibility Drop Alert</Heading>
          <Text style={text}>Hi {userName},</Text>
          <Text style={text}>
            We detected a significant drop in AI visibility for your keyword:{" "}
            <strong>{keyword}</strong>
          </Text>

          <Section style={alertBox}>
            <Text style={alertTitle}>Score Change</Text>
            <Text style={scoreText}>
              {previousScore} → {currentScore}
            </Text>
            <Text style={dropText}>-{dropPercent}% decline</Text>
          </Section>

          <Text style={text}>
            This drop exceeds your alert threshold. We recommend reviewing
            recent changes to your website content, structured data, or
            llms.txt configuration.
          </Text>

          <Hr style={hr} />
          <Link href={dashboardUrl} style={button}>
            View Dashboard
          </Link>
          <Text style={footer}>
            You're receiving this email because you have visibility alerts
            enabled.{" "}
            <Link href="{{unsubscribe_url}}" style={link}>
              Manage alert settings
            </Link>
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const main: React.CSSProperties = {
  backgroundColor: "#f9fafb",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container: React.CSSProperties = {
  margin: "0 auto",
  padding: "20px 0 48px",
  maxWidth: 580,
};

const h1: React.CSSProperties = {
  fontSize: 24,
  fontWeight: "bold",
  marginBottom: 8,
  color: "#ef4444",
};

const text: React.CSSProperties = {
  fontSize: 16,
  lineHeight: "24px",
  color: "#374151",
};

const alertBox: React.CSSProperties = {
  backgroundColor: "#fef2f2",
  borderRadius: 8,
  padding: 24,
  textAlign: "center",
  marginTop: 24,
  marginBottom: 24,
  border: "1px solid #fecaca",
};

const alertTitle: React.CSSProperties = {
  fontSize: 14,
  color: "#dc2626",
  marginBottom: 8,
  fontWeight: "bold",
};

const scoreText: React.CSSProperties = {
  fontSize: 24,
  fontWeight: "bold",
  color: "#1f2937",
};

const dropText: React.CSSProperties = {
  fontSize: 18,
  color: "#ef4444",
  marginTop: 8,
  fontWeight: "bold",
};

const hr: React.CSSProperties = {
  borderColor: "#e5e7eb",
  margin: "24px 0",
};

const button: React.CSSProperties = {
  backgroundColor: "#ef4444",
  borderRadius: 6,
  color: "#fff",
  fontSize: 16,
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center",
  display: "inline-block",
  padding: "12px 24px",
};

const footer: React.CSSProperties = {
  fontSize: 12,
  color: "#9ca3af",
  marginTop: 32,
};

const link: React.CSSProperties = {
  color: "#4f46e5",
  textDecoration: "underline",
};
