import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { PDFDocument, StandardFonts } from "pdf-lib";

export async function tempFolder(t) {
  const dir = await mkdtemp(join(tmpdir(), "snowkit-test-"));
  t.after(() => rm(dir, { recursive: true, force: true }));
  return dir;
}

export async function samplePdf(path, pages, { size = [612, 792], title } = {}) {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  for (let i = 1; i <= pages; i++) {
    const page = doc.addPage(size);
    page.drawText("Page " + i, { x: 50, y: 50, size: 24, font });
  }
  if (title) doc.setTitle(title);
  await writeFile(path, await doc.save());
  return path;
}

export async function pageTexts(bytes) {
  const doc = await PDFDocument.load(bytes);
  return doc.getPages().map((p) => ({ size: [Math.round(p.getWidth()), Math.round(p.getHeight())], rotation: p.getRotation().angle }));
}
