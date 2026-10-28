const ECC = [
  [-1, 7, 10, 15, 20, 26, 18, 20, 24, 30, 18, 20, 24, 26, 30, 22, 24, 28, 30, 28, 28, 28, 28, 30, 30, 26, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
  [-1, 10, 16, 26, 18, 24, 16, 18, 22, 22, 26, 30, 22, 22, 24, 24, 28, 28, 26, 26, 26, 26, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28],
  [-1, 13, 22, 18, 26, 18, 24, 18, 22, 20, 24, 28, 26, 24, 20, 30, 24, 28, 28, 26, 30, 28, 30, 30, 30, 30, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
  [-1, 17, 28, 22, 16, 22, 28, 26, 26, 24, 28, 24, 28, 22, 24, 24, 30, 28, 28, 26, 28, 30, 24, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
];
const BLOCKS = [
  [-1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 4, 4, 4, 4, 4, 6, 6, 6, 6, 7, 8, 8, 9, 9, 10, 12, 12, 12, 13, 14, 15, 16, 17, 18, 19, 19, 20, 21, 22, 24, 25],
  [-1, 1, 1, 1, 2, 2, 4, 4, 4, 5, 5, 5, 8, 9, 9, 10, 10, 11, 13, 14, 16, 17, 17, 18, 20, 21, 23, 25, 26, 28, 29, 31, 33, 35, 37, 38, 40, 43, 45, 47, 49],
  [-1, 1, 1, 2, 2, 4, 4, 6, 6, 8, 8, 8, 10, 12, 16, 12, 17, 16, 18, 21, 20, 23, 23, 25, 27, 29, 34, 34, 35, 38, 40, 43, 45, 48, 51, 53, 56, 59, 62, 65, 68],
  [-1, 1, 1, 2, 4, 4, 4, 5, 6, 8, 8, 11, 11, 16, 16, 18, 16, 19, 21, 25, 25, 25, 34, 30, 32, 35, 37, 40, 42, 45, 48, 51, 54, 57, 60, 63, 66, 70, 74, 77, 81],
];
const FORMAT_ECL = [1, 0, 3, 2];
const FINDER_LIKE = [1, 0, 1, 1, 1, 0, 1, 0, 0, 0, 0];
const ALNUM = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:";
const CHARSETS = { 1: "iso-8859-1", 3: "iso-8859-1", 4: "iso-8859-2", 7: "iso-8859-5", 9: "iso-8859-7", 20: "shift_jis", 21: "windows-1250", 22: "windows-1251", 23: "windows-1252", 24: "windows-1256", 25: "utf-16be", 26: "utf-8", 28: "big5", 29: "gb18030", 30: "euc-kr" };
const MASKS = [
  (x, y) => (x + y) % 2 === 0,
  (x, y) => y % 2 === 0,
  (x, y) => x % 3 === 0,
  (x, y) => (x + y) % 3 === 0,
  (x, y) => (Math.floor(x / 3) + Math.floor(y / 2)) % 2 === 0,
  (x, y) => ((x * y) % 2) + ((x * y) % 3) === 0,
  (x, y) => (((x * y) % 2) + ((x * y) % 3)) % 2 === 0,
  (x, y) => (((x + y) % 2) + ((x * y) % 3)) % 2 === 0,
];

export const LEVELS = ["L", "M", "Q", "H"];

const EXP = new Uint8Array(512);
const LOG = new Uint8Array(256);
for (let i = 0, v = 1; i < 255; i++) {
  EXP[i] = v;
  LOG[v] = i;
  v <<= 1;
  if (v & 256) v ^= 0x11d;
}
for (let i = 255; i < 512; i++) EXP[i] = EXP[i - 255];

const gmul = (a, b) => (a && b ? EXP[LOG[a] + LOG[b]] : 0);
const gdiv = (a, b) => (a ? EXP[LOG[a] + 255 - LOG[b]] : 0);

function levelIndex(ecl) {
  if (typeof ecl === "number") return Math.max(0, Math.min(3, ecl | 0));
  const i = LEVELS.indexOf(String(ecl || "M").toUpperCase());
  return i < 0 ? 1 : i;
}

function rawModules(ver) {
  let n = (16 * ver + 128) * ver + 64;
  if (ver >= 2) {
    const a = Math.floor(ver / 7) + 2;
    n -= (25 * a - 10) * a - 55;
    if (ver >= 7) n -= 36;
  }
  return n;
}

const dataBytes = (ver, ecl) => Math.floor(rawModules(ver) / 8) - ECC[ecl][ver] * BLOCKS[ecl][ver];

function countBits(mode, ver) {
  const i = ver < 10 ? 0 : ver < 27 ? 1 : 2;
  if (mode === 1) return [10, 12, 14][i];
  if (mode === 2) return [9, 11, 13][i];
  if (mode === 8) return [8, 10, 12][i];
  return [8, 16, 16][i];
}

function alignments(ver) {
  if (ver === 1) return [];
  const n = Math.floor(ver / 7) + 2;
  const step = Math.floor((ver * 8 + n * 3 + 5) / (n * 4 - 4)) * 2;
  const out = [6];
  for (let pos = ver * 4 + 10; out.length < n; pos -= step) out.splice(1, 0, pos);
  return out;
}

function formatBits(ecl, mask) {
  const data = (FORMAT_ECL[ecl] << 3) | mask;
  let rem = data;
  for (let i = 0; i < 10; i++) rem = (rem << 1) ^ ((rem >>> 9) * 0x537);
  return ((data << 10) | rem) ^ 0x5412;
}

function versionBits(ver) {
  let rem = ver;
  for (let i = 0; i < 12; i++) rem = (rem << 1) ^ ((rem >>> 11) * 0x1f25);
  return (ver << 12) | rem;
}

function formatSpots(size) {
  const a = [];
  const b = [];
  for (let i = 0; i < 15; i++) {
    if (i < 6) a.push([8, i]);
    else if (i === 6) a.push([8, 7]);
    else if (i === 7) a.push([8, 8]);
    else if (i === 8) a.push([7, 8]);
    else a.push([14 - i, 8]);
    b.push(i < 8 ? [size - 1 - i, 8] : [8, size - 15 + i]);
  }
  return [a, b];
}

function versionSpots(size) {
  const a = [];
  const b = [];
  for (let i = 0; i < 18; i++) {
    const p = size - 11 + (i % 3);
    const q = Math.floor(i / 3);
    a.push([p, q]);
    b.push([q, p]);
  }
  return [a, b];
}

const layouts = new Map();

function layout(ver) {
  if (layouts.has(ver)) return layouts.get(ver);
  const size = ver * 4 + 17;
  const mod = new Uint8Array(size * size);
  const fn = new Uint8Array(size * size);
  const set = (x, y, dark) => {
    mod[y * size + x] = dark ? 1 : 0;
    fn[y * size + x] = 1;
  };
  for (let i = 0; i < size; i++) {
    set(6, i, i % 2 === 0);
    set(i, 6, i % 2 === 0);
  }
  for (const [cx, cy] of [[3, 3], [size - 4, 3], [3, size - 4]]) {
    for (let dy = -4; dy <= 4; dy++) {
      for (let dx = -4; dx <= 4; dx++) {
        const x = cx + dx;
        const y = cy + dy;
        if (x < 0 || y < 0 || x >= size || y >= size) continue;
        const d = Math.max(Math.abs(dx), Math.abs(dy));
        set(x, y, d !== 2 && d !== 4);
      }
    }
  }
  const pos = alignments(ver);
  const n = pos.length;
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if ((i === 0 && j === 0) || (i === 0 && j === n - 1) || (i === n - 1 && j === 0)) continue;
      for (let dy = -2; dy <= 2; dy++) {
        for (let dx = -2; dx <= 2; dx++) set(pos[i] + dx, pos[j] + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1);
      }
    }
  }
  const [fa, fb] = formatSpots(size);
  for (const [x, y] of fa.concat(fb)) set(x, y, false);
  set(8, size - 8, true);
  if (ver >= 7) {
    const bits = versionBits(ver);
    const [va, vb] = versionSpots(size);
    for (let i = 0; i < 18; i++) {
      const dark = (bits >>> i) & 1;
      set(va[i][0], va[i][1], dark);
      set(vb[i][0], vb[i][1], dark);
    }
  }
  const order = [];
  for (let right = size - 1; right >= 1; right -= 2) {
    if (right === 6) right = 5;
    const up = ((right + 1) & 2) === 0;
    for (let v = 0; v < size; v++) {
      const y = up ? size - 1 - v : v;
      for (let j = 0; j < 2; j++) {
        const k = y * size + right - j;
        if (!fn[k]) order.push(k);
      }
    }
  }
  const result = { ver, size, mod, fn, order };
  layouts.set(ver, result);
  return result;
}

function divisor(degree) {
  const out = new Uint8Array(degree);
  out[degree - 1] = 1;
  let root = 1;
  for (let i = 0; i < degree; i++) {
    for (let j = 0; j < degree; j++) {
      out[j] = gmul(out[j], root);
      if (j + 1 < degree) out[j] ^= out[j + 1];
    }
    root = gmul(root, 2);
  }
  return out;
}

function remainder(data, div) {
  const out = new Uint8Array(div.length);
  for (const byte of data) {
    const factor = byte ^ out[0];
    out.copyWithin(0, 1);
    out[out.length - 1] = 0;
    for (let i = 0; i < div.length; i++) out[i] ^= gmul(div[i], factor);
  }
  return out;
}

function blockPlan(ver, ecl) {
  const count = BLOCKS[ecl][ver];
  const ec = ECC[ecl][ver];
  const raw = Math.floor(rawModules(ver) / 8);
  return { count, ec, shortCount: count - (raw % count), shortLen: Math.floor(raw / count) };
}

function interleave(data, ver, ecl) {
  const { count, ec, shortCount, shortLen } = blockPlan(ver, ecl);
  const div = divisor(ec);
  const blocks = [];
  let k = 0;
  for (let i = 0; i < count; i++) {
    const len = shortLen - ec + (i < shortCount ? 0 : 1);
    const dat = data.slice(k, k + len);
    k += len;
    blocks.push({ dat, ecc: remainder(dat, div) });
  }
  const out = [];
  for (let i = 0; i <= shortLen - ec; i++) {
    for (const b of blocks) if (i < b.dat.length) out.push(b.dat[i]);
  }
  for (let i = 0; i < ec; i++) {
    for (const b of blocks) out.push(b.ecc[i]);
  }
  return out;
}

function segment(text) {
  const bits = [];
  const put = (v, n) => {
    for (let i = n - 1; i >= 0; i--) bits.push((v >>> i) & 1);
  };
  if (/^[0-9]*$/.test(text)) {
    for (let i = 0; i < text.length; i += 3) {
      const part = text.slice(i, i + 3);
      put(parseInt(part, 10), part.length * 3 + 1);
    }
    return { mode: 1, count: text.length, bits };
  }
  if (/^[0-9A-Z $%*+\-./:]*$/.test(text)) {
    for (let i = 0; i + 1 < text.length; i += 2) put(ALNUM.indexOf(text[i]) * 45 + ALNUM.indexOf(text[i + 1]), 11);
    if (text.length % 2) put(ALNUM.indexOf(text[text.length - 1]), 6);
    return { mode: 2, count: text.length, bits };
  }
  const bytes = new TextEncoder().encode(text);
  for (const b of bytes) put(b, 8);
  return { mode: 4, count: bytes.length, bits };
}

export function capacity(mode, ecl) {
  const e = levelIndex(ecl);
  const bits = dataBytes(40, e) * 8 - 4 - countBits(mode, 40);
  if (mode === 1) return Math.floor(bits / 10) * 3 + (bits % 10 >= 7 ? 2 : bits % 10 >= 4 ? 1 : 0);
  if (mode === 2) return Math.floor(bits / 11) * 2 + (bits % 11 >= 6 ? 1 : 0);
  return Math.floor(bits / 8);
}

function penalty(m, size) {
  let score = 0;
  for (let pass = 0; pass < 2; pass++) {
    for (let a = 0; a < size; a++) {
      let run = 1;
      const line = new Uint8Array(size);
      for (let b = 0; b < size; b++) line[b] = pass ? m[b * size + a] : m[a * size + b];
      for (let b = 1; b < size; b++) {
        if (line[b] === line[b - 1]) {
          run++;
          if (run === 5) score += 3;
          else if (run > 5) score++;
        } else {
          run = 1;
        }
      }
      for (let b = 0; b + 10 < size; b++) {
        let ahead = true;
        let behind = true;
        for (let i = 0; i < 11 && (ahead || behind); i++) {
          if (line[b + i] !== FINDER_LIKE[i]) ahead = false;
          if (line[b + i] !== FINDER_LIKE[10 - i]) behind = false;
        }
        if (ahead) score += 40;
        if (behind) score += 40;
      }
    }
  }
  let dark = 0;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const c = m[y * size + x];
      dark += c;
      if (y + 1 < size && x + 1 < size && c === m[y * size + x + 1] && c === m[(y + 1) * size + x] && c === m[(y + 1) * size + x + 1]) score += 3;
    }
  }
  const total = size * size;
  score += Math.max(0, Math.ceil(Math.abs(dark * 20 - total * 10) / total) - 1) * 10;
  return score;
}

