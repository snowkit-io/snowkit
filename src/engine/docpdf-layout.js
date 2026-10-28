export const PAGE_SIZES = { a4: [595.28, 841.89], letter: [612, 792], legal: [612, 1008], a5: [419.53, 595.28] };

const INK = [0.11, 0.11, 0.11];
const LINK = [0.05, 0.33, 0.73];
const MUTED = [0.42, 0.42, 0.42];
const RULE = [0.8, 0.8, 0.8];
const CODE_BG = [0.955, 0.953, 0.948];
const HEAD_BG = [0.945, 0.945, 0.945];
const BAR = [0.83, 0.83, 0.83];
const LIST_INDENT = 20;
const QUOTE_INDENT = 16;
const CELL_PAD = 5;
const HEAD = { h1: [2.0, 1.2, 0.55], h2: [1.55, 1.15, 0.5], h3: [1.27, 1.0, 0.4], h4: [1.1, 0.9, 0.35], h5: [1.0, 0.8, 0.3], h6: [0.95, 0.8, 0.3] };

const SKIP = new Set(['head', 'script', 'style', 'title', 'meta', 'link', 'noscript', 'template', 'iframe', 'object', 'embed', 'svg', 'canvas', 'video', 'audio', 'map', 'select', 'button', 'textarea', 'datalist', 'option', 'base', 'param', 'source', 'track', 'dialog']);
const CONTAINER = new Set(['html', 'body', 'div', 'section', 'article', 'header', 'footer', 'main', 'nav', 'aside', 'address', 'form', 'figure', 'center', 'details', 'summary', 'fieldset', 'hgroup', 'legend', 'search', 'p', 'caption', 'figcaption', '#root']);
const BLOCK = new Set([...CONTAINER, 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'dl', 'dt', 'dd', 'blockquote', 'pre', 'table', 'hr', 'menu']);
const NAMED = {
  black: [0, 0, 0], white: [1, 1, 1], red: [0.8, 0, 0], green: [0, 0.5, 0], blue: [0, 0, 0.8], gray: [0.5, 0.5, 0.5], grey: [0.5, 0.5, 0.5],
  orange: [1, 0.65, 0], purple: [0.5, 0, 0.5], navy: [0, 0, 0.5], teal: [0, 0.5, 0.5], maroon: [0.5, 0, 0], olive: [0.5, 0.5, 0], silver: [0.75, 0.75, 0.75],
  yellow: [1, 1, 0], brown: [0.65, 0.16, 0.16], pink: [1, 0.75, 0.8], darkgray: [0.66, 0.66, 0.66], darkgrey: [0.66, 0.66, 0.66], lightgray: [0.83, 0.83, 0.83],
  lightgrey: [0.83, 0.83, 0.83], darkred: [0.55, 0, 0], darkgreen: [0, 0.39, 0], darkblue: [0, 0, 0.55], crimson: [0.86, 0.08, 0.24], gold: [1, 0.84, 0],
  indigo: [0.29, 0, 0.51], coral: [1, 0.5, 0.31], tomato: [1, 0.39, 0.28], steelblue: [0.27, 0.51, 0.71], slategray: [0.44, 0.5, 0.56], dimgray: [0.41, 0.41, 0.41],
};

const tagOf = (n) => (n && n.nodeType === 1 ? String(n.tagName || n.nodeName || '').toLowerCase() : '');
const kids = (n) => Array.from((n && n.childNodes) || []);

function attr(n, k) {
  if (!n || n.nodeType !== 1) return null;
  if (typeof n.getAttribute === 'function') return n.getAttribute(k);
  return n.attrs && Object.prototype.hasOwnProperty.call(n.attrs, k) ? n.attrs[k] : null;
}

export function parseColor(raw) {
  const s = String(raw || '').trim().toLowerCase();
  if (!s || s === 'transparent' || s === 'inherit' || s === 'currentcolor' || s === 'initial') return null;
  if (NAMED[s]) return NAMED[s].slice();
  let m = /^#([0-9a-f]{3,8})$/.exec(s);
  if (m) {
    let h = m[1];
    if (h.length === 3 || h.length === 4) h = h.slice(0, 3).split('').map((c) => c + c).join('');
    else if (h.length === 8) h = h.slice(0, 6);
    if (h.length !== 6) return null;
    return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
  }
  m = /^rgba?\(\s*([\d.]+%?)[\s,]+([\d.]+%?)[\s,]+([\d.]+%?)(?:[\s,/]+([\d.]+%?))?\s*\)$/.exec(s);
  if (m) {
    if (m[4] !== undefined && parseFloat(m[4]) === 0) return null;
    return [m[1], m[2], m[3]].map((v) => Math.max(0, Math.min(1, v.endsWith('%') ? parseFloat(v) / 100 : parseFloat(v) / 255)));
  }
  return null;
}

export function parseStyle(text) {
  const out = {};
  for (const part of String(text || '').split(';')) {
    const i = part.indexOf(':');
    if (i < 0) continue;
    const k = part.slice(0, i).trim().toLowerCase();
    const v = part.slice(i + 1).replace(/!important/i, '').trim();
    if (k) out[k] = v;
  }
  return out;
}

function sizeScale(v, base) {
  const s = String(v || '').trim().toLowerCase();
  const named = { 'xx-small': 0.6, 'x-small': 0.7, small: 0.85, medium: 1, large: 1.2, 'x-large': 1.5, 'xx-large': 2, smaller: 0.85, larger: 1.2 };
  if (named[s]) return named[s];
  const m = /^([\d.]+)(px|pt|em|rem|%)?$/.exec(s);
  if (!m) return null;
  const n = parseFloat(m[1]);
  if (!(n > 0)) return null;
  const unit = m[2] || 'px';
  const r = unit === 'px' ? (n * 0.75) / base : unit === 'pt' ? n / base : unit === '%' ? n / 100 : n;
  return Math.max(0.5, Math.min(3.5, r));
}

function hidden(n, css) {
  if (attr(n, 'hidden') !== null) return true;
  const d = (css.display || '').toLowerCase();
  return d === 'none' || (css.visibility || '').toLowerCase() === 'hidden';
}

