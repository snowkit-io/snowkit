import * as PDFLib from "pdf-lib";
import { basename, dirname, extname, join } from "node:path";
import { ToolError, readInput, readTextInput, besideInput, existingFolder, checkTargets, writeOutput, formatBytes } from "./files.js";
import { markdownPdf, pageSizeFor } from "./engine/mdpdf.js";
import { markdownTitle } from "./engine/md-render.js";

const { PDFDocument, degrees } = PDFLib;

const NAMED_SIZES = [
  ["A3", 841.89, 1190.55],
  ["A4", 595.28, 841.89],
  ["A5", 419.53, 595.28],
  ["Letter", 612, 792],
  ["Legal", 612, 1008],
  ["Tabloid", 792, 1224],
];

const plural = (n, one, many) => n + " " + (n === 1 ? one : many || one + "s");

export async function loadPdf(file, options = {}) {
  try {
    return await PDFDocument.load(file.bytes, { updateMetadata: false, ...options });
  } catch (e) {
    const message = String((e && e.message) || e);
    if (/encrypt/i.test(message)) throw new ToolError(file.path + " is password-protected. Remove the password first, then try again.");
    throw new ToolError(file.path + " could not be read as a PDF. It may be damaged or not a PDF at all.");
  }
}

async function readPdf(value) {
  const file = await readInput(value);
  return { file, doc: await loadPdf(file) };
}

function newDocument() {
  return PDFDocument.create().then((doc) => {
    doc.setCreator("Snowkit");
    doc.setProducer("Snowkit");
    return doc;
  });
}

async function save(doc) {
  try {
    return await doc.save();
  } catch (e) {
    throw new ToolError("The PDF could not be saved: " + String((e && e.message) || e));
  }
}

export function parsePages(spec, count) {
  const text = String(spec == null ? "" : spec).trim().toLowerCase();
  if (!text) throw new ToolError("Give the pages to use, such as 1-3, 5, 8-.");
  const out = [];
  const num = (raw, part) => {
    if (raw === "last" || raw === "end") return count;
    if (!/^\d+$/.test(raw)) throw new ToolError("“" + part + "” is not a page or a range. Use forms like 4, 2-6, 9- or last.");
    const n = Number(raw);
    if (n < 1 || n > count) throw new ToolError("Page " + n + " does not exist. This PDF has " + plural(count, "page") + ".");
    return n;
  };
  for (const part of text.split(/[,;\s]+/).filter(Boolean)) {
    if (part === "all") {
      for (let i = 0; i < count; i++) out.push(i);
      continue;
    }
    if (part === "odd" || part === "even") {
      for (let i = part === "odd" ? 0 : 1; i < count; i += 2) out.push(i);
      continue;
    }
    const m = part.match(/^([^-]*)-([^-]*)$/);
    if (!m) {
      out.push(num(part, part) - 1);
      continue;
    }
    const from = m[1] ? num(m[1], part) : 1;
    const to = m[2] ? num(m[2], part) : count;
    const step = from <= to ? 1 : -1;
    for (let p = from; p !== to + step; p += step) out.push(p - 1);
  }
  if (!out.length) throw new ToolError("Those pages select nothing in this PDF.");
  return out;
}

function sizeName(w, h) {
  const a = Math.min(w, h);
  const b = Math.max(w, h);
  const hit = NAMED_SIZES.find(([, x, y]) => Math.abs(x - a) < 3 && Math.abs(y - b) < 3);
  if (!hit) return "";
  return hit[0] + (w > h ? " landscape" : "");
}

function describeSize(w, h) {
  const mm = (pt) => Math.round((pt / 72) * 25.4);
  const inch = (pt) => Math.round((pt / 72) * 100) / 100;
  const name = sizeName(w, h);
  return (name ? name + ", " : "") + mm(w) + " × " + mm(h) + " mm (" + inch(w) + " × " + inch(h) + " in)";
}

export async function mergePdfs({ inputs, output, overwrite = false }) {
  if (!Array.isArray(inputs) || inputs.length < 2) throw new ToolError("Give at least two PDF files to merge, in the order you want them.");
  const files = [];
  for (const value of inputs) files.push(await readPdf(value));
  const target = output || besideInput(files[0].file.path, "-merged", ".pdf");
  const merged = await newDocument();
  let pages = 0;
  for (const { doc } of files) {
    const copied = await merged.copyPages(doc, doc.getPageIndices());
    for (const page of copied) merged.addPage(page);
    pages += copied.length;
  }
  const bytes = await save(merged);
  const path = await writeOutput(target, bytes, { overwrite });
  return {
    text: "Merged " + plural(files.length, "file") + " into " + plural(pages, "page") + ".\nSaved to " + path + " (" + formatBytes(bytes.length) + ").",
    data: { output: path, pages, files: files.map((f) => f.file.path), bytes: bytes.length },
  };
}

