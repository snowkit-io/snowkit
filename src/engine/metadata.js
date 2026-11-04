const ascii = (b, s, n) => {
  let out = "";
  for (let i = 0; i < n; i++) out += String.fromCharCode(b[s + i]);
  return out;
};

export function detect(bytes) {
  const b = bytes;
  if (b[0] === 0xff && b[1] === 0xd8) return "jpeg";
  if (b[0] === 0x89 && ascii(b, 1, 3) === "PNG") return "png";
  if (ascii(b, 0, 4) === "RIFF" && ascii(b, 8, 4) === "WEBP") return "webp";
  return null;
}

const IFD0 = { 0x010e: "Description", 0x010f: "Camera make", 0x0110: "Camera model", 0x0112: "Orientation", 0x0131: "Software", 0x0132: "Modified", 0x013b: "Artist", 0x8298: "Copyright" };
const EXIF = { 0x9003: "Taken", 0x9010: "Time zone", 0xa434: "Lens", 0xa431: "Camera serial number", 0xa435: "Lens serial number", 0x829a: "Exposure", 0x829d: "Aperture", 0x8827: "ISO", 0x920a: "Focal length", 0xa420: "Unique image ID", 0xa430: "Camera owner", 0x927c: "Maker notes" };

export function parseExif(b, start, length) {
  const end = start + length;
  if (end > b.length || length < 8) return null;
  const le = b[start] === 0x49;
  const u16 = (o) => (le ? b[o] | (b[o + 1] << 8) : (b[o] << 8) | b[o + 1]);
  const u32 = (o) => (le ? (b[o] | (b[o + 1] << 8) | (b[o + 2] << 16) | (b[o + 3] << 24)) >>> 0 : ((b[o] << 24) | (b[o + 1] << 16) | (b[o + 2] << 8) | b[o + 3]) >>> 0);
  const SIZE = { 1: 1, 2: 1, 3: 2, 4: 4, 5: 8, 7: 1, 9: 4, 10: 8 };
  function readIFD(off) {
    const tags = {};
    const at = start + off;
    if (at + 2 > end) return { tags, next: 0 };
    const n = u16(at);
    for (let i = 0; i < n; i++) {
      const e = at + 2 + i * 12;
      if (e + 12 > end) break;
      const tag = u16(e);
      const type = u16(e + 2);
      const count = u32(e + 4);
      const size = (SIZE[type] || 1) * count;
      const vo = size > 4 ? start + u32(e + 8) : e + 8;
      if (vo + size > end) continue;
      let v;
      if (type === 2) v = ascii(b, vo, count).replace(/\0+$/, "").trim();
      else if (type === 3) v = count === 1 ? u16(vo) : Array.from({ length: Math.min(count, 8) }, (_, k) => u16(vo + k * 2));
      else if (type === 4 || type === 9) v = count === 1 ? u32(vo) : Array.from({ length: Math.min(count, 8) }, (_, k) => u32(vo + k * 4));
      else if (type === 5 || type === 10) v = Array.from({ length: Math.min(count, 8) }, (_, k) => { const d = u32(vo + k * 8 + 4); return d ? u32(vo + k * 8) / d : 0; });
      else v = { bytes: count };
      tags[tag] = v;
    }
    return { tags, next: at + 2 + n * 12 + 4 <= end ? u32(at + 2 + n * 12) : 0 };
  }
  const first = readIFD(u32(start + 4));
  const out = { fields: [], gps: null, orientation: 1, thumbnail: !!first.next };
  const fmt = (tag, v) => {
    if (tag === 0x829a && Array.isArray(v)) return v[0] >= 1 ? v[0] + " s" : "1/" + Math.round(1 / v[0]) + " s";
    if (tag === 0x829d && Array.isArray(v)) return "f/" + Math.round(v[0] * 10) / 10;
    if (tag === 0x920a && Array.isArray(v)) return Math.round(v[0]) + " mm";
    if (tag === 0x927c) return "Present";
    if (Array.isArray(v)) return v.join(", ");
    if (typeof v === "object") return "Present";
    return String(v);
  };
  for (const [k, label] of Object.entries(IFD0)) {
    const v = first.tags[k];
    if (v === undefined || v === "") continue;
    if (+k === 0x0112) out.orientation = +v || 1;
    else out.fields.push({ label, value: fmt(+k, v) });
  }
  if (first.tags[0x8769]) {
    const ex = readIFD(first.tags[0x8769]).tags;
    for (const [k, label] of Object.entries(EXIF)) if (ex[k] !== undefined && ex[k] !== "") out.fields.push({ label, value: fmt(+k, ex[k]) });
  }
  if (first.tags[0x8825]) {
    const g = readIFD(first.tags[0x8825]).tags;
    const dms = (a) => (Array.isArray(a) && a.length >= 3 ? a[0] + a[1] / 60 + a[2] / 3600 : null);
    const lat = dms(g[2]);
    const lon = dms(g[4]);
    if (lat !== null && lon !== null && (lat || lon)) {
      out.gps = { lat: g[1] === "S" ? -lat : lat, lon: g[3] === "W" ? -lon : lon, altitude: Array.isArray(g[6]) ? Math.round(g[6][0]) : null };
    }
  }
  return out;
}

