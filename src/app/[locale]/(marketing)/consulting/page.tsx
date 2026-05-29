import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Link } from "@/i18n/routing";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Consulting Services - mairror",
    description:
      "Get expert AI visibility improvement plans tailored to your brand's audit results.",
  };
}

export default async function ConsultingPage() {
  return (
    <div className="container mx-auto py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold tracking-tight mb-4">
          AI Visibility Consulting
        </h1>
        <p className="text-xl text-muted-foreground mb-12">
          Expert analysis and actionable improvement plans based on your brand's audit results.
        </p>

        <div className="grid gap-6 md:grid-cols-2 mb-12">
          <Card>
            <CardHeader>
              <CardTitle>Standard Audit Review</CardTitle>
              <CardDescription>$499 one-time</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>• Full audit report analysis</p>
              <p>• Prioritized action plan</p>
              <p>• llms.txt generation</p>
              <p>• JSON-LD recommendations</p>
              <p>• Email delivery in 3 business days</p>
              <Button asChild className="w-full mt-4">
                <Link href="/sign-up?plan=consulting-standard">Get Started</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-primary">
            <CardHeader>
              <CardTitle>Premium Implementation</CardTitle>
              <CardDescription>$1,499 one-time</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>• Everything in Standard</p>
              <p>• Direct implementation support</p>
              <p>• Custom content strategy</p>
              <p>• Competitor positioning analysis</p>
              <p>• 2 weeks of monitoring included</p>
              <Button asChild className="w-full mt-4">
                <Link href="/sign-up?plan=consulting-premium">Get Started</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Not sure what you need?</CardTitle>
            <CardDescription>
              Start with a free brand scan and we'll recommend the right plan for your brand.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline">
              <Link href="/">Free Brand Scan</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