function formatFrom(n, fmt, css, base) {
  const tag = tagOf(n);
  const f = { ...fmt };
  if (tag === 'b' || tag === 'strong') f.b = true;
  if (tag === 'i' || tag === 'em' || tag === 'cite' || tag === 'dfn' || tag === 'var' || tag === 'address') f.i = true;
  if (tag === 'u' || tag === 'ins') f.u = true;
  if (tag === 's' || tag === 'del' || tag === 'strike') f.s = true;
  if (tag === 'code' || tag === 'kbd' || tag === 'samp' || tag === 'tt') f.code = true;
  if (tag === 'mark') f.bg = [1, 0.92, 0.5];
  if (tag === 'sup') f.sup = true;
  if (tag === 'sub') f.sub = true;
  if (tag === 'small') f.scale = (f.scale || 1) * 0.85;
  if (tag === 'big') f.scale = (f.scale || 1) * 1.15;
  if (tag === 'font' && attr(n, 'color')) f.color = parseColor(attr(n, 'color')) || f.color;
  if (tag === 'a') {
    const href = attr(n, 'href') || '';
    if (/^(https?:|mailto:|tel:)/i.test(href.trim())) {
      f.link = href.trim();
      if (!css.color) f.color = LINK;
    }
  }
  const fw = (css['font-weight'] || '').toLowerCase();
  if (fw === 'bold' || fw === 'bolder' || +fw >= 600) f.b = true;
  else if (fw === 'normal' || fw === 'lighter' || (+fw > 0 && +fw < 600)) f.b = false;
  const fs = (css['font-style'] || '').toLowerCase();
  if (fs === 'italic' || fs === 'oblique') f.i = true;
  else if (fs === 'normal') f.i = false;
  const td = (css['text-decoration'] || css['text-decoration-line'] || '').toLowerCase();
  if (td.includes('underline')) f.u = true;
  if (td.includes('line-through')) f.s = true;
  if (td === 'none') f.u = f.s = false;
  if (css.color) f.color = parseColor(css.color) || f.color;
  const bg = css['background-color'] || (css.background && parseColor(css.background.split(/\s+/)[0]) ? css.background.split(/\s+/)[0] : '');
  if (bg && parseColor(bg)) {
    const c = parseColor(bg);
    if (!(c[0] > 0.97 && c[1] > 0.97 && c[2] > 0.97)) f.bg = c;
  }
  if (/mono|courier|consolas|menlo/i.test(css['font-family'] || '')) f.mono = true;
  const va = (css['vertical-align'] || '').toLowerCase();
  if (va === 'super') f.sup = true;
  if (va === 'sub') f.sub = true;
  if (css['font-size']) {
    const k = sizeScale(css['font-size'], base);
    if (k) f.scale = k;
  }
  const tt = (css['text-transform'] || '').toLowerCase();
  if (tt === 'uppercase' || tt === 'lowercase' || tt === 'capitalize') f.transform = tt;
  return f;
}

function cleanText(s) {
  return String(s).replace(/[\u0000-\u0008\u000b\u000e-\u001f\u007f\u00ad\u200b\u2060\ufeff]/g, '');
}

function transformText(t, mode) {
  if (mode === 'uppercase') return t.toUpperCase();
  if (mode === 'lowercase') return t.toLowerCase();
  if (mode === 'capitalize') return t.replace(/(^|\s)(\S)/g, (m, a, b) => a + b.toUpperCase());
  return t;
}

function textRun(raw, fmt) {
  const t = cleanText(raw).replace(/[ \t\n\r\f]+/g, ' ');
  if (!t) return [];
  return [{ ...fmt, text: transformText(t, fmt.transform) }];
}

function inlineRuns(node, fmt, base, out = []) {
  for (const n of kids(node)) {
    if (n.nodeType === 3) {
      out.push(...textRun(n.nodeValue || n.data || '', fmt));
      continue;
    }
    if (n.nodeType !== 1) continue;
    const tag = tagOf(n);
    if (SKIP.has(tag) || tag === 'input') continue;
    const css = parseStyle(attr(n, 'style'));
    if (hidden(n, css)) continue;
    if (tag === 'br') {
      out.push({ br: true });
      continue;
    }
    if (tag === 'wbr') continue;
    if (tag === 'img') {
      out.push({ img: attr(n, 'src') || '', alt: attr(n, 'alt') || '', width: px(attr(n, 'width') || css.width), height: px(attr(n, 'height') || css.height) });
      continue;
    }
    const f = formatFrom(n, fmt, css, base);
    if (tag === 'q') out.push(...textRun('\u201c', f));
    inlineRuns(n, f, base, out);
    if (tag === 'q') out.push(...textRun('\u201d', f));
  }
  return out;
}

function px(v) {
  const m = /^\s*([\d.]+)\s*(px)?\s*$/i.exec(String(v || ''));
  return m ? parseFloat(m[1]) : null;
}

function alignOf(n, css, fallback) {
  const a = (css['text-align'] || attr(n, 'align') || '').toLowerCase();
  if (a === 'center' || a === 'right' || a === 'justify' || a === 'left') return a;
  if (a === 'start') return 'left';
  if (a === 'end') return 'right';
  if (tagOf(n) === 'center') return 'center';
  return fallback;
}

function breakBefore(css) {
  return /always|page|left|right/.test(String(css['page-break-before'] || css['break-before'] || '').toLowerCase());
}

function breakAfter(css) {
  return /always|page|left|right/.test(String(css['page-break-after'] || css['break-after'] || '').toLowerCase());
}

function deco(ctx) {
  return { indent: ctx.indent, bars: ctx.bars, align: ctx.align };
}

function paras(runs, ctx, out) {
  let cur = [];
  const flush = (force) => {
    if (!cur.length && !force) return;
    while (cur.length && cur[cur.length - 1].br) cur.pop();
    while (cur.length && cur[0].text !== undefined && !cur[0].text.trim()) cur.shift();
    while (cur.length && cur[cur.length - 1].text !== undefined && !cur[cur.length - 1].text.trim()) cur.pop();
    if (cur.length && cur[0].text) cur[0] = { ...cur[0], text: cur[0].text.replace(/^ +/, '') };
    if (cur.length && cur[cur.length - 1].text) cur[cur.length - 1] = { ...cur[cur.length - 1], text: cur[cur.length - 1].text.replace(/ +$/, '') };
    const b = { type: 'para', runs: cur, style: ctx.style || 'p', ...deco(ctx) };
    if (ctx.mark && !ctx.mark.used) {
      b.mark = ctx.mark;
      ctx.mark.used = true;
    }
    if (b.runs.some((r) => r.text && r.text.trim()) || b.mark) out.push(b);
    cur = [];
  };
  for (const r of runs) {
    if (r.img !== undefined) {
      flush();
      if (ctx.mark && !ctx.mark.used) flush(true);
      out.push({ type: 'image', src: r.img, alt: r.alt, width: r.width, height: r.height, ...deco(ctx) });
    } else cur.push(r);
  }
  flush();
  return out;
}

function preText(node) {
  let s = '';
  for (const n of kids(node)) {
    if (n.nodeType === 3) s += n.nodeValue || n.data || '';
    else if (n.nodeType === 1) {
      const tag = tagOf(n);
      if (tag === 'br') s += '\n';
      else if (!SKIP.has(tag)) s += preText(n);
    }
  }
  return s;
}

function firstCheckbox(li) {
  for (const n of kids(li)) {
    if (n.nodeType === 3 && (n.nodeValue || '').trim()) return null;
    if (n.nodeType !== 1) continue;
    const tag = tagOf(n);
    if (tag === 'input' && String(attr(n, 'type') || '').toLowerCase() === 'checkbox') return attr(n, 'checked') !== null;
    if (tag === 'p' || tag === 'label' || tag === 'span') return firstCheckbox(n);
    return null;
  }
  return null;
}