function orientationExif(o) {
  const tiff = [0x4d, 0x4d, 0, 0x2a, 0, 0, 0, 8, 0, 1, 0x01, 0x12, 0, 3, 0, 0, 0, 1, 0, o, 0, 0, 0, 0, 0, 0];
  const body = [0x45, 0x78, 0x69, 0x66, 0, 0, ...tiff];
  const len = body.length + 2;
  return new Uint8Array([0xff, 0xe1, len >> 8, len & 255, ...body]);
}

function concat(parts) {
  const n = parts.reduce((a, p) => a + p.length, 0);
  const out = new Uint8Array(n);
  let o = 0;
  for (const p of parts) {
    out.set(p, o);
    o += p.length;
  }
  return out;
}

function jpeg(b, { keepColor = true, keepOrientation = true } = {}) {
  const report = { format: "JPEG", fields: [], gps: null, found: [], orientation: 1 };
  const keep = [b.subarray(0, 2)];
  let i = 2;
  let removed = 0;
  while (i + 4 <= b.length) {
    if (b[i] !== 0xff) throw new Error("This JPEG looks damaged");
    const m = b[i + 1];
    if (m === 0xff) {
      i++;
      continue;
    }
    if (m === 0xda) break;
    if (m === 0xd8 || (m >= 0xd0 && m <= 0xd7) || m === 0x01) {
      keep.push(b.subarray(i, i + 2));
      i += 2;
      continue;
    }
    const len = (b[i + 2] << 8) | b[i + 3];
    const seg = b.subarray(i, i + 2 + len);
    const head = ascii(b, i + 4, Math.min(30, len - 2));
    let drop = false;
    if (m === 0xe1 && head.startsWith("Exif\0")) {
      const ex = parseExif(b, i + 10, len - 8);
      if (ex) {
        report.fields.push(...ex.fields);
        report.gps = report.gps || ex.gps;
        report.orientation = ex.orientation;
        if (ex.thumbnail) report.found.push("Embedded thumbnail");
      }
      report.found.push("EXIF");
      drop = true;
    } else if (m === 0xe1) {
      report.found.push(head.startsWith("http://ns.adobe.com/xap") ? "XMP" : "APP1 data");
      drop = true;
    } else if (m === 0xe2 && head.startsWith("ICC_PROFILE")) {
      if (!keepColor) {
        report.found.push("Colour profile");
        drop = true;
      }
    } else if (m === 0xed) {
      report.found.push("IPTC");
      drop = true;
    } else if (m === 0xfe) {
      report.found.push("Comment");
      drop = true;
    } else if ((m >= 0xe2 && m <= 0xef && m !== 0xee) || m === 0xe0 && !head.startsWith("JFIF")) {
      report.found.push("APP" + (m - 0xe0) + " data");
      drop = true;
    }
    if (drop) removed += seg.length;
    else keep.push(seg);
    i += 2 + len;
  }
  let end = b.length;
  let p = i;
  while (p + 1 < b.length) {
    if (b[p] !== 0xff) {
      p++;
      continue;
    }
    const m = b[p + 1];
    if (m === 0xff) {
      p++;
      continue;
    }
    if (m === 0xd9) {
      end = p + 2;
      break;
    }
    if ((m >= 0xd0 && m <= 0xd7) || m === 0x01) {
      p += 2;
      continue;
    }
    p += 2 + ((b[p + 2] << 8) | b[p + 3]);
    if (m === 0xda) {
      while (p + 1 < b.length && !(b[p] === 0xff && b[p + 1] !== 0 && !(b[p + 1] >= 0xd0 && b[p + 1] <= 0xd7))) p++;
    }
  }
  if (end < b.length) {
    report.found.push("Data after the image");
    removed += b.length - end;
  }
  if (keepOrientation && report.orientation > 1 && report.orientation <= 8) keep.splice(1, 0, orientationExif(report.orientation));
  keep.push(b.subarray(i, Math.min(end, b.length)));
  report.found = [...new Set(report.found)];
  return { bytes: concat(keep), report, removed };
}

