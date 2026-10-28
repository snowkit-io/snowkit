const VOID = new Set(["area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "source", "track", "wbr"]);
const RAW = new Set(["script", "style", "textarea", "title"]);
const AUTO_CLOSE = { p: /^(p|div|ul|ol|table|h[1-6]|pre|blockquote|section|article|header|footer|hr|dl)$/, li: /^li$/, dt: /^(dt|dd)$/, dd: /^(dt|dd)$/, tr: /^tr$/, td: /^(td|th|tr)$/, th: /^(td|th|tr)$/, option: /^option$/ };
const ENT = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: "\u00a0", copy: "\u00a9", reg: "\u00ae", hellip: "\u2026", mdash: "\u2014", ndash: "\u2013", lsquo: "\u2018", rsquo: "\u2019", ldquo: "\u201c", rdquo: "\u201d", bull: "\u2022", middot: "\u00b7", trade: "\u2122", euro: "\u20ac", pound: "\u00a3" };

export function decode(s) {
  return s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e) => {
    if (e[0] === "#") {
      const code = e[1] === "x" || e[1] === "X" ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
      return Number.isFinite(code) && code > 0 && code < 0x110000 ? String.fromCodePoint(code) : m;
    }
    return ENT[e.toLowerCase()] ?? m;
  });
}

function el(name, attrs, parent) {
  return { nodeType: 1, tagName: name, attrs, childNodes: [], parentNode: parent };
}

export function parseHTML(src) {
  const root = el("#root", {}, null);
  let cur = root;
  const re = /<!--[\s\S]*?-->|<!doctype[^>]*>|<\/([a-zA-Z][\w:-]*)\s*>|<([a-zA-Z][\w:-]*)((?:\s+[^\s"'>/=]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s"'=<>`]+))?)*)\s*(\/?)>/gi;
  let at = 0;
  let m;
  const text = (s) => {
    if (s) cur.childNodes.push({ nodeType: 3, nodeValue: decode(s), parentNode: cur });
  };
  while ((m = re.exec(src))) {
    text(src.slice(at, m.index));
    at = re.lastIndex;
    if (m[0].startsWith("<!")) continue;
    if (m[1]) {
      const name = m[1].toLowerCase();
      let n = cur;
      while (n && n.tagName !== name) n = n.parentNode;
      if (n && n !== root) cur = n.parentNode;
      continue;
    }
    const name = m[2].toLowerCase();
    const attrs = {};
    for (const a of m[3].matchAll(/([^\s"'>/=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g)) attrs[a[1].toLowerCase()] = decode(a[2] ?? a[3] ?? a[4] ?? "");
    while (AUTO_CLOSE[cur.tagName] && AUTO_CLOSE[cur.tagName].test(name)) cur = cur.parentNode;
    const node = el(name, attrs, cur);
    cur.childNodes.push(node);
    if (VOID.has(name) || m[4]) continue;
    if (RAW.has(name)) {
      const end = src.toLowerCase().indexOf("</" + name, at);
      const stop = end < 0 ? src.length : end;
      node.childNodes.push({ nodeType: 3, nodeValue: name === "textarea" || name === "title" ? decode(src.slice(at, stop)) : src.slice(at, stop), parentNode: node });
      const close = src.indexOf(">", stop);
      at = re.lastIndex = close < 0 ? src.length : close + 1;
      continue;
    }
    cur = node;
  }
  text(src.slice(at));
  return root;
}
