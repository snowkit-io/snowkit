import { readFileSync } from "node:fs";
import { TOOLS, runTool, ToolError } from "./tools.js";
import { CASES } from "./text.js";

const VALUE_FLAGS = new Set(["output", "pages", "angle", "range", "every", "page", "title", "level", "size", "indent", "case", "schema", "count", "against", "format"]);
const BOOL_FLAGS = new Set(["overwrite", "json", "sort", "minify", "numbers", "utc", "ignore-case", "remove-empty", "keep-spaces", "help", "version"]);
const SHORT = { o: "output", h: "help", v: "version" };

export class UsageError extends Error {}

export function parseArgs(argv) {
  const pos = [];
  const flags = { range: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--") {
      pos.push(...argv.slice(i + 1));
      break;
    }
    let key = null;
    let value;
    if (/^--[a-z]/.test(a)) {
      const eq = a.indexOf("=");
      key = eq > 0 ? a.slice(2, eq) : a.slice(2);
      if (eq > 0) value = a.slice(eq + 1);
    } else if (/^-[a-z]$/i.test(a)) {
      key = SHORT[a.slice(1)];
      if (!key) throw new UsageError("Unknown option " + a + ".");
    } else {
      pos.push(a);
      continue;
    }
    if (BOOL_FLAGS.has(key)) {
      if (value !== undefined) throw new UsageError("--" + key + " does not take a value.");
      flags[key] = true;
    } else if (VALUE_FLAGS.has(key)) {
      if (value === undefined) {
        if (i + 1 >= argv.length) throw new UsageError("--" + key + " needs a value.");
        value = argv[++i];
      }
      if (key === "range") flags.range.push(value);
      else flags[key] = value;
    } else throw new UsageError("Unknown option --" + key + ".");
  }
  return { pos, flags };
}

const HELP = `Snowkit: private tools that run on your computer.

Usage:
  snowkit                      start the MCP server for AI apps (same as snowkit mcp)
  snowkit pdf merge <a.pdf> <b.pdf> [more.pdf...] [-o out.pdf]
  snowkit pdf split <file.pdf> [--every 2 | --range 1-3 --range 4-] [-o folder]
  snowkit pdf extract <file.pdf> --pages "1-3, 7" [-o out.pdf]
  snowkit pdf rotate <file.pdf> --angle 90|180|270|-90 [--pages "2, 4-6"] [-o out.pdf]
  snowkit pdf info <file.pdf>
  snowkit md2pdf <notes.md> [-o notes.pdf] [--page letter|a4|legal|a5] [--title "..."] [--numbers]
  snowkit qr "<text or link>" [-o qr.svg|qr.png] [--level L|M|Q|H] [--size 512]
  snowkit json format [file.json] [--indent 2] [--sort] [--minify] [-o out.json]
  snowkit json validate [file.json] [--schema schema.json]
  snowkit sql format [file.sql] [--case upper|lower|preserve] [--indent 2] [--minify] [-o out.sql]
  snowkit text stats [file.txt]
  snowkit text case <${CASES.join("|")}> [file.txt]
  snowkit text slug [file.txt]
  snowkit text dedupe [file.txt] [--ignore-case] [--remove-empty] [--keep-spaces]
  snowkit color "<colour>" [--against "<colour>"]
  snowkit cron "<expression>" [--count 5] [--utc]
  snowkit tools                list the tools AI apps can use

Text commands read the file given, or standard input when it is piped.
Results that are files are saved next to the input unless -o is given.
Existing files are never replaced unless you add --overwrite.
Add --json to print the full result as JSON.

Nothing you open with Snowkit leaves your computer. https://snowkit.io`;

function readStdin() {
  if (process.stdin.isTTY) throw new UsageError("Give a file, or pipe text in.");
  return readFileSync(0, "utf8").replace(/^﻿/, "");
}

function textSource(file) {
  return file && file !== "-" ? { input: file } : { text: readStdin() };
}

function num(value, name) {
  if (value === undefined) return undefined;
  const n = Number(value);
  if (!Number.isFinite(n)) throw new UsageError("--" + name + " needs a number.");
  return n;
}

function need(value, what) {
  if (value === undefined || value === "") throw new UsageError("Missing " + what + ". Run snowkit --help for examples.");
  return value;
}

