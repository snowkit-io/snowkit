import { ToolError, readTextInput, writeOutput } from "./files.js";
import { parseJson, stringify, lineCol } from "./engine/devtools-kit.js";
import { parseJsonText, validateJson } from "./engine/jsonkit.js";
import { formatSql, minifySql } from "./engine/sqlformat.js";
import { stats, convertCase, dedupeLines, slugLine } from "./engine/texttools-kit.js";
import { readability, easeLabel, gradeLabel } from "./engine/readability.js";
import { parseColor, toHex, formatColor, nearestName, contrastRatio, wcag, ratioText } from "./engine/colorkit.js";
import { describe, next } from "./engine/cron.js";

const MAX_TEXT = 20 * 1024 * 1024;
const endLine = (s) => String(s).replace(/\n*$/, "\n");
const plural = (n, one, many) => n.toLocaleString("en-CA") + " " + (n === 1 ? one : many || one + "s");

export async function takeText({ text, input }, what = "text") {
  if ((text === undefined) === (input === undefined)) throw new ToolError("Give either input (a file path) or text, not both.");
  if (input !== undefined) {
    const file = await readTextInput(input);
    return { text: file.text, path: file.path };
  }
  const value = String(text);
  if (value.length > MAX_TEXT) throw new ToolError("That " + what + " is too long. Save it to a file and pass the file path instead.");
  return { text: value, path: null };
}

async function deliver(body, { output, overwrite }, summary, data = {}) {
  if (!output) return { text: summary, output: body, data: { ...data, result: body } };
  const path = await writeOutput(output, Buffer.from(body, "utf8"), { overwrite });
  return { text: summary + "\nSaved to " + path + ".", data: { ...data, output: path } };
}

function parseStrict(source) {
  try {
    return parseJson(source);
  } catch (e) {
    const at = e && typeof e.pos === "number" ? lineCol(source, e.pos) : null;
    throw new ToolError("This is not valid JSON: " + String((e && e.message) || e) + (at ? " (line " + at.line + ", column " + at.col + ")" : "") + ".");
  }
}

export async function jsonFormat(args) {
  const { text } = await takeText(args, "JSON");
  if (!text.trim()) throw new ToolError("The JSON is empty.");
  const parsed = parseStrict(text);
  const indent = args.indent === undefined ? 2 : Number(args.indent);
  if (!Number.isInteger(indent) || indent < 0 || indent > 8) throw new ToolError("indent must be a whole number from 0 to 8.");
  const body = endLine(stringify(parsed.value, args.minify ? "" : " ".repeat(indent), !!args.sort_keys));
  const notes = [];
  if (parsed.big && parsed.big.length) notes.push(plural(parsed.big.length, "large number") + " kept with every digit.");
  if (parsed.dupes && parsed.dupes.length) notes.push(plural(parsed.dupes.length, "duplicate key") + " found; the last value of each is kept.");
  const summary = (args.minify ? "Minified" : "Formatted") + " the JSON" + (args.sort_keys ? " with keys sorted" : "") + "." + (notes.length ? " " + notes.join(" ") : "");
  return deliver(body, args, summary);
}

