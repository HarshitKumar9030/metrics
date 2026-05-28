import Link from "next/link";
import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import {
  Activity,
  ArrowLeft,
  CalendarRange,
  Clock,
  Eye,
  Globe,
  Laptop,
  MapPin,
  Monitor,
  MousePointerClick,
  Radio,
  TrendingDown,
  Users,
  Zap,
} from "lucide-react";
import { countryCodeToFlag, countryCodeToName } from "@/lib/ua-parser";
import { CreateApiKeyDialog } from "@/components/dashboard/create-api-key-dialog";
import { CreateProjectDialog } from "@/components/dashboard/create-project-dialog";
import { ProjectSwitcher } from "@/components/dashboard/project-switcher";
import { TimelineChart } from "@/components/dashboard/timeline-chart";
import { Badge } from "@/components/ui/badge";
import { getDashboardData, listProjectKeys, listProjects } from "@/lib/metrics";
import { FadeIn, FadeInStagger } from "@/components/ui/fade-in";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ project?: string; days?: string }>;
}) {
  const { userId, redirectToSignIn } = await auth();
  if (!userId) {
    return redirectToSignIn();
  }

  const params = await searchParams;
  const projects = await listProjects(userId);

  if (projects.length === 0) {
    return <EmptyDashboard />;
  }

  const selectedProjectId = params.project ?? projects[0].id;
  const selectedProject = projects.find((project) => project.id === selectedProjectId);

  if (!selectedProject) {
    notFound();
  }

  const days = Number(params.days ?? "14");
  const normalizedDays = Number.isFinite(days) ? Math.max(1, Math.min(days, 90)) : 14;

  const [data, keys] = await Promise.all([
    getDashboardData(selectedProject.id, userId, normalizedDays),
    listProjectKeys(selectedProject.id, userId),
  ]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-100 selection:bg-zinc-800">
      <FadeInStagger className="mx-auto max-w-6xl space-y-6 px-6 py-12">
        <FadeIn>
          <header className="flex flex-col gap-6 pb-2 md:flex-row md:items-end md:justify-between">
            <div className="space-y-4">
              <Link href="/" className="group inline-flex items-center gap-2 text-xs font-medium text-zinc-500 hover:text-zinc-300 transition-colors">
                <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
                Back to projects
              </Link>
              <div className="space-y-1.5">
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-semibold tracking-tight text-zinc-100">{selectedProject.name}</h1>
                  {data.liveVisitors > 0 && (
                    <div className="flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-emerald-400 animate-pulse">
                      <Radio className="h-2.5 w-2.5" />
                      {data.liveVisitors} Live
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs font-medium text-zinc-500">
                  <CalendarRange className="h-3.5 w-3.5" />
                  Last {normalizedDays} days
                </div>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <ProjectSwitcher projects={projects} selectedProjectId={selectedProject.id} days={normalizedDays} />
              <div className="h-4 w-px bg-white/10 mx-2 hidden md:block" />
              <CreateApiKeyDialog projectId={selectedProject.id} />
              <CreateProjectDialog />
            </div>
          </header>
        </FadeIn>

        {/* Summary Cards */}
        <section className="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
          <FadeIn><MetricCard icon={<MousePointerClick className="h-3.5 w-3.5" />} label="Events" value={data.summary.totalEvents.toLocaleString()} /></FadeIn>
          <FadeIn><MetricCard icon={<Eye className="h-3.5 w-3.5" />} label="Pageviews" value={data.summary.pageviews.toLocaleString()} /></FadeIn>
          <FadeIn><MetricCard icon={<Users className="h-3.5 w-3.5" />} label="Visitors" value={data.summary.uniqueVisitors.toLocaleString()} /></FadeIn>
          <FadeIn><MetricCard icon={<Zap className="h-3.5 w-3.5" />} label="Sessions" value={data.summary.uniqueSessions.toLocaleString()} /></FadeIn>
          <FadeIn><MetricCard icon={<Clock className="h-3.5 w-3.5" />} label="Duration" value={formatDuration(data.summary.avgSessionDurationMs)} /></FadeIn>
          <FadeIn><MetricCard icon={<TrendingDown className="h-3.5 w-3.5" />} label="Bounce" value={`${data.summary.bounceRate}%`} /></FadeIn>
        </section>

        {/* Timeline + Top Paths */}
        <section className="grid gap-4 lg:grid-cols-[1.8fr_1fr]">
          <FadeIn>
            <LinearCard title="Traffic overview" description="Events and pageviews over time.">
              <div className="mt-4">
                <TimelineChart data={data.timeline} />
              </div>
            </LinearCard>
          </FadeIn>

          <FadeIn>
            <LinearCard title="Top pages" description="Most viewed paths.">
              {data.topPaths.length === 0 ? (
                <EmptyState message="No pageviews yet." />
              ) : (
                <div className="mt-4 space-y-2">
                  {data.topPaths.map((p) => (
                    <div key={p.path} className="group flex items-center justify-between gap-3 text-sm rounded-md hover:bg-white/[0.02] -mx-2 px-2 py-1 transition-colors">
                      <p className="truncate text-zinc-300 font-medium">{p.path}</p>
                      <span className="tabular-nums text-zinc-500 font-mono text-xs">{p.views.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              )}
            </LinearCard>
          </FadeIn>
        </section>

        {/* Referrers + Countries */}
        <section className="grid gap-4 md:grid-cols-2">
          <FadeIn>
            <LinearCard icon={<Globe className="h-3.5 w-3.5" />} title="Top referrers">
              {data.topReferrers.length === 0 ? (
                <EmptyState message="No referrer data." />
              ) : (
                <div className="mt-4 space-y-2">
                  {data.topReferrers.map((r) => (
                    <div key={r.referrer} className="group flex items-center justify-between gap-3 text-sm rounded-md hover:bg-white/[0.02] -mx-2 px-2 py-1 transition-colors">
                      <p className="truncate text-zinc-300 font-medium">{cleanReferrer(r.referrer)}</p>
                      <span className="tabular-nums text-zinc-500 font-mono text-xs">{r.count.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              )}
            </LinearCard>
          </FadeIn>

          <FadeIn>
            <LinearCard icon={<MapPin className="h-3.5 w-3.5" />} title="Countries">
              {data.countryBreakdown.length === 0 ? (
                <EmptyState message="No country data yet. Deploy to Vercel for automatic geo detection." />
              ) : (
                <div className="mt-4 space-y-2">
                  {data.countryBreakdown.map((c) => {
                    const total = data.countryBreakdown.reduce((s, x) => s + x.count, 0);
                    const pct = total > 0 ? Math.round((c.count / total) * 100) : 0;
                    return (
                      <div key={c.country} className="group flex items-center justify-between gap-3 text-sm rounded-md hover:bg-white/[0.02] -mx-2 px-2 py-1.5 transition-colors">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-base leading-none">{countryCodeToFlag(c.country)}</span>
                          <span className="truncate text-zinc-300 font-medium">{countryCodeToName(c.country)}</span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <div className="w-16 h-1 rounded-full bg-white/5 overflow-hidden hidden sm:block">
                            <div className="h-full bg-zinc-400 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="tabular-nums text-zinc-500 font-mono text-xs w-6 text-right">{pct}%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </LinearCard>
          </FadeIn>
        </section>

        {/* Browsers + Devices + OS */}
        <section className="grid gap-4 md:grid-cols-3">
          <FadeIn>
            <LinearCard icon={<Monitor className="h-3.5 w-3.5" />} title="Browsers">
              {data.browserBreakdown.length === 0 ? (
                <EmptyState message="No browser data yet." />
              ) : (
                <div className="mt-5 space-y-4">
                  {data.browserBreakdown.map((b) => {
                    const total = data.browserBreakdown.reduce((s, x) => s + x.count, 0);
                    const pct = total > 0 ? Math.round((b.count / total) * 100) : 0;
                    return (
                      <div key={b.browser} className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs font-medium">
                          <span className="text-zinc-300">{b.browser}</span>
                          <span className="tabular-nums text-zinc-500">{pct}%</span>
                        </div>
                        <div className="h-0.5 w-full overflow-hidden rounded-full bg-white/5">
                          <div className="h-full bg-zinc-400 transition-all duration-500" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </LinearCard>
          </FadeIn>

          <FadeIn>
            <LinearCard icon={<Activity className="h-3.5 w-3.5" />} title="Devices">
              {data.deviceBreakdown.length === 0 ? (
                <EmptyState message="No device data yet." />
              ) : (
                <div className="mt-5 space-y-4">
                  {data.deviceBreakdown.map((d) => {
                    const total = data.deviceBreakdown.reduce((s, x) => s + x.count, 0);
                    const pct = total > 0 ? Math.round((d.count / total) * 100) : 0;
                    return (
                      <div key={d.deviceType} className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs font-medium">
                          <span className="text-zinc-300 capitalize">{d.deviceType}</span>
                          <span className="tabular-nums text-zinc-500">{pct}%</span>
                        </div>
                        <div className="h-0.5 w-full overflow-hidden rounded-full bg-white/5">
                          <div className="h-full bg-zinc-400 transition-all duration-500" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </LinearCard>
          </FadeIn>

          <FadeIn>
            <LinearCard icon={<Laptop className="h-3.5 w-3.5" />} title="Operating Systems">
              {data.osBreakdown.length === 0 ? (
                <EmptyState message="No OS data yet." />
              ) : (
                <div className="mt-5 space-y-4">
                  {data.osBreakdown.map((o) => {
                    const total = data.osBreakdown.reduce((s, x) => s + x.count, 0);
                    const pct = total > 0 ? Math.round((o.count / total) * 100) : 0;
                    return (
                      <div key={o.os} className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs font-medium">
                          <span className="text-zinc-300">{o.os}</span>
                          <span className="tabular-nums text-zinc-500">{pct}%</span>
                        </div>
                        <div className="h-0.5 w-full overflow-hidden rounded-full bg-white/5">
                          <div className="h-full bg-zinc-400 transition-all duration-500" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </LinearCard>
          </FadeIn>
        </section>

        {/* Custom Events + Hourly Heatmap */}
        <section className="grid gap-4 lg:grid-cols-2">
          <FadeIn>
            <LinearCard title="Custom events" description="Top business events triggered by users.">
              {data.eventBreakdown.length === 0 ? (
                <EmptyState message="No custom events yet." />
              ) : (
                <div className="mt-4 space-y-2">
                  {data.eventBreakdown.map((e) => (
                    <div key={e.name} className="group flex items-center justify-between gap-3 text-sm rounded-md hover:bg-white/[0.02] -mx-2 px-2 py-1.5 transition-colors">
                      <code className="text-[11px] px-1.5 py-0.5 rounded-md bg-white/[0.03] text-zinc-300 border border-white/[0.05] font-mono">{e.name}</code>
                      <span className="tabular-nums text-zinc-500 font-mono text-xs">{e.count.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              )}
            </LinearCard>
          </FadeIn>

          <FadeIn>
            <LinearCard title="Activity by hour" description="Event density over a 24-hour cycle (UTC).">
              {data.hourlyHeatmap.length === 0 ? (
                <EmptyState message="No activity data." />
              ) : (
                <div className="mt-6">
                  <HourlyHeatmap data={data.hourlyHeatmap} />
                </div>
              )}
            </LinearCard>
          </FadeIn>
        </section>

        {/* Recent Events Feed */}
        <FadeIn>
          <LinearCard icon={<Radio className="h-3.5 w-3.5 text-zinc-400" />} title="Event stream" description="Real-time chronological feed of the last 20 events.">
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse whitespace-nowrap">
                <thead>
                  <tr className="border-b border-white/[0.05]">
                    <th className="pb-3 text-xs font-medium text-zinc-500 font-mono uppercase tracking-wider">Event</th>
                    <th className="pb-3 text-xs font-medium text-zinc-500 font-mono uppercase tracking-wider pl-4">Path</th>
                    <th className="pb-3 text-xs font-medium text-zinc-500 font-mono uppercase tracking-wider pl-4">Location</th>
                    <th className="pb-3 text-xs font-medium text-zinc-500 font-mono uppercase tracking-wider pl-4">Visitor</th>
                    <th className="pb-3 text-xs font-medium text-zinc-500 font-mono uppercase tracking-wider pl-4 text-right">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.02]">
                  {data.recentEvents.map((event) => (
                    <tr key={event.id} className="group hover:bg-white/[0.01] transition-colors">
                      <td className="py-2.5">
                        <code className="text-[11px] px-1.5 py-0.5 rounded-md bg-white/[0.03] text-zinc-300 border border-white/[0.05] font-mono">{event.name}</code>
                      </td>
                      <td className="py-2.5 pl-4 text-zinc-400 max-w-[200px] truncate">{event.path || "—"}</td>
                      <td className="py-2.5 pl-4 text-zinc-400 text-xs">
                        {event.country ? (
                          <span className="inline-flex items-center gap-1">
                            <span className="text-sm leading-none">{countryCodeToFlag(event.country)}</span>
                            <span>{countryCodeToName(event.country)}</span>
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="py-2.5 pl-4 font-mono text-[11px] text-zinc-500">{event.visitorId?.slice(0, 10) || "—"}</td>
                      <td className="py-2.5 pl-4 text-right tabular-nums text-xs text-zinc-500">{timeAgo(event.occurredAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </LinearCard>
        </FadeIn>

        {/* API Keys */}
        <FadeIn>
          <LinearCard title="API Keys" description="Keys used to authenticate SDK ingestion.">
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse whitespace-nowrap">
                <thead>
                  <tr className="border-b border-white/[0.05]">
                    <th className="pb-3 text-xs font-medium text-zinc-500 font-mono uppercase tracking-wider">Label</th>
                    <th className="pb-3 text-xs font-medium text-zinc-500 font-mono uppercase tracking-wider pl-4">Key Preview</th>
                    <th className="pb-3 text-xs font-medium text-zinc-500 font-mono uppercase tracking-wider pl-4">Created</th>
                    <th className="pb-3 text-xs font-medium text-zinc-500 font-mono uppercase tracking-wider pl-4">Last Used</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.02]">
                  {keys.map((key) => (
                    <tr key={key.id} className="group hover:bg-white/[0.01] transition-colors">
                      <td className="py-2.5 font-medium text-zinc-300">{key.label}</td>
                      <td className="py-2.5 pl-4 font-mono text-[11px] text-zinc-500">{key.keyPreview}</td>
                      <td className="py-2.5 pl-4 text-zinc-400 text-xs">{new Date(key.createdAt).toLocaleDateString()}</td>
                      <td className="py-2.5 pl-4 text-zinc-400 text-xs">{key.lastUsedAt ? new Date(key.lastUsedAt).toLocaleString() : "Never"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </LinearCard>
        </FadeIn>
      </FadeInStagger>
    </div>
  );
}

// ── Helper Components ──

function MetricCard({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-white/[0.08] bg-[#111111]/50 p-4 shadow-sm backdrop-blur-md transition-all hover:bg-[#111111]">
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-zinc-500">
          {icon}
          {label}
        </div>
        <div className="text-2xl font-semibold tracking-tight text-zinc-100 tabular-nums">
          {value}
        </div>
      </div>
    </div>
  );
}

function LinearCard({ title, description, icon, children }: { title: string; description?: string; icon?: ReactNode; children: ReactNode }) {
  return (
    <div className="h-full rounded-xl border border-white/[0.08] bg-[#111111]/30 p-5 shadow-sm backdrop-blur-md relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-50" />
      {(title || description) && (
        <div className="mb-2">
          <div className="flex items-center gap-2">
            {icon && <span className="text-zinc-500">{icon}</span>}
            <h2 className="text-[15px] font-semibold text-zinc-200 tracking-tight">{title}</h2>
          </div>
          {description && <p className="mt-1 text-[13px] text-zinc-500">{description}</p>}
        </div>
      )}
      {children}
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return <div className="mt-4 text-sm text-zinc-600 font-mono text-[11px]">{message}</div>;
}

function HourlyHeatmap({ data }: { data: Array<{ hour: number; count: number }> }) {
  const max = Math.max(...data.map((d) => d.count), 1);
  const hours = Array.from({ length: 24 }, (_, i) => {
    const found = data.find((d) => d.hour === i);
    return { hour: i, count: found?.count ?? 0 };
  });

  return (
    <div className="grid grid-cols-12 gap-1 md:gap-1.5">
      {hours.map((h) => {
        const intensity = h.count / max;
        const bg = intensity === 0
          ? "bg-white/[0.02] border border-white/[0.02]"
          : intensity < 0.25
            ? "bg-white/[0.08]"
            : intensity < 0.5
              ? "bg-white/[0.15]"
              : intensity < 0.75
                ? "bg-white/[0.25]"
                : "bg-zinc-300";
        return (
          <div key={h.hour} className="flex flex-col items-center gap-1.5">
            <div
              className={`w-full aspect-square rounded-[3px] transition-colors ${bg}`}
              title={`${h.hour}:00 — ${h.count} events`}
            />
            <span className="text-[9px] font-mono text-zinc-600">{h.hour}</span>
          </div>
        );
      })}
    </div>
  );
}

function EmptyDashboard() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6">
      <main className="flex max-w-md flex-col items-center justify-center gap-6 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.02] shadow-sm">
          <Activity className="h-5 w-5 text-zinc-400" />
        </div>
        <div className="space-y-2">
          <h1 className="text-xl font-semibold tracking-tight text-zinc-100">No projects yet</h1>
          <p className="text-sm text-zinc-500">
            Create your first project and add the SDK to start tracking events in real time.
          </p>
        </div>
        <CreateProjectDialog />
      </main>
    </div>
  );
}

// ── Utilities ──

function formatDuration(ms: number): string {
  if (ms === 0) return "0s";
  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds}s`;
}

function cleanReferrer(referrer: string): string {
  try {
    const url = new URL(referrer);
    return url.hostname;
  } catch {
    return referrer;
  }
}

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
