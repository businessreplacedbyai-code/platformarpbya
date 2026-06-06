import { AdminShell } from "@/components/admin/AdminShell";
import { getWorkflowsList, n8nEnabled } from "@/lib/n8n";
import { RECIPES } from "@/lib/n8n-recipes";
import { AutomationsClient } from "./AutomationsClient";
import { Recipes } from "./Recipes";
import { AlertTriangle } from "lucide-react";

export const metadata = { title: "Automatizări · Admin" };
export const dynamic = "force-dynamic";

export default async function AutomationsPage() {
  const enabled = n8nEnabled();
  const workflows = enabled ? await getWorkflowsList() : [];
  const n8nUrl = process.env.N8N_API_URL || "https://n8n.replacedbyai.ro";

  return (
    <AdminShell>
      <div className="max-w-[820px] space-y-6">
        <header>
          <p className="eyebrow mb-1">Automatizări</p>
          <h1 className="h-display text-3xl mb-1">Automatizările tale (n8n)</h1>
          <p className="text-[14px] text-[var(--ink-2)]">
            Pornește, oprește sau rulează orice automatizare — direct de aici, fără să intri în n8n.
            Pentru editare detaliată, click pe iconul de editare.
          </p>
        </header>

        {!enabled ? (
          <div className="rounded-xl px-4 py-3 flex items-start gap-3" style={{ background: "#FFF7ED", border: "1px solid #F59E0B" }}>
            <AlertTriangle size={15} className="text-amber-600 mt-0.5 shrink-0" />
            <p className="text-[13px] text-amber-800">
              n8n nu e configurat (lipsește <code className="bg-amber-100 px-1 rounded">N8N_API_URL</code> / <code className="bg-amber-100 px-1 rounded">N8N_API_KEY</code>).
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            <Recipes recipes={RECIPES} existingNames={workflows.map((w) => w.name)} />
            <div>
              <h2 className="h-display text-xl mb-3">Toate automatizările active</h2>
              <AutomationsClient initial={workflows} n8nUrl={n8nUrl} />
            </div>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
