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

interface WeeklyReportEmailProps {
  userName: string;
  keywords: Array<{
    keyword: string;
    score: number;
    change: number;
    trend: "up" | "down" | "stable";
  }>;
  overallScore: number;
  scoreChange: number;
  reportUrl: string;
}

export function WeeklyReportEmail({
  userName,
  keywords,
  overallScore,
  scoreChange,
  reportUrl,
}: WeeklyReportEmailProps) {
  const changeText =
    scoreChange > 0
      ? `+${scoreChange}`
      : scoreChange < 0
        ? `${scoreChange}`
        : "0";

  const changeColor =
    scoreChange > 0 ? "#10b981" : scoreChange < 0 ? "#ef4444" : "#6b7280";

  return (
    <Html>
      <Head />
      <Preview>
        {`Your weekly AI visibility report — overall score: ${overallScore}/100`}
      </Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Weekly AI Visibility Report</Heading>
          <Text style={text}>Hi {userName},</Text>
          <Text style={text}>
            Here's your weekly AI brand visibility summary. We tracked{" "}
            {keywords.length} keyword{keywords.length > 1 ? "s" : ""} across
            AI platforms this week.
          </Text>

          <Section style={scoreBox}>
            <Text style={scoreLabel}>Overall Visibility Score</Text>
            <Text style={scoreValue}>{overallScore}/100</Text>
            <Text style={{ ...scoreChangeText, color: changeColor }}>
              {changeText} points vs last week
            </Text>
          </Section>

          <Heading style={h2}>Keyword Breakdown</Heading>
          {keywords.map((kw) => (
            <Section key={kw.keyword} style={keywordRow}>
              <Text style={keywordText}>
                {kw.keyword}: {kw.score}/100
                <span
                  style={{
                    color: kw.trend === "up" ? "#10b981" : kw.trend === "down" ? "#ef4444" : "#6b7280",
                    marginLeft: 8,
                    fontSize: 14,
                  }}
                >
                  {kw.change > 0 ? `▲ +${kw.change}` : kw.change < 0 ? `▼ ${kw.change}` : "—"}
                </span>
              </Text>
            </Section>
          ))}

          <Hr style={hr} />
          <Text style={text}>
            View your full report online for detailed trend charts and
            competitive analysis.
          </Text>
          <Link href={reportUrl} style={button}>
            View Full Report
          </Link>
          <Text style={footer}>
            You're receiving this email because you have an active mairror
            subscription.{" "}
            <Link href="{{unsubscribe_url}}" style={link}>
              Manage email preferences
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
};

const h2: React.CSSProperties = {
  fontSize: 18,
  fontWeight: "bold",
  marginTop: 24,
  marginBottom: 12,
};

const text: React.CSSProperties = {
  fontSize: 16,
  lineHeight: "24px",
  color: "#374151",
};

const scoreBox: React.CSSProperties = {
  backgroundColor: "#eef2ff",
  borderRadius: 8,
  padding: 24,
  textAlign: "center",
  marginTop: 24,
  marginBottom: 8,
};

const scoreLabel: React.CSSProperties = {
  fontSize: 14,
  color: "#6b7280",
  marginBottom: 4,
};

const scoreValue: React.CSSProperties = {
  fontSize: 48,
  fontWeight: "bold",
  color: "#4f46e5",
};

const scoreChangeText: React.CSSProperties = {
  fontSize: 14,
  marginTop: 8,
};

const keywordRow: React.CSSProperties = {
  padding: "12px 0",
  borderBottom: "1px solid #e5e7eb",
};

const keywordText: React.CSSProperties = {
  fontSize: 16,
  color: "#1f2937",
};

const hr: React.CSSProperties = {
  borderColor: "#e5e7eb",
  margin: "24px 0",
};

const button: React.CSSProperties = {
  backgroundColor: "#4f46e5",
  borderRadius: 6,
  color: "#fff",
  fontSize: 16,
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center",
  display: "inline-block",
  padding: "12px 24px",
  marginTop: 16,
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
