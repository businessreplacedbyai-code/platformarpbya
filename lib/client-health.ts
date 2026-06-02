const INTAKE_KEYS = [
  "toneOfVoice", "workingHours", "locations", "services",
  "mainPhone", "contactEmail", "calendarSystem", "crmSystem",
  "faqText", "testerName",
] as const;

type HealthInput = {
  intakeSubmittedAt: Date | null;
  intake: Record<string, unknown> | null;
  agents: { status: string }[];
  tasksDone: number;
  tasksTotal: number;
  lastLoginAt: Date | null;
};

export type HealthScore = {
  score: number;        // 0-100
  label: "Sănătos" | "Atenție" | "Critic";
  color: "emerald" | "amber" | "red";
  breakdown: { label: string; pts: number; max: number }[];
};

export function computeHealthScore(c: HealthInput): HealthScore {
  let intakePts = 0;
  if (c.intake) {
    const filled = INTAKE_KEYS.filter((k) => {
      const v = c.intake![k];
      return v !== null && v !== undefined && String(v).trim().length > 0;
    }).length;
    intakePts = Math.round((filled / INTAKE_KEYS.length) * 30);
  }

  const agentsLive = c.agents.filter((a) => a.status === "live").length;
  const agentsAny = c.agents.length;
  const agentPts = agentsLive > 0 ? 30 : agentsAny > 0 ? 15 : 0;

  const taskPts = c.tasksTotal > 0
    ? Math.round((c.tasksDone / c.tasksTotal) * 25)
    : 0;

  let loginPts = 0;
  if (c.lastLoginAt) {
    const daysSince = (Date.now() - c.lastLoginAt.getTime()) / 86400000;
    loginPts = daysSince < 7 ? 15 : daysSince < 30 ? 8 : 3;
  }

  const score = intakePts + agentPts + taskPts + loginPts;

  return {
    score,
    label: score >= 75 ? "Sănătos" : score >= 45 ? "Atenție" : "Critic",
    color: score >= 75 ? "emerald" : score >= 45 ? "amber" : "red",
    breakdown: [
      { label: "Intake completat", pts: intakePts, max: 30 },
      { label: "Agenți live", pts: agentPts, max: 30 },
      { label: "Taskuri bifate", pts: taskPts, max: 25 },
      { label: "Activ în portal", pts: loginPts, max: 15 },
    ],
  };
}
