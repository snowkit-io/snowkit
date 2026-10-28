import { deflateSync } from "node:zlib";
import { extname } from "node:path";
import { ToolError, writeOutput, formatBytes } from "./files.js";
import { encode, qrScene, sceneSvg } from "./engine/qrkit.js";

const MARGIN = 4;

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const head = Buffer.alloc(8);
  head.writeUInt32BE(data.length, 0);
  head.write(type, 4, "latin1");
  const tail = Buffer.alloc(4);
  tail.writeUInt32BE(crc32(Buffer.concat([head.subarray(4), data])), 0);
  return Buffer.concat([head, data, tail]);
}

export function grayPng(width, height, pixel) {
  const raw = Buffer.alloc((width + 1) * height);
  for (let y = 0; y < height; y++) {
    const row = y * (width + 1);
    raw[row] = 0;
    for (let x = 0; x < width; x++) raw[row + 1 + x] = pixel(x, y);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 0;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;
  return Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), chunk("IHDR", ihdr), chunk("IDAT", deflateSync(raw, { level: 9 })), chunk("IEND", Buffer.alloc(0))]);
}

export function makeCode(text, level = "M") {
  const value = String(text == null ? "" : text);
  if (!value) throw new ToolError("Give the text or link to put in the QR code.");
  const ecl = String(level).toUpperCase();
  if (!["L", "M", "Q", "H"].includes(ecl)) throw new ToolError("level must be L, M, Q or H.");
  try {
    return encode(value, ecl);
  } catch (e) {
    if (e && e.kind === "long") throw new ToolError("That is too long for one QR code. At level " + ecl + " it holds about " + e.max + (e.bytes ? " bytes" : " characters") + ". Shorten it or use level L.");
    throw new ToolError("The QR code could not be made: " + String((e && e.message) || e));
  }
}

export function qrSvg(code, size) {
  return sceneSvg(qrScene(code, { margin: MARGIN }), { width: size });
}

export function qrPng(code, size) {
  const total = code.size + MARGIN * 2;
  const scale = Math.max(1, Math.round(size / total));
  const width = total * scale;
  return grayPng(width, width, (x, y) => {
    const mx = Math.floor(x / scale) - MARGIN;
    const my = Math.floor(y / scale) - MARGIN;
    if (mx < 0 || my < 0 || mx >= code.size || my >= code.size) return 255;
    return code.modules[my * code.size + mx] === 1 ? 0 : 255;
  });
}

export async function makeQr({ text, output, format, level = "M", size = 512, overwrite = false }) {
  const px = Number(size);
  if (!Number.isInteger(px) || px < 64 || px > 4096) throw new ToolError("size must be a whole number from 64 to 4096.");
  const ext = output ? extname(String(output)).toLowerCase() : "";
  const kind = (format || (ext === ".png" ? "png" : "svg")).toLowerCase();
  if (kind !== "svg" && kind !== "png") throw new ToolError("format must be svg or png.");
  if (output && ext && ext !== "." + kind) throw new ToolError("The output name ends in " + ext + " but the format is " + kind + ". Make them match.");
  const code = makeCode(text, level);
  const facts = "Version " + code.ver + ", level " + code.level + ", " + code.size + " × " + code.size + " modules.";
  if (!output) {
    if (kind === "png") throw new ToolError("Give an output path to save a PNG: a full file path ending in .png.");
    const svg = qrSvg(code, px);
    return { text: facts, output: svg, data: { svg, version: code.ver, level: code.level, modules: code.size } };
  }
  const bytes = kind === "png" ? qrPng(code, px) : Buffer.from(qrSvg(code, px), "utf8");
  const path = await writeOutput(output, bytes, { overwrite });
  return {
    text: "Saved a " + kind.toUpperCase() + " QR code to " + path + " (" + formatBytes(bytes.length) + ").\n" + facts + "\nThe text lives in the code itself, so it never expires.",
    data: { output: path, format: kind, version: code.ver, level: code.level, modules: code.size, bytes: bytes.length },
  };
}
