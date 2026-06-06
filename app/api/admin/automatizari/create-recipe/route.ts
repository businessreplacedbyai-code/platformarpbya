// Creează un workflow n8n din rețetă predefinită (click-to-create).
import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { createRecipeWorkflow } from "@/lib/n8n-recipes";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { key } = await req.json();
  if (!key) return NextResponse.json({ error: "missing_key" }, { status: 400 });
  const r = await createRecipeWorkflow(key);
  return NextResponse.json(r, { status: r.ok ? 200 : 502 });
}