export function encode(text, eclIn) {
  const ecl = levelIndex(eclIn);
  const seg = segment(String(text));
  let ver = 1;
  for (; ver <= 40; ver++) {
    const cb = countBits(seg.mode, ver);
    if (seg.count < 2 ** cb && 4 + cb + seg.bits.length <= dataBytes(ver, ecl) * 8) break;
  }
  if (ver > 40) {
    const error = new Error("Too long for one QR code");
    error.kind = "long";
    error.count = seg.count;
    error.max = capacity(seg.mode, ecl);
    error.bytes = seg.mode === 4;
    throw error;
  }
  const cap = dataBytes(ver, ecl) * 8;
  const bits = [];
  const put = (v, n) => {
    for (let i = n - 1; i >= 0; i--) bits.push((v >>> i) & 1);
  };
  put(seg.mode, 4);
  put(seg.count, countBits(seg.mode, ver));
  for (const b of seg.bits) bits.push(b);
  put(0, Math.min(4, cap - bits.length));
  put(0, (8 - (bits.length % 8)) % 8);
  for (let pad = 0xec; bits.length < cap; pad ^= 0xec ^ 0x11) put(pad, 8);
  const data = new Uint8Array(cap / 8);
  bits.forEach((b, i) => {
    data[i >>> 3] |= b << (7 - (i & 7));
  });
  const codes = interleave(data, ver, ecl);
  const L = layout(ver);
  const base = L.mod.slice();
  L.order.forEach((k, i) => {
    base[k] = i < codes.length * 8 ? (codes[i >>> 3] >>> (7 - (i & 7))) & 1 : 0;
  });
  const [fa, fb] = formatSpots(L.size);
  let best = null;
  let bestScore = Infinity;
  for (let mask = 0; mask < 8; mask++) {
    const mod = base.slice();
    const test = MASKS[mask];
    for (const k of L.order) if (test(k % L.size, Math.floor(k / L.size))) mod[k] ^= 1;
    const fbits = formatBits(ecl, mask);
    for (let i = 0; i < 15; i++) {
      const v = (fbits >>> i) & 1;
      mod[fa[i][1] * L.size + fa[i][0]] = v;
      mod[fb[i][1] * L.size + fb[i][0]] = v;
    }
    const score = penalty(mod, L.size);
    if (score < bestScore) {
      bestScore = score;
      best = { mod, mask };
    }
  }
  return { ver, size: L.size, modules: best.mod, mask: best.mask, ecl, level: LEVELS[ecl] };
}