function listBlocks(el, ctx, out) {
  const ordered = tagOf(el) === 'ol';
  let n = ordered ? parseInt(attr(el, 'start') || '1', 10) : 1;
  if (!Number.isFinite(n)) n = 1;
  const type = attr(el, 'type') || parseStyle(attr(el, 'style'))['list-style-type'] || '';
  const level = ctx.level || 0;
  for (const li of kids(el)) {
    if (li.nodeType !== 1) continue;
    const tag = tagOf(li);
    if (tag === 'ul' || tag === 'ol') {
      listBlocks(li, { ...ctx, level: level + 1, indent: ctx.indent + LIST_INDENT }, out);
      continue;
    }
    if (tag !== 'li') continue;
    const css = parseStyle(attr(li, 'style'));
    if (hidden(li, css)) continue;
    const v = parseInt(attr(li, 'value') || '', 10);
    if (Number.isFinite(v)) n = v;
    const mark = { ordered, n, level, task: firstCheckbox(li), kind: listKind(type, ordered), used: false };
    const inner = { ...ctx, indent: ctx.indent + LIST_INDENT, level: level + 1, mark, style: undefined, fmt: formatFrom(li, ctx.fmt, css, ctx.base) };
    const before = out.length;
    blocksOf(li, inner, out);
    if (!mark.used) out.splice(before, 0, { type: 'para', runs: [], style: 'p', mark, ...deco(inner) });
    mark.used = true;
    n++;
  }
}

function listKind(type, ordered) {
  const raw = String(type).trim();
  const t = raw.toLowerCase();
  if (!ordered) return t === 'none' ? 'none' : t === 'square' ? 'square' : t === 'circle' ? 'circle' : '';
  if (raw === 'A' || t === 'upper-alpha' || t === 'upper-latin') return 'A';
  if (raw === 'I' || t === 'upper-roman') return 'I';
  if (t === 'a' || t === 'lower-alpha' || t === 'lower-latin') return 'a';
  if (t === 'i' || t === 'lower-roman') return 'i';
  return t === 'none' ? 'none' : '1';
}

function roman(n) {
  const map = [[1000, 'm'], [900, 'cm'], [500, 'd'], [400, 'cd'], [100, 'c'], [90, 'xc'], [50, 'l'], [40, 'xl'], [10, 'x'], [9, 'ix'], [5, 'v'], [4, 'iv'], [1, 'i']];
  let s = '';
  let k = Math.max(1, Math.min(3999, n));
  for (const [v, r] of map) while (k >= v) {
    s += r;
    k -= v;
  }
  return s;
}

export function markerLabel(mark) {
  if (!mark.ordered) return '';
  const n = mark.n;
  if (mark.kind === 'a' || mark.kind === 'A') {
    let k = Math.max(1, n);
    let s = '';
    while (k > 0) {
      k--;
      s = String.fromCharCode(97 + (k % 26)) + s;
      k = Math.floor(k / 26);
    }
    return (mark.kind === 'A' ? s.toUpperCase() : s) + '.';
  }
  if (mark.kind === 'i') return roman(n) + '.';
  if (mark.kind === 'I') return roman(n).toUpperCase() + '.';
  if (mark.kind === 'none') return '';
  return n + '.';
}

function tableBlock(el, ctx) {
  const rows = [];
  const visit = (node, head) => {
    for (const n of kids(node)) {
      const tag = tagOf(n);
      if (tag === 'thead') visit(n, true);
      else if (tag === 'tbody' || tag === 'tfoot') visit(n, false);
      else if (tag === 'tr') {
        const cells = [];
        for (const c of kids(n)) {
          const ct = tagOf(c);
          if (ct !== 'td' && ct !== 'th') continue;
          const css = parseStyle(attr(c, 'style'));
          const th = ct === 'th';
          const fmt = formatFrom(c, { ...ctx.fmt, b: th || ctx.fmt.b }, css, ctx.base);
          const bg = css['background-color'] ? parseColor(css['background-color']) : css.background ? parseColor(css.background.split(/\s+/)[0]) : null;
          delete fmt.bg;
          const inner = { ...ctx, fmt, indent: 0, bars: [], align: alignOf(c, css, th && head ? 'left' : 'left'), mark: null, style: undefined, level: 0 };
          const blocks = [];
          blocksOf(c, inner, blocks);
          cells.push({ blocks: blocks.filter((b) => b.type !== 'break'), colspan: Math.max(1, Math.min(50, parseInt(attr(c, 'colspan') || '1', 10) || 1)), rowspan: Math.max(1, Math.min(500, parseInt(attr(c, 'rowspan') || '1', 10) || 1)), head: head || (th && !rows.length), bg });
        }
        if (cells.length) rows.push({ cells, head });
      } else if (tag === 'caption') continue;
      else if (tag && !SKIP.has(tag)) visit(n, head);
    }
  };
  visit(el, false);
  let caption = null;
  for (const n of kids(el)) if (tagOf(n) === 'caption') caption = n;
  return { rows, caption };
}

