import { verifyDisposableDatabase } from "./disposable-database";

async function main() {
  const deadline = setTimeout(() => {
    console.error("FAIL disposable lifecycle: overall deadline exceeded.");
    process.exit(1);
  }, 90000);
  try {
    if (process.argv.length !== 2 || process.env.MONGO_URI) throw new Error("external target");
    (await verifyDisposableDatabase()).forEach((stage) => console.log(`PASS disposable lifecycle: ${stage}`));
  } catch {
    console.error(
      "FAIL disposable lifecycle: no external MONGO_URI or arguments are allowed; startup, read/write, cleanup and teardown must all succeed. No connection details printed.",
    );
    process.exitCode = 1;
  } finally {
    clearTimeout(deadline);
  }
}
void main();
