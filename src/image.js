import { extname } from "node:path";
import { clean as cleanImage } from "./engine/metadata.js";
import { ToolError, readInput, besideInput, writeOutput, formatBytes } from "./files.js";

function parse(bytes, options) {
  try {
    return cleanImage(bytes, options);
  } catch (e) {
    throw new ToolError(/supported/.test(String(e && e.message)) ? "Only JPEG, PNG and WebP images are supported." : "This image looks damaged and could not be read.");
  }
}

function place(gps) {
  if (!gps) return "";
  return gps.lat.toFixed(5) + ", " + gps.lon.toFixed(5) + (gps.altitude !== null ? " at " + gps.altitude + " m" : "");
}

export async function imageInfo({ input }) {
  const file = await readInput(input, "image path");
  const { report, removed } = parse(new Uint8Array(file.bytes));
  const lines = [report.format + " image, " + formatBytes(file.size) + "."];
  if (report.gps) lines.push("Location: " + place(report.gps) + ". Anyone with the file can see where it was taken.");
  for (const f of report.fields) lines.push(f.label + ": " + f.value);
  const extra = [...new Set(report.found)];
  if (extra.length) lines.push("Hidden data: " + extra.join(", ") + " (" + formatBytes(removed) + ").");
  else lines.push("No hidden metadata found.");
  return {
    text: lines.join("\n"),
    data: { input: file.path, format: report.format, size: file.size, gps: report.gps, fields: report.fields, found: extra, metadataBytes: removed },
  };
}

export async function stripMetadata({ input, output, keep_color_profile = true, overwrite = false }) {
  const file = await readInput(input, "image path");
  const { bytes, report, removed } = parse(new Uint8Array(file.bytes), { keepColor: keep_color_profile !== false, keepOrientation: true });
  const ext = extname(file.path) || "." + report.format.toLowerCase();
  const path = await writeOutput(output || besideInput(file.path, "-clean", ext), bytes, { overwrite });
  const extra = [...new Set(report.found)];
  const what = extra.length ? "Removed " + extra.join(", ") + (report.gps ? ", including the location" : "") + " (" + formatBytes(removed) + ")." : "There was no hidden metadata to remove.";
  return {
    text: what + " The picture itself is unchanged.\nSaved to " + path + ".",
    data: { input: file.path, output: path, removed: extra, hadLocation: !!report.gps, bytesRemoved: removed },
  };
}
