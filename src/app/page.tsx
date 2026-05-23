import Link from "next/link";
import type { ReactNode } from "react";
import { SignedIn } from "@clerk/nextjs";
import { Activity, ArrowRight, BarChart3, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CreateProjectDialog } from "@/components/dashboard/create-project-dialog";
import { FadeIn } from "@/components/ui/fade-in";
import { GlowingTerminal } from "@/components/ui/glowing-terminal";
import { AbstractHeroShapes } from "@/components/ui/abstract-hero-shapes";

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
    <main className="w-full bg-neutral-50 dark:bg-[#0F0F0F] min-h-screen text-neutral-900 dark:text-white overflow-hidden relative transition-colors duration-300">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,var(--tw-gradient-stops))] from-blue-100/50 via-neutral-50 to-neutral-50 dark:from-blue-900/10 dark:via-[#0F0F0F] dark:to-[#0F0F0F] pointer-events-none -z-10 transition-colors duration-300" />

      <div className="mx-auto max-w-7xl px-6 py-20 lg:py-24">
        {/* New 2-Column Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-12 lg:gap-8 items-center w-full z-10 relative">
          
          {/* Left Content Area */}
          <FadeIn className="flex flex-col items-start text-left">
            <h1 className="max-w-[12ch] font-display text-[clamp(3.1rem,8vw,6.6rem)] font-semibold leading-[0.92] tracking-[-0.08em] text-neutral-950 dark:text-[#F5F5F5] text-balance">
              <span className="block">Innovate</span>
              <span className="mt-3 block">
                <span className="inline-flex relative isolate">
                  <span className="absolute inset-0 rounded-2xl md:rounded-3xl bg-linear-to-r from-[#FF758C] to-[#FF7EB3]" />
                  <span className="relative inline-flex px-4 md:px-5 py-1 text-[0.92em] font-semibold tracking-tighter text-neutral-950">
                    Faster
                  </span>
                </span>
              </span>
              <span className="mt-2 block">Than ever</span>
              <span className="mt-4 block text-[0.34em] font-medium tracking-[-0.03em] leading-[1.15] text-neutral-600 dark:text-neutral-400">
                With a committed dev partner
              </span>
              <span className="mt-5 block text-[0.30em] tracking-[-0.12em] text-neutral-400 dark:text-neutral-500">
                {">>>"}
              </span>
            </h1>

            <div className="mt-10 flex gap-5 md:gap-6">
              <div className="flex flex-col items-center mt-2.5 opacity-60">
                <div className="w-1.5 h-1.5 rounded-full bg-black dark:bg-white" />
                <div className="w-px grow bg-black/20 dark:bg-white/40 my-1 min-h-16" />
                <div className="w-1.5 h-1.5 rounded-full bg-black dark:bg-white" />
              </div>
              <p className="max-w-xl text-pretty text-base sm:text-lg md:text-xl leading-8 text-neutral-600 dark:text-neutral-400">
                Whether you're looking to streamline your operations, enhance customer experiences, or boost productivity, our expert team is here to help you achieve your goals.
              </p>
            </div>

            <div className="mt-12 flex flex-wrap items-center gap-4">
              <Button asChild size="lg" className="rounded-md font-semibold text-sm bg-transparent hover:bg-black/5 dark:hover:bg-white/5 border border-black/20 dark:border-white/20 text-neutral-900 dark:text-white tracking-widest px-8 shadow-[0_0_20px_rgba(0,0,0,0.05)] dark:shadow-[0_0_20px_rgba(255,255,255,0.05)] uppercase transition-all duration-300">
                <Link href="/dashboard" prefetch={false}>
                  Work with us
                </Link>
              </Button>
              <SignedIn>
                <div className="ml-2">
                  <CreateProjectDialog />
                </div>
              </SignedIn>
            </div>
          </FadeIn>

          {/* Right Content Area - Abstract Shapes */}
          <div className="relative w-full h-100 lg:h-150 flex items-center justify-center">
            <AbstractHeroShapes />
          </div>

        </div>

        {/* Code Demo Section */}
        <div className="mt-32 max-w-3xl mx-auto hidden md:block">
          <GlowingTerminal installSnippet={installSnippet} sdkSnippet={sdkSnippet} />
        </div>

        {/* Feature Grid */}
        <section className="mt-32 grid gap-6 md:grid-cols-3 text-left w-full mx-auto max-w-6xl">
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
      </div>
    </main>
  );
}

function FeatureCard({ icon, title, text }: { icon: ReactNode; title: string; text: string }) {
  return (
    <Card className="h-full border border-black/10 dark:border-white/10 bg-white dark:bg-[#141414] transition-all hover:bg-neutral-50 dark:hover:bg-[#1A1A1A] hover:border-black/20 dark:hover:border-white/20 group">
      <CardHeader>
        <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg border border-black/10 dark:border-white/10 bg-neutral-100 dark:bg-[#0B0B0B] text-neutral-900 dark:text-white transition-colors group-hover:border-black/20 dark:group-hover:border-white/30">
          {icon}
        </div>
        <CardTitle className="text-lg text-neutral-900 dark:text-white">{title}</CardTitle>
        <CardDescription className="text-neutral-600 dark:text-neutral-400 mt-2 leading-relaxed">{text}</CardDescription>
      </CardHeader>
    </Card>
  );
}
