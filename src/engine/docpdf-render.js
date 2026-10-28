import { layoutDocument } from './docpdf-layout.js';

const FACES = ['regular', 'bold', 'italic', 'bolditalic'];

function link(L, doc, page, o) {
  const ctx = doc.context;
  let uri = o.url;
  try {
    uri = encodeURI(decodeURI(o.url));
  } catch (e) {}
  const ref = ctx.register(ctx.obj({ Type: 'Annot', Subtype: 'Link', Rect: [o.x, o.y, o.x + o.w, o.y + o.h], Border: [0, 0, 0], F: 4, A: { Type: 'Action', S: 'URI', URI: L.PDFString.of(uri) } }));
  const annots = page.node.lookup(L.PDFName.of('Annots'));
  if (annots instanceof L.PDFArray) annots.push(ref);
  else page.node.set(L.PDFName.of('Annots'), ctx.obj([ref]));
}

export async function buildDocPdf(L, blocks, opts = {}) {
  const doc = await L.PDFDocument.create();
  const fonts = {};
  if (opts.fontkit && opts.fontBytes && opts.fontBytes.regular) {
    doc.registerFontkit(opts.fontkit);
    for (const f of FACES) fonts[f] = await doc.embedFont(opts.fontBytes[f] || opts.fontBytes.regular, { subset: true });
  } else {
    const std = { regular: L.StandardFonts.Helvetica, bold: L.StandardFonts.HelveticaBold, italic: L.StandardFonts.HelveticaOblique, bolditalic: L.StandardFonts.HelveticaBoldOblique };
    for (const f of FACES) fonts[f] = await doc.embedFont(std[f]);
  }
  fonts.mono = await doc.embedFont(L.StandardFonts.Courier);
  fonts.monobold = await doc.embedFont(L.StandardFonts.CourierBold);
  const custom = !!(opts.fontkit && opts.fontBytes && opts.fontBytes.regular);
  const encodable = new Map();
  const canEncode = (f, text) => {
    if (custom && !f.startsWith('mono')) return true;
    const key = f + '\u0000' + text;
    if (encodable.has(key)) return encodable.get(key);
    let ok = true;
    try {
      fonts[f].encodeText(text);
    } catch (e) {
      ok = false;
    }
    if (encodable.size < 20000) encodable.set(key, ok);
    return ok;
  };
  const measure = (text, f, size) => fonts[f].widthOfTextAtSize(text, size);
  const images = opts.images || new Map();
  const layout = layoutDocument(blocks, { page: opts.page, margin: opts.margin, base: opts.base, numbers: opts.numbers, measure, canEncode, image: (src) => (images.get(src) ? { w: images.get(src).w, h: images.get(src).h } : null) });
  const embedded = new Map();
  const color = (c) => L.rgb(c[0], c[1], c[2]);
  for (const p of layout.pages) {
    const page = doc.addPage([layout.width, layout.height]);
    for (const o of p.ops) {
      if (o.op === 'text') {
        const t = { x: o.x, y: o.y, size: o.size, font: fonts[o.font] || fonts.regular, color: color(o.color) };
        try {
          page.drawText(o.text, t);
        } catch (e) {
          page.drawText(o.text.replace(/[^\x20-\x7e\u00a0-\u00ff]/g, '?'), t);
        }
      } else if (o.op === 'rect') {
        const r = { x: o.x, y: o.y, width: o.w, height: o.h };
        if (o.fill) r.color = color(o.fill);
        if (o.stroke) {
          r.borderColor = color(o.stroke);
          r.borderWidth = o.sw || 1;
        }
        page.drawRectangle(r);
      } else if (o.op === 'line') {
        page.drawLine({ start: { x: o.x1, y: o.y1 }, end: { x: o.x2, y: o.y2 }, thickness: o.w, color: color(o.color) });
      } else if (o.op === 'circle') {
        const c = { x: o.x, y: o.y, size: o.r };
        if (o.fill) c.color = color(o.fill);
        if (o.stroke) {
          c.borderColor = color(o.stroke);
          c.borderWidth = o.sw || 1;
        }
        page.drawCircle(c);
      } else if (o.op === 'path') {
        for (let i = 1; i < o.points.length; i++) page.drawLine({ start: { x: o.points[i - 1][0], y: o.points[i - 1][1] }, end: { x: o.points[i][0], y: o.points[i][1] }, thickness: o.w, color: color(o.color), lineCap: L.LineCapStyle.Round });
      } else if (o.op === 'image') {
        const src = images.get(o.src);
        if (!src) continue;
        let img = embedded.get(o.src);
        if (!img) {
          img = src.mime === 'image/jpeg' ? await doc.embedJpg(src.bytes) : await doc.embedPng(src.bytes);
          embedded.set(o.src, img);
        }
        page.drawImage(img, { x: o.x, y: o.y, width: o.w, height: o.h });
      } else if (o.op === 'link') {
        link(L, doc, page, o);
      }
    }
  }
  if (opts.title) doc.setTitle(opts.title);
  doc.setCreator('Snowkit');
  doc.setProducer('Snowkit');
  const bytes = await doc.save();
  return { bytes, pages: layout.pages.length, skipped: layout.skipped, links: layout.links };
}

export function imageSources(blocks, out = new Set()) {
  for (const b of blocks) {
    if (b.type === 'image' && b.src) out.add(b.src);
    if (b.type === 'table') for (const r of b.rows) for (const c of r.cells) imageSources(c.blocks, out);
  }
  return out;
}