function correct(block, ec) {
  const n = block.length;
  const synd = new Uint8Array(ec);
  let bad = false;
  for (let i = 0; i < ec; i++) {
    let s = 0;
    const a = EXP[i];
    for (let k = 0; k < n; k++) s = gmul(s, a) ^ block[k];
    synd[i] = s;
    if (s) bad = true;
  }
  if (!bad) return true;
  let C = [1];
  let B = [1];
  let L = 0;
  let m = 1;
  let b = 1;
  for (let k = 0; k < ec; k++) {
    let d = synd[k];
    for (let i = 1; i <= L; i++) d ^= gmul(C[i] || 0, synd[k - i]);
    if (d === 0) {
      m++;
      continue;
    }
    const coef = gdiv(d, b);
    const T = C.slice();
    while (C.length < B.length + m) C.push(0);
    for (let i = 0; i < B.length; i++) C[i + m] ^= gmul(coef, B[i]);
    if (2 * L <= k) {
      L = k + 1 - L;
      B = T;
      b = d;
      m = 1;
    } else {
      m++;
    }
  }
  C = C.slice(0, L + 1);
  if (2 * L > ec) return false;
  const spots = [];
  for (let k = 0; k < n; k++) {
    const xinv = EXP[(255 - ((n - 1 - k) % 255)) % 255];
    let v = 0;
    for (let i = C.length - 1; i >= 0; i--) v = gmul(v, xinv) ^ C[i];
    if (v === 0) spots.push(k);
  }
  if (spots.length !== L) return false;
  const omega = new Uint8Array(ec);
  for (let i = 0; i < ec; i++) {
    for (let j = 0; j < C.length && i + j < ec; j++) omega[i + j] ^= gmul(synd[i], C[j]);
  }
  for (const k of spots) {
    const p = (n - 1 - k) % 255;
    const X = EXP[p];
    const xinv = EXP[(255 - p) % 255];
    let num = 0;
    for (let i = ec - 1; i >= 0; i--) num = gmul(num, xinv) ^ omega[i];
    let den = 0;
    for (let i = 1; i < C.length; i += 2) den ^= gmul(C[i], i === 1 ? 1 : EXP[(LOG[xinv] * (i - 1)) % 255]);
    if (!den) return false;
    block[k] ^= gmul(X, gdiv(num, den));
  }
  for (let i = 0; i < ec; i++) {
    let s = 0;
    const a = EXP[i];
    for (let k = 0; k < n; k++) s = gmul(s, a) ^ block[k];
    if (s) return false;
  }
  return true;
}

