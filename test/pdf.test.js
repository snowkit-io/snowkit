import test from "node:test";
import assert from "node:assert/strict";
import { readFile, writeFile, readdir, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { PDFDocument } from "pdf-lib";
import { tempFolder, samplePdf, pageTexts } from "./helpers.js";
import { mergePdfs, splitPdf, extractPages, rotatePdf, pdfInfo, markdownToPdf, parsePages } from "../src/pdf.js";
import { ToolError } from "../src/files.js";

test("page ranges cover singles, ranges, open ends, reverse and keywords", () => {
  assert.deepEqual(parsePages("1-3, 5", 10), [0, 1, 2, 4]);
  assert.deepEqual(parsePages("8-", 10), [7, 8, 9]);
  assert.deepEqual(parsePages("-2", 10), [0, 1]);
  assert.deepEqual(parsePages("3-1", 10), [2, 1, 0]);
  assert.deepEqual(parsePages("odd", 5), [0, 2, 4]);
  assert.deepEqual(parsePages("even", 5), [1, 3]);
  assert.deepEqual(parsePages("last", 4), [3]);
  assert.deepEqual(parsePages("all", 3), [0, 1, 2]);
  assert.throws(() => parsePages("12", 10), /Page 12 does not exist. This PDF has 10 pages/);
  assert.throws(() => parsePages("a-b", 10), ToolError);
  assert.throws(() => parsePages("", 10), /Give the pages/);
});

test("merge keeps order and saves beside the first file", async (t) => {
  const dir = await tempFolder(t);
  const a = await samplePdf(join(dir, "a.pdf"), 2);
  const b = await samplePdf(join(dir, "b.pdf"), 3, { size: [595.28, 841.89] });
  const r = await mergePdfs({ inputs: [a, b] });
  assert.equal(r.data.output, join(dir, "a-merged.pdf"));
  assert.equal(r.data.pages, 5);
  const pages = await pageTexts(await readFile(r.data.output));
  assert.deepEqual(pages.map((p) => p.size[0]), [612, 612, 595, 595, 595]);
  const doc = await PDFDocument.load(await readFile(r.data.output), { updateMetadata: false });
  assert.equal(doc.getProducer(), "Snowkit");
});

test("merge never replaces an existing file unless asked", async (t) => {
  const dir = await tempFolder(t);
  const a = await samplePdf(join(dir, "a.pdf"), 1);
  const b = await samplePdf(join(dir, "b.pdf"), 1);
  const out = join(dir, "out.pdf");
  await writeFile(out, "keep me");
  await assert.rejects(mergePdfs({ inputs: [a, b], output: out }), /already exists/);
  assert.equal(await readFile(out, "utf8"), "keep me");
  await mergePdfs({ inputs: [a, b], output: out, overwrite: true });
  assert.equal((await pageTexts(await readFile(out))).length, 2);
  assert.deepEqual((await readdir(dir)).sort(), ["a.pdf", "b.pdf", "out.pdf"]);
});

test("merge gives readable errors", async (t) => {
  const dir = await tempFolder(t);
  const a = await samplePdf(join(dir, "a.pdf"), 1);
  await assert.rejects(mergePdfs({ inputs: [a] }), /at least two/);
  await assert.rejects(mergePdfs({ inputs: [a, join(dir, "missing.pdf")] }), /File not found/);
  await writeFile(join(dir, "fake.pdf"), "not a pdf");
  await assert.rejects(mergePdfs({ inputs: [a, join(dir, "fake.pdf")] }), /could not be read as a PDF/);
  await assert.rejects(mergePdfs({ inputs: [a, a], output: join(dir, "nope", "x.pdf") }), /does not exist/);
});

test("split one file per page, every N pages, and by ranges", async (t) => {
  const dir = await tempFolder(t);
  const src = await samplePdf(join(dir, "report.pdf"), 5);
  const each = await splitPdf({ input: src });
  assert.deepEqual(each.data.files.map((f) => f.output), [1, 2, 3, 4, 5].map((n) => join(dir, "report-page-" + n + ".pdf")));
  const out = join(dir, "parts");
  await mkdir(out);
  const pairs = await splitPdf({ input: src, every: 2, output_folder: out });
  assert.deepEqual(pairs.data.files.map((f) => f.pages), [2, 2, 1]);
  const ranges = await splitPdf({ input: src, ranges: ["1-2", "3-"], output_folder: out });
  assert.deepEqual(ranges.data.files.map((f) => f.output), [join(out, "report-pages-1-2.pdf"), join(out, "report-pages-3-.pdf")]);
  assert.equal((await pageTexts(await readFile(join(out, "report-pages-3-.pdf")))).length, 3);
  await assert.rejects(splitPdf({ input: src, every: 2, output_folder: out }), /already exists/);
  await assert.rejects(splitPdf({ input: src, every: 2, ranges: ["1"] }), /either ranges or every/);
});

test("extract pages in the order asked", async (t) => {
  const dir = await tempFolder(t);
  const src = await samplePdf(join(dir, "doc.pdf"), 4);
  const doc = await PDFDocument.load(await readFile(src));
  doc.getPage(3).setSize(300, 300);
  await writeFile(src, await doc.save());
  const r = await extractPages({ input: src, pages: "4, 1-2" });
  assert.equal(r.data.output, join(dir, "doc-extracted.pdf"));
  assert.deepEqual(r.data.pages, [4, 1, 2]);
  const pages = await pageTexts(await readFile(r.data.output));
  assert.deepEqual(pages.map((p) => p.size[0]), [300, 612, 612]);
});

test("rotate chosen pages and keep the rest", async (t) => {
  const dir = await tempFolder(t);
  const src = await samplePdf(join(dir, "scan.pdf"), 3);
  const r = await rotatePdf({ input: src, angle: 90, pages: "2-3" });
  const pages = await pageTexts(await readFile(r.data.output));
  assert.deepEqual(pages.map((p) => p.rotation), [0, 90, 90]);
  const again = await rotatePdf({ input: r.data.output, angle: -90, output: join(dir, "back.pdf") });
  assert.deepEqual((await pageTexts(await readFile(again.data.output))).map((p) => p.rotation), [270, 0, 0]);
  await assert.rejects(rotatePdf({ input: src, angle: 45 }), /angle must be/);
});

test("info reports pages, sizes and details without writing anything", async (t) => {
  const dir = await tempFolder(t);
  const src = await samplePdf(join(dir, "a4.pdf"), 2, { size: [595.28, 841.89], title: "Quarterly report" });
  const r = await pdfInfo({ input: src });
  assert.equal(r.data.pages, 2);
  assert.equal(r.data.metadata.title, "Quarterly report");
  assert.equal(r.data.encrypted, false);
  assert.match(r.text, /A4, 210 × 297 mm/);
  assert.deepEqual(await readdir(dir), ["a4.pdf"]);
});

test("markdown becomes a PDF beside the source", async (t) => {
  const dir = await tempFolder(t);
  const md = join(dir, "notes.md");
  await writeFile(md, "# Trip notes\n\nPack **boots** and a [map](https://snowkit.io).\n\n- one\n- two\n\n| a | b |\n|---|---|\n| 1 | 2 |\n");
  const r = await markdownToPdf({ input: md, page: "letter", page_numbers: true });
  assert.equal(r.data.output, join(dir, "notes.pdf"));
  assert.equal(r.data.title, "Trip notes");
  const doc = await PDFDocument.load(await readFile(r.data.output));
  assert.equal(doc.getTitle(), "Trip notes");
  assert.equal(Math.round(doc.getPage(0).getWidth()), 612);
  await assert.rejects(markdownToPdf({ markdown: "# Hi" }), /output path/);
  const inline = await markdownToPdf({ markdown: "# Hi\n\nÇa va, naïve café.", output: join(dir, "hi.pdf"), page: "a4" });
  assert.equal(inline.data.pages, 1);
  assert.doesNotMatch(inline.text, /question marks/);
  const greek = await markdownToPdf({ markdown: "# Γειά", output: join(dir, "greek.pdf") });
  assert.match(greek.text, /question marks/);
});
