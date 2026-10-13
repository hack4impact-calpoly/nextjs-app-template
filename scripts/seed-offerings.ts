import { loadEnvConfig } from "@next/env";
import mongoose from "mongoose";
import { seedOfferings } from "@/database/seedOffering";

async function main(): Promise<void> {
  let stage = "configuration";
  const deadline = setTimeout(() => {
    console.error("FAIL seed: 20-second deadline exceeded; rerun safely after checking connectivity.");
    process.exit(1);
  }, 20_000);
  try {
    const args = process.argv.slice(2);
    if (args.length !== 1 || args[0] !== "--apply") throw new Error("configuration");
    loadEnvConfig(process.cwd(), true, { info() {}, error() {} });
    const uri = process.env.MONGO_URI;
    const match = /^mongodb(?:\+srv)?:\/\/[^/]+\/([A-Za-z0-9_-]+)(?:\?.*)?$/.exec(uri ?? "");
    if (
      !match ||
      /[{}<>]|placeholder|YOUR_|CHANGE_ME/i.test(uri ?? "") ||
      ["admin", "local", "config"].includes(match[1])
    ) {
      throw new Error("configuration");
    }
    stage = "seed";
    const inserted = await seedOfferings();
    console.log(`PASS seed: inserted=${inserted}; existing offerings preserved.`);
  } catch {
    process.exitCode = 1;
    console.error(
      stage === "configuration"
        ? "FAIL configuration: run npm run db:seed -- --apply with MONGO_URI naming an explicit non-system database."
        : "FAIL seed: database operation failed; check configuration, permissions, and connectivity. Reruns preserve existing records.",
    );
  } finally {
    try {
      await mongoose.disconnect();
    } catch {
      process.exitCode = 1;
      console.error("FAIL close: database connection could not be closed.");
    }
    clearTimeout(deadline);
  }
}

void main();
