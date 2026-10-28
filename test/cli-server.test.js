import test from "node:test";
import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { tempFolder, samplePdf } from "./helpers.js";
import { main, parseArgs } from "../src/cli.js";

const BIN = fileURLToPath(new URL("../bin/snowkit.js", import.meta.url));

function capture() {
  const out = [];
  const err = [];
  return { io: { out: { write: (s) => out.push(s) }, err: { write: (s) => err.push(s) } }, out: () => out.join(""), err: () => err.join("") };
}

test("argument parsing", () => {
  const r = parseArgs(["pdf", "split", "a.pdf", "--range", "1-2", "--range=3-", "-o", "out", "--overwrite"]);
  assert.deepEqual(r.pos, ["pdf", "split", "a.pdf"]);
  assert.deepEqual(r.flags.range, ["1-2", "3-"]);
  assert.equal(r.flags.output, "out");
  assert.equal(r.flags.overwrite, true);
  assert.throws(() => parseArgs(["--bogus"]), /Unknown option/);
  assert.throws(() => parseArgs(["--pages"]), /needs a value/);
});

test("command line merges, reports info and explains usage errors", async (t) => {
  const dir = await tempFolder(t);
  const a = await samplePdf(join(dir, "a.pdf"), 1);
  const b = await samplePdf(join(dir, "b.pdf"), 2);
  const merged = capture();
  assert.equal(await main(["pdf", "merge", a, b, "-o", join(dir, "all.pdf")], "0.0.0", merged.io), 0);
  assert.match(merged.out(), /Merged 2 files into 3 pages/);
  const info = capture();
  assert.equal(await main(["pdf", "info", join(dir, "all.pdf"), "--json"], "0.0.0", info.io), 0);
  assert.equal(JSON.parse(info.out()).pages, 3);
  const again = capture();
  assert.equal(await main(["pdf", "merge", a, b, "-o", join(dir, "all.pdf")], "0.0.0", again.io), 1);
  assert.match(again.err(), /already exists/);
  const bad = capture();
  assert.equal(await main(["frobnicate"], "0.0.0", bad.io), 2);
  assert.match(bad.err(), /Unknown command/);
  const help = capture();
  assert.equal(await main(["--help"], "0.0.0", help.io), 0);
  assert.match(help.out(), /snowkit pdf merge/);
  const qr = capture();
  assert.equal(await main(["qr", "https://snowkit.io"], "0.0.0", qr.io), 0);
  assert.match(qr.out(), /^<svg/);
});

test("MCP server lists and runs tools over stdio", async (t) => {
  const dir = await tempFolder(t);
  const a = await samplePdf(join(dir, "one.pdf"), 2);
  const b = await samplePdf(join(dir, "two.pdf"), 1);
  const client = new Client({ name: "snowkit-test", version: "1.0.0" });
  const transport = new StdioClientTransport({ command: process.execPath, args: [BIN], stderr: "pipe" });
  await client.connect(transport);
  t.after(() => client.close());

  const info = client.getServerVersion();
  assert.equal(info.name, "snowkit");
  assert.equal(info.title, "Snowkit");
  assert.match(client.getInstructions(), /never send files/);

  const { tools } = await client.listTools();
  const names = tools.map((x) => x.name);
  for (const n of ["pdf_merge", "pdf_split", "pdf_extract_pages", "pdf_rotate", "pdf_info", "markdown_to_pdf", "qr_code", "json_format", "json_validate", "sql_format", "text_stats", "text_transform", "color_convert", "cron_explain"]) assert.ok(names.includes(n), n);
  const merge = tools.find((x) => x.name === "pdf_merge");
  assert.equal(merge.inputSchema.additionalProperties, false);
  assert.deepEqual(merge.inputSchema.required, ["inputs"]);
  assert.equal(tools.find((x) => x.name === "pdf_info").annotations.readOnlyHint, true);

  const merged = await client.callTool({ name: "pdf_merge", arguments: { inputs: [a, b] } });
  assert.equal(merged.isError, undefined);
  assert.match(merged.content[0].text, /Merged 2 files into 3 pages/);
  assert.match(merged.content[0].text, /Open in Snowkit: https:\/\/snowkit\.io\/merge-pdf\//);
  assert.ok((await readdir(dir)).includes("one-merged.pdf"));

  const repeat = await client.callTool({ name: "pdf_merge", arguments: { inputs: [a, b] } });
  assert.equal(repeat.isError, true);
  assert.match(repeat.content[0].text, /already exists/);

  const pdfInfo = await client.callTool({ name: "pdf_info", arguments: { input: join(dir, "one-merged.pdf") } });
  assert.match(pdfInfo.content[0].text, /Pages: 3/);

  const contrast = await client.callTool({ name: "color_convert", arguments: { color: "#777", against: "#fff" } });
  assert.match(contrast.content[0].text, /contrast-checker/);

  const slug = await client.callTool({ name: "text_transform", arguments: { text: "Hello World", action: "slug" } });
  assert.match(slug.content[0].text, /hello-world/);
  assert.match(slug.content[0].text, /slug-generator/);

  const qr = await client.callTool({ name: "qr_code", arguments: { text: "https://snowkit.io", output: join(dir, "code.png") } });
  assert.equal((await readFile(join(dir, "code.png"))).subarray(1, 4).toString("latin1"), "PNG");
  assert.match(qr.content[0].text, /Saved a PNG QR code/);

  const extra = await client.callTool({ name: "cron_explain", arguments: { expression: "* * * * *", shell: "rm -rf /" } });
  assert.equal(extra.isError, true);

  const missing = await client.callTool({ name: "pdf_info", arguments: { input: join(dir, "nope.pdf") } });
  assert.equal(missing.isError, true);
  assert.match(missing.content[0].text, /File not found/);
});
