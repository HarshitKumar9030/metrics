import Link from "next/link";
import type { ReactNode } from "react";
import { SignedIn } from "@clerk/nextjs";
import { Activity, ArrowRight, BarChart3, KeyRound, TerminalSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CreateProjectDialog } from "@/components/dashboard/create-project-dialog";
import { FadeIn } from "@/components/ui/fade-in";
import { GlowingTerminal } from "@/components/ui/glowing-terminal";

const installSnippet = `npm install harshit-metrics`;

const sdkSnippet = `import { createMetricsClient } from "harshit-metrics";

const metrics = createMetricsClient("mtr_your_api_key_here", {
  endpoint: "https://metrics.harshit.page/api/collect",
  autoTrackPageviews: true,
});

metrics.track("signup_clicked", {
  metadata: {
    plan: "pro",
    source: "hero",
  },
});`;

export default function Home() {
  return (
    <main className="mx-auto flex flex-col items-center max-w-6xl px-6 py-24 md:py-32 overflow-hidden text-center">
      {/* Hero Section */}
      <FadeIn className="flex flex-col items-center relative w-full pt-8">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-black/5 dark:bg-white/5 opacity-50 dark:opacity-100 blur-[100px] rounded-full pointer-events-none -z-10" />
        
        <div className="inline-flex items-center gap-2 rounded-full border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 px-3 py-1.5 mb-8 text-xs font-medium text-neutral-600 dark:text-neutral-300 backdrop-blur-md transition-colors hover:border-black/20 dark:hover:border-white/20">
          <Activity className="h-3.5 w-3.5 text-neutral-500 dark:text-neutral-400" />
          <span>Introducing Harshit Metrics SDK</span>
        </div>
        
        <h1 className="text-5xl font-bold tracking-tight text-neutral-900 dark:text-white md:text-7xl lg:text-8xl max-w-4xl mx-auto drop-shadow-sm">
          Own your analytics. <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-b from-neutral-800 to-neutral-400 dark:from-white dark:to-neutral-500">
            Track every event.
          </span>
        </h1>
        
        <p className="mt-6 max-w-2xl text-lg text-neutral-600 dark:text-neutral-400 md:text-xl font-medium leading-relaxed">
          API-key based web analytics with your own dashboard, custom event pipeline, and a TypeScript SDK ready for any modern frontend app.
        </p>
        
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Button asChild size="lg" className="rounded-full shadow-lg dark:shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)]">
            <Link href="/dashboard" prefetch={false}>
              Open dashboard
              <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </Button>
          <Button variant="secondary" size="lg" asChild className="rounded-full bg-white dark:bg-transparent text-neutral-900 dark:text-white border-neutral-200 dark:border-white/10">
            <Link href="/docs">Read documentation</Link>
          </Button>
          <SignedIn>
            <CreateProjectDialog />
          </SignedIn>
        </div>
      </FadeIn>

      {/* Code Demo Section */}
      <GlowingTerminal installSnippet={installSnippet} sdkSnippet={sdkSnippet} />

      {/* Feature Grid */}
      <section className="mt-32 grid gap-6 md:grid-cols-3 text-left w-full">
        <FadeIn delay={0.3}>
          <FeatureCard
            icon={<BarChart3 className="h-5 w-5" />}
            title="Detailed dashboards"
            text="Pageviews, custom events, top paths, and precise trends over time in beautiful charts."
          />
        </FadeIn>
        <FadeIn delay={0.4}>
          <FeatureCard
            icon={<KeyRound className="h-5 w-5" />}
            title="API key isolation"
            text="Generate per-project and per-app keys for cleaner attribution and absolute security."
          />
        </FadeIn>
        <FadeIn delay={0.5}>
          <FeatureCard
            icon={<Activity className="h-5 w-5" />}
            title="Custom event stream"
            text="Track rich metadata, payloads, and deeply customized user behavior from your own apps."
          />
        </FadeIn>
      </section>
    </main>
  );
}

function FeatureCard({ icon, title, text }: { icon: ReactNode; title: string; text: string }) {
  return (
    <Card className="h-full border border-[color:var(--border)] bg-white/50 dark:bg-transparent transition-all hover:bg-white/80 dark:hover:bg-white/[0.02] hover:border-black/10 dark:hover:border-white/20 group">
      <CardHeader>
        <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[color:var(--border)] bg-neutral-100 dark:bg-black text-black dark:text-white transition-colors group-hover:border-neutral-300 dark:group-hover:border-neutral-500 group-hover:bg-neutral-200 dark:group-hover:bg-neutral-900">
          {icon}
        </div>
        <CardTitle className="text-lg text-neutral-900 dark:text-white">{title}</CardTitle>
        <CardDescription className="text-neutral-600 dark:text-neutral-400 mt-2 leading-relaxed">{text}</CardDescription>
      </CardHeader>
    </Card>
  );
}