function blocksOf(node, ctx, out) {
  let loose = [];
  const flush = () => {
    if (loose.some((r) => r.img !== undefined || (r.text && r.text.trim()))) paras(loose, ctx, out);
    loose = [];
  };
  for (const n of kids(node)) {
    if (n.nodeType === 3) {
      loose.push(...textRun(n.nodeValue || n.data || '', ctx.fmt));
      continue;
    }
    if (n.nodeType !== 1) continue;
    const tag = tagOf(n);
    if (SKIP.has(tag)) continue;
    const css = parseStyle(attr(n, 'style'));
    if (hidden(n, css)) continue;
    const display = (css.display || '').toLowerCase();
    const isBlock = BLOCK.has(tag) || display === 'block' || display === 'flex' || display === 'grid' || display === 'list-item';
    if (!isBlock || display === 'inline' || display === 'inline-block') {
      if (tag === 'br') loose.push({ br: true });
      else if (tag === 'img') loose.push(...inlineRuns({ childNodes: [n] }, ctx.fmt, ctx.base));
      else if (tag !== 'input') {
        const f = formatFrom(n, ctx.fmt, css, ctx.base);
        if (tag === 'q') loose.push(...textRun('\u201c', f));
        inlineRuns(n, f, ctx.base, loose);
        if (tag === 'q') loose.push(...textRun('\u201d', f));
      }
      continue;
    }
    flush();
    if (breakBefore(css)) out.push({ type: 'break' });
    const fmt = formatFrom(n, ctx.fmt, css, ctx.base);
    const align = alignOf(n, css, ctx.align);
    if (/^h[1-6]$/.test(tag)) {
      paras(inlineRuns(n, fmt, ctx.base), { ...ctx, fmt, align, style: tag }, out);
    } else if (tag === 'ul' || tag === 'ol' || tag === 'menu') {
      listBlocks(n, { ...ctx, fmt, align }, out);
    } else if (tag === 'li') {
      listBlocks({ nodeType: 1, tagName: 'ul', childNodes: [n], attrs: {} }, { ...ctx, fmt, align }, out);
    } else if (tag === 'blockquote') {
      blocksOf(n, { ...ctx, fmt, align, bars: [...ctx.bars, ctx.indent + 2], indent: ctx.indent + QUOTE_INDENT }, out);
    } else if (tag === 'pre') {
      if (ctx.mark && !ctx.mark.used) paras([], ctx, out);
      const text = preText(n).replace(/\r\n?/g, '\n').replace(/^\n/, '').replace(/\n$/, '');
      out.push({ type: 'code', text: cleanText(text.replace(/\t/g, '    ')), ...deco(ctx) });
    } else if (tag === 'table') {
      if (ctx.mark && !ctx.mark.used) paras([], ctx, out);
      const t = tableBlock(n, { ...ctx, fmt });
      if (t.caption) paras(inlineRuns(t.caption, { ...fmt, i: true }, ctx.base), { ...ctx, fmt, align: 'center' }, out);
      if (t.rows.length) out.push({ type: 'table', rows: t.rows, ...deco(ctx) });
    } else if (tag === 'hr') {
      out.push({ type: 'rule', ...deco(ctx) });
    } else if (tag === 'dl') {
      for (const d of kids(n)) {
        const dt = tagOf(d);
        if (dt === 'dt') paras(inlineRuns(d, { ...fmt, b: true }, ctx.base), { ...ctx, fmt, align }, out);
        else if (dt === 'dd') blocksOf(d, { ...ctx, fmt, align, indent: ctx.indent + LIST_INDENT }, out);
        else if (dt === 'div') blocksOf({ nodeType: 1, tagName: 'dl', childNodes: [{ nodeType: 1, tagName: 'dl', childNodes: kids(d), attrs: {} }], attrs: {} }, ctx, out);
      }
    } else if (tag === 'figcaption' || tag === 'caption') {
      paras(inlineRuns(n, { ...fmt, i: true, color: fmt.color || MUTED, scale: (fmt.scale || 1) * 0.9 }, ctx.base), { ...ctx, fmt, align: css['text-align'] ? align : 'center' }, out);
    } else if (tag === 'dt') {
      paras(inlineRuns(n, { ...fmt, b: true }, ctx.base), { ...ctx, fmt, align }, out);
    } else if (tag === 'dd') {
      blocksOf(n, { ...ctx, fmt, align, indent: ctx.indent + LIST_INDENT }, out);
    } else {
      blocksOf(n, { ...ctx, fmt, align }, out);
    }
    if (breakAfter(css)) out.push({ type: 'break' });
  }
  flush();
  return out;
}

export function htmlBlocks(root, { base = 11 } = {}) {
  const body = findBody(root) || root;
  const out = [];
  blocksOf(body, { fmt: {}, align: 'left', indent: 0, bars: [], level: 0, mark: null, base }, out);
  while (out.length && out[out.length - 1].type === 'break') out.pop();
  while (out.length && out[0].type === 'break') out.shift();
  return out;
}

function findBody(n) {
  if (!n) return null;
  if (tagOf(n) === 'body') return n;
  for (const k of kids(n)) {
    if (k.nodeType !== 1) continue;
    const t = tagOf(k);
    if (t === 'body') return k;
    if (t === 'html') {
      const b = findBody(k);
      if (b) return b;
    }
  }
  return null;
}

function fontKey(r) {
  if (r.code || r.mono) return r.b ? 'monobold' : 'mono';
  return r.b && r.i ? 'bolditalic' : r.b ? 'bold' : r.i ? 'italic' : 'regular';
}

class Layout {
  constructor(opts) {
    const size = Array.isArray(opts.page) ? opts.page : PAGE_SIZES[opts.page] || PAGE_SIZES.a4;
    this.w = size[0];
    this.h = size[1];
    const m = typeof opts.margin === 'number' ? { top: opts.margin, right: opts.margin, bottom: opts.margin, left: opts.margin } : { top: 56, right: 56, bottom: 56, left: 56, ...(opts.margin || {}) };
    this.m = m;
    this.left = m.left;
    this.width = Math.max(72, this.w - m.left - m.right);
    this.top = this.h - m.top;
    this.bottom = Math.min(this.top - 72, m.bottom);
    this.base = opts.base || 11;
    this.lead = opts.lineHeight || 1.45;
    this.measureFn = opts.measure || ((t, f, s) => t.length * s * (f.startsWith('mono') ? 0.6 : 0.5));
    this.canEncode = opts.canEncode || (() => true);
    this.imageFn = opts.image || (() => null);
    this.pages = [];
    this.skipped = 0;
    this.links = 0;
    this.newPage();
  }

  newPage() {
    this.ops = [];
    this.pages.push({ ops: this.ops });
    this.y = this.top;
  }

  get atTop() {
    return this.y >= this.top - 0.01;
  }

  measure(text, font, size) {
    try {
      const w = this.measureFn(text, font, size);
      return Number.isFinite(w) ? w : text.length * size * 0.5;
    } catch (e) {
      return text.length * size * 0.55;
    }
  }

  pick(r, text) {
    let f = fontKey(r);
    if ((f === 'mono' || f === 'monobold') && !this.canEncode(f, text)) f = r.b ? 'bold' : 'regular';
    if (!this.canEncode(f, text)) f = r.b ? 'bold' : 'regular';
    return f;
  }