export async function splitPdf({ input, ranges, every, output_folder, overwrite = false }) {
  const { file, doc } = await readPdf(input);
  const count = doc.getPageCount();
  const folder = output_folder ? await existingFolder(output_folder, "output folder") : dirname(file.path);
  const base = basename(file.path, extname(file.path));
  const parts = [];
  if (ranges !== undefined && every !== undefined) throw new ToolError("Use either ranges or every, not both.");
  if (ranges !== undefined) {
    const list = Array.isArray(ranges) ? ranges : [ranges];
    if (!list.length) throw new ToolError("Give at least one range, such as 1-3.");
    for (const r of list) {
      const label = String(r).trim().toLowerCase().replace(/[^a-z0-9-]+/g, "_").replace(/^_+|_+$/g, "") || "pages";
      parts.push({ pages: parsePages(r, count), name: base + "-pages-" + label + ".pdf" });
    }
  } else {
    const size = every === undefined ? 1 : Number(every);
    if (!Number.isInteger(size) || size < 1) throw new ToolError("every must be a whole number of pages, 1 or more.");
    const total = Math.ceil(count / size);
    const width = String(total).length;
    for (let i = 0, n = 1; i < count; i += size, n++) {
      const pages = [];
      for (let p = i; p < Math.min(count, i + size); p++) pages.push(p);
      parts.push({ pages, name: base + (size === 1 ? "-page-" : "-part-") + String(n).padStart(width, "0") + ".pdf" });
    }
  }
  if (parts.length > 2000) throw new ToolError("That would make " + parts.length + " files. Split into fewer, larger parts.");
  const names = new Set();
  for (const part of parts) {
    if (names.has(part.name)) throw new ToolError("Two ranges would write the same file name, " + part.name + ".");
    names.add(part.name);
    part.path = join(folder, part.name);
  }
  await checkTargets(parts.map((p) => p.path), overwrite);
  const written = [];
  for (const part of parts) {
    const out = await newDocument();
    for (const page of await out.copyPages(doc, part.pages)) out.addPage(page);
    const bytes = await save(out);
    written.push({ output: await writeOutput(part.path, bytes, { overwrite }), pages: part.pages.length });
  }
  const list = written.map((w) => "  " + w.output + " (" + plural(w.pages, "page") + ")").join("\n");
  return {
    text: "Split " + plural(count, "page") + " into " + plural(written.length, "file") + ":\n" + list,
    data: { input: file.path, files: written },
  };
}

export async function extractPages({ input, pages, output, overwrite = false }) {
  const { file, doc } = await readPdf(input);
  const indices = parsePages(pages, doc.getPageCount());
  const target = output || besideInput(file.path, "-extracted", ".pdf");
  const out = await newDocument();
  for (const page of await out.copyPages(doc, indices)) out.addPage(page);
  const bytes = await save(out);
  const path = await writeOutput(target, bytes, { overwrite });
  return {
    text: "Copied " + plural(indices.length, "page") + " from " + file.path + ".\nSaved to " + path + " (" + formatBytes(bytes.length) + ").",
    data: { input: file.path, output: path, pages: indices.map((i) => i + 1) },
  };
}

export async function rotatePdf({ input, angle, pages, output, overwrite = false }) {
  const turn = Number(angle);
  if (![90, 180, 270, -90].includes(turn)) throw new ToolError("angle must be 90, 180, 270 or -90.");
  const { file, doc } = await readPdf(input);
  const indices = [...new Set(parsePages(pages === undefined ? "all" : pages, doc.getPageCount()))];
  for (const i of indices) {
    const page = doc.getPage(i);
    page.setRotation(degrees((((page.getRotation().angle + turn) % 360) + 360) % 360));
  }
  const target = output || besideInput(file.path, "-rotated", ".pdf");
  const bytes = await save(doc);
  const path = await writeOutput(target, bytes, { overwrite });
  const which = indices.length === doc.getPageCount() ? "every page" : plural(indices.length, "page");
  return {
    text: "Turned " + which + " by " + turn + " degrees" + (turn < 0 ? " (anticlockwise)" : " clockwise") + ".\nSaved to " + path + ".",
    data: { input: file.path, output: path, angle: turn, pages: indices.map((i) => i + 1) },
  };
}

function safeDate(get) {
  try {
    const d = get();
    return d instanceof Date && !isNaN(d) ? d.toISOString() : null;
  } catch (e) {
    return null;
  }
}

function safeText(get) {
  try {
    const v = get();
    return v == null || v === "" ? null : String(v);
  } catch (e) {
    return null;
  }
}

