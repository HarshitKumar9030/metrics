import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { ingestEvents, resolveProjectByApiKey } from "@/lib/metrics";

const eventSchema = z.object({
  name: z.string().min(1).max(100),
  path: z.string().max(2048).optional(),
  url: z.string().max(4096).optional(),
  referrer: z.string().max(4096).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
  sessionId: z.string().max(200).optional(),
  visitorId: z.string().max(200).optional(),
  occurredAt: z.string().datetime().optional(),
});

const payloadSchema = z.object({
  events: z.array(eventSchema).min(1).max(100),
});

function withCors(response: NextResponse) {
  response.headers.set("access-control-allow-origin", "*");
  response.headers.set("access-control-allow-methods", "POST, OPTIONS");
  response.headers.set("access-control-allow-headers", "content-type, x-api-key");
  return response;
}

export async function OPTIONS() {
  return withCors(new NextResponse(null, { status: 204 }));
}

export async function POST(request: NextRequest) {
  const apiKey = request.headers.get("x-api-key") ?? request.nextUrl.searchParams.get("apiKey");

  if (!apiKey) {
    return withCors(
      NextResponse.json({ error: "Missing API key" }, { status: 401 }),
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = payloadSchema.safeParse(body);

  if (!parsed.success) {
    return withCors(
      NextResponse.json(
        {
          error: "Invalid payload",
          details: parsed.error.flatten(),
        },
        { status: 400 },
      ),
    );
  }

  const project = await resolveProjectByApiKey(apiKey);

  if (!project) {
    return withCors(NextResponse.json({ error: "Invalid API key" }, { status: 401 }));
  }

  const ipHeader = request.headers.get("x-forwarded-for");
  const ip = ipHeader?.split(",")[0]?.trim();

  const accepted = await ingestEvents(project.projectId, parsed.data.events, {
    ip,
    userAgent: request.headers.get("user-agent") ?? undefined,
  });

  return withCors(NextResponse.json({ accepted }, { status: 202 }));
}
