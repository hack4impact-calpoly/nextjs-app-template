import { readFile } from "node:fs/promises";
import { runAcceptance, type AcceptanceOptions } from "./acceptance";
import type { Offering } from "@/types/offering";

async function main() {
  // This deadline also bounds a broken response stream or uncertain teardown.
  const deadline = setTimeout(() => {
    console.error(
      "FAIL acceptance: overall deadline exceeded; inspect the disposable target for this run's Verification records.",
    );
    process.exit(1);
  }, 120000);
  try {
    const args = process.argv.slice(2);
    if (args.length !== 2 || args[0] !== "--scenario" || !["empty", "seeded", "database-failure"].includes(args[1]))
      throw new Error("Use --scenario empty|seeded|database-failure.");
    if (process.env.ACCEPTANCE_CONFIRM_WRITES !== "disposable")
      throw new Error("Set ACCEPTANCE_CONFIRM_WRITES=disposable only for an isolated acceptance target.");
    const scenario = args[1] as AcceptanceOptions["scenario"];
    let expectedSeed: Offering[] | undefined;
    if (scenario === "seeded") {
      if (!process.env.ACCEPTANCE_SEED_FILE)
        throw new Error("Set ACCEPTANCE_SEED_FILE to independently prepared expected seed JSON.");
      try {
        expectedSeed = JSON.parse(await readFile(process.env.ACCEPTANCE_SEED_FILE, "utf8"));
      } catch {
        throw new Error("Cannot read expected seed JSON.");
      }
      if (!Array.isArray(expectedSeed)) throw new Error("Expected seed JSON must be an array.");
    }
    const stages = await runAcceptance({
      baseUrl: process.env.ACCEPTANCE_BASE_URL ?? "",
      scenario,
      username: process.env.MANAGEMENT_USERNAME ?? "",
      password: process.env.MANAGEMENT_PASSWORD ?? "",
      expectedSeed,
    });
    // Never print URLs, paths, authorization, environment values, or raw exceptions.
    console.log(
      `INFO acceptance: explicit literal loopback target; scenario=${scenario}; request deadline=15s; overall deadline=120s; disposable writes acknowledged.`,
    );
    stages.forEach((stage) => console.log(`PASS acceptance: ${stage}`));
  } catch (error) {
    console.error(`FAIL acceptance: ${error instanceof Error ? error.message : "Verification failed."}`);
    process.exitCode = 1;
  } finally {
    clearTimeout(deadline);
  }
}
void main();