  lines(runs, width, size) {
    const words = [];
    let word = null;
    for (const r of runs) {
      if (r.br) {
        words.push({ br: true });
        word = null;
        continue;
      }
      if (!r.text) continue;
      const s = size * (r.scale || 1) * (r.sup || r.sub ? 0.7 : 1) * (r.code ? 0.9 : 1);
      for (const piece of r.text.split(/( +)/)) {
        if (!piece) continue;
        const font = this.pick(r, piece);
        const part = { text: piece, font, size: s, r, w: this.measure(piece, font, s) };
        if (/^ +$/.test(piece)) {
          const sp = { ...part, text: ' ', w: this.measure(' ', font, s) };
          if (word) word.space = sp;
          else if (words.length && !words[words.length - 1].br) words[words.length - 1].space = sp;
          word = null;
        } else {
          if (!word) {
            word = { parts: [], w: 0, space: null };
            words.push(word);
          }
          word.parts.push(part);
          word.w += part.w;
        }
      }
    }
    const lines = [];
    let line = { parts: [], w: 0, spaces: 0 };
    let pending = null;
    const end = (hard) => {
      line.hard = hard;
      lines.push(line);
      line = { parts: [], w: 0, spaces: 0 };
      pending = null;
    };
    for (const wd of words) {
      if (wd.br) {
        end(true);
        continue;
      }
      const gap = line.parts.length && pending ? pending.w : 0;
      if (line.parts.length && line.w + gap + wd.w > width + 0.01) end(false);
      if (!line.parts.length && wd.w > width) {
        for (const p of wd.parts) {
          let chunk = '';
          for (const ch of p.text) {
            const test = chunk + ch;
            if (line.w + this.measure(test, p.font, p.size) > width && (chunk || line.parts.length)) {
              if (chunk) {
                const w = this.measure(chunk, p.font, p.size);
                line.parts.push({ ...p, text: chunk, w });
                line.w += w;
              }
              end(false);
              chunk = ch;
            } else chunk = test;
          }
          if (chunk) {
            const w = this.measure(chunk, p.font, p.size);
            line.parts.push({ ...p, text: chunk, w });
            line.w += w;
          }
        }
      } else {
        if (line.parts.length && pending) {
          line.parts.push({ ...pending, space: true });
          line.w += pending.w;
          line.spaces++;
        }
        for (const p of wd.parts) line.parts.push(p);
        line.w += wd.w;
      }
      pending = wd.space;
    }
    if (line.parts.length || !lines.length) end(true);
    return lines.map((l) => {
      const max = l.parts.reduce((m, p) => Math.max(m, p.r.sup || p.r.sub ? p.size / 0.7 : p.r.code ? p.size / 0.9 : p.size), 0) || size;
      return { ...l, h: max * this.lead, base: max * 1.08, size: max };
    });
  }

  drawLine(ops, line, x, yTop, width, align, last) {
    const base = yTop - line.base;
    let extra = 0;
    let cx = x;
    if (align === 'center') cx = x + Math.max(0, (width - line.w) / 2);
    else if (align === 'right') cx = x + Math.max(0, width - line.w);
    else if (align === 'justify' && !last && !line.hard && line.spaces) extra = Math.max(0, (width - line.w) / line.spaces);
    const same = (a, b) => a.font === b.font && a.size === b.size && a.r.link === b.r.link && !!a.r.u === !!b.r.u && !!a.r.s === !!b.r.s && !!a.r.sup === !!b.r.sup && !!a.r.sub === !!b.r.sub && !!a.r.code === !!b.r.code && String(a.r.color) === String(b.r.color) && String(a.r.bg) === String(b.r.bg);
    const groups = [];
    for (const p of line.parts) {
      const g = groups[groups.length - 1];
      if (g && !extra && same(g, p)) {
        g.text += p.text;
        g.w += p.w;
      } else groups.push({ ...p });
    }
    for (const p of groups) {
      if (p.space && extra) {
        cx += p.w + extra;
        continue;
      }
      const y = base + (p.r.sup ? line.size * 0.35 : p.r.sub ? -line.size * 0.12 : 0);
      const col = p.r.color || INK;
      const bg = p.r.code ? p.r.bg || CODE_BG : p.r.bg;
      if (bg && p.text.trim()) ops.push({ op: 'rect', x: cx - (p.r.code ? 1.5 : 0.5), y: y - p.size * 0.28, w: p.w + (p.r.code ? 3 : 1), h: p.size * 1.18, fill: bg });
      if (p.text.trim()) ops.push({ op: 'text', x: cx, y, text: p.text, font: p.font, size: p.size, color: col });
      const t = Math.max(0.5, p.size * 0.055);
      if (p.r.u || p.r.link) ops.push({ op: 'line', x1: cx, y1: y - p.size * 0.12, x2: cx + p.w, y2: y - p.size * 0.12, w: t, color: col });
      if (p.r.s) ops.push({ op: 'line', x1: cx, y1: y + p.size * 0.3, x2: cx + p.w, y2: y + p.size * 0.3, w: t, color: col });
      if (p.r.link && p.text.trim()) {
        ops.push({ op: 'link', x: cx, y: y - p.size * 0.25, w: p.w, h: p.size * 1.15, url: p.r.link });
        this.links++;
      }
      cx += p.w;
    }
  }

  marker(ops, mark, line, x, yTop, size) {
    const base = yTop - line.base;
    if (mark.task !== null && mark.task !== undefined) {
      const s = size * 0.78;
      const bx = x - s - 6;
      const by = base - size * 0.08;
      ops.push({ op: 'rect', x: bx, y: by, w: s, h: s, stroke: INK, sw: 0.8 });
      if (mark.task) ops.push({ op: 'path', points: [[bx + s * 0.2, by + s * 0.5], [bx + s * 0.42, by + s * 0.25], [bx + s * 0.82, by + s * 0.8]], w: 1.2, color: INK });
      return;
    }
    if (mark.ordered) {
      const label = markerLabel(mark);
      if (!label) return;
      const w = this.measure(label, 'regular', size);
      ops.push({ op: 'text', x: x - w - 5, y: base, text: label, font: 'regular', size, color: INK });
      return;
    }
    if (mark.kind === 'none') return;
    const cx = x - 10;
    const cy = base + size * 0.32;
    const r = size * 0.17;
    const kind = mark.kind || ['disc', 'circle', 'square'][mark.level % 3];
    if (kind === 'circle') ops.push({ op: 'circle', x: cx, y: cy, r, stroke: INK, sw: size * 0.07 });
    else if (kind === 'square') ops.push({ op: 'rect', x: cx - r, y: cy - r, w: r * 2, h: r * 2, fill: INK });
    else ops.push({ op: 'circle', x: cx, y: cy, r, fill: INK });
  }

  imageSize(b, width) {
    const nat = this.imageFn(b.src);
    if (!nat || !(nat.w > 0) || !(nat.h > 0)) return null;
    let w = b.width ? b.width * 0.75 : nat.w * 0.75;
    let h = b.height ? b.height * 0.75 : b.width ? (w * nat.h) / nat.w : nat.h * 0.75;
    if (b.height && !b.width) w = (h * nat.w) / nat.h;
    const maxH = (this.top - this.bottom) * 0.92;
    const k = Math.min(1, width / w, maxH / h);
    return { w: w * k, h: h * k };
  }