function decodeBytes(bytes, charset) {
  if (charset) {
    try {
      return new TextDecoder(charset).decode(bytes);
    } catch {
      charset = "";
    }
  }
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    return new TextDecoder("windows-1252").decode(bytes);
  }
}

function parse(bytes, ver) {
  const total = bytes.length * 8;
  let pos = 0;
  const read = (n) => {
    if (pos + n > total) throw new RangeError("end");
    let v = 0;
    for (let i = 0; i < n; i++, pos++) v = (v << 1) | ((bytes[pos >>> 3] >>> (7 - (pos & 7))) & 1);
    return v;
  };
  let text = "";
  let charset = "";
  try {
    while (pos + 4 <= total) {
      const mode = read(4);
      if (mode === 0) break;
      if (mode === 7) {
        let v = read(8);
        if ((v & 0xc0) === 0x80) v = ((v & 0x3f) << 8) | read(8);
        else if ((v & 0xe0) === 0xc0) v = ((v & 0x1f) << 16) | read(16);
        charset = CHARSETS[v] || "";
        continue;
      }
      if (mode === 3) {
        read(16);
        continue;
      }
      if (mode === 5) continue;
      if (mode === 9) {
        read(8);
        continue;
      }
      if (mode !== 1 && mode !== 2 && mode !== 4 && mode !== 8) return null;
      let n = read(countBits(mode, ver));
      if (mode === 1) {
        while (n >= 3) {
          const v = read(10);
          if (v > 999) return null;
          text += String(v).padStart(3, "0");
          n -= 3;
        }
        if (n === 2) {
          const v = read(7);
          if (v > 99) return null;
          text += String(v).padStart(2, "0");
        } else if (n === 1) {
          const v = read(4);
          if (v > 9) return null;
          text += String(v);
        }
      } else if (mode === 2) {
        while (n >= 2) {
          const v = read(11);
          if (v >= 45 * 45) return null;
          text += ALNUM[Math.floor(v / 45)] + ALNUM[v % 45];
          n -= 2;
        }
        if (n === 1) {
          const v = read(6);
          if (v >= 45) return null;
          text += ALNUM[v];
        }
      } else if (mode === 4) {
        const out = new Uint8Array(n);
        for (let i = 0; i < n; i++) out[i] = read(8);
        text += decodeBytes(out, charset);
      } else {
        const out = new Uint8Array(n * 2);
        for (let i = 0; i < n; i++) {
          const v = read(13);
          let code = (Math.floor(v / 0xc0) << 8) | (v % 0xc0);
          code += code < 0x1f00 ? 0x8140 : 0xc140;
          out[i * 2] = code >> 8;
          out[i * 2 + 1] = code & 255;
        }
        text += decodeBytes(out, "shift_jis");
      }
    }
  } catch {
    return text || null;
  }
  return text;
}

function bitCount(v) {
  let c = 0;
  for (; v; v &= v - 1) c++;
  return c;
}

function readGrid(grid, d) {
  const ver = (d - 17) / 4;
  const [fa, fb] = formatSpots(d);
  const read = (spots) => spots.reduce((v, [x, y], i) => v | (grid[y * d + x] << i), 0);
  const f1 = read(fa);
  const f2 = read(fb);
  let ecl = -1;
  let mask = -1;
  let low = 99;
  for (let e = 0; e < 4; e++) {
    for (let k = 0; k < 8; k++) {
      const code = formatBits(e, k);
      const dist = Math.min(bitCount(code ^ f1), bitCount(code ^ f2));
      if (dist < low) {
        low = dist;
        ecl = e;
        mask = k;
      }
    }
  }
  if (low > 3) return null;
  if (ver >= 7) {
    const [va, vb] = versionSpots(d);
    const v1 = read(va);
    const v2 = read(vb);
    let found = 0;
    let near = 99;
    for (let v = 7; v <= 40; v++) {
      const code = versionBits(v);
      const dist = Math.min(bitCount(code ^ v1), bitCount(code ^ v2));
      if (dist < near) {
        near = dist;
        found = v;
      }
    }
    if (near <= 3 && found !== ver) return { retry: found };
  }
  const L = layout(ver);
  const test = MASKS[mask];
  const raw = Math.floor(rawModules(ver) / 8);
  const codes = new Uint8Array(raw);
  for (let i = 0; i < raw * 8; i++) {
    const k = L.order[i];
    const bit = grid[k] ^ (test(k % d, Math.floor(k / d)) ? 1 : 0);
    codes[i >>> 3] |= bit << (7 - (i & 7));
  }
  const { count, ec, shortCount, shortLen } = blockPlan(ver, ecl);
  const blocks = [];
  for (let i = 0; i < count; i++) blocks.push({ len: shortLen - ec + (i < shortCount ? 0 : 1), bytes: [] });
  let k = 0;
  for (let i = 0; i <= shortLen - ec; i++) {
    for (const b of blocks) if (i < b.len) b.bytes.push(codes[k++]);
  }
  for (let i = 0; i < ec; i++) {
    for (const b of blocks) b.bytes.push(codes[k++]);
  }
  const data = [];
  for (const b of blocks) {
    const arr = Uint8Array.from(b.bytes);
    if (!correct(arr, ec)) return null;
    for (let i = 0; i < b.len; i++) data.push(arr[i]);
  }
  const text = parse(Uint8Array.from(data), ver);
  return text === null ? null : { text, ver, ecl: LEVELS[ecl] };
}

export function toGray(image) {
  const { data, width, height } = image;
  const gray = new Uint8Array(width * height);
  for (let i = 0, j = 0; i < gray.length; i++, j += 4) {
    let v = (data[j] * 77 + data[j + 1] * 150 + data[j + 2] * 29) >> 8;
    const a = data[j + 3];
    if (a < 255) v = 255 - Math.round(((255 - v) * a) / 255);
    gray[i] = v;
  }
  return gray;
}