export function plan(pos, f) {
  const [cmd, sub, ...rest] = pos;
  const base = { overwrite: f.overwrite || undefined };
  const clean = (o) => Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined));
  if (cmd === "pdf") {
    const files = rest;
    if (sub === "merge") return ["pdf_merge", clean({ ...base, inputs: files, output: f.output })];
    if (sub === "split") return ["pdf_split", clean({ ...base, input: need(files[0], "PDF file"), every: num(f.every, "every"), ranges: f.range.length ? f.range : undefined, output_folder: f.output })];
    if (sub === "extract") return ["pdf_extract_pages", clean({ ...base, input: need(files[0], "PDF file"), pages: need(f.pages, "--pages"), output: f.output })];
    if (sub === "rotate") return ["pdf_rotate", clean({ ...base, input: need(files[0], "PDF file"), angle: num(need(f.angle, "--angle"), "angle"), pages: f.pages, output: f.output })];
    if (sub === "info") return ["pdf_info", { input: need(files[0], "PDF file") }];
    throw new UsageError("Choose a PDF command: merge, split, extract, rotate or info.");
  }
  if (cmd === "md2pdf") return ["markdown_to_pdf", clean({ ...base, input: need(sub, "Markdown file"), output: f.output, page: f.page, title: f.title, page_numbers: f.numbers || undefined })];
  if (cmd === "qr") return ["qr_code", clean({ ...base, text: need(sub, "text or link"), output: f.output, format: f.format, level: f.level, size: num(f.size, "size") })];
  if (cmd === "json") {
    if (sub === "format") return ["json_format", clean({ ...base, ...textSource(rest[0]), indent: num(f.indent, "indent"), sort_keys: f.sort || undefined, minify: f.minify || undefined, output: f.output })];
    if (sub === "validate") return ["json_validate", clean({ ...textSource(rest[0]), schema_path: f.schema })];
    throw new UsageError("Choose a JSON command: format or validate.");
  }
  if (cmd === "sql") {
    if (sub !== "format") throw new UsageError("Use snowkit sql format [file.sql].");
    return ["sql_format", clean({ ...base, ...textSource(rest[0]), keyword_case: f.case, indent: num(f.indent, "indent"), minify: f.minify || undefined, output: f.output })];
  }
  if (cmd === "text") {
    if (sub === "stats") return ["text_stats", textSource(rest[0])];
    if (sub === "case") return ["text_transform", clean({ ...base, action: need(rest[0], "case name, such as title"), ...textSource(rest[1]), output: f.output })];
    if (sub === "slug") return ["text_transform", clean({ ...base, action: "slug", ...textSource(rest[0]), output: f.output })];
    if (sub === "dedupe") return ["text_transform", clean({ ...base, action: "dedupe", ...textSource(rest[0]), ignore_case: f["ignore-case"] || undefined, remove_empty: f["remove-empty"] || undefined, trim: f["keep-spaces"] ? false : undefined, output: f.output })];
    throw new UsageError("Choose a text command: stats, case, slug or dedupe.");
  }
  if (cmd === "color" || cmd === "colour") return ["color_convert", clean({ color: need(sub, "colour"), against: f.against })];
  if (cmd === "cron") return ["cron_explain", clean({ expression: need(sub, "cron expression"), count: num(f.count, "count"), utc: f.utc || undefined })];
  throw new UsageError("Unknown command “" + cmd + "”. Run snowkit --help to see them all.");
}

export async function main(argv, version, io = { out: process.stdout, err: process.stderr }) {
  const say = (stream, text) => stream.write(String(text).replace(/\n?$/, "\n"));
  let parsed;
  try {
    parsed = parseArgs(argv);
  } catch (e) {
    say(io.err, e.message);
    return 2;
  }
  const { pos, flags } = parsed;
  if (flags.version) {
    say(io.out, version);
    return 0;
  }
  if (flags.help || pos[0] === "help") {
    say(io.out, HELP);
    return 0;
  }
  if (pos[0] === "tools") {
    const width = Math.max(...TOOLS.map((t) => t.name.length));
    say(io.out, TOOLS.map((t) => t.name.padEnd(width + 2) + t.description).join("\n"));
    return 0;
  }
  try {
    const [name, args] = plan(pos, flags);
    const result = await runTool(name, args);
    if (flags.json) say(io.out, JSON.stringify(result.data, null, 2));
    else if (result.output !== undefined) io.out.write(result.output);
    else say(io.out, result.text);
    if (result.data && result.data.valid === false) return 1;
    return 0;
  } catch (e) {
    if (e instanceof UsageError) {
      say(io.err, e.message);
      return 2;
    }
    if (e instanceof ToolError) {
      say(io.err, e.message);
      return 1;
    }
    say(io.err, "Something went wrong: " + String((e && e.message) || e));
    return 1;
  }
}
