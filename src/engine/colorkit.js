const NAMED_RAW =
  "aliceblue:f0f8ff,antiquewhite:faebd7,aqua:00ffff,aquamarine:7fffd4,azure:f0ffff,beige:f5f5dc,bisque:ffe4c4,black:000000,blanchedalmond:ffebcd,blue:0000ff," +
  "blueviolet:8a2be2,brown:a52a2a,burlywood:deb887,cadetblue:5f9ea0,chartreuse:7fff00,chocolate:d2691e,coral:ff7f50,cornflowerblue:6495ed,cornsilk:fff8dc," +
  "crimson:dc143c,cyan:00ffff,darkblue:00008b,darkcyan:008b8b,darkgoldenrod:b8860b,darkgray:a9a9a9,darkgreen:006400,darkgrey:a9a9a9,darkkhaki:bdb76b," +
  "darkmagenta:8b008b,darkolivegreen:556b2f,darkorange:ff8c00,darkorchid:9932cc,darkred:8b0000,darksalmon:e9967a,darkseagreen:8fbc8f,darkslateblue:483d8b," +
  "darkslategray:2f4f4f,darkslategrey:2f4f4f,darkturquoise:00ced1,darkviolet:9400d3,deeppink:ff1493,deepskyblue:00bfff,dimgray:696969,dimgrey:696969," +
  "dodgerblue:1e90ff,firebrick:b22222,floralwhite:fffaf0,forestgreen:228b22,fuchsia:ff00ff,gainsboro:dcdcdc,ghostwhite:f8f8ff,gold:ffd700,goldenrod:daa520," +
  "gray:808080,green:008000,greenyellow:adff2f,grey:808080,honeydew:f0fff0,hotpink:ff69b4,indianred:cd5c5c,indigo:4b0082,ivory:fffff0,khaki:f0e68c," +
  "lavender:e6e6fa,lavenderblush:fff0f5,lawngreen:7cfc00,lemonchiffon:fffacd,lightblue:add8e6,lightcoral:f08080,lightcyan:e0ffff,lightgoldenrodyellow:fafad2," +
  "lightgray:d3d3d3,lightgreen:90ee90,lightgrey:d3d3d3,lightpink:ffb6c1,lightsalmon:ffa07a,lightseagreen:20b2aa,lightskyblue:87cefa,lightslategray:778899," +
  "lightslategrey:778899,lightsteelblue:b0c4de,lightyellow:ffffe0,lime:00ff00,limegreen:32cd32,linen:faf0e6,magenta:ff00ff,maroon:800000," +
  "mediumaquamarine:66cdaa,mediumblue:0000cd,mediumorchid:ba55d3,mediumpurple:9370db,mediumseagreen:3cb371,mediumslateblue:7b68ee,mediumspringgreen:00fa9a," +
  "mediumturquoise:48d1cc,mediumvioletred:c71585,midnightblue:191970,mintcream:f5fffa,mistyrose:ffe4e1,moccasin:ffe4b5,navajowhite:ffdead,navy:000080," +
  "oldlace:fdf5e6,olive:808000,olivedrab:6b8e23,orange:ffa500,orangered:ff4500,orchid:da70d6,palegoldenrod:eee8aa,palegreen:98fb98,paleturquoise:afeeee," +
  "palevioletred:db7093,papayawhip:ffefd5,peachpuff:ffdab9,peru:cd853f,pink:ffc0cb,plum:dda0dd,powderblue:b0e0e6,purple:800080,rebeccapurple:663399," +
  "red:ff0000,rosybrown:bc8f8f,royalblue:4169e1,saddlebrown:8b4513,salmon:fa8072,sandybrown:f4a460,seagreen:2e8b57,seashell:fff5ee,sienna:a0522d," +
  "silver:c0c0c0,skyblue:87ceeb,slateblue:6a5acd,slategray:708090,slategrey:708090,snow:fffafa,springgreen:00ff7f,steelblue:4682b4,tan:d2b48c,teal:008080," +
  "thistle:d8bfd8,tomato:ff6347,turquoise:40e0d0,violet:ee82ee,wheat:f5deb3,white:ffffff,whitesmoke:f5f5f5,yellow:ffff00,yellowgreen:9acd32";

export const NAMED_COLORS = Object.fromEntries(NAMED_RAW.split(",").map((p) => p.split(":")));

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const round = (v, d = 0) => {
  const f = Math.pow(10, d);
  const r = Math.round(v * f) / f;
  return Object.is(r, -0) ? 0 : r;
};