export function otsu(gray) {
  const hist = new Uint32Array(256);
  for (const v of gray) hist[v]++;
  const total = gray.length;
  let sum = 0;
  for (let i = 0; i < 256; i++) sum += i * hist[i];
  let sumB = 0;
  let wB = 0;
  let best = 0;
  let level = 128;
  for (let i = 0; i < 256; i++) {
    wB += hist[i];
    if (!wB) continue;
    const wF = total - wB;
    if (!wF) break;
    sumB += i * hist[i];
    const mB = sumB / wB;
    const mF = (sum - sumB) / wF;
    const between = wB * wF * (mB - mF) * (mB - mF);
    if (between > best) {
      best = between;
      level = i;
    }
  }
  return level;
}

function binarizeLocal(gray, w, h, global) {
  const S = 8;
  const bw = Math.ceil(w / S);
  const bh = Math.ceil(h / S);
  const lo = new Uint8Array(bw * bh);
  const hi = new Uint8Array(bw * bh);
  for (let by = 0; by < bh; by++) {
    for (let bx = 0; bx < bw; bx++) {
      let mn = 255;
      let mx = 0;
      const y1 = Math.min(h, by * S + S);
      const x1 = Math.min(w, bx * S + S);
      for (let y = by * S; y < y1; y++) {
        for (let x = bx * S; x < x1; x++) {
          const v = gray[y * w + x];
          if (v < mn) mn = v;
          if (v > mx) mx = v;
        }
      }
      lo[by * bw + bx] = mn;
      hi[by * bw + bx] = mx;
    }
  }
  const out = new Uint8Array(w * h);
  for (let by = 0; by < bh; by++) {
    for (let bx = 0; bx < bw; bx++) {
      let mn = 255;
      let mx = 0;
      for (let y = Math.max(0, by - 2); y <= Math.min(bh - 1, by + 2); y++) {
        for (let x = Math.max(0, bx - 2); x <= Math.min(bw - 1, bx + 2); x++) {
          if (lo[y * bw + x] < mn) mn = lo[y * bw + x];
          if (hi[y * bw + x] > mx) mx = hi[y * bw + x];
        }
      }
      const t = mx - mn >= 40 ? (mn + mx) >> 1 : global;
      const y1 = Math.min(h, by * S + S);
      const x1 = Math.min(w, bx * S + S);
      for (let y = by * S; y < y1; y++) {
        for (let x = bx * S; x < x1; x++) out[y * w + x] = gray[y * w + x] <= t ? 1 : 0;
      }
    }
  }
  return out;
}

function finderRatio(c) {
  const total = c[0] + c[1] + c[2] + c[3] + c[4];
  if (total < 7) return false;
  const ms = total / 7;
  const v = ms / 2;
  return Math.abs(ms - c[0]) < v && Math.abs(ms - c[1]) < v && Math.abs(3 * ms - c[2]) < 3 * v && Math.abs(ms - c[3]) < v && Math.abs(ms - c[4]) < v;
}

function cross(img, x, y, dx, dy, ref) {
  const { bits, w, h } = img;
  const at = (i) => {
    const px = x + i * dx;
    const py = y + i * dy;
    return px < 0 || py < 0 || px >= w || py >= h ? -1 : bits[py * w + px];
  };
  if (at(0) !== 1) return null;
  const c = [0, 0, 0, 0, 0];
  let i = 0;
  while (at(-i) === 1) {
    c[2]++;
    i++;
  }
  const back = i;
  while (at(-i) === 0) {
    c[1]++;
    i++;
  }
  if (at(-i) !== 1) return null;
  while (at(-i) === 1) {
    c[0]++;
    i++;
  }
  let j = 1;
  while (at(j) === 1) {
    c[2]++;
    j++;
  }
  const fwd = j - 1;
  while (at(j) === 0) {
    c[3]++;
    j++;
  }
  if (at(j) !== 1) return null;
  while (at(j) === 1) {
    c[4]++;
    j++;
  }
  if (!finderRatio(c)) return null;
  const total = c[0] + c[1] + c[2] + c[3] + c[4];
  if (5 * Math.abs(total - ref) >= 2 * ref) return null;
  return { at: (dx ? x : y) - back + 1 + (back + fwd) / 2, total };
}

function findFinders(img) {
  const { bits, w, h } = img;
  const found = [];
  const step = h > 900 ? 2 : 1;
  const starts = new Int32Array(w + 1);
  const lens = new Int32Array(w + 1);
  const cols = new Uint8Array(w + 1);
  for (let y = 0; y < h; y += step) {
    let n = 0;
    const row = y * w;
    for (let x = 0; x < w; x++) {
      const c = bits[row + x];
      if (n && cols[n - 1] === c) lens[n - 1]++;
      else {
        starts[n] = x;
        lens[n] = 1;
        cols[n] = c;
        n++;
      }
    }
    for (let i = 0; i + 4 < n; i++) {
      if (!cols[i]) continue;
      const c = [lens[i], lens[i + 1], lens[i + 2], lens[i + 3], lens[i + 4]];
      if (!finderRatio(c)) continue;
      const total = c[0] + c[1] + c[2] + c[3] + c[4];
      const cx = Math.floor(starts[i + 2] + lens[i + 2] / 2);
      const v = cross(img, cx, y, 0, 1, total);
      if (!v) continue;
      const hz = cross(img, cx, Math.floor(v.at), 1, 0, total);
      if (!hz) continue;
      const v2 = cross(img, Math.floor(hz.at), Math.floor(v.at), 0, 1, total);
      if (!v2) continue;
      const fx = hz.at;
      const fy = v2.at;
      const ms = (hz.total + v2.total) / 14;
      const near = found.find((f) => Math.abs(f.x - fx) <= ms && Math.abs(f.y - fy) <= ms && Math.abs(f.ms - ms) <= Math.max(1, f.ms * 0.5));
      if (near) {
        near.x = (near.x * near.n + fx) / (near.n + 1);
        near.y = (near.y * near.n + fy) / (near.n + 1);
        near.ms = (near.ms * near.n + ms) / (near.n + 1);
        near.n++;
      } else {
        found.push({ x: fx, y: fy, ms, n: 1 });
      }
    }
  }
  return found;
}

