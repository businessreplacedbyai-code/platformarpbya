import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { claudeGenerate, GEN_TYPES, type GenType } from "@/lib/ai-generate";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { type, input } = await req.json();
  if (!type || !(type in GEN_TYPES)) {
    return NextResponse.json({ error: "Tip invalid" }, { status: 400 });
  }
  const t = type as GenType;
  const userInput = String(input || "").slice(0, 1200).trim();

  const prompt = `${GEN_TYPES[t].label} — cerință: ${userInput || "(general — alege tu un unghi bun și relevant)"}

Generează acum, în română, gata de folosit (copy-paste).`;

  try {
    const text = await claudeGenerate(prompt, { system: GEN_TYPES[t].system, maxTokens: 1500 });
    return NextResponse.json({ ok: true, text });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Eroare la generare" },
      { status: 500 }
    );
  }
}