  items(blocks, width, compact) {
    const out = [];
    const size0 = compact ? this.base * 0.92 : this.base;
    for (let i = 0; i < blocks.length; i++) {
      const b = blocks[i];
      const bars = b.bars || [];
      const indent = b.indent || 0;
      const w = Math.max(24, width - indent);
      const prev = out.length ? out[out.length - 1] : null;
      if (b.type === 'break') {
        out.push({ pagebreak: true });
        continue;
      }
      if (b.type === 'rule') {
        out.push({ space: size0 * 0.5, bars });
        out.push({ h: 2, bars, draw: (ops, x, yTop) => ops.push({ op: 'line', x1: x + indent, y1: yTop - 1, x2: x + indent + w, y2: yTop - 1, w: 0.8, color: RULE }) });
        out.push({ space: size0 * 0.9, bars });
        continue;
      }
      if (b.type === 'image') {
        const sz = this.imageSize(b, w);
        if (!sz) {
          this.skipped++;
          if (b.alt) {
            const lines = this.lines([{ text: b.alt, i: true, color: MUTED }], w, size0);
            for (const line of lines) out.push({ h: line.h, bars, draw: (ops, x, yTop) => this.drawLine(ops, line, x + indent, yTop, w, b.align, true) });
            out.push({ space: size0 * 0.6, bars });
          }
          continue;
        }
        const off = b.align === 'center' ? (w - sz.w) / 2 : b.align === 'right' ? w - sz.w : 0;
        out.push({ h: sz.h, bars, draw: (ops, x, yTop) => ops.push({ op: 'image', src: b.src, x: x + indent + off, y: yTop - sz.h, w: sz.w, h: sz.h }) });
        out.push({ space: compact ? 4 : size0 * 0.75, bars });
        continue;
      }
      if (b.type === 'code') {
        const size = size0 * 0.86;
        const pad = compact ? 4 : 8;
        const lh = size * 1.38;
        const raw = b.text.split('\n');
        const avail = w - pad * 2;
        const rows = [];
        for (const ln of raw) {
          if (!ln) {
            rows.push('');
            continue;
          }
          let rest = ln;
          while (rest.length) {
            let cut = rest.length;
            const font = this.canEncode('mono', rest) ? 'mono' : 'regular';
            if (this.measure(rest, font, size) > avail) {
              let lo = 1;
              let hi = rest.length;
              while (lo < hi) {
                const mid = Math.ceil((lo + hi) / 2);
                if (this.measure(rest.slice(0, mid), font, size) <= avail) lo = mid;
                else hi = mid - 1;
              }
              cut = Math.max(1, lo);
            }
            rows.push(rest.slice(0, cut));
            rest = rest.slice(cut);
          }
        }
        if (!compact && prev && !prev.space) out.push({ space: size0 * 0.2, bars });
        const bg = (ops, x, yTop, h) => ops.push({ op: 'rect', x: x + indent, y: yTop - h, w, h: h + 0.2, fill: CODE_BG });
        out.push({ h: pad, bars, draw: (ops, x, yTop) => bg(ops, x, yTop, pad) });
        for (const row of rows) {
          out.push({
            h: lh,
            bars,
            draw: (ops, x, yTop) => {
              bg(ops, x, yTop, lh);
              if (row.trim()) {
                const font = this.canEncode('mono', row) ? 'mono' : 'regular';
                ops.push({ op: 'text', x: x + indent + pad, y: yTop - size * 1.05, text: row, font, size, color: INK });
              }
            },
          });
        }
        out.push({ h: pad, bars, draw: (ops, x, yTop) => bg(ops, x, yTop, pad) });
        out.push({ space: compact ? 4 : size0 * 0.85, bars });
        continue;
      }
      if (b.type === 'table') {
        if (prev && !prev.space && !compact) out.push({ space: size0 * 0.3, bars });
        out.push({ table: b, indent, width: w, bars });
        out.push({ space: size0 * 0.9, bars });
        continue;
      }
      const head = HEAD[b.style];
      const size = head ? size0 * head[0] : size0;
      const runs = head ? b.runs.map((r) => ({ ...r, b: true, i: r.i || b.style === 'h6' })) : b.runs;
      if (head && !compact && out.length) {
        while (out.length && out[out.length - 1].space) out.pop();
        if (out.length) out.push({ space: size0 * head[1], bars });
      }
      const lines = this.lines(runs, w, size);
      const after = head ? size0 * head[2] + (b.style === 'h1' || b.style === 'h2' ? 6 : 0) : b.mark ? size0 * 0.22 : compact ? 3 : size0 * 0.7;
      lines.forEach((line, n) => {
        const last = n === lines.length - 1;
        const item = { h: line.h, bars, draw: (ops, x, yTop) => this.drawLine(ops, line, x + indent, yTop, w, b.align, last) };
        if (n === 0 && b.mark) {
          const inner = item.draw;
          const mk = b.mark;
          item.draw = (ops, x, yTop) => {
            inner(ops, x, yTop);
            this.marker(ops, mk, line, x + indent, yTop, size);
          };
        }
        if (head) item.keep = true;
        out.push(item);
      });
      if (head && (b.style === 'h1' || b.style === 'h2') && !compact) {
        out.push({ h: 4, keep: true, bars, draw: (ops, x, yTop) => ops.push({ op: 'line', x1: x + indent, y1: yTop - 2, x2: x + indent + w, y2: yTop - 2, w: 0.6, color: RULE }) });
      }
      const next = blocks[i + 1];
      const tightList = b.mark && next && next.mark && next.type === 'para';
      out.push({ space: tightList ? size0 * 0.22 : after, bars });
    }
    while (out.length && out[out.length - 1].space) out.pop();
    for (let i = 0; i < out.length; i++) {
      if (!out[i].space) continue;
      let a = i - 1;
      while (a >= 0 && out[a].space) a--;
      let z = i + 1;
      while (z < out.length && out[z].space) z++;
      const pa = a >= 0 ? out[a].bars || [] : [];
      const pz = z < out.length ? out[z].bars || [] : [];
      const common = [];
      for (let k = 0; k < Math.min(pa.length, pz.length) && pa[k] === pz[k]; k++) common.push(pa[k]);
      out[i].bars = common;
    }
    return out;
  }

  bars(item, yTop, h) {
    for (const bx of item.bars || []) this.ops.push({ op: 'rect', x: this.left + bx, y: yTop - h, w: 2.5, h, fill: BAR });
  }

