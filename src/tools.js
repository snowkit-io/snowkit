import { z } from "zod";
import { mergePdfs, splitPdf, extractPages, rotatePdf, pdfInfo, markdownToPdf } from "./pdf.js";
import { makeQr } from "./qr.js";
import { jsonFormat, jsonValidate, sqlFormat, textStats, textTransform, colorConvert, cronExplain, TRANSFORMS } from "./text.js";
import { imageInfo, stripMetadata } from "./image.js";
import { headTags, checkHeadTags } from "./web.js";
import { ToolError } from "./files.js";

export { ToolError };

const SITE = "https://snowkit.io/";

const path = (what) => z.string().min(1).describe(what);
const outputPath = (fallback) => z.string().min(1).optional().describe("Where to save the result. " + fallback);
const overwrite = z.boolean().optional().describe("Replace the output file if it already exists. Defaults to false.");
const textOrFile = {
  text: z.string().optional().describe("The text itself. Use this or input."),
  input: z.string().min(1).optional().describe("Path to a file to read instead of text."),
};
const saveText = {
  output: z.string().min(1).optional().describe("Save the result to this file instead of returning it."),
  overwrite,
};

export const TOOLS = [
  {
    name: "pdf_merge",
    title: "Merge PDFs",
    description: "Combine two or more PDF files into one, in the order given. Saves next to the first file as name-merged.pdf unless output is set.",
    link: "merge-pdf",
    schema: {
      inputs: z.array(z.string().min(1)).min(2).describe("Paths of the PDF files, in order."),
      output: outputPath("Defaults to the first file's name with -merged, in the same folder."),
      overwrite,
    },
    run: mergePdfs,
  },
  {
    name: "pdf_split",
    title: "Split a PDF",
    description: "Split a PDF into several files: one per page by default, every N pages, or one file for each page range. Files are saved beside the original unless output_folder is set.",
    link: "split-pdf",
    schema: {
      input: path("Path of the PDF to split."),
      ranges: z.array(z.string().min(1)).min(1).optional().describe("One file per range, such as [\"1-3\", \"4-10\", \"11-\"]."),
      every: z.number().int().min(1).optional().describe("Start a new file every this many pages. Defaults to 1."),
      output_folder: z.string().min(1).optional().describe("An existing folder for the new files. Defaults to the original's folder."),
      overwrite,
    },
    run: splitPdf,
  },
  {
    name: "pdf_extract_pages",
    title: "Extract PDF pages",
    description: "Copy chosen pages of a PDF into a new PDF, in the order listed. Also works to reorder, duplicate or drop pages. Saves as name-extracted.pdf beside the original unless output is set.",
    link: "extract-pages-from-pdf",
    schema: {
      input: path("Path of the PDF."),
      pages: z.string().min(1).describe("Pages in order, such as \"1-3, 7, 10-\", \"5-1\" for reverse, \"odd\", \"even\" or \"last\"."),
      output: outputPath("Defaults to the original's name with -extracted, in the same folder."),
      overwrite,
    },
    run: extractPages,
  },
  {
    name: "pdf_rotate",
    title: "Rotate PDF pages",
    description: "Turn all or some pages of a PDF by 90, 180 or 270 degrees clockwise, or -90 for anticlockwise. Everything else in the file is kept. Saves as name-rotated.pdf unless output is set.",
    link: "rotate-pdf",
    schema: {
      input: path("Path of the PDF."),
      angle: z.union([z.literal(90), z.literal(180), z.literal(270), z.literal(-90)]).describe("Degrees clockwise: 90, 180, 270, or -90."),
      pages: z.string().min(1).optional().describe("Which pages to turn, such as \"2, 4-6\". Defaults to all pages."),
      output: outputPath("Defaults to the original's name with -rotated, in the same folder."),
      overwrite,
    },
    run: rotatePdf,
  },
  {
    name: "pdf_info",
    title: "PDF details",
    description: "Read a PDF's page count, page sizes, file size, PDF version, form fields, password protection and document details such as title and author. Changes nothing.",
    link: "edit-pdf-metadata",
    readOnly: true,
    schema: { input: path("Path of the PDF.") },
    run: pdfInfo,
  },
  {
    name: "markdown_to_pdf",
    title: "Markdown to PDF",
    description: "Turn Markdown into a clean, paginated PDF with headings, lists, tables, code blocks and links. Uses built-in fonts for Western European text; images are left out. Saves beside the Markdown file unless output is set.",
    link: "markdown-to-pdf",
    schema: {
      input: z.string().min(1).optional().describe("Path to a Markdown file. Use this or markdown."),
      markdown: z.string().optional().describe("The Markdown text itself. Needs an output path."),
      output: outputPath("Defaults to the Markdown file's name with .pdf, in the same folder."),
      page: z.enum(["letter", "a4", "legal", "a5"]).optional().describe("Paper size. Defaults to Letter or A4 based on the computer's region."),
      title: z.string().optional().describe("Document title. Defaults to the first heading."),
      page_numbers: z.boolean().optional().describe("Add page numbers at the foot of each page."),
      overwrite,
    },
    run: markdownToPdf,
  },
  {
    name: "qr_code",
    title: "Make a QR code",
    description: "Make a QR code for a link or any text, as SVG or PNG. Without an output path the SVG is returned as text. The content lives in the code itself, so it never expires.",
    link: "qr-code",
    schema: {
      text: z.string().min(1).describe("The link or text to encode."),
      output: z.string().min(1).optional().describe("File to save, ending in .svg or .png."),
      format: z.enum(["svg", "png"]).optional().describe("Defaults to the output file's extension, or svg."),
      level: z.enum(["L", "M", "Q", "H"]).optional().describe("Error correction: L 7%, M 15%, Q 25%, H 30%. Defaults to M."),
      size: z.number().int().min(64).max(4096).optional().describe("Width in pixels. Defaults to 512."),
      overwrite,
    },
    run: makeQr,
  },
  {
    name: "json_format",
    title: "Format JSON",
    description: "Pretty-print or minify JSON, optionally sorting keys. Large numbers keep every digit and errors point to the line and column.",
    link: "json-formatter",
    schema: {
      ...textOrFile,
      indent: z.number().int().min(0).max(8).optional().describe("Spaces per level. Defaults to 2."),
      sort_keys: z.boolean().optional().describe("Sort object keys A to Z."),
      minify: z.boolean().optional().describe("Put everything on one line."),
      ...saveText,
    },
    run: jsonFormat,
  },
  {
    name: "json_validate",
    title: "Validate JSON",
    description: "Check that JSON is valid and, optionally, that it matches a JSON Schema. Reports the line and column of syntax errors and the path of every schema problem.",
    link: "json-validator",
    readOnly: true,
    schema: {
      ...textOrFile,
      schema: z.string().optional().describe("A JSON Schema as text."),
      schema_path: z.string().min(1).optional().describe("Path to a JSON Schema file."),
    },
    run: jsonValidate,
  },
  {
    name: "sql_format",
    title: "Format SQL",
    description: "Tidy SQL into readable, indented lines, or minify it onto one line. Works with common dialects such as PostgreSQL, MySQL, SQLite and SQL Server.",
    link: "sql-formatter",
    schema: {
      ...textOrFile,
      keyword_case: z.enum(["upper", "lower", "preserve"]).optional().describe("How to write keywords. Defaults to upper."),
      indent: z.number().int().min(1).max(8).optional().describe("Spaces per level. Defaults to 2."),
      minify: z.boolean().optional().describe("Put the query on one line and drop comments."),
      ...saveText,
    },
    run: sqlFormat,
  },
  {
    name: "text_stats",
    title: "Text statistics",
    description: "Count words, characters, sentences, paragraphs and lines, estimate reading and speaking time, and score readability for English text.",
    link: "word-counter",
    readOnly: true,
    schema: { ...textOrFile },
    run: textStats,
  },
  {
    name: "text_transform",
    title: "Transform text",
    description: "Change text case (upper, lower, title, sentence, camel, pascal, snake, kebab, constant), turn each line into a URL slug, or remove duplicate lines while keeping the original order.",
    link: (args) => (args && args.action === "slug" ? "slug-generator" : args && args.action === "dedupe" ? "remove-duplicate-lines" : "case-converter"),
    schema: {
      ...textOrFile,
      action: z.enum(TRANSFORMS).describe("What to do."),
      ignore_case: z.boolean().optional().describe("For dedupe: treat Apple and apple as the same line."),
      remove_empty: z.boolean().optional().describe("For dedupe: also drop empty lines."),
      trim: z.boolean().optional().describe("For dedupe: ignore spaces at the start and end of lines when comparing. Defaults to true."),
      ...saveText,
    },
    run: textTransform,
  },
  {
    name: "color_convert",
    title: "Convert a colour",
    description: "Show a colour as hex, RGB, HSL, HSV and OKLCH with its nearest named colour. Give a second colour to get the WCAG contrast ratio and pass or fail results.",
    link: (args) => (args && args.against ? "contrast-checker" : "color-converter"),
    readOnly: true,
    schema: {
      color: z.string().min(1).describe("Such as #336699, rgb(51 102 153), hsl(210 50% 40%) or teal."),
      against: z.string().min(1).optional().describe("A second colour, such as a background, to check contrast."),
    },
    run: colorConvert,
  },
  {
    name: "cron_explain",
    title: "Explain a cron schedule",
    description: "Describe a five-field cron expression in plain English and list its next run times.",
    link: "cron-expression",
    readOnly: true,
    schema: {
      expression: z.string().min(1).describe("Such as \"*/15 9-17 * * 1-5\"."),
      count: z.number().int().min(1).max(50).optional().describe("How many upcoming runs to list. Defaults to 5."),
      utc: z.boolean().optional().describe("List times in UTC instead of this computer's time zone."),
    },
    run: cronExplain,
  },
  {
    name: "image_info",
    title: "Image metadata",
    description: "Show what a JPEG, PNG or WebP photo reveals about itself: camera, date, editing software and the GPS location where it was taken, if any.",
    link: "metadata-remover",
    readOnly: true,
    schema: {
      input: path("Path to the image."),
    },
    run: imageInfo,
  },
  {
    name: "image_strip_metadata",
    title: "Remove image metadata",
    description: "Remove the hidden location, camera details, dates and comments from a JPEG, PNG or WebP photo without changing the picture. Saves next to the original as name-clean unless output is set.",
    link: "metadata-remover",
    schema: {
      input: path("Path to the image."),
      output: outputPath("Defaults to the image's name with -clean, in the same folder."),
      keep_color_profile: z.boolean().optional().describe("Keep the colour profile so colours look the same. Defaults to true."),
      overwrite,
    },
    run: stripMetadata,
  },
  {
    name: "head_tags",
    title: "Make head tags",
    description: "Write the title, description, canonical, Open Graph and Twitter tags for a web page, ready to paste into its <head>.",
    link: "meta-tag-generator",
    readOnly: true,
    schema: {
      title: z.string().optional().describe("The page title, about 60 characters at most."),
      description: z.string().optional().describe("One or two sentences, about 155 characters at most."),
      url: z.string().optional().describe("The page's full address, used as the canonical and og:url."),
      image: z.string().optional().describe("Full address of a 1200 x 630 share image."),
      image_alt: z.string().optional().describe("A short description of the share image."),
      site_name: z.string().optional().describe("The site or app name."),
      twitter: z.string().optional().describe("The site's X handle, with or without @."),
      theme_color: z.string().optional().describe("A hex colour for the browser bar, such as #2f7cf6."),
      noindex: z.boolean().optional().describe("Ask search engines not to list the page. Defaults to false."),
    },
    run: headTags,
  },
  {
    name: "head_check",
    title: "Check head tags",
    description: "Check a web page's HTML for a missing or too-long title and description, share image, canonical and other head tags, with what to fix.",
    link: "meta-tag-checker",
    readOnly: true,
    schema: {
      html: z.string().optional().describe("The page's HTML. Use this or input."),
      input: z.string().min(1).optional().describe("Path to an HTML file to read instead."),
    },
    run: checkHeadTags,
  },
];

