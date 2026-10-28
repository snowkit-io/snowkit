const PUNCT = /^[!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~]$/;
const OPEN = "\ue000";
const CLOSE = "\ue001";

export function escapeHtml(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

const ENTITY = /^&(#\d{1,7}|#[xX][0-9a-fA-F]{1,6}|[a-zA-Z][a-zA-Z0-9]{1,31});/;

export function safeUrl(raw, { image = false } = {}) {
  const url = String(raw || "").trim().replace(/\\([!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~])/g, "$1");
  const probe = url.replace(/[\u0000- \u007f-\u009f]/g, "").toLowerCase();
  const scheme = probe.match(/^([a-z][a-z0-9+.-]*):/);
  if (scheme) {
    const s = scheme[1];
    const ok = s === "http" || s === "https" || (!image && (s === "mailto" || s === "tel")) || (image && /^data:image\/(png|gif|jpeg|webp);base64,/.test(probe));
    if (!ok) return "#";
  }
  return url.replace(/ /g, "%20");
}

function blank(line) {
  return /^[ \t]*$/.test(line);
}

function indentOf(line) {
  return line.match(/^ */)[0].length;
}

function expandTabs(line) {
  const m = line.match(/^[ \t]+/);
  if (!m || !m[0].includes("\t")) return line;
  let col = 0;
  for (const ch of m[0]) col = ch === "\t" ? col + 4 - (col % 4) : col + 1;
  return " ".repeat(col) + line.slice(m[0].length);
}

function isHr(line) {
  return /^ {0,3}([-*_])(?:[ \t]*\1){2,}[ \t]*$/.test(line);
}

function fenceStart(line) {
  const m = line.match(/^( {0,3})(`{3,}|~{3,})[ \t]*(.*)$/);
  if (!m) return null;
  if (m[2][0] === "`" && m[3].includes("`")) return null;
  return { indent: m[1].length, fence: m[2], info: m[3].trim().split(/\s+/)[0] || "" };
}

function listStart(line) {
  if (isHr(line)) return null;
  const m = line.match(/^( {0,3})([-+*]|\d{1,9}[.)])(?:([ \t]+)(.*))?$/);
  if (!m) return null;
  const marker = m[2];
  const ordered = /\d/.test(marker[0]);
  let spaces = m[3] ? m[3].length : 0;
  let rest = m[4] || "";
  if (!m[3]) {
    if (line.length > m[1].length + marker.length) return null;
    spaces = 1;
  } else if (spaces > 4 || rest === "") {
    rest = m[3].slice(1) + rest;
    spaces = 1;
  }
  return {
    indent: m[1].length,
    ordered,
    key: ordered ? marker.slice(-1) : marker,
    start: ordered ? parseInt(marker, 10) : 1,
    content: m[1].length + marker.length + spaces,
    rest,
    empty: rest.trim() === "",
  };
}

function splitCells(line) {
  let s = line.trim();
  if (s.startsWith("|")) s = s.slice(1);
  if (s.endsWith("|") && !s.endsWith("\\|")) s = s.slice(0, -1);
  const cells = [];
  let cur = "";
  let tick = 0;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (c === "\\" && s[i + 1] === "|") {
      cur += tick ? "|" : "\\|";
      i++;
      continue;
    }
    if (c === "`") {
      let n = 1;
      while (s[i + n] === "`") n++;
      if (!tick) tick = n;
      else if (tick === n) tick = 0;
      cur += "`".repeat(n);
      i += n - 1;
      continue;
    }
    if (c === "|" && !tick) {
      cells.push(cur.trim());
      cur = "";
      continue;
    }
    cur += c;
  }
  cells.push(cur.trim());
  return cells;
}

function delimiterRow(line) {
  if (!/-/.test(line) || !/^[ \t|:-]+$/.test(line)) return null;
  const cells = splitCells(line);
  if (!cells.every((c) => /^:?-+:?$/.test(c))) return null;
  if (cells.length === 1 && !line.includes("|")) return null;
  return cells.map((c) => (c.startsWith(":") && c.endsWith(":") ? "center" : c.endsWith(":") ? "right" : c.startsWith(":") ? "left" : ""));
}

function interrupts(line) {
  if (fenceStart(line) || isHr(line) || /^ {0,3}#{1,6}(?:[ \t]|$)/.test(line) || /^ {0,3}>/.test(line)) return true;
  const l = listStart(line);
  return !!(l && !l.empty && (!l.ordered || l.start === 1));
}

const REF_DEF = /^ {0,3}\[((?:[^\]\\]|\\.){1,999})\]:[ \t]*(<[^>\n]*>|\S+)(?:[ \t]+("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|\((?:[^)\\]|\\.)*\)))?[ \t]*$/;

export function normalizeLabel(s) {
  return String(s).trim().replace(/\s+/g, " ").toLowerCase();
}

function unquote(t) {
  return t ? t.slice(1, -1).replace(/\\(.)/g, "$1") : "";
}

function parseBlocks(lines, refs) {
  const out = [];
  let i = 0;
  const n = lines.length;
  while (i < n) {
    const line = lines[i];
    if (blank(line)) {
      i++;
      continue;
    }
    const fence = fenceStart(line);
    if (fence) {
      const body = [];
      i++;
      while (i < n) {
        const close = lines[i].match(/^ {0,3}(`{3,}|~{3,})[ \t]*$/);
        if (close && close[1][0] === fence.fence[0] && close[1].length >= fence.fence.length) {
          i++;
          break;
        }
        body.push(lines[i].replace(new RegExp("^ {0," + fence.indent + "}"), ""));
        i++;
      }
      out.push({ t: "code", lang: fence.info, text: body.join("\n") });
      continue;
    }
    if (/^ {4}/.test(line)) {
      const body = [];
      while (i < n && (blank(lines[i]) || /^ {4}/.test(lines[i]))) body.push(lines[i++].slice(4));
      while (body.length && blank(body[body.length - 1])) body.pop();
      out.push({ t: "code", lang: "", text: body.join("\n") });
      continue;
    }
    const h = line.match(/^ {0,3}(#{1,6})(?:[ \t]+(.*?))?[ \t]*$/);
    if (h) {
      out.push({ t: "heading", level: h[1].length, text: (h[2] || "").replace(/(^|[ \t]+)#+$/, "").trim() });
      i++;
      continue;
    }
    if (isHr(line)) {
      out.push({ t: "hr" });
      i++;
      continue;
    }
    if (/^ {0,3}>/.test(line)) {
      const inner = [];
      while (i < n) {
        const l = lines[i];
        const q = l.match(/^ {0,3}> ?(.*)$/);
        if (q) inner.push(q[1]);
        else if (!blank(l) && inner.length && !blank(inner[inner.length - 1]) && !interrupts(l)) inner.push(l);
        else break;
        i++;
      }
      out.push({ t: "quote", children: parseBlocks(inner, refs) });
      continue;
    }
    const ls = listStart(line);
    if (ls) {
      const list = { t: "list", ordered: ls.ordered, start: ls.start, loose: false, items: [] };
      let prevContent = ls.content;
      while (i < n) {
        const s = listStart(lines[i]);
        if (!s || s.key !== ls.key || s.ordered !== ls.ordered || s.indent >= prevContent) break;
        const body = [s.rest];
        const ci = s.content;
        prevContent = ci;
        i++;
        let inFence = !!fenceStart(s.rest);
        let blankInside = false;
        while (i < n) {
          const l = lines[i];
          if (blank(l)) {
            body.push("");
            i++;
            continue;
          }
          if (indentOf(l) >= ci) {
            const stripped = l.slice(ci);
            if (body.length && blank(body[body.length - 1]) && !inFence) blankInside = true;
            if (fenceStart(stripped)) inFence = !inFence;
            body.push(stripped);
            i++;
            continue;
          }
          if (blank(body[body.length - 1])) break;
          if (!interrupts(l) && !listStart(l) && !inFence) {
            body.push(l);
            i++;
            continue;
          }
          break;
        }
        let trailing = false;
        while (body.length > 1 && blank(body[body.length - 1])) {
          body.pop();
          trailing = true;
        }
        if (blankInside) list.loose = true;
        const next = i < n ? listStart(lines[i]) : null;
        if (trailing && next && next.key === ls.key && next.indent < ci) list.loose = true;
        let task = null;
        const tm = body[0].match(/^\[([ xX])\](?:[ \t]+(.*)|$)/);
        if (tm) {
          task = tm[1] !== " ";
          body[0] = tm[2] || "";
        }
        list.items.push({ task, children: parseBlocks(body, refs) });
        if (trailing && !(next && next.key === ls.key)) break;
      }
      out.push(list);
      continue;
    }
    if (i + 1 < n && line.includes("|")) {
      const align = delimiterRow(lines[i + 1]);
      const head = splitCells(line);
      if (align && align.length === head.length) {
        const rows = [];
        i += 2;
        while (i < n && !blank(lines[i]) && !interrupts(lines[i])) {
          const cells = splitCells(lines[i]);
          rows.push(head.map((_, k) => (cells[k] === undefined ? "" : cells[k])));
          i++;
        }
        out.push({ t: "table", align, head, rows });
        continue;
      }
    }
    const para = [line];
    i++;
    let setext = 0;
    while (i < n && !blank(lines[i])) {
      const l = lines[i];
      if (/^ {0,3}=+[ \t]*$/.test(l)) {
        setext = 1;
        i++;
        break;
      }
      if (/^ {0,3}-+[ \t]*$/.test(l)) {
        setext = 2;
        i++;
        break;
      }
      if (interrupts(l)) break;
      if (l.includes("|") && i + 1 < n && delimiterRow(lines[i + 1])) break;
      para.push(l);
      i++;
    }
    while (para.length) {
      const d = para[0].match(REF_DEF);
      if (!d) break;
      const label = normalizeLabel(d[1]);
      if (label && !refs.has(label)) refs.set(label, { href: d[2].replace(/^<|>$/g, ""), title: unquote(d[3]) });
      para.shift();
    }
    if (!para.length) continue;
    const text = para.map((l) => l.replace(/^ {0,3}/, "")).join("\n").replace(/[ \t]+$/, "");
    out.push(setext ? { t: "heading", level: setext, text: text.trim() } : { t: "para", text });
  }
  return out;
}

function findClose(src, from) {
  let depth = 0;
  for (let i = from; i < src.length; i++) {
    const c = src[i];
    if (c === "\\") {
      i++;
      continue;
    }
    if (c === "`") {
      let k = 1;
      while (src[i + k] === "`") k++;
      const end = src.indexOf("`".repeat(k), i + k);
      if (end > 0) i = end + k - 1;
      else i += k - 1;
      continue;
    }
    if (c === "[") depth++;
    else if (c === "]") {
      if (depth === 0) return i;
      depth--;
    }
  }
  return -1;
}

function parseDestination(src, at) {
  let i = at;
  if (src[i] !== "(") return null;
  i++;
  while (/[ \t\n]/.test(src[i] || "")) i++;
  let href = "";
  if (src[i] === "<") {
    const end = src.indexOf(">", i);
    if (end < 0 || src.slice(i, end).includes("\n")) return null;
    href = src.slice(i + 1, end);
    i = end + 1;
  } else {
    let depth = 0;
    const startHref = i;
    while (i < src.length) {
      const c = src[i];
      if (c === "\\" && i + 1 < src.length) {
        i += 2;
        continue;
      }
      if (/[\s]/.test(c)) break;
      if (c === "(") depth++;
      if (c === ")") {
        if (depth === 0) break;
        depth--;
      }
      i++;
    }
    href = src.slice(startHref, i);
  }
  while (/[ \t\n]/.test(src[i] || "")) i++;
  let title = "";
  const q = src[i];
  if (q === '"' || q === "'" || q === "(") {
    const closer = q === "(" ? ")" : q;
    let j = i + 1;
    while (j < src.length && src[j] !== closer) j += src[j] === "\\" ? 2 : 1;
    if (j >= src.length) return null;
    title = src.slice(i + 1, j).replace(/\\(.)/g, "$1");
    i = j + 1;
    while (/[ \t\n]/.test(src[i] || "")) i++;
  }
  if (src[i] !== ")") return null;
  return { href, title, end: i + 1 };
}

function plainText(html) {
  return html.replace(/<[^>]*>/g, "").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
}

function emphasis(s) {
  return s
    .replace(/\*\*\*(?=[^\s*])([\s\S]*?[^\s*])\*\*\*/g, "<strong><em>$1</em></strong>")
    .replace(/(^|[^\w])___(?=[^\s_])([\s\S]*?[^\s_])___(?![\w])/g, "$1<strong><em>$2</em></strong>")
    .replace(/\*\*(?=[^\s*]|\*[^\s*])([\s\S]*?[^\s])\*\*/g, "<strong>$1</strong>")
    .replace(/(^|[^\w\\])__(?=\S)([\s\S]*?[^\s\\])__(?![\w])/g, "$1<strong>$2</strong>")
    .replace(/(^|[^\\*])\*(?=[^\s*])([\s\S]*?[^\s\\*])\*(?!\*)/g, "$1<em>$2</em>")
    .replace(/(^|[^\w\\])_(?=[^\s_])([\s\S]*?[^\s\\_])_(?![\w])/g, "$1<em>$2</em>")
    .replace(/(^|[^\\~])~~(?=\S)([\s\S]*?\S)~~/g, "$1<del>$2</del>");
}

function linkTag(href, title, inner) {
  return '<a href="' + escapeHtml(safeUrl(href)) + '"' + (title ? ' title="' + escapeHtml(title) + '"' : "") + ">" + inner + "</a>";
}

export function renderInline(src, refs = new Map(), inLink = false) {
  const store = [];
  const put = (html) => OPEN + (store.push(html) - 1) + CLOSE;
  let out = "";
  let i = 0;
  const len = src.length;
  while (i < len) {
    const c = src[i];
    if (c === "\\" && i + 1 < len) {
      const d = src[i + 1];
      if (d === "\n") {
        out += put("<br>\n");
        i += 2;
        continue;
      }
      if (PUNCT.test(d)) {
        out += put(escapeHtml(d));
        i += 2;
        continue;
      }
    }
    if (c === "`") {
      let k = 1;
      while (src[i + k] === "`") k++;
      const fence = "`".repeat(k);
      let end = i + k;
      let found = -1;
      while ((end = src.indexOf(fence, end)) >= 0) {
        if (src[end + k] !== "`" && src[end - 1] !== "`") {
          found = end;
          break;
        }
        while (src[end] === "`") end++;
      }
      if (found >= 0) {
        let code = src.slice(i + k, found).replace(/\n/g, " ");
        if (/^ .*[^ ].* $/.test(code)) code = code.slice(1, -1);
        out += put("<code>" + escapeHtml(code) + "</code>");
        i = found + k;
      } else {
        out += fence;
        i += k;
      }
      continue;
    }
    if ((c === "!" && src[i + 1] === "[") || (c === "[" && !inLink)) {
      const image = c === "!";
      const open = image ? i + 1 : i;
      const close = findClose(src, open + 1);
      if (close > 0) {
        const text = src.slice(open + 1, close);
        let target = parseDestination(src, close + 1);
        let end = target ? target.end : -1;
        if (!target) {
          let label = text;
          end = close + 1;
          const ref = src.slice(close + 1).match(/^\[((?:[^\]\\]|\\.)*)\]/);
          if (ref) {
            if (ref[1].trim()) label = ref[1];
            end = close + 1 + ref[0].length;
          }
          const def = refs.get(normalizeLabel(label));
          if (def) target = { href: def.href, title: def.title };
        }
        if (target) {
          if (image) {
            const alt = plainText(renderInline(text, refs, true));
            out += put('<img src="' + escapeHtml(safeUrl(target.href, { image: true })) + '" alt="' + escapeHtml(alt) + '"' + (target.title ? ' title="' + escapeHtml(target.title) + '"' : "") + ">");
          } else {
            out += put(linkTag(target.href, target.title, renderInline(text, refs, true)));
          }
          i = end;
          continue;
        }
      }
      out += image ? "!" : "[";
      i++;
      continue;
    }
    if (c === "<") {
      const rest = src.slice(i);
      const auto = rest.match(/^<([a-zA-Z][a-zA-Z0-9+.-]{1,31}:[^\s<>]*)>/);
      const mail = rest.match(/^<([a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*)>/);
      if (auto && !inLink) {
        out += put(linkTag(auto[1], "", escapeHtml(auto[1])));
        i += auto[0].length;
        continue;
      }
      if (mail && !inLink) {
        out += put(linkTag("mailto:" + mail[1], "", escapeHtml(mail[1])));
        i += mail[0].length;
        continue;
      }
      out += "&lt;";
      i++;
      continue;
    }
    if (!inLink && (c === "h" || c === "H") && (i === 0 || /[\s(*_~]/.test(src[i - 1]))) {
      const m = src.slice(i).match(/^https?:\/\/[^\s<]+/i);
      if (m) {
        let url = m[0];
        while (/[.,:;!?'"*_~]$/.test(url) || (url.endsWith(")") && (url.match(/\(/g) || []).length < (url.match(/\)/g) || []).length)) url = url.slice(0, -1);
        out += put(linkTag(url, "", escapeHtml(url)));
        i += url.length;
        continue;
      }
    }
    if (c === "\n") {
      if (/ {2,}$/.test(out)) {
        out = out.replace(/ +$/, "");
        out += put("<br>\n");
      } else {
        out = out.replace(/ +$/, "") + "\n";
      }
      i++;
      while (src[i] === " ") i++;
      continue;
    }
    if (c === "&") {
      const e = src.slice(i).match(ENTITY);
      if (e) {
        out += put(e[0]);
        i += e[0].length;
        continue;
      }
      out += "&amp;";
      i++;
      continue;
    }
    out += c === ">" ? "&gt;" : c === '"' ? "&quot;" : c === "'" ? "&#39;" : c;
    i++;
  }
  out = emphasis(out);
  const restore = (s) => s.replace(/\ue000(\d+)\ue001/g, (_, k) => restore(store[+k]));
  return restore(out);
}

function slugify(text, ids) {
  let base = plainText(text).toLowerCase().trim().replace(/[^\p{L}\p{N}\s-]/gu, "").replace(/\s+/g, "-") || "section";
  let id = base;
  let k = 1;
  while (ids.has(id)) id = base + "-" + k++;
  ids.add(id);
  return id;
}

function renderBlocks(blocks, ctx, tight) {
  const out = [];
  for (const b of blocks) {
    if (b.t === "para") {
      const inner = renderInline(b.text, ctx.refs);
      out.push(tight ? inner : "<p>" + inner + "</p>");
    } else if (b.t === "heading") {
      const inner = renderInline(b.text, ctx.refs);
      const id = ctx.ids ? ' id="' + escapeHtml(slugify(inner, ctx.ids)) + '"' : "";
      out.push("<h" + b.level + id + ">" + inner + "</h" + b.level + ">");
    } else if (b.t === "hr") {
      out.push("<hr>");
    } else if (b.t === "code") {
      const lang = b.lang.replace(/[^\w+#.-]/g, "");
      out.push("<pre><code" + (lang ? ' class="language-' + escapeHtml(lang) + '"' : "") + ">" + escapeHtml(b.text) + (b.text ? "\n" : "") + "</code></pre>");
    } else if (b.t === "quote") {
      out.push("<blockquote>\n" + renderBlocks(b.children, ctx, false) + "\n</blockquote>");
    } else if (b.t === "list") {
      const tag = b.ordered ? "ol" : "ul";
      const hasTask = b.items.some((it) => it.task !== null);
      const open = "<" + tag + (b.ordered && b.start !== 1 ? ' start="' + b.start + '"' : "") + (hasTask ? ' class="tasks"' : "") + ">";
      const items = b.items.map((it) => {
        const box = it.task === null ? "" : '<input type="checkbox" disabled' + (it.task ? " checked" : "") + "> ";
        const body = renderBlocks(it.children, ctx, !b.loose);
        const cls = it.task === null ? "" : ' class="task"';
        if (!b.loose) return "<li" + cls + ">" + box + body + "</li>";
        return "<li" + cls + ">" + (box ? box.trim() + "\n" : "") + body + "</li>";
      });
      out.push(open + "\n" + items.join("\n") + "\n</" + tag + ">");
    } else if (b.t === "table") {
      const cell = (tag, text, k) => "<" + tag + (b.align[k] ? ' style="text-align:' + b.align[k] + '"' : "") + ">" + renderInline(text, ctx.refs) + "</" + tag + ">";
      const head = "<thead>\n<tr>" + b.head.map((t, k) => cell("th", t, k)).join("") + "</tr>\n</thead>";
      const body = b.rows.length ? "\n<tbody>\n" + b.rows.map((r) => "<tr>" + r.map((t, k) => cell("td", t, k)).join("") + "</tr>").join("\n") + "\n</tbody>" : "";
      out.push("<table>\n" + head + body + "\n</table>");
    }
  }
  return out.join(tight ? "\n" : "\n");
}

export function renderMarkdown(src, { headingIds = true } = {}) {
  const text = String(src == null ? "" : src).replace(/\r\n?/g, "\n").replace(/[\ue000\ue001\u0000]/g, "");
  const lines = text.split("\n").map(expandTabs);
  const refs = new Map();
  const blocks = parseBlocks(lines, refs);
  const html = renderBlocks(blocks, { refs, ids: headingIds ? new Set() : null }, false);
  return html ? html + "\n" : "";
}

export function markdownDocument(bodyHtml, title = "Document") {
  return (
    "<!doctype html>\n<html lang=\"en\">\n<head>\n<meta charset=\"utf-8\">\n<meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">\n<title>" +
    escapeHtml(title) +
    "</title>\n<style>\nbody{max-width:760px;margin:40px auto;padding:0 20px;font:17px/1.6 system-ui,-apple-system,\"Segoe UI\",Roboto,sans-serif;color:#1a1916;background:#fff}\n" +
    "h1,h2,h3{line-height:1.25}a{color:#b23a08}img{max-width:100%}\npre{padding:14px 16px;overflow:auto;border-radius:8px;background:#f4f1ea}code{font:0.92em ui-monospace,SFMono-Regular,Menlo,Consolas,monospace}\n" +
    "p code,li code,td code{padding:1px 5px;border-radius:4px;background:#f4f1ea}blockquote{margin:0;padding:2px 18px;border-left:4px solid #ddd5c6;color:#5a554b}\n" +
    "table{border-collapse:collapse}th,td{padding:6px 12px;border:1px solid #ddd5c6}ul.tasks{list-style:none;padding-left:4px}hr{border:0;border-top:1px solid #ddd5c6}\n</style>\n</head>\n<body>\n" +
    bodyHtml +
    "</body>\n</html>\n"
  );
}

export function markdownTitle(src) {
  const m = String(src).match(/^ {0,3}#{1,6}[ \t]+(.+?)[ \t#]*$/m);
  return m ? plainText(renderInline(m[1])).trim() : "";
}