  flow(blocks) {
    const items = this.items(blocks, this.width, false);
    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      if (it.pagebreak) {
        if (!this.atTop) this.newPage();
        continue;
      }
      if (it.space) {
        if (!this.atTop) {
          const h = Math.min(it.space, this.y - this.bottom);
          this.bars(it, this.y, h);
          this.y -= it.space;
        }
        if (this.y < this.bottom) this.newPage();
        continue;
      }
      if (it.table) {
        this.table(it);
        continue;
      }
      let need = it.h;
      if (it.keep) {
        let j = i + 1;
        let body = 0;
        while (j < items.length && body < 2 && !items[j].pagebreak && !items[j].table) {
          const nx = items[j];
          if (nx.space) need += nx.space;
          else {
            need += nx.h;
            if (!nx.keep) body++;
          }
          j++;
        }
        if (j < items.length && items[j].table && body === 0) need += 60;
      }
      if (this.y - (need > this.top - this.bottom ? it.h : need) < this.bottom - 0.01 && !this.atTop) this.newPage();
      this.bars(it, this.y, it.h);
      it.draw(this.ops, this.left, this.y);
      this.y -= it.h;
    }
  }

  natural(blocks) {
    let min = 0;
    let max = 0;
    for (const b of blocks) {
      if (b.type === 'image') {
        const sz = this.imageSize(b, 10000);
        min = Math.max(min, sz ? Math.min(sz.w, 60) : 0);
        max = Math.max(max, sz ? sz.w : 0);
        continue;
      }
      if (b.type === 'code') {
        for (const ln of b.text.split('\n')) max = Math.max(max, this.measure(ln, 'mono', this.base * 0.8) + 8);
        min = Math.max(min, 60);
        continue;
      }
      if (b.type === 'table') {
        min = Math.max(min, 80);
        max = Math.max(max, 240);
        continue;
      }
      if (!b.runs) continue;
      const size = HEAD[b.style] ? this.base * 0.92 * HEAD[b.style][0] : this.base * 0.92;
      let line = 0;
      let word = 0;
      for (const r of b.runs) {
        if (r.br) {
          max = Math.max(max, line + (b.indent || 0));
          line = 0;
          continue;
        }
        if (!r.text) continue;
        const f = this.pick(r, r.text);
        const s = size * (r.scale || 1);
        line += this.measure(r.text, f, s);
        for (const wd of r.text.split(/ +/)) if (wd) word = Math.max(word, this.measure(wd, f, s));
      }
      max = Math.max(max, line + (b.indent || 0));
      min = Math.max(min, Math.min(word, 150) + (b.indent || 0));
    }
    return { min: min + 2 * CELL_PAD, max: max + 2 * CELL_PAD + 1 };
  }

  columns(rows, W) {
    const grid = [];
    const placed = rows.map((row, ri) => {
      grid[ri] = grid[ri] || [];
      let col = 0;
      return row.cells.map((c) => {
        while (grid[ri][col]) col++;
        for (let dr = 0; dr < c.rowspan; dr++) {
          grid[ri + dr] = grid[ri + dr] || [];
          for (let dc = 0; dc < c.colspan; dc++) grid[ri + dr][col + dc] = dr ? 'span' : 'cell';
        }
        const p = { ...c, col, row: ri };
        col += c.colspan;
        return p;
      });
    });
    const count = Math.max(1, ...grid.slice(0, rows.length).map((r) => (r ? r.length : 0)));
    const min = new Array(count).fill(2 * CELL_PAD + 12);
    const max = new Array(count).fill(2 * CELL_PAD + 12);
    for (const cells of placed)
      for (const c of cells) {
        if (c.colspan !== 1) continue;
        const n = this.natural(c.blocks);
        min[c.col] = Math.max(min[c.col], n.min);
        max[c.col] = Math.max(max[c.col], n.max);
      }
    const sMin = min.reduce((a, b) => a + b, 0);
    const sMax = max.reduce((a, b) => a + b, 0);
    let widths;
    if (sMax <= W) widths = max.map((m) => m + ((W - sMax) * m) / sMax);
    else if (sMin <= W) {
      const extra = sMax - sMin;
      widths = min.map((m, i) => m + (extra ? ((W - sMin) * (max[i] - min[i])) / extra : (W - sMin) / count));
    } else widths = min.map((m) => (W * m) / sMin);
    return { placed, grid, widths };
  }

  table(it) {
    const t = it.table;
    if (!t.rows.length) return;
    const W = it.width;
    const { placed, grid, widths } = this.columns(t.rows, W);
    const x0 = this.left + it.indent;
    const xs = [x0];
    for (const w of widths) xs.push(xs[xs.length - 1] + w);
    const prepared = placed.map((cells, ri) =>
      cells.map((c) => {
        const w = xs[c.col + c.colspan] - xs[c.col];
        const items = this.items(c.blocks, w - 2 * CELL_PAD, true).filter((x) => !x.table && !x.pagebreak);
        return { x: xs[c.col], w, items, head: c.head, bg: c.bg, rowspan: ri + c.rowspan > placed.length ? 1 : c.rowspan };
      })
    );
    const headRows = [];
    for (let ri = 0; ri < t.rows.length && t.rows[ri].head; ri++) headRows.push(ri);
    let started = false;
    for (let ri = 0; ri < placed.length; ri++) {
      const spans = (grid[ri] || []).map((g, col) => (g === 'span' ? { col, last: !(grid[ri + 1] && grid[ri + 1][col] === 'span') || ri + 1 >= placed.length } : null)).filter(Boolean);
      const isHead = headRows.includes(ri);
      const repeat = started && !isHead && headRows.length ? headRows : [];
      this.row(prepared[ri], spans, xs, it, repeat.map((h) => prepared[h]));
      started = true;
    }
  }

  rowHeight(cells) {
    const height = (items) => items.reduce((s, x) => s + (x.space || x.h || 0), 0);
    return Math.max(...cells.map((c) => height(c.items))) + 2 * CELL_PAD;
  }

  row(cells, spans, xs, it, heads) {
    const height = (items) => items.reduce((s, x) => s + (x.space || x.h || 0), 0);
    let pending = cells.map((c) => c.items.slice());
    let first = true;
    let guard = 0;
    for (;;) {
      if (++guard > 500) break;
      const need = Math.max(...pending.map((its) => height(its))) + 2 * CELL_PAD;
      const avail = this.y - this.bottom;
      const full = this.top - this.bottom;
      if (need > avail && !this.atTop && (need <= full || avail < full * 0.25)) {
        this.newPage();
        for (const h of heads) this.simpleRow(h, xs);
        continue;
      }
      const chunk = Math.min(need, avail);
      const top = this.y;
      const rest = [];
      const fills = [];
      const texts = [];
      cells.forEach((c, i) => {
        if (c.head || c.bg) fills.push({ op: 'rect', x: c.x, y: top - chunk, w: c.w, h: chunk, fill: c.bg || HEAD_BG });
        let y = top - CELL_PAD;
        const its = pending[i];
        let k = 0;
        while (k < its.length) {
          const x = its[k];
          const h = x.space || x.h || 0;
          if (y - h < top - chunk + CELL_PAD - 0.01 && k > 0) break;
          if (x.draw) x.draw(texts, c.x + CELL_PAD, y);
          y -= h;
          k++;
        }
        rest.push(its.slice(k));
      });
      this.ops.push(...fills, ...texts);
      const bottomY = top - chunk;
      const done = rest.every((p) => !p.some((x) => x.draw));
      const line = (x1, y1, x2, y2) => this.ops.push({ op: 'line', x1, y1, x2, y2, w: 0.6, color: RULE });
      for (const c of cells) {
        if (first || c.rowspan === 1) line(c.x, top, c.x + c.w, top);
        if (c.rowspan === 1 || !done) line(c.x, bottomY, c.x + c.w, bottomY);
        line(c.x, top, c.x, bottomY);
        line(c.x + c.w, top, c.x + c.w, bottomY);
      }
      for (const s of spans) {
        line(xs[s.col], top, xs[s.col], bottomY);
        line(xs[s.col + 1], top, xs[s.col + 1], bottomY);
        if (s.last || !done) line(xs[s.col], bottomY, xs[s.col + 1], bottomY);
      }
      this.bars(it, top, chunk);
      this.y = bottomY;
      pending = rest;
      first = false;
      if (done) break;
      this.newPage();
      for (const h of heads) this.simpleRow(h, xs);
      first = true;
    }
  }

  simpleRow(cells, xs) {
    const h = this.rowHeight(cells);
    const top = this.y;
    for (const c of cells) {
      this.ops.push({ op: 'rect', x: c.x, y: top - h, w: c.w, h, fill: c.bg || HEAD_BG });
      let y = top - CELL_PAD;
      for (const x of c.items) {
        if (x.draw) x.draw(this.ops, c.x + CELL_PAD, y);
        y -= x.space || x.h || 0;
      }
      const line = (x1, y1, x2, y2) => this.ops.push({ op: 'line', x1, y1, x2, y2, w: 0.6, color: RULE });
      line(c.x, top, c.x + c.w, top);
      line(c.x, top - h, c.x + c.w, top - h);
      line(c.x, top, c.x, top - h);
      line(c.x + c.w, top, c.x + c.w, top - h);
    }
    this.y = top - h;
  }

  numbers() {
    const n = this.pages.length;
    this.pages.forEach((p, i) => {
      const label = i + 1 + ' / ' + n;
      const size = 8.5;
      const w = this.measure(label, 'regular', size);
      p.ops.push({ op: 'text', x: (this.w - w) / 2, y: Math.max(14, this.m.bottom / 2 - size / 2), text: label, font: 'regular', size, color: MUTED });
    });
  }
}

