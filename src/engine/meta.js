import { parseHTML } from "./html.js";

export const LIMITS = {
  title: { min: 30, max: 60 },
  description: { min: 70, max: 160 },
  ogTitle: { min: 1, max: 90 },
  imageAlt: { min: 1, max: 420 },
};

export function escAttr(s) {
  return String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export function escText(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export function clean(s) {
  return String(s ?? "").replace(/\s+/g, " ").trim();
}

export function lengthStatus(text, { min, max }) {
  const n = [...clean(text)].length;
  if (!n) return { n, status: "empty" };
  if (n > max) return { n, status: "long" };
  if (n < min) return { n, status: "short" };
  return { n, status: "ok" };
}

export function clip(text, max) {
  const t = clean(text);
  const chars = [...t];
  if (chars.length <= max) return t;
  const cut = chars.slice(0, max).join("");
  const sp = cut.lastIndexOf(" ");
  return (sp > max * 0.6 ? cut.slice(0, sp) : cut).replace(/[\s,.;:!?-]+$/, "") + "\u2026";
}

export function isAbsolute(url) {
  return /^https?:\/\/[^\s/?#]+\.[^\s/?#]+/i.test(String(url || "").trim());
}

export function crumbs(url) {
  try {
    const u = new URL(String(url).trim());
    const parts = u.pathname.split("/").filter(Boolean).map((p) => {
      try {
        return decodeURIComponent(p);
      } catch (e) {
        return p;
      }
    });
    return { host: u.host.replace(/^www\./, ""), origin: u.origin, path: parts };
  } catch (e) {
    return null;
  }
}

export function handle(s) {
  const t = clean(s).replace(/^https?:\/\/(www\.)?(twitter|x)\.com\//i, "").replace(/^@+/, "").replace(/[/?#].*$/, "");
  return /^\w{1,15}$/.test(t) ? "@" + t : "";
}

export function robotsValue({ index = true, follow = true, noarchive = false, nosnippet = false, largeImages = false } = {}) {
  const parts = [index ? "index" : "noindex", follow ? "follow" : "nofollow"];
  if (noarchive) parts.push("noarchive");
  if (nosnippet) parts.push("nosnippet");
  if (largeImages && !nosnippet) parts.push("max-image-preview:large");
  return parts.join(", ");
}

export function buildHead(f = {}) {
  const title = clean(f.title);
  const desc = clean(f.description);
  const url = clean(f.url);
  const site = clean(f.siteName);
  const image = clean(f.image);
  const alt = clean(f.imageAlt);
  const tw = handle(f.twitter || "");
  const theme = clean(f.themeColor);
  const robots = robotsValue(f.robots || {});
  const out = [];
  const meta = (attr, key, value) => out.push("<meta " + attr + '="' + key + '" content="' + escAttr(value) + '">');
  if (title) out.push("<title>" + escText(title) + "</title>");
  if (desc) meta("name", "description", desc);
  if (url) out.push('<link rel="canonical" href="' + escAttr(url) + '">');
  if (robots !== "index, follow") meta("name", "robots", robots);
  if (title || desc || url || image) {
    out.push("");
    meta("property", "og:type", clean(f.type) || "website");
    if (site) meta("property", "og:site_name", site);
    if (title) meta("property", "og:title", title);
    if (desc) meta("property", "og:description", desc);
    if (url) meta("property", "og:url", url);
    if (image) meta("property", "og:image", image);
    if (image && alt) meta("property", "og:image:alt", alt);
    if (clean(f.locale)) meta("property", "og:locale", clean(f.locale));
    out.push("");
    meta("name", "twitter:card", image ? "summary_large_image" : "summary");
    if (tw) meta("name", "twitter:site", tw);
    if (title) meta("name", "twitter:title", title);
    if (desc) meta("name", "twitter:description", desc);
    if (image) meta("name", "twitter:image", image);
    if (image && alt) meta("name", "twitter:image:alt", alt);
  }
  if (/^#[0-9a-f]{3}([0-9a-f]{3})?$/i.test(theme)) {
    out.push("");
    meta("name", "theme-color", theme.toLowerCase());
  }
  return out.join("\n").replace(/^\n+|\n+$/g, "").replace(/\n{3,}/g, "\n\n");
}

function walk(node, fn) {
  for (const c of node.childNodes || []) {
    if (c.nodeType === 1) {
      fn(c);
      walk(c, fn);
    }
  }
}

function textOf(node) {
  let s = "";
  for (const c of node.childNodes || []) s += c.nodeType === 3 ? c.nodeValue : textOf(c);
  return s;
}

export function readHead(html) {
  const root = parseHTML(String(html || ""));
  const found = { titles: [], meta: {}, links: {}, charset: false, viewport: "" };
  const add = (map, key, value) => (map[key] = map[key] || []).push(value);
  walk(root, (el) => {
    const a = el.attrs;
    if (el.tagName === "title") found.titles.push(clean(textOf(el)));
    else if (el.tagName === "meta") {
      if ("charset" in a || /content-type/i.test(a["http-equiv"] || "")) found.charset = true;
      const key = (a.property || a.name || "").toLowerCase().trim();
      if (key) add(found.meta, key, a.content ?? "");
      if (key === "viewport") found.viewport = a.content || "";
    } else if (el.tagName === "link" && a.rel) {
      for (const rel of a.rel.toLowerCase().split(/\s+/)) if (rel) add(found.links, rel, a.href ?? "");
    }
  });
  return found;
}

export function checkHead(html) {
  const h = readHead(html);
  const items = [];
  const push = (key, label, status, note) => items.push({ key, label, status, note });
  const one = (k) => (h.meta[k] || [])[0];
  const lenCheck = (key, label, value, lim, what) => {
    const { n, status } = lengthStatus(value, lim);
    if (status === "long") push(key, label, "long", n + " characters. Search engines usually cut " + what + " after about " + lim.max + ".");
    else if (status === "short") push(key, label, "short", n + " characters. Aim for " + lim.min + " to " + lim.max + " so it says enough.");
    else push(key, label, "ok", n + " characters.");
  };

  if (!h.titles.length || !h.titles[0]) push("title", "Title", "missing", "Add a <title>. It is the clickable headline in search results.");
  else {
    lenCheck("title", "Title", h.titles[0], LIMITS.title, "titles");
    if (h.titles.length > 1) push("title-dup", "Title", "warn", "There are " + h.titles.length + " <title> tags. Keep exactly one.");
  }

  const desc = h.meta.description;
  if (!desc || !clean(desc[0])) push("description", "Meta description", "missing", "Add a meta description. Search engines often show it under the title.");
  else {
    lenCheck("description", "Meta description", desc[0], LIMITS.description, "descriptions");
    if (desc.length > 1) push("description-dup", "Meta description", "warn", "There are " + desc.length + " description tags. Keep one.");
  }

  const canon = (h.links.canonical || [])[0];
  if (canon === undefined) push("canonical", "Canonical link", "missing", "Add a canonical link so search engines know the preferred address.");
  else if (!isAbsolute(canon)) push("canonical", "Canonical link", "warn", "Use the full address, starting with https://.");
  else push("canonical", "Canonical link", "ok", canon);

  const robots = clean(one("robots") || "").toLowerCase();
  if (/noindex/.test(robots)) push("robots", "Robots", "warn", "This page asks search engines not to index it (noindex).");
  else if (robots) push("robots", "Robots", "ok", robots);

  if (!h.charset) push("charset", "Character set", "missing", 'Add <meta charset="utf-8"> as the first tag in the head.');
  else push("charset", "Character set", "ok", "Set.");
  if (!h.viewport) push("viewport", "Viewport", "missing", 'Add <meta name="viewport" content="width=device-width, initial-scale=1"> so it works on phones.');
  else push("viewport", "Viewport", "ok", h.viewport);

  const ogt = one("og:title");
  if (ogt === undefined) push("og:title", "og:title", "missing", "Share cards fall back to the page title, but setting og:title is more reliable.");
  else if (lengthStatus(ogt, LIMITS.ogTitle).status === "long") push("og:title", "og:title", "long", [...clean(ogt)].length + " characters. Long share titles get cut.");
  else push("og:title", "og:title", "ok", clean(ogt));

  const ogd = one("og:description");
  if (ogd === undefined) push("og:description", "og:description", "missing", "Add og:description for the text under the share card title.");
  else if ([...clean(ogd)].length > 200) push("og:description", "og:description", "long", [...clean(ogd)].length + " characters. Most apps show about 200 at most.");
  else push("og:description", "og:description", "ok", [...clean(ogd)].length + " characters.");

  const ogi = one("og:image");
  if (ogi === undefined) push("og:image", "og:image", "missing", "Without og:image, links to this page share with no picture. 1200 \u00d7 630 works everywhere.");
  else if (!isAbsolute(ogi)) push("og:image", "og:image", "warn", "Use the full image address, starting with https://. Relative paths often fail.");
  else push("og:image", "og:image", "ok", ogi);

  const ogu = one("og:url");
  if (ogu === undefined) push("og:url", "og:url", "missing", "Add og:url with the page\u2019s full address.");
  else if (!isAbsolute(ogu)) push("og:url", "og:url", "warn", "Use the full address, starting with https://.");
  else push("og:url", "og:url", "ok", ogu);

  const card = one("twitter:card");
  if (card === undefined) push("twitter:card", "twitter:card", "missing", ogi ? "Add twitter:card set to summary_large_image to show the big image on X." : "Add twitter:card so X shows a card.");
  else if (!/^(summary|summary_large_image|app|player)$/.test(clean(card))) push("twitter:card", "twitter:card", "warn", "Use summary or summary_large_image.");
  else push("twitter:card", "twitter:card", "ok", clean(card));

  if (one("theme-color") === undefined) push("theme-color", "Theme colour", "optional", "Optional. Tints the browser bar on some phones.");
  else push("theme-color", "Theme colour", "ok", clean(one("theme-color")));

  if (!(h.links.icon || h.links["shortcut"] || []).length) push("icon", "Favicon", "missing", "No <link rel=\"icon\">. Browsers will look for /favicon.ico on their own.");
  else push("icon", "Favicon", "ok", "Linked.");

  return items;
}