function edgeRun(img, x, y, ux, uy) {
  const { bits, w, h } = img;
  let state = 0;
  for (let t = 0; t < 4000; t++) {
    const px = Math.floor(x + ux * t);
    const py = Math.floor(y + uy * t);
    if (px < 0 || py < 0 || px >= w || py >= h) return state === 2 ? t : NaN;
    const c = bits[py * w + px];
    if (state === 0 && !c) state = 1;
    else if (state === 1 && c) state = 2;
    else if (state === 2 && !c) return t;
  }
  return NaN;
}

function moduleAlong(img, a, b) {
  const len = Math.hypot(b.x - a.x, b.y - a.y);
  const ux = (b.x - a.x) / len;
  const uy = (b.y - a.y) / len;
  return (edgeRun(img, a.x, a.y, ux, uy) + edgeRun(img, a.x, a.y, -ux, -uy)) / 7;
}

function averageOf(list, fallback) {
  const good = list.filter(Number.isFinite);
  return good.length ? good.reduce((s, v) => s + v, 0) / good.length : fallback;
}

function crossAlign(img, x, y, dx, dy, ms) {
  const { bits, w, h } = img;
  const at = (i) => {
    const px = x + i * dx;
    const py = y + i * dy;
    return px < 0 || py < 0 || px >= w || py >= h ? -1 : bits[py * w + px];
  };
  if (at(0) !== 1) return null;
  const near = (n) => Math.abs(n - ms) < ms * 0.7;
  let mid = 0;
  let i = 0;
  while (at(-i) === 1) {
    mid++;
    i++;
  }
  const back = i;
  let left = 0;
  while (at(-i) === 0) {
    left++;
    i++;
  }
  if (at(-i) !== 1) return null;
  let j = 1;
  while (at(j) === 1) {
    mid++;
    j++;
  }
  const fwd = j - 1;
  let right = 0;
  while (at(j) === 0) {
    right++;
    j++;
  }
  if (at(j) !== 1) return null;
  if (!near(mid) || !near(left) || !near(right)) return null;
  return (dx ? x : y) - back + 1 + (back + fwd) / 2;
}

function findAlign(img, ex, ey, ms) {
  const { bits, w, h } = img;
  for (const f of [4, 8, 14]) {
    const r = Math.ceil(f * ms);
    const x0 = Math.max(0, Math.floor(ex - r));
    const x1 = Math.min(w - 1, Math.ceil(ex + r));
    const y0 = Math.max(0, Math.floor(ey - r));
    const y1 = Math.min(h - 1, Math.ceil(ey + r));
    if (x1 - x0 < 3 * ms || y1 - y0 < 3 * ms) continue;
    let best = null;
    let bestD = Infinity;
    for (let y = y0; y <= y1; y++) {
      let start = x0;
      const runs = [];
      for (let x = x0 + 1; x <= x1 + 1; x++) {
        if (x > x1 || bits[y * w + x] !== bits[y * w + x - 1]) {
          runs.push([start, x - start, bits[y * w + start]]);
          start = x;
        }
      }
      for (let i = 1; i + 2 < runs.length; i++) {
        if (runs[i][2] !== 0) continue;
        const near = (n) => Math.abs(n - ms) < ms * 0.7;
        if (!near(runs[i][1]) || !near(runs[i + 1][1]) || !near(runs[i + 2][1])) continue;
        const cx = Math.floor(runs[i + 1][0] + runs[i + 1][1] / 2);
        const cy = crossAlign(img, cx, y, 0, 1, ms);
        if (cy === null) continue;
        const cx2 = crossAlign(img, cx, Math.floor(cy), 1, 0, ms);
        if (cx2 === null) continue;
        const dist = Math.hypot(cx2 - ex, cy - ey);
        if (dist < bestD) {
          bestD = dist;
          best = { x: cx2, y: cy };
        }
      }
    }
    if (best) return best;
  }
  return null;
}

function squareToQuad(p) {
  const [x0, y0, x1, y1, x2, y2, x3, y3] = p;
  const dx3 = x0 - x1 + x2 - x3;
  const dy3 = y0 - y1 + y2 - y3;
  if (Math.abs(dx3) < 1e-9 && Math.abs(dy3) < 1e-9) return [x1 - x0, x3 - x0, x0, y1 - y0, y3 - y0, y0, 0, 0, 1];
  const dx1 = x1 - x2;
  const dx2 = x3 - x2;
  const dy1 = y1 - y2;
  const dy2 = y3 - y2;
  const den = dx1 * dy2 - dx2 * dy1;
  const g = (dx3 * dy2 - dx2 * dy3) / den;
  const k = (dx1 * dy3 - dx3 * dy1) / den;
  return [x1 - x0 + g * x1, x3 - x0 + k * x3, x0, y1 - y0 + g * y1, y3 - y0 + k * y3, y0, g, k, 1];
}

function adjugate(m) {
  const [a, b, c, d, e, f, g, h, i] = m;
  return [e * i - f * h, c * h - b * i, b * f - c * e, f * g - d * i, a * i - c * g, c * d - a * f, d * h - e * g, b * g - a * h, a * e - b * d];
}

function times(p, q) {
  const out = new Array(9).fill(0);
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      for (let k = 0; k < 3; k++) out[r * 3 + c] += p[r * 3 + k] * q[k * 3 + c];
    }
  }
  return out;
}

function sample(img, H, d) {
  const { bits, w, h } = img;
  const grid = new Uint8Array(d * d);
  for (let y = 0; y < d; y++) {
    for (let x = 0; x < d; x++) {
      const u = x + 0.5;
      const v = y + 0.5;
      const z = H[6] * u + H[7] * v + H[8];
      const px = Math.floor((H[0] * u + H[1] * v + H[2]) / z);
      const py = Math.floor((H[3] * u + H[4] * v + H[5]) / z);
      grid[y * d + x] = px >= 0 && py >= 0 && px < w && py < h ? bits[py * w + px] : 0;
    }
  }
  return grid;
}

