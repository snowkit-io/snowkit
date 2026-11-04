import test from "node:test";
import assert from "node:assert/strict";
import { copyFile, readFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { runTool } from "../src/tools.js";
import { tempFolder } from "./helpers.js";

const GPS = fileURLToPath(new URL("./fixtures/gps.jpg", import.meta.url));

test("image_info reports the location and camera details", async () => {
  const r = await runTool("image_info", { input: GPS });
  assert.match(r.text, /Location: 45\.51000, -73\.57000/);
  assert.match(r.text, /Camera serial number: SN123456/);
  assert.equal(r.data.gps.lat, 45.51);
  assert.equal(r.link, "https://snowkit.io/studio-editor/");
});

test("image_strip_metadata removes the location and keeps the picture", async (t) => {
  const dir = await tempFolder(t);
  const src = join(dir, "photo.jpg");
  await copyFile(GPS, src);
  const r = await runTool("image_strip_metadata", { input: src });
  assert.equal(r.data.output, join(dir, "photo-clean.jpg"));
  assert.ok(r.data.hadLocation);
  const out = await readFile(r.data.output);
  assert.ok(!out.includes(Buffer.from("SN123456")));
  const again = await runTool("image_info", { input: r.data.output });
  assert.equal(again.data.gps, null);
  await assert.rejects(runTool("image_strip_metadata", { input: src }), /exists/i);
});

test("image tools refuse other files clearly", async (t) => {
  const dir = await tempFolder(t);
  const p = join(dir, "notes.txt");
  await (await import("node:fs/promises")).writeFile(p, "hello there, not an image");
  await assert.rejects(runTool("image_info", { input: p }), /JPEG, PNG and WebP/);
});

test("head_tags writes title, description and share tags", async () => {
  const r = await runTool("head_tags", { title: "Plant Care", description: "Water reminders for your plants.", url: "https://example.com/", image: "https://example.com/og.png" });
  assert.match(r.text, /<title>Plant Care<\/title>/);
  assert.match(r.text, /property="og:image" content="https:\/\/example\.com\/og\.png"/);
  assert.match(r.text, /twitter:card" content="summary_large_image"/);
  await assert.rejects(runTool("head_tags", {}), /title or a description/);
});

test("head_check finds what is missing", async () => {
  const r = await runTool("head_check", { html: "<html><head><title>Hi</title></head><body></body></html>" });
  assert.ok(r.data.problems > 0);
  assert.match(r.text, /Missing: Description|Too short: Title/);
});
