// Rulează `prisma migrate deploy` cu reîncercări.
// Neon (Postgres serverless) dă uneori timeout tranzitoriu (P1002) la conexiunea
// directă din build-ul Vercel (build în US-East, DB în EU-Central). Un retry cu
// backoff rezolvă asta — FĂRĂ a masca o eroare reală de migrare (după ce se
// epuizează încercările, oprește build-ul cu cod non-zero).
const { spawnSync } = require("node:child_process");

function attempt() {
  const r = spawnSync("npx", ["prisma", "migrate", "deploy"], {
    stdio: "inherit",
    shell: true,
  });
  return r.status === 0;
}

(async () => {
  const ATTEMPTS = 5;
  for (let i = 1; i <= ATTEMPTS; i++) {
    if (attempt()) process.exit(0);
    console.error(`[migrate] incercarea ${i}/${ATTEMPTS} a esuat.`);
    if (i < ATTEMPTS) {
      const wait = i * 5000;
      console.error(`[migrate] reincerc in ${wait / 1000}s...`);
      await new Promise((res) => setTimeout(res, wait));
    }
  }
  console.error("[migrate] toate incercarile au esuat — opresc build-ul.");
  process.exit(1);
})();
