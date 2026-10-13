import { loadEnvConfig } from "@next/env";
import { verifyLive } from "./live-acceptance";

async function main() {
  try {
    loadEnvConfig(process.cwd(), true, { info() {}, error() {} });
    const args = process.argv.slice(2);
    if (
      args.some((arg) => !["--confirm-writes", "--all"].includes(arg)) ||
      (args.includes("--all") && !args.includes("--confirm-writes"))
    )
      throw new Error("arguments");
    const result = await verifyLive({
      baseUrl: process.env.LIVE_BASE_URL ?? "",
      username: process.env.MANAGEMENT_USERNAME,
      password: process.env.MANAGEMENT_PASSWORD,
      allowWrites: args.includes("--confirm-writes"),
      allOperations: args.includes("--all"),
    });
    console.log(
      `PASS live: ${result.readCount} public offerings; ${result.writes ? "authorized persistence and targeted cleanup verified" : "read-only check"}${result.updated ? "; update verified" : ""}.`,
    );
  } catch {
    console.error(
      "FAIL live: check LIVE_BASE_URL, private management credentials, and deployed behavior. Writes require --confirm-writes; --all also verifies updates. Check the deployment for disposable Verification records if a request or cleanup failed. No credentials printed.",
    );
    process.exitCode = 1;
  }
}
void main();