export async function pdfInfo({ input }) {
  const file = await readInput(input);
  const doc = await loadPdf(file, { ignoreEncryption: true });
  const header = file.bytes.subarray(0, 1024).toString("latin1").match(/%PDF-(\d\.\d)/);
  const sizes = new Map();
  doc.getPages().forEach((page) => {
    const { width, height } = page.getSize();
    const rot = page.getRotation().angle % 180 !== 0;
    const label = rot ? describeSize(height, width) : describeSize(width, height);
    sizes.set(label, (sizes.get(label) || 0) + 1);
  });
  let fields = 0;
  try {
    fields = doc.getForm().getFields().length;
  } catch (e) {
    fields = 0;
  }
  const meta = {
    title: safeText(() => doc.getTitle()),
    author: safeText(() => doc.getAuthor()),
    subject: safeText(() => doc.getSubject()),
    keywords: safeText(() => doc.getKeywords()),
    creator: safeText(() => doc.getCreator()),
    producer: safeText(() => doc.getProducer()),
    created: safeDate(() => doc.getCreationDate()),
    modified: safeDate(() => doc.getModificationDate()),
  };
  const count = doc.getPageCount();
  const lines = [file.path, "Pages: " + count, "File size: " + formatBytes(file.size)];
  if (header) lines.push("PDF version: " + header[1]);
  lines.push("Password-protected: " + (doc.isEncrypted ? "yes" : "no"));
  if (fields) lines.push("Form fields: " + fields);
  lines.push("Page sizes:");
  for (const [label, n] of sizes) lines.push("  " + label + (sizes.size > 1 ? " – " + plural(n, "page") : ""));
  const labels = { title: "Title", author: "Author", subject: "Subject", keywords: "Keywords", creator: "Created with", producer: "Producer", created: "Created", modified: "Modified" };
  const shown = Object.entries(meta).filter(([, v]) => v);
  if (shown.length) {
    lines.push("Details:");
    for (const [k, v] of shown) lines.push("  " + labels[k] + ": " + v);
  }
  return {
    text: lines.join("\n"),
    data: { input: file.path, pages: count, bytes: file.size, version: header ? header[1] : null, encrypted: !!doc.isEncrypted, form_fields: fields, page_sizes: [...sizes].map(([size, pages]) => ({ size, pages })), metadata: meta },
  };
}

const WIN_ANSI_EXTRA = new Set([0x152, 0x153, 0x160, 0x161, 0x178, 0x17d, 0x17e, 0x192, 0x2c6, 0x2dc, 0x2013, 0x2014, 0x2018, 0x2019, 0x201a, 0x201c, 0x201d, 0x201e, 0x2020, 0x2021, 0x2022, 0x2026, 0x2030, 0x2039, 0x203a, 0x20ac, 0x2122]);

function outsideLatin(text) {
  for (const ch of text) {
    const code = ch.codePointAt(0);
    if (code > 0xff && !WIN_ANSI_EXTRA.has(code)) return true;
  }
  return false;
}

export async function markdownToPdf({ input, markdown, output, page, title, page_numbers = false, overwrite = false }) {
  if ((input === undefined) === (markdown === undefined)) throw new ToolError("Give either input (a Markdown file) or markdown (the text itself), not both.");
  let source;
  let from = null;
  if (input !== undefined) {
    const file = await readTextInput(input);
    source = file.text;
    from = file.path;
  } else source = String(markdown);
  if (!source.trim()) throw new ToolError("The Markdown is empty.");
  if (!output && !from) throw new ToolError("Give an output path for the PDF: a full file path ending in .pdf.");
  const target = output || besideInput(from, "", ".pdf");
  const paper = page || pageSizeFor(Intl.DateTimeFormat().resolvedOptions().locale, null);
  const heading = title || markdownTitle(source) || (from ? basename(from, extname(from)) : "");
  const result = await markdownPdf(source, { page: paper, title: heading, numbers: !!page_numbers }, { L: PDFLib, fontkit: null, fontBytes: null });
  const path = await writeOutput(target, result.bytes, { overwrite });
  const notes = [];
  if (outsideLatin(source)) notes.push("Some characters outside Western European alphabets could not be drawn with the built-in fonts and show as question marks.");
  if (result.skipped) notes.push(plural(result.skipped, "image") + " left out, because images are not added from Markdown here.");
  return {
    text: "Made a " + plural(result.pages, "page") + " PDF (" + paper.toUpperCase() + ").\nSaved to " + path + "." + (notes.length ? "\n" + notes.join("\n") : ""),
    data: { input: from, output: path, pages: result.pages, page_size: paper, title: heading || null },
  };
}
