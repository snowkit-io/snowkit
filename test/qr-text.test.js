import test from "node:test";
import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";
import { inflateSync } from "node:zlib";
import { join } from "node:path";
import { tempFolder } from "./helpers.js";
import { makeQr } from "../src/qr.js";
import { decodeImage } from "../src/engine/qrkit.js";
import { jsonFormat, jsonValidate, sqlFormat, textStats, textTransform, colorConvert, cronExplain } from "../src/text.js";

function readGrayPng(buf) {
  assert.equal(buf.subarray(1, 4).toString("latin1"), "PNG");
  let p = 8;
  let width = 0;
  let height = 0;
  const idat = [];
  while (p < buf.length) {
    const len = buf.readUInt32BE(p);
    const type = buf.subarray(p + 4, p + 8).toString("latin1");
    const data = buf.subarray(p + 8, p + 8 + len);
    if (type === "IHDR") {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
    }
    if (type === "IDAT") idat.push(data);
    p += 12 + len;
  }
  const raw = inflateSync(Buffer.concat(idat));
  const rgba = new Uint8ClampedArray(width * height * 4);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const v = raw[y * (width + 1) + 1 + x];
      rgba.set([v, v, v, 255], (y * width + x) * 4);
    }
  }
  return { data: rgba, width, height };
}

test("qr code PNG decodes back to the same text", async (t) => {
  const dir = await tempFolder(t);
  const out = join(dir, "link.png");
  const r = await makeQr({ text: "https://snowkit.io/qr-code/", output: out, size: 300 });
  assert.equal(r.data.format, "png");
  const image = readGrayPng(await readFile(out));
  const decoded = decodeImage(image);
  assert.equal(decoded && (decoded.text || decoded), "https://snowkit.io/qr-code/");
});

test("qr code SVG is returned inline or saved", async (t) => {
  const dir = await tempFolder(t);
  const inline = await makeQr({ text: "hello" });
  assert.match(inline.output, /^<svg xmlns="http:\/\/www.w3.org\/2000\/svg"/);
  const saved = await makeQr({ text: "hello", output: join(dir, "hello.svg"), level: "H" });
  assert.equal(saved.data.level, "H");
  await assert.rejects(makeQr({ text: "hello", output: join(dir, "hello.svg") }), /already exists/);
  await assert.rejects(makeQr({ text: "hello", format: "png" }), /output path/);
  await assert.rejects(makeQr({ text: "hello", output: join(dir, "x.png"), format: "svg" }), /Make them match/);
  await assert.rejects(makeQr({ text: "x".repeat(8000) }), /too long/);
});

test("json format keeps big numbers and reports errors with a position", async (t) => {
  const r = await jsonFormat({ text: '{"b":1,"a":12345678901234567890}', sort_keys: true });
  assert.equal(r.output, '{\n  "a": 12345678901234567890,\n  "b": 1\n}\n');
  assert.equal((await jsonFormat({ text: '{ "a": [1, 2] }', minify: true })).output, '{"a":[1,2]}\n');
  await assert.rejects(jsonFormat({ text: '{"a": 1,\n "b": }' }), /line 2/);
  await assert.rejects(jsonFormat({ text: "{}", input: "x.json" }), /not both/);
  const dir = await tempFolder(t);
  const src = join(dir, "data.json");
  await writeFile(src, "﻿[1,2]");
  const saved = await jsonFormat({ input: src, output: join(dir, "pretty.json") });
  assert.equal(await readFile(saved.data.output, "utf8"), "[\n  1,\n  2\n]\n");
});

test("json validate checks syntax and schema", async () => {
  assert.equal((await jsonValidate({ text: '{"a":1}' })).data.valid, true);
  const bad = await jsonValidate({ text: '{"a":1,}' });
  assert.equal(bad.data.valid, false);
  assert.equal(bad.data.syntax.line, 1);
  const schema = JSON.stringify({ type: "object", required: ["name"], properties: { age: { type: "integer" } } });
  const r = await jsonValidate({ text: '{"age":"ten"}', schema });
  assert.equal(r.data.valid, false);
  assert.ok(r.data.schema_errors.length >= 2);
  assert.match(r.text, /does not match the schema/);
});

test("sql format and minify", async () => {
  const r = await sqlFormat({ text: "select a, b from t where x = 1" });
  assert.equal(r.output, "SELECT\n  a,\n  b\nFROM\n  t\nWHERE\n  x = 1\n");
  assert.equal((await sqlFormat({ text: "SELECT a\nFROM t -- note\nWHERE b = 2", minify: true, keyword_case: "lower" })).output, "select a from t where b=2\n");
});

test("text stats, transforms, colours and cron", async () => {
  const s = await textStats({ text: "One two three. Four five!\n\nSix." });
  assert.equal(s.data.words, 6);
  assert.equal(s.data.sentences, 3);
  assert.equal((await textTransform({ text: "hello big world", action: "camel" })).output, "helloBigWorld");
  assert.equal((await textTransform({ text: "Hello World\nCrème brûlée & tea", action: "slug" })).output, "hello-world\ncreme-brulee-and-tea\n");
  const d = await textTransform({ text: "a\nb\nA\na\n", action: "dedupe", ignore_case: true });
  assert.equal(d.output, "a\nb\n");
  assert.equal(d.data.removed, 2);
  await assert.rejects(textTransform({ text: "x", action: "reverse" }), /action must be/);
  const c = colorConvert({ color: "#336699", against: "white" });
  assert.equal(c.data.hex, "#336699");
  assert.equal(c.data.aa_normal, true);
  assert.throws(() => colorConvert({ color: "notacolour" }), /does not look like a colour/);
  const cron = cronExplain({ expression: "0 9 * * 1", count: 2, utc: true });
  assert.equal(cron.data.next_runs.length, 2);
  assert.match(cron.data.next_runs[0], /T09:00:00\.000Z$/);
  assert.throws(() => cronExplain({ expression: "61 * * * *" }), /does not work/);
});