const PNG_DROP = new Set(["tEXt", "zTXt", "iTXt", "eXIf", "tIME"]);

function png(b, { keepColor = true } = {}) {
  const report = { format: "PNG", fields: [], gps: null, found: [], orientation: 1 };
  const keep = [b.subarray(0, 8)];
  let i = 8;
  let removed = 0;
  while (i + 12 <= b.length) {
    const len = ((b[i] << 24) | (b[i + 1] << 16) | (b[i + 2] << 8) | b[i + 3]) >>> 0;
    const type = ascii(b, i + 4, 4);
    const chunk = b.subarray(i, i + 12 + len);
    let drop = PNG_DROP.has(type) || (!keepColor && type === "iCCP");
    if (type === "tEXt" || type === "iTXt" || type === "zTXt") {
      let k = i + 8;
      let key = "";
      while (k < i + 8 + len && b[k] !== 0 && key.length < 79) key += String.fromCharCode(b[k++]);
      let val = "";
      if (type === "tEXt") val = ascii(b, k + 1, Math.min(200, i + 8 + len - k - 1));
      report.fields.push({ label: key || "Text", value: val || "Present" });
      if (/xml:com\.adobe\.xmp/i.test(key)) report.found.push("XMP");
      else report.found.push("Text notes");
    }
    if (type === "eXIf") {
      const ex = parseExif(b, i + 8, len);
      if (ex) {
        report.fields.push(...ex.fields);
        report.gps = ex.gps;
      }
      report.found.push("EXIF");
    }
    if (type === "tIME") report.found.push("Timestamp");
    if (type === "iCCP" && !keepColor) report.found.push("Colour profile");
    if (drop) removed += chunk.length;
    else keep.push(chunk);
    i += 12 + len;
    if (type === "IEND") break;
  }
  if (i < b.length) {
    report.found.push("Data after the image");
    removed += b.length - i;
  }
  report.found = [...new Set(report.found)];
  return { bytes: concat(keep), report, removed };
}

function webp(b, { keepColor = true } = {}) {
  const report = { format: "WebP", fields: [], gps: null, found: [], orientation: 1 };
  const keep = [];
  let i = 12;
  let removed = 0;
  let vp8x = -1;
  const riffEnd = Math.min(b.length, 8 + (((b[4] | (b[5] << 8) | (b[6] << 16) | (b[7] << 24)) >>> 0)));
  while (i + 8 <= riffEnd) {
    const type = ascii(b, i, 4);
    const len = (b[i + 4] | (b[i + 5] << 8) | (b[i + 6] << 16) | (b[i + 7] << 24)) >>> 0;
    const total = 8 + len + (len & 1);
    const chunk = b.slice(i, i + total);
    let drop = false;
    if (type === "EXIF") {
      let s = i + 8;
      if (ascii(b, s, 6) === "Exif\0\0") s += 6;
      const ex = parseExif(b, s, len - (s - i - 8));
      if (ex) {
        report.fields.push(...ex.fields);
        report.gps = ex.gps;
      }
      report.found.push("EXIF");
      drop = true;
    } else if (type === "XMP ") {
      report.found.push("XMP");
      drop = true;
    } else if (type === "ICCP" && !keepColor) {
      report.found.push("Colour profile");
      drop = true;
    }
    if (type === "VP8X") vp8x = keep.length;
    if (drop) removed += total;
    else keep.push(chunk);
    i += total;
  }
  if (vp8x >= 0) {
    const c = keep[vp8x];
    c[8] &= ~(0x08 | 0x04 | (keepColor ? 0 : 0x20));
  }
  const body = concat(keep);
  const size = body.length + 4;
  const head = new Uint8Array([0x52, 0x49, 0x46, 0x46, size & 255, (size >> 8) & 255, (size >> 16) & 255, (size >>> 24) & 255, 0x57, 0x45, 0x42, 0x50]);
  report.found = [...new Set(report.found)];
  return { bytes: concat([head, body]), report, removed };
}

export function inspect(bytes, options) {
  return clean(bytes, options).report;
}

export function clean(bytes, options = {}) {
  const b = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  const kind = detect(b);
  if (kind === "jpeg") return jpeg(b, options);
  if (kind === "png") return png(b, options);
  if (kind === "webp") return webp(b, options);
  throw new Error("Only JPEG, PNG and WebP images are supported");
}
