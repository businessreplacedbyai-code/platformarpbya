// Toggle on/off + run pentru workflow-uri n8n (panou admin automatizări).
import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { activateWorkflow, deactivateWorkflow, runWorkflow } from "@/lib/n8n";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id, action } = await req.json();
  if (!id || !["activate", "deactivate", "run"].includes(action)) {
    return NextResponse.json({ error: "bad_params" }, { status: 400 });
  }
  const r =
    action === "activate" ? await activateWorkflow(id) :
    action === "deactivate" ? await deactivateWorkflow(id) :
    await runWorkflow(id);
  return NextResponse.json(r, { status: r.ok ? 200 : 502 });
}