function hexToRgb(h) {
  let s = h.replace(/^#/, "");
  if (s.length === 3 || s.length === 4) s = [...s].map((c) => c + c).join("");
  const n = (i) => parseInt(s.slice(i, i + 2), 16);
  return { r: n(0), g: n(2), b: n(4), a: s.length === 8 ? round(n(6) / 255, 3) : 1 };
}

function angle(s) {
  const m = /^(-?[\d.]+(?:e-?\d+)?)(deg|rad|grad|turn)?$/.exec(s);
  if (!m) throw new Error("Can't read the hue " + s);
  const v = +m[1];
  const deg = m[2] === "rad" ? (v * 180) / Math.PI : m[2] === "grad" ? v * 0.9 : m[2] === "turn" ? v * 360 : v;
  return ((deg % 360) + 360) % 360;
}

function num(s, scale100 = 1) {
  if (s === "none") return 0;
  const m = /^(-?[\d.]+(?:e-?\d+)?)(%)?$/.exec(s);
  if (!m || Number.isNaN(+m[1])) throw new Error("Can't read the value " + s);
  return m[2] ? (+m[1] / 100) * scale100 : +m[1];
}

function alpha(s) {
  if (s === undefined) return 1;
  return clamp(num(s, 1), 0, 1);
}

export function hslToRgb(h, s, l) {
  s = clamp(s, 0, 100) / 100;
  l = clamp(l, 0, 100) / 100;
  const k = (n) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1));
  return { r: f(0) * 255, g: f(8) * 255, b: f(4) * 255 };
}

export function rgbToHsl(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;
  if (d > 1e-9) {
    s = d / (1 - Math.abs(2 * l - 1));
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  return { h, s: s * 100, l: l * 100 };
}

export function hsvToRgb(h, s, v) {
  s = clamp(s, 0, 100) / 100;
  v = clamp(v, 0, 100) / 100;
  const f = (n) => {
    const k = (n + h / 60) % 6;
    return v - v * s * Math.max(0, Math.min(k, 4 - k, 1));
  };
  return { r: f(5) * 255, g: f(3) * 255, b: f(1) * 255 };
}

export function rgbToHsv(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const d = max - Math.min(r, g, b);
  let h = 0;
  if (d > 1e-9) {
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  return { h, s: max === 0 ? 0 : (d / max) * 100, v: max * 100 };
}

const toLinear = (c) => {
  c /= 255;
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
};
const fromLinear = (c) => 255 * (c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055);

export function rgbToOklab(r, g, b) {
  const lr = toLinear(r);
  const lg = toLinear(g);
  const lb = toLinear(b);
  const l = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb);
  const m = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb);
  const s = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb);
  return { L: 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s, a: 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s, b: 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s };
}

function oklabToLinear(L, a, b) {
  const l = Math.pow(L + 0.3963377774 * a + 0.2158037573 * b, 3);
  const m = Math.pow(L - 0.1055613458 * a - 0.0638541728 * b, 3);
  const s = Math.pow(L - 0.0894841775 * a - 1.291485548 * b, 3);
  return [4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s, -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s, -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s];
}

export function oklabToRgb(L, a, b) {
  const [r, g, bl] = oklabToLinear(L, a, b);
  return { r: fromLinear(r), g: fromLinear(g), b: fromLinear(bl) };
}

export function rgbToOklch(r, g, b) {
  const lab = rgbToOklab(r, g, b);
  const C = Math.sqrt(lab.a * lab.a + lab.b * lab.b);
  let H = (Math.atan2(lab.b, lab.a) * 180) / Math.PI;
  if (H < 0) H += 360;
  return { L: lab.L, C: C < 1e-4 ? 0 : C, H: C < 1e-4 ? 0 : H };
}

function inGamut(lin) {
  return lin.every((v) => v >= -1e-4 && v <= 1 + 1e-4);
}

export function oklchToRgb(L, C, H) {
  const lab = (c) => [L, c * Math.cos((H * Math.PI) / 180), c * Math.sin((H * Math.PI) / 180)];
  let lin = oklabToLinear(...lab(C));
  let clipped = false;
  if (!inGamut(lin)) {
    clipped = true;
    let lo = 0;
    let hi = C;
    for (let i = 0; i < 30; i++) {
      const mid = (lo + hi) / 2;
      if (inGamut(oklabToLinear(...lab(mid)))) lo = mid;
      else hi = mid;
    }
    lin = oklabToLinear(...lab(lo));
  }
  const [r, g, b] = lin.map((v) => clamp(fromLinear(clamp(v, 0, 1)), 0, 255));
  return { r, g, b, clipped };
}