export function findTool(name) {
  return TOOLS.find((t) => t.name === name);
}

const MAX_FRAGMENT = 20000;
const PDF_APP = { label: "Sign, fill, mark up or compress it in Snowkit PDF", slug: "pdf-workspace" };
const DESIGN_APP = { label: "Edit it in Snowkit Design", slug: "studio-editor" };
const NEXT = { image_info: DESIGN_APP, image_strip_metadata: DESIGN_APP, pdf_merge: PDF_APP, pdf_split: PDF_APP, pdf_extract_pages: PDF_APP, pdf_rotate: PDF_APP, pdf_info: PDF_APP };

const PREFILL = {
  qr_code: (a) => (/^https?:\/\/\S+$/i.test(a.text || "") ? ["qr-code", { url: a.text }] : null),
  json_format: (a) => (a.text ? ["json-tools", { json: a.text }] : null),
  json_validate: (a) => (a.text ? ["json-tools", { json: a.text }] : null),
  sql_format: (a) => (a.text ? ["sql-formatter", { sql: a.text, case: a.keyword_case }] : null),
  text_stats: (a) => (a.text ? ["readability-checker", { text: a.text }] : null),
  color_convert: (a) => (/^#?[0-9a-f]{3,8}$/i.test(a.color || "") && !a.against ? ["color-converter", { color: a.color.replace(/^#/, "") }] : null),
  cron_explain: (a) => (a.expression ? ["cron-expression", { cron: a.expression }] : null),
  markdown_to_pdf: (a) => (a.markdown ? ["markdown-to-pdf", { markdown: a.markdown, page: a.page }] : null),
};

function fragment(params) {
  return Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== null && v !== "")
    .map(([k, v]) => k + "=" + encodeURIComponent(String(v)))
    .join("&");
}

export function toolLink(tool, args) {
  const a = args || {};
  const fill = PREFILL[tool.name] && PREFILL[tool.name](a);
  if (fill) {
    const frag = fragment(fill[1]);
    if (frag && frag.length <= MAX_FRAGMENT) return SITE + fill[0] + "/#" + frag;
  }
  if (NEXT[tool.name]) return SITE + NEXT[tool.name].slug + "/";
  const slug = typeof tool.link === "function" ? tool.link(a) : tool.link;
  return SITE + slug + "/";
}

export function linkLabel(tool, args) {
  const a = args || {};
  if (PREFILL[tool.name] && PREFILL[tool.name](a)) return "Open this in Snowkit";
  if (NEXT[tool.name]) return NEXT[tool.name].label;
  return "Open in Snowkit";
}

export async function runTool(name, args = {}) {
  const tool = findTool(name);
  if (!tool) throw new ToolError("Unknown tool: " + name);
  const result = await tool.run(args);
  return { ...result, link: toolLink(tool, args) };
}
