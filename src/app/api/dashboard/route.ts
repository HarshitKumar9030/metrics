import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { getDashboardData } from "@/lib/metrics";

const querySchema = z.object({
  projectId: z.string().length(24),
  days: z.coerce.number().min(1).max(90).default(14),
});

export async function GET(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const query = Object.fromEntries(request.nextUrl.searchParams.entries());
  const parsed = querySchema.safeParse(query);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Invalid query",
        details: parsed.error.flatten(),
      },
      { status: 400 },
    );
  }

  const data = await getDashboardData(parsed.data.projectId, userId, parsed.data.days);
  return NextResponse.json(data);
}