function atDim(img, tl, tr, bl, ms, d) {
  const ver = (d - 17) / 4;
  const bx = tr.x + bl.x - tl.x;
  const by = tr.y + bl.y - tl.y;
  const corners = [];
  if (ver >= 2) {
    const k = 1 - 3 / (d - 7);
    const al = findAlign(img, tl.x + k * (bx - tl.x), tl.y + k * (by - tl.y), ms);
    if (al) corners.push([al.x, al.y, d - 6.5]);
  }
  corners.push([bx, by, d - 3.5]);
  for (const [qx, qy, qm] of corners) {
    const from = squareToQuad([3.5, 3.5, d - 3.5, 3.5, qm, qm, 3.5, d - 3.5]);
    const to = squareToQuad([tl.x, tl.y, tr.x, tr.y, qx, qy, bl.x, bl.y]);
    const H = times(to, adjugate(from));
    const result = readGrid(sample(img, H, d), d);
    if (result) return result;
  }
  return null;
}

function tryTriple(img, tl, tr, bl) {
  const top = averageOf([moduleAlong(img, tl, tr), moduleAlong(img, tr, tl)], (tl.ms + tr.ms) / 2);
  const side = averageOf([moduleAlong(img, tl, bl), moduleAlong(img, bl, tl)], (tl.ms + bl.ms) / 2);
  const ms = (top + side) / 2;
  const est = Math.round((Math.hypot(tr.x - tl.x, tr.y - tl.y) / top + Math.hypot(bl.x - tl.x, bl.y - tl.y) / side) / 2) + 7;
  const r = est & 3;
  const dims = r === 1 ? [est, est + 4, est - 4] : r === 0 ? [est + 1, est - 3] : r === 2 ? [est - 1, est + 3] : [est - 2, est + 2];
  const seen = new Set();
  for (const first of dims) {
    let d = first;
    for (let hop = 0; hop < 2; hop++) {
      if (d < 21 || d > 177 || seen.has(d)) break;
      seen.add(d);
      const result = atDim(img, tl, tr, bl, ms, d);
      if (!result) break;
      if (result.retry) {
        d = result.retry * 4 + 17;
        continue;
      }
      return result;
    }
  }
  return null;
}

function detect(img) {
  const found = findFinders(img).sort((a, b) => b.n - a.n).slice(0, 12);
  if (found.length < 3) return null;
  const triples = [];
  for (let i = 0; i < found.length; i++) {
    for (let j = i + 1; j < found.length; j++) {
      for (let k = j + 1; k < found.length; k++) {
        const t = [found[i], found[j], found[k]];
        const sizes = t.map((f) => f.ms);
        const spread = Math.max(...sizes) / Math.min(...sizes);
        if (spread > 1.7) continue;
        const mean = (sizes[0] + sizes[1] + sizes[2]) / 3;
        const dd = [[0, 1], [1, 2], [0, 2]].map(([p, q]) => Math.hypot(t[p].x - t[q].x, t[p].y - t[q].y)).sort((p, q) => p - q);
        if (dd[0] < 10 * mean) continue;
        const score = Math.abs(dd[2] * dd[2] - dd[0] * dd[0] - dd[1] * dd[1]) / (dd[2] * dd[2]) + Math.abs(dd[0] - dd[1]) / dd[1] + (spread - 1) / 2;
        if (score < 0.9) triples.push({ t, score });
      }
    }
  }
  triples.sort((a, b) => a.score - b.score);
  for (const { t } of triples.slice(0, 6)) {
    const d01 = Math.hypot(t[0].x - t[1].x, t[0].y - t[1].y);
    const d12 = Math.hypot(t[1].x - t[2].x, t[1].y - t[2].y);
    const d02 = Math.hypot(t[0].x - t[2].x, t[0].y - t[2].y);
    let a;
    let b;
    let c;
    if (d12 >= d01 && d12 >= d02) [b, a, c] = [t[0], t[1], t[2]];
    else if (d02 >= d01 && d02 >= d12) [b, a, c] = [t[1], t[0], t[2]];
    else [b, a, c] = [t[2], t[0], t[1]];
    if ((c.x - b.x) * (a.y - b.y) - (c.y - b.y) * (a.x - b.x) < 0) [a, c] = [c, a];
    const result = tryTriple(img, b, c, a);
    if (result) return result;
  }
  return null;
}

export function decodeImage(image) {
  const w = image.width;
  const h = image.height;
  const gray = toGray(image);
  const level = otsu(gray);
  const local = binarizeLocal(gray, w, h, level);
  const global = new Uint8Array(gray.length);
  for (let i = 0; i < gray.length; i++) global[i] = gray[i] <= level ? 1 : 0;
  for (const bits of [local, global]) {
    const plain = detect({ bits, w, h });
    if (plain) return plain;
    const flipped = bits.map((v) => v ^ 1);
    const inverse = detect({ bits: flipped, w, h });
    if (inverse) return inverse;
  }
  return null;
}

export const SHAPES = ["square", "rounded", "dots"];
export const EYES = ["square", "rounded", "circle"];

const num = (v) => Number(v.toFixed(3));

export function logoBox(code, frac) {
  if (!frac) return null;
  const n = code.size;
  let span = Math.max(3, Math.round(n * frac));
  if ((n - span) % 2) span += 1;
  const start = (n - span) / 2;
  return { x: start, y: start, span };
}

function dark(code, hole, x, y) {
  if (x < 0 || y < 0 || x >= code.size || y >= code.size) return false;
  if (hole && x >= hole.x && x < hole.x + hole.span && y >= hole.y && y < hole.y + hole.span) return false;
  return code.modules[y * code.size + x] === 1;
}

function inFinder(n, x, y) {
  return (x < 7 && y < 7) || (x >= n - 7 && y < 7) || (x < 7 && y >= n - 7);
}

export function separateEyes(style) {
  return (style.eye || "square") !== "square" || style.shape === "dots";
}

export function roundRect(x, y, w, h, r) {
  if (!r) return `M${x} ${y}h${w}v${h}h-${w}z`;
  return `M${x + r} ${y}H${x + w - r}a${r} ${r} 0 0 1 ${r} ${r}V${y + h - r}a${r} ${r} 0 0 1 -${r} ${r}H${x + r}a${r} ${r} 0 0 1 -${r} -${r}V${y + r}a${r} ${r} 0 0 1 ${r} -${r}z`;
}

export function circlePath(cx, cy, r) {
  return `M${cx - r} ${cy}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 -${2 * r} 0z`;
}

