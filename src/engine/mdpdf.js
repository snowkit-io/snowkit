import { renderMarkdown } from './md-render.js';
import { parseHTML } from './html.js';
import { htmlBlocks } from './docpdf-layout.js';
import { buildDocPdf } from './docpdf-render.js';

export const PDF_LIB = '/pdf-tools/pdf-lib.min.js';
export const FONTKIT = '/word-to-pdf/vendor/fontkit-1.1.1/fontkit.umd.min.js';
export const FONT_BASE = '/word-to-pdf/vendor/open-sans/';
export const FACES = { regular: 'OpenSans_400Regular', bold: 'OpenSans_700Bold', italic: 'OpenSans_400Regular_Italic', bolditalic: 'OpenSans_700Bold_Italic' };
export const BREAK_MARK = '@@page-break@@';
export const PAGE_BREAK = '\n\n' + BREAK_MARK + '\n\n';

export function markdownHtml(md) {
  return renderMarkdown(String(md || '')).split('<p>' + BREAK_MARK + '</p>').join('<div style="break-before: page"></div>');
}

export function previewHtml(md) {
  return renderMarkdown(String(md || ''), { headingIds: false })
    .split('<p>' + BREAK_MARK + '</p>')
    .join('<hr class="page-break">')
    .replace(/\sstyle="[^"]*"/g, '');
}

export function markdownBlocks(md, { base = 11 } = {}) {
  return htmlBlocks(parseHTML(markdownHtml(md)), { base });
}

export function joinPages(pages) {
  return pages.map((p) => String(p || '').trim()).filter(Boolean).join(PAGE_BREAK);
}

export function mdEscape(text) {
  return String(text == null ? '' : text)
    .replace(/\r\n?/g, '\n')
    .replace(/([\\`*_[\]<>#|])/g, '\\$1')
    .replace(/^(\s*)(\d+)([.)])(\s)/gm, '$1$2\\$3$4')
    .replace(/^(\s*)([-+])(\s)/gm, '$1\\$2$3');
}

export const PREFS_KEY = 'snowkit:prefs';

export function preferredPaper(storage) {
  try {
    const s = storage === undefined ? globalThis.localStorage : storage;
    const p = s ? JSON.parse(s.getItem(PREFS_KEY) || '{}') : {};
    return p && (p.paper === 'a4' || p.paper === 'letter') ? p.paper : '';
  } catch {
    return '';
  }
}

export function pageSizeFor(locale, storage) {
  return preferredPaper(storage) || (/^(en-us|en-ca|es-mx|es-us|fr-ca|en-ph)$/i.test(String(locale || '')) ? 'letter' : 'a4');
}

export function safeFileName(text, fallback = 'document') {
  const s = String(text || '').replace(/[\\/:*?"<>|\u0000-\u001f]+/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 80);
  return s || fallback;
}

let cached = null;

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = src;
    s.onload = resolve;
    s.onerror = () => reject(new Error('The PDF maker could not be loaded. Reload the page and try again.'));
    document.head.append(s);
  });
}

export async function pdfLibs() {
  if (cached) return cached;
  await Promise.all([window.PDFLib ? null : loadScript(PDF_LIB), window.fontkit ? null : loadScript(FONTKIT).catch(() => null)]);
  let fontBytes = null;
  if (window.fontkit) {
    try {
      const entries = await Promise.all(
        Object.entries(FACES).map(async ([k, n]) => {
          const r = await fetch(FONT_BASE + n + '.ttf');
          if (!r.ok) throw new Error('font');
          return [k, new Uint8Array(await r.arrayBuffer())];
        })
      );
      fontBytes = Object.fromEntries(entries);
    } catch (e) {
      fontBytes = null;
    }
  }
  cached = { L: window.PDFLib, fontkit: window.fontkit || null, fontBytes };
  return cached;
}

export async function markdownPdf(md, opts = {}, libs = null) {
  const { L, fontkit, fontBytes } = libs || (await pdfLibs());
  const blocks = markdownBlocks(md, { base: opts.base || 11 });
  return buildDocPdf(L, blocks, { page: opts.page || 'a4', margin: opts.margin || 56, base: opts.base || 11, numbers: !!opts.numbers, title: opts.title || '', fontkit, fontBytes });
}

export function download(data, name, type) {
  const blob = data instanceof Blob ? data : new Blob([data], { type: type || 'application/octet-stream' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.hidden = true;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 60000);
  return name;
}
