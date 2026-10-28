#!/usr/bin/env node
import { readFileSync } from "node:fs";

const version = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8")).version;
const argv = process.argv.slice(2);

if (!argv.length || (argv.length === 1 && argv[0] === "mcp")) {
  const { startServer } = await import("../src/server.js");
  if (process.stdin.isTTY) process.stderr.write("Snowkit " + version + " is waiting for an AI app on standard input. Press Ctrl+C to stop, or run snowkit --help for the command line tools.\n");
  try {
    await startServer(version);
  } catch (e) {
    process.stderr.write("Snowkit could not start: " + String((e && e.message) || e) + "\n");
    process.exit(1);
  }
} else {
  const { main } = await import("../src/cli.js");
  process.exitCode = await main(argv, version);
}