export async function jsonValidate(args) {
  const { text } = await takeText(args, "JSON");
  let data;
  try {
    data = parseJsonText(text);
  } catch (e) {
    return {
      text: "Not valid JSON. " + e.message + ".",
      data: { valid: false, syntax: { line: e.line || null, column: e.column || null, message: e.reason || e.message } },
    };
  }
  let dupes = [];
  try {
    dupes = parseJson(text).dupes || [];
  } catch (e) {
    dupes = [];
  }
  const dupeNote = dupes.length ? "\nNote: " + plural(dupes.length, "duplicate key") + ", where only the last value counts." : "";
  if (args.schema === undefined && args.schema_path === undefined) {
    return { text: "Valid JSON." + dupeNote, data: { valid: true, duplicate_keys: dupes.length } };
  }
  if (args.schema !== undefined && args.schema_path !== undefined) throw new ToolError("Give either schema or schema_path, not both.");
  let schema;
  try {
    schema = args.schema_path !== undefined ? parseJsonText((await readTextInput(args.schema_path, "schema path")).text) : typeof args.schema === "string" ? parseJsonText(args.schema) : args.schema;
  } catch (e) {
    if (e instanceof ToolError) throw e;
    throw new ToolError("The schema is not valid JSON. " + e.message + ".");
  }
  const errors = validateJson(data, schema);
  if (!errors.length) return { text: "Valid JSON, and it matches the schema." + dupeNote, data: { valid: true, schema_errors: [] } };
  const shown = errors.slice(0, 50).map((e) => "  " + e.path + ": " + e.message).join("\n");
  return {
    text: "Valid JSON, but it does not match the schema (" + plural(errors.length, "problem") + "):\n" + shown + (errors.length > 50 ? "\n  and " + (errors.length - 50) + " more" : ""),
    data: { valid: false, schema_errors: errors },
  };
}

export async function sqlFormat(args) {
  const { text } = await takeText(args, "SQL");
  if (!text.trim()) throw new ToolError("The SQL is empty.");
  const keywordCase = args.keyword_case || "upper";
  const indent = args.indent === undefined ? 2 : Number(args.indent);
  if (!Number.isInteger(indent) || indent < 1 || indent > 8) throw new ToolError("indent must be a whole number from 1 to 8.");
  const body = endLine(args.minify ? minifySql(text, { keywordCase }) : formatSql(text, { keywordCase, indent: " ".repeat(indent) }));
  return deliver(body, args, (args.minify ? "Minified" : "Formatted") + " the SQL.");
}

export async function textStats(args) {
  const { text } = await takeText(args);
  const s = stats(text);
  const r = readability(text);
  const lines = [
    "Words: " + s.words.toLocaleString("en-CA"),
    "Characters: " + s.chars.toLocaleString("en-CA") + " (" + s.nospace.toLocaleString("en-CA") + " without spaces)",
    "Sentences: " + s.sentences.toLocaleString("en-CA"),
    "Paragraphs: " + s.paragraphs.toLocaleString("en-CA"),
    "Lines: " + s.lines.toLocaleString("en-CA"),
    "Reading time: " + s.read,
    "Speaking time: " + s.speak,
  ];
  const data = { words: s.words, characters: s.chars, characters_without_spaces: s.nospace, sentences: s.sentences, paragraphs: s.paragraphs, lines: s.lines, reading_time: s.read, speaking_time: s.speak };
  if (r && r.words >= 30) {
    lines.push("Readability (English): " + r.fleschEase + " Flesch reading ease, " + easeLabel(r.fleschEase).toLowerCase() + "; " + gradeLabel(r.averageGrade).toLowerCase() + " level");
    if (r.longSentences.length) lines.push("Sentences over 25 words: " + r.longSentences.length);
    data.readability = { flesch_reading_ease: r.fleschEase, ease: easeLabel(r.fleschEase), flesch_kincaid_grade: r.fleschKincaid, gunning_fog: r.gunningFog, smog: r.smog, coleman_liau: r.colemanLiau, ari: r.ari, average_grade: r.averageGrade, words_per_sentence: r.wordsPerSentence, long_sentences: r.longSentences.length };
  }
  return { text: lines.join("\n"), data };
}

export const CASES = ["upper", "lower", "title", "sentence", "camel", "pascal", "snake", "kebab", "constant"];
export const TRANSFORMS = [...CASES, "slug", "dedupe"];