export function layoutDocument(blocks, opts = {}) {
  const L = new Layout(opts);
  L.flow(blocks);
  while (L.pages.length > 1 && !L.pages[L.pages.length - 1].ops.length) L.pages.pop();
  if (opts.numbers) L.numbers();
  const fonts = new Set();
  for (const p of L.pages) for (const o of p.ops) if (o.op === 'text') fonts.add(o.font);
  return { width: L.w, height: L.h, pages: L.pages, skipped: L.skipped, links: L.links, fonts: [...fonts] };
}

export function cssRules(text) {
  const src = String(text || '').replace(/\/\*[\s\S]*?\*\//g, '');
  const out = [];
  let i = 0;
  const block = (from) => {
    let depth = 0;
    for (let k = from; k < src.length; k++) {
      if (src[k] === '{') depth++;
      else if (src[k] === '}' && !--depth) return k;
    }
    return src.length;
  };
  while (i < src.length) {
    const open = src.indexOf('{', i);
    if (open < 0) break;
    const head = src.slice(i, open).trim();
    const close = block(open);
    const body = src.slice(open + 1, close);
    if (head.startsWith('@')) {
      if (/^@media\b/i.test(head) && /\b(print|all)\b/i.test(head) && !/\bnot\b/i.test(head)) out.push(...cssRules(body));
    } else if (head) {
      const decls = parseStyle(body);
      for (const sel of head.split(',')) {
        const s = sel.trim();
        if (s) out.push({ selector: s, decls });
      }
    }
    i = close + 1;
  }
  return out;
}

export function specificity(sel) {
  const s = sel.replace(/::?[a-z-]+(\([^)]*\))?/gi, (m) => (m.startsWith('::') ? ' ' : '.p'));
  const ids = (s.match(/#[\w-]+/g) || []).length;
  const cls = (s.match(/\.[\w-]+|\[[^\]]*\]/g) || []).length;
  const tags = (s.replace(/#[\w-]+|\.[\w-]+|\[[^\]]*\]/g, ' ').match(/(^|[\s>+~])[a-z][\w-]*/gi) || []).length;
  return ids * 10000 + cls * 100 + tags;
}

function compoundMatch(n, c) {
  if (!n || n.nodeType !== 1) return false;
  const m = /^([a-z][\w-]*|\*)?((?:[.#][\w-]+)*)$/i.exec(c);
  if (!m) return null;
  if (m[1] && m[1] !== '*' && tagOf(n) !== m[1].toLowerCase()) return false;
  const classes = String(attr(n, 'class') || '').split(/\s+/);
  for (const part of m[2].match(/[.#][\w-]+/g) || []) {
    if (part[0] === '#' && attr(n, 'id') !== part.slice(1)) return false;
    if (part[0] === '.' && !classes.includes(part.slice(1))) return false;
  }
  return true;
}

export function simpleSelect(root, selector) {
  const parts = selector.replace(/\s*>\s*/g, ' ').trim().split(/\s+/);
  if (parts.some((p) => compoundMatch({ nodeType: 1, tagName: 'x', attrs: {} }, p) === null)) return [];
  const found = [];
  const walk = (n) => {
    for (const k of kids(n)) {
      if (k.nodeType !== 1) continue;
      if (compoundMatch(k, parts[parts.length - 1])) {
        let ok = true;
        let up = k.parentNode;
        for (let i = parts.length - 2; i >= 0 && ok; i--) {
          while (up && !compoundMatch(up, parts[i])) up = up.parentNode;
          if (!up) ok = false;
          else up = up.parentNode;
        }
        if (ok) found.push(k);
      }
      walk(k);
    }
  };
  walk(root);
  return found;
}

export function applyStyleSheets(root, select = simpleSelect) {
  let css = '';
  const collect = (n) => {
    for (const k of kids(n)) {
      if (k.nodeType !== 1) continue;
      if (tagOf(k) === 'style') css += kids(k).map((t) => t.nodeValue || t.data || '').join('') + '\n';
      else collect(k);
    }
  };
  collect(root);
  if (!css.trim()) return 0;
  const hits = [];
  cssRules(css).forEach((r, order) => {
    let nodes = [];
    try {
      nodes = Array.from(select(root, r.selector) || []);
    } catch (e) {
      nodes = [];
    }
    const spec = specificity(r.selector);
    for (const n of nodes) hits.push({ n, spec, order, decls: r.decls });
  });
  hits.sort((a, b) => a.spec - b.spec || a.order - b.order);
  const acc = new Map();
  for (const h of hits) acc.set(h.n, { ...(acc.get(h.n) || {}), ...h.decls });
  for (const [n, decls] of acc) {
    const merged = { ...decls, ...parseStyle(attr(n, 'style')) };
    const text = Object.entries(merged).map(([k, v]) => k + ':' + v).join(';');
    if (typeof n.setAttribute === 'function') n.setAttribute('style', text);
    else n.attrs = { ...(n.attrs || {}), style: text };
  }
  return acc.size;
}

export function blocksText(blocks) {
  const out = [];
  for (const b of blocks) {
    if (b.runs) out.push(b.runs.map((r) => (r.br ? '\n' : r.text || '')).join(''));
    else if (b.type === 'code') out.push(b.text);
    else if (b.type === 'table') for (const r of b.rows) for (const c of r.cells) out.push(blocksText(c.blocks));
  }
  return out.join('\n');
}