export function modulePath(code, style, hole) {
  const m = style.margin || 0;
  const parts = [];
  const n = code.size;
  const sep = separateEyes(style);
  const on = (x, y) => dark(code, hole, x, y) && !(sep && inFinder(n, x, y));
  const shape = style.shape || "square";
  if (shape === "dots") {
    const r = 0.43;
    for (let y = 0; y < n; y++) {
      for (let x = 0; x < n; x++) {
        if (!on(x, y)) continue;
        const cx = x + m + 0.5;
        const cy = y + m + 0.5;
        parts.push(`M${num(cx - r)} ${cy}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 -${2 * r} 0z`);
      }
    }
    return parts.join("");
  }
  if (shape !== "rounded") {
    for (let y = 0; y < n; y++) {
      for (let x = 0; x < n; x++) {
        if (!on(x, y)) continue;
        let len = 1;
        while (on(x + len, y)) len++;
        parts.push(`M${x + m} ${y + m}h${len}v1h-${len}z`);
        x += len - 1;
      }
    }
    return parts.join("");
  }
  const r = 0.5;
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      if (!on(x, y)) continue;
      const up = on(x, y - 1);
      const down = on(x, y + 1);
      const left = on(x - 1, y);
      const right = on(x + 1, y);
      const tl = !up && !left ? r : 0;
      const tr = !up && !right ? r : 0;
      const br = !down && !right ? r : 0;
      const bl = !down && !left ? r : 0;
      const X = x + m;
      const Y = y + m;
      let d = `M${X + tl} ${Y}H${X + 1 - tr}`;
      if (tr) d += `a${r} ${r} 0 0 1 ${r} ${r}`;
      d += `V${Y + 1 - br}`;
      if (br) d += `a${r} ${r} 0 0 1 -${r} ${r}`;
      d += `H${X + bl}`;
      if (bl) d += `a${r} ${r} 0 0 1 -${r} -${r}`;
      d += `V${Y + tl}`;
      if (tl) d += `a${r} ${r} 0 0 1 ${r} -${r}`;
      parts.push(`${d}z`);
    }
  }
  return parts.join("");
}

export function eyePath(code, style) {
  if (!separateEyes(style)) return "";
  const n = code.size;
  const m = style.margin || 0;
  const parts = [];
  for (const [fx, fy] of [[0, 0], [n - 7, 0], [0, n - 7]]) {
    const x = fx + m;
    const y = fy + m;
    if (style.eye === "circle") parts.push(circlePath(x + 3.5, y + 3.5, 3.5), circlePath(x + 3.5, y + 3.5, 2.5), circlePath(x + 3.5, y + 3.5, 1.5));
    else if (style.eye === "rounded") parts.push(roundRect(x, y, 7, 7, 2), roundRect(x + 1, y + 1, 5, 5, 1.3), roundRect(x + 2, y + 2, 3, 3, 0.9));
    else parts.push(roundRect(x, y, 7, 7, 0), roundRect(x + 1, y + 1, 5, 5, 0), roundRect(x + 2, y + 2, 3, 3, 0));
  }
  return parts.join("");
}

export function logoRect(box, margin, ratio) {
  const inner = box.span - 0.8;
  const r = ratio > 0 ? ratio : 1;
  const w = r >= 1 ? inner : inner * r;
  const h = r >= 1 ? inner / r : inner;
  return { x: num(box.x + margin + (box.span - w) / 2), y: num(box.y + margin + (box.span - h) / 2), w: num(w), h: num(h) };
}

export function qrScene(code, style = {}) {
  const margin = style.margin || 0;
  const total = code.size + margin * 2;
  const logo = style.logo && style.logo.frac ? style.logo : null;
  const hole = logo ? logoBox(code, logo.frac) : null;
  const fg = style.fg || "#000000";
  const items = [];
  if (!style.clear) items.push({ type: "rect", x: 0, y: 0, w: total, h: total, fill: style.bg || "#ffffff" });
  items.push({ type: "path", d: modulePath(code, style, hole), fill: fg });
  const eyes = eyePath(code, style);
  if (eyes) items.push({ type: "path", d: eyes, fill: fg, rule: "evenodd" });
  if (hole) items.push({ type: "image", ...logoRect(hole, margin, logo.ratio), ref: "logo" });
  return { width: total, height: total, items, crisp: (style.shape || "square") === "square" && !separateEyes(style) };
}

const escXml = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export function sceneSvg(scene, { width, height, images = {} } = {}) {
  const w = width === undefined ? scene.width : width;
  const h = height === undefined ? (typeof w === "number" ? num((w * scene.height) / scene.width) : scene.height) : height;
  const parts = [`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${num(scene.width)} ${num(scene.height)}" width="${w}" height="${h}"${scene.crisp ? ' shape-rendering="crispEdges"' : ""}>`];
  for (const it of scene.items) {
    if (it.type === "rect") parts.push(`<rect x="${num(it.x)}" y="${num(it.y)}" width="${num(it.w)}" height="${num(it.h)}" fill="${escXml(it.fill)}"/>`);
    else if (it.type === "path") parts.push(`<path fill="${escXml(it.fill)}"${it.rule === "evenodd" ? ' fill-rule="evenodd"' : ""} d="${it.d}"/>`);
    else if (it.type === "stroke") parts.push(`<path fill="none" stroke="${escXml(it.stroke)}" stroke-width="${num(it.width)}" d="${it.d}"/>`);
    else if (it.type === "text") parts.push(`<text x="${num(it.x)}" y="${num(it.y)}" fill="${escXml(it.fill)}" font-family="Helvetica, Arial, sans-serif" font-weight="${it.bold ? 700 : 400}" font-size="${num(it.size)}" text-anchor="${it.anchor === "start" ? "start" : "middle"}" dominant-baseline="central">${escXml(it.text)}</text>`);
    else if (it.type === "image" && images[it.ref]) parts.push(`<image href="${escXml(images[it.ref])}" x="${it.x}" y="${it.y}" width="${it.w}" height="${it.h}" preserveAspectRatio="xMidYMid meet"/>`);
  }
  parts.push("</svg>");
  return parts.join("") + "\n";
}

export function slugName(text, max = 40) {
  return String(text)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, max)
    .replace(/-+$/, "");
}
