import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { createAdditionalApiKey, listProjectKeys } from "@/lib/metrics";

const createKeySchema = z.object({
  projectId: z.string().length(24),
  label: z.string().min(2).max(40).default("SDK key"),
});

const listQuerySchema = z.object({
  projectId: z.string().length(24),
});

export async function GET(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const query = Object.fromEntries(request.nextUrl.searchParams.entries());
  const parsed = listQuerySchema.safeParse(query);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Invalid query",
        details: parsed.error.flatten(),
      },
      { status: 400 },
    );
  }

  const keys = await listProjectKeys(parsed.data.projectId, userId);
  return NextResponse.json({ keys });
}

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = createKeySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Invalid payload",
        details: parsed.error.flatten(),
      },
      { status: 400 },
    );
  }

  try {
    const apiKey = await createAdditionalApiKey(parsed.data.projectId, parsed.data.label, userId);
    return NextResponse.json({ apiKey }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Could not create API key",
      },
      { status: 404 },
    );
  }
}
