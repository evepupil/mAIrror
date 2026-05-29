import { Activity, BarChart3, Bell, Globe, Plus, TrendingUp } from "lucide-react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { auth } from "@/lib/auth";
import { getPlanPrivileges } from "@/config/subscription-plan";
import { getUserPlan } from "@/features/subscription";

export default async function MonitoringPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    redirect("/sign-in");
  }

  const { plan } = await getUserPlan(session.user.id);
  const priv = getPlanPrivileges(plan);

  return (
    <div className="container mx-auto space-y-8 px-4 py-6 md:px-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Brand Monitoring
        </h1>
        <p className="text-muted-foreground">
          Track your brand's AI visibility across platforms
        </p>
      </div>

      {/* Current Plan Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Current Plan: {priv.name}</CardTitle>
          <CardDescription>
            {priv.maxKeywords > 0
              ? `${priv.maxKeywords} keywords · ${priv.frequency} reports`
              : "Upgrade to start monitoring"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="flex items-center gap-2 text-sm">
              <Globe className="h-4 w-4 text-muted-foreground" />
              <span>{priv.maxKeywords} keywords</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Bell className="h-4 w-4 text-muted-foreground" />
              <span>{priv.alerts ? "Alerts on" : "No alerts"}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
              <span>{priv.competitorReport ? "Competitor reports" : "Basic only"}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <span>{priv.historyDays}d history</span>
            </div>
          </div>

          {plan === "free" && (
            <Button asChild size="sm" className="mt-4">
              <a href="/#pricing">Upgrade to Start Monitoring</a>
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Placeholder: No keywords yet */}
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <Activity className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <h3 className="font-semibold mb-1">No keywords monitored yet</h3>
          <p className="text-sm text-muted-foreground mb-4 max-w-md">
            {plan === "free"
              ? "Upgrade to a paid plan to start monitoring your brand keywords across AI platforms."
              : "Add your first brand keyword to start tracking AI visibility."}
          </p>
          {plan !== "free" && (
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Add Keyword
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