export function parseColor(input) {
  const s = String(input).trim().toLowerCase().replace(/;$/, "");
  if (!s) throw new Error("Type a colour, like #3b82f6 or rgb(59 130 246)");
  if (s === "transparent") return { r: 0, g: 0, b: 0, a: 0 };
  if (NAMED_COLORS[s]) return hexToRgb(NAMED_COLORS[s]);
  if (/^#?([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/.test(s)) return hexToRgb(s);
  if (/^0x[0-9a-f]{6}$/.test(s)) return hexToRgb(s.slice(2));
  let m = /^(rgba?|hsla?|hsv|hsva|hsb|oklch|oklab)\s*\(\s*(.*?)\s*\)$/.exec(s);
  if (!m && /^-?[\d.]+%?(\s*,\s*|\s+)-?[\d.]+%?(\s*,\s*|\s+)-?[\d.]+%?$/.test(s)) m = [s, "rgb", s];
  if (!m) throw new Error("Not a colour this tool understands. Try #hex, rgb(), hsl(), hsv(), oklch() or a CSS name");
  const fn = m[1].replace(/a$/, "") === "hsv" || m[1] === "hsb" ? "hsv" : m[1].replace(/a$/, "");
  const [main, slash] = m[2].split("/").map((x) => x.trim());
  let parts = main.split(/\s*,\s*|\s+/).filter(Boolean);
  let a = slash;
  if (parts.length === 4 && a === undefined) a = parts.pop();
  if (parts.length !== 3) throw new Error(fn + "() needs three values" + (fn === "rgb" ? ", like rgb(59, 130, 246)" : ""));
  let rgb;
  if (fn === "rgb") rgb = { r: clamp(num(parts[0], 255), 0, 255), g: clamp(num(parts[1], 255), 0, 255), b: clamp(num(parts[2], 255), 0, 255) };
  else if (fn === "hsl") rgb = hslToRgb(angle(parts[0]), parseFloat(parts[1]), parseFloat(parts[2]));
  else if (fn === "hsv") rgb = hsvToRgb(angle(parts[0]), parseFloat(parts[1]), parseFloat(parts[2]));
  else if (fn === "oklch") {
    let L = num(parts[0], 1);
    if (!parts[0].endsWith("%") && L > 1) L /= 100;
    const C = parts[1].endsWith("%") ? num(parts[1], 0.4) : num(parts[1]);
    rgb = oklchToRgb(clamp(L, 0, 1), Math.max(0, C), angle(parts[2] === "none" ? "0" : parts[2]));
  } else {
    let L = num(parts[0], 1);
    if (!parts[0].endsWith("%") && L > 1) L /= 100;
    const A = parts[1].endsWith("%") ? num(parts[1], 0.4) : num(parts[1]);
    const B = parts[2].endsWith("%") ? num(parts[2], 0.4) : num(parts[2]);
    const o = oklabToRgb(L, A, B);
    rgb = { r: clamp(o.r, 0, 255), g: clamp(o.g, 0, 255), b: clamp(o.b, 0, 255) };
  }
  for (const k of ["r", "g", "b"]) if (Number.isNaN(rgb[k])) throw new Error("Can't read " + input);
  return { r: rgb.r, g: rgb.g, b: rgb.b, a: alpha(a), clipped: rgb.clipped || undefined };
}

const hex2 = (v) => Math.round(clamp(v, 0, 255)).toString(16).padStart(2, "0");

export function toHex(c) {
  return "#" + hex2(c.r) + hex2(c.g) + hex2(c.b) + (c.a !== undefined && c.a < 1 ? hex2(c.a * 255) : "");
}

const alphaPart = (c, sep) => (c.a !== undefined && c.a < 1 ? sep + round(c.a, 3) : "");

export function formatColor(c, fmt) {
  const R = Math.round(clamp(c.r, 0, 255));
  const G = Math.round(clamp(c.g, 0, 255));
  const B = Math.round(clamp(c.b, 0, 255));
  if (fmt === "hex") return toHex(c);
  if (fmt === "rgb") return c.a !== undefined && c.a < 1 ? "rgba(" + R + ", " + G + ", " + B + ", " + round(c.a, 3) + ")" : "rgb(" + R + ", " + G + ", " + B + ")";
  if (fmt === "hsl") {
    const h = rgbToHsl(c.r, c.g, c.b);
    const body = round(h.h, 1) + ", " + round(h.s, 1) + "%, " + round(h.l, 1) + "%";
    return c.a !== undefined && c.a < 1 ? "hsla(" + body + ", " + round(c.a, 3) + ")" : "hsl(" + body + ")";
  }
  if (fmt === "hsv") {
    const h = rgbToHsv(c.r, c.g, c.b);
    return "hsv(" + round(h.h, 1) + ", " + round(h.s, 1) + "%, " + round(h.v, 1) + "%" + alphaPart(c, ", ") + ")";
  }
  if (fmt === "oklch") {
    const o = rgbToOklch(c.r, c.g, c.b);
    return "oklch(" + round(o.L * 100, 2) + "% " + round(o.C, 4) + " " + round(o.H, 2) + alphaPart(c, " / ") + ")";
  }
  if (fmt === "name") {
    const n = nearestName(c);
    return n.exact ? n.name : "";
  }
  throw new Error("Unknown format " + fmt);
}

export function nearestName(c) {
  const lab = rgbToOklab(c.r, c.g, c.b);
  let best = null;
  for (const [name, hex] of Object.entries(NAMED_COLORS)) {
    const o = hexToRgb(hex);
    const l2 = rgbToOklab(o.r, o.g, o.b);
    const d = Math.hypot(lab.L - l2.L, lab.a - l2.a, lab.b - l2.b);
    if (!best || d < best.d) best = { name, hex: "#" + hex, d };
  }
  const exact = toHex({ ...c, a: 1 }) === best.hex;
  return { name: best.name, hex: best.hex, exact, distance: best.d };
}

export function luminance(c) {
  return 0.2126 * toLinear(c.r) + 0.7152 * toLinear(c.g) + 0.0722 * toLinear(c.b);
}

export function blend(fg, bg) {
  const a = fg.a === undefined ? 1 : fg.a;
  return { r: fg.r * a + bg.r * (1 - a), g: fg.g * a + bg.g * (1 - a), b: fg.b * a + bg.b * (1 - a), a: 1 };
}

export function contrastRatio(fg, bg) {
  const base = bg.a !== undefined && bg.a < 1 ? blend(bg, { r: 255, g: 255, b: 255 }) : bg;
  const top = fg.a !== undefined && fg.a < 1 ? blend(fg, base) : fg;
  const l1 = luminance(top);
  const l2 = luminance(base);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

export function wcag(ratio) {
  return { aaNormal: ratio >= 4.5, aaLarge: ratio >= 3, aaaNormal: ratio >= 7, aaaLarge: ratio >= 4.5, ui: ratio >= 3 };
}

export function ratioText(ratio) {
  return (Math.floor(ratio * 100) / 100).toFixed(2) + ":1";
}

export function readableOn(c) {
  return contrastRatio({ r: 0, g: 0, b: 0 }, c) >= contrastRatio({ r: 255, g: 255, b: 255 }, c) ? "#000000" : "#ffffff";
}

export function mix(c1, c2, t) {
  const a = rgbToOklab(c1.r, c1.g, c1.b);
  const b = rgbToOklab(c2.r, c2.g, c2.b);
  const o = oklabToRgb(a.L + (b.L - a.L) * t, a.a + (b.a - a.a) * t, a.b + (b.b - a.b) * t);
  return { r: clamp(o.r, 0, 255), g: clamp(o.g, 0, 255), b: clamp(o.b, 0, 255), a: 1 };
}

export function tintsAndShades(c, steps = 5) {
  const white = { r: 255, g: 255, b: 255 };
  const black = { r: 0, g: 0, b: 0 };
  const tints = [];
  const shades = [];
  for (let i = 1; i <= steps; i++) {
    tints.push(toHex(mix(c, white, i / (steps + 1))));
    shades.push(toHex(mix(c, black, i / (steps + 1))));
  }
  return { tints, shades };
}

export function suggestContrast(fg, bg, target = 4.5) {
  if (contrastRatio(fg, bg) >= target) return null;
  const o = rgbToOklch(fg.r, fg.g, fg.b);
  const tryL = (L) => {
    const rgb = oklchToRgb(L, o.C, o.H);
    return { ...rgb, a: 1 };
  };
  const found = [];
  for (const dir of [-1, 1]) {
    const end = dir < 0 ? 0 : 1;
    if (contrastRatio(tryL(end), bg) < target) continue;
    let lo = o.L;
    let hi = end;
    for (let i = 0; i < 30; i++) {
      const mid = (lo + hi) / 2;
      if (contrastRatio(tryL(mid), bg) >= target) hi = mid;
      else lo = mid;
    }
    found.push({ c: tryL(hi), d: Math.abs(hi - o.L) });
  }
  if (!found.length) return null;
  found.sort((a, b) => a.d - b.d);
  let hex = toHex(found[0].c);
  let c = parseColor(hex);
  if (contrastRatio(c, bg) < target) {
    const o2 = rgbToOklch(c.r, c.g, c.b);
    const step = o2.L < rgbToOklch(bg.r, bg.g, bg.b).L ? -0.005 : 0.005;
    for (let i = 0; i < 20 && contrastRatio(c, bg) < target; i++) {
      c = { ...oklchToRgb(clamp(o2.L + step * (i + 1), 0, 1), o2.C, o2.H), a: 1 };
      hex = toHex(c);
      c = parseColor(hex);
    }
  }
  return hex;
}
