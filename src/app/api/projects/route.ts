import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { createProject, listProjects } from "@/lib/metrics";

const createProjectSchema = z.object({
  name: z.string().min(2).max(60),
});

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const projects = await listProjects(userId);
  return NextResponse.json({ projects });
}

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = createProjectSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Invalid payload",
        details: parsed.error.flatten(),
      },
      { status: 400 },
    );
  }

  const created = await createProject(parsed.data.name, userId);
  return NextResponse.json(created, { status: 201 });
}
