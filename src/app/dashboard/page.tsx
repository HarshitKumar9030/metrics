import Link from "next/link";
import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { ArrowLeft, CalendarRange, Eye, MousePointerClick, Users } from "lucide-react";
import { CreateApiKeyDialog } from "@/components/dashboard/create-api-key-dialog";
import { CreateProjectDialog } from "@/components/dashboard/create-project-dialog";
import { ProjectSwitcher } from "@/components/dashboard/project-switcher";
import { TimelineChart } from "@/components/dashboard/timeline-chart";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
    <FadeInStagger className="mx-auto max-w-6xl space-y-8 px-6 py-10">
      <FadeIn>
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-2">
            <Link href="/" className="inline-flex items-center gap-2 text-sm text-[color:var(--text-muted)] hover:text-[color:var(--text)]">
              <ArrowLeft className="h-4 w-4" />
              Back to overview
            </Link>
            <h1 className="text-3xl font-semibold md:text-4xl">{selectedProject.name}</h1>
            <div className="flex items-center gap-2 text-sm text-[color:var(--text-muted)]">
              <CalendarRange className="h-4 w-4" />
              Last {normalizedDays} days
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <ProjectSwitcher projects={projects} selectedProjectId={selectedProject.id} days={normalizedDays} />
            <CreateApiKeyDialog projectId={selectedProject.id} />
            <CreateProjectDialog />
          </div>
        </header>
      </FadeIn>

      <section className="grid gap-4 md:grid-cols-3">
        <FadeIn>
          <MetricCard icon={<MousePointerClick className="h-4 w-4" />} label="Events" value={data.summary.totalEvents.toLocaleString()} />
        </FadeIn>
        <FadeIn>
          <MetricCard icon={<Eye className="h-4 w-4" />} label="Pageviews" value={data.summary.pageviews.toLocaleString()} />
        </FadeIn>
        <FadeIn>
          <MetricCard icon={<Users className="h-4 w-4" />} label="Unique visitors" value={data.summary.uniqueVisitors.toLocaleString()} />
        </FadeIn>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.7fr_1fr]">
        <FadeIn>
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Traffic timeline</CardTitle>
              <CardDescription>Events and pageviews in the selected window.</CardDescription>
            </CardHeader>
            <CardContent>
              <TimelineChart data={data.timeline} />
            </CardContent>
          </Card>
        </FadeIn>

        <FadeIn>
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Top paths</CardTitle>
              <CardDescription>Most viewed pages from pageview events.</CardDescription>
            </CardHeader>
            <CardContent>
              {data.topPaths.length === 0 ? (
                <p className="text-sm text-[color:var(--text-muted)]">No pageviews yet.</p>
              ) : (
                <div className="space-y-3">
                  {data.topPaths.map((path) => (
                    <div key={path.path} className="flex items-center justify-between gap-3 rounded-md border border-[color:var(--border)] px-3 py-2">
                      <p className="truncate text-sm text-[color:var(--text)]">{path.path}</p>
                      <Badge>{path.views.toLocaleString()}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </FadeIn>
      </section>

      <FadeIn>
        <Card>
          <CardHeader>
            <CardTitle>API keys</CardTitle>
            <CardDescription>Full values are hidden after creation for safety.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Label</TableHead>
                  <TableHead>Preview</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Last used</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {keys.map((key) => (
                  <TableRow key={key.id}>
                    <TableCell>{key.label}</TableCell>
                    <TableCell className="font-mono text-xs">{key.keyPreview}</TableCell>
                    <TableCell>{new Date(key.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>{key.lastUsedAt ? new Date(key.lastUsedAt).toLocaleString() : "Never"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </FadeIn>
    </FadeInStagger>
  );
}

function MetricCard({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardDescription className="flex items-center gap-2 text-xs uppercase tracking-[0.16em]">{icon}{label}</CardDescription>
        <CardTitle className="text-3xl">{value}</CardTitle>
      </CardHeader>
    </Card>
  );
}

function EmptyDashboard() {
  return (
    <main className="mx-auto flex min-h-[80vh] max-w-4xl flex-col items-center justify-center gap-5 px-6 text-center">
      <Badge variant="success">Ready to track</Badge>
      <h1 className="text-4xl font-semibold">No projects yet</h1>
      <p className="max-w-lg text-[color:var(--text-muted)]">
        Create your first project and copy the API key into your app with the SDK. Events will appear here in real time.
      </p>
      <CreateProjectDialog />
    </main>
  );
}