export async function textTransform(args) {
  const { text } = await takeText(args);
  const action = String(args.action || "");
  if (!TRANSFORMS.includes(action)) throw new ToolError("action must be one of: " + TRANSFORMS.join(", ") + ".");
  if (action === "dedupe") {
    const r = dedupeLines(text, { trim: args.trim !== false, ignoreCase: !!args.ignore_case, dropEmpty: !!args.remove_empty });
    const removed = r.dupes ? plural(r.dupes, "duplicate line") + " removed" : "No duplicate lines found";
    return deliver(endLine(r.out.join("\n")), args, removed + (r.empties ? ", plus " + plural(r.empties, "empty line") : "") + ".", { removed: r.dupes, empty_removed: r.empties });
  }
  if (action === "slug") {
    const slugs = text.replace(/\r\n?/g, "\n").split("\n").filter((l) => l.trim()).map((l) => slugLine(l, { ascii: true, lower: true, sep: "-", stop: false, max: 0 }));
    return deliver(endLine(slugs.join("\n")), args, "Made " + plural(slugs.length, "slug") + ".");
  }
  const body = convertCase(text, action === "constant" ? "constant" : action);
  return deliver(body, args, "Converted to " + action + " case.");
}

function readColor(value) {
  try {
    return parseColor(String(value == null ? "" : value).trim()) || null;
  } catch (e) {
    return null;
  }
}

export function colorConvert({ color, against }) {
  const c = readColor(color);
  if (!c) throw new ToolError("“" + color + "” does not look like a colour. Try #336699, rgb(51 102 153), hsl(210 50% 40%) or a name such as teal.");
  const near = nearestName(c);
  const data = { hex: toHex(c), rgb: formatColor(c, "rgb"), hsl: formatColor(c, "hsl"), hsv: formatColor(c, "hsv"), oklch: formatColor(c, "oklch"), name: near.name, exact_name: !!near.exact };
  const lines = ["Hex: " + data.hex, "RGB: " + data.rgb, "HSL: " + data.hsl, "HSV: " + data.hsv, "OKLCH: " + data.oklch, (near.exact ? "Name: " : "Nearest name: ") + near.name];
  if (against !== undefined && against !== null && against !== "") {
    const b = readColor(against);
    if (!b) throw new ToolError("“" + against + "” does not look like a colour.");
    const ratio = contrastRatio(c, b);
    const w = wcag(ratio);
    const yes = (v) => (v ? "pass" : "fail");
    Object.assign(data, { against: toHex(b), contrast: ratioText(ratio), aa_normal: !!w.aaNormal, aa_large: !!w.aaLarge, aaa_normal: !!w.aaaNormal });
    lines.push("", "Contrast with " + data.against + ": " + data.contrast, "WCAG AA normal text: " + yes(w.aaNormal) + ", AA large text: " + yes(w.aaLarge) + ", AAA normal text: " + yes(w.aaaNormal));
  }
  return { text: lines.join("\n"), data };
}

export function cronExplain({ expression, count = 5, utc = false }) {
  const expr = String(expression == null ? "" : expression).trim();
  if (!expr) throw new ToolError("Give a cron expression, such as */15 9-17 * * 1-5.");
  const n = Number(count);
  if (!Number.isInteger(n) || n < 1 || n > 50) throw new ToolError("count must be a whole number from 1 to 50.");
  let words;
  let runs;
  try {
    words = describe(expr);
    runs = next(expr, n, new Date(), { utc: !!utc });
  } catch (e) {
    throw new ToolError("That cron expression does not work: " + String((e && e.message) || e) + ".");
  }
  const zone = utc ? "UTC" : Intl.DateTimeFormat().resolvedOptions().timeZone || "local time";
  const show = (d) => (utc ? d.toISOString().replace("T", " ").replace(/:00\.000Z$/, " UTC") : d.toLocaleString("en-CA", { dateStyle: "medium", timeStyle: "short" }));
  return {
    text: words + "\n\nNext runs (" + zone + "):\n" + runs.map((d) => "  " + show(d)).join("\n"),
    data: { description: words, time_zone: zone, next_runs: runs.map((d) => d.toISOString()) },
  };
}
