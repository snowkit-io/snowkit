import { buildHead, checkHead } from "./engine/meta.js";
import { ToolError, readTextInput } from "./files.js";

export function headTags({ title, description, url, image, image_alt, site_name, twitter, theme_color, noindex = false }) {
  if (!title && !description) throw new ToolError("Give at least a title or a description.");
  const html = buildHead({ title, description, url, image, imageAlt: image_alt, siteName: site_name, twitter, themeColor: theme_color, robots: noindex ? { index: false } : {} });
  return { text: html, data: { html } };
}

const MARK = { ok: "OK", long: "Too long", short: "Too short", missing: "Missing", warn: "Check" };

export async function checkHeadTags({ html, input }) {
  let source = html;
  if (!source && input) source = (await readTextInput(input, "HTML file")).text;
  if (!source || !String(source).trim()) throw new ToolError("Give the page's HTML or the path to an HTML file.");
  const items = checkHead(String(source));
  const problems = items.filter((i) => i.status !== "ok");
  const lines = items.map((i) => (MARK[i.status] || i.status) + ": " + i.label + (i.note ? ". " + i.note : ""));
  return {
    text: (problems.length ? problems.length + (problems.length === 1 ? " thing to fix" : " things to fix") : "Everything checked looks right") + ".\n" + lines.join("\n"),
    data: { items, problems: problems.length },
  };
}
