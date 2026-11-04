import { test } from "node:test";
import assert from "node:assert/strict";
import { findTool, toolLink, linkLabel } from "../src/tools.js";

const link = (name, args) => toolLink(findTool(name), args);

test("text tools open with the content filled in", () => {
  assert.equal(link("qr_code", { text: "https://example.com/menu" }), "https://snowkit.io/qr-code/#url=https%3A%2F%2Fexample.com%2Fmenu");
  assert.equal(link("json_format", { text: '{"a":1}' }), "https://snowkit.io/json-tools/#json=%7B%22a%22%3A1%7D");
  assert.equal(link("sql_format", { text: "select 1", keyword_case: "upper" }), "https://snowkit.io/sql-formatter/#sql=select%201&case=upper");
  assert.equal(link("color_convert", { color: "#336699" }), "https://snowkit.io/color-converter/#color=336699");
  assert.equal(linkLabel(findTool("json_format"), { text: "{}" }), "Open this in Snowkit");
});

test("plain pages when there is nothing safe to fill in", () => {
  assert.equal(link("qr_code", { text: "hello" }), "https://snowkit.io/qr-code/");
  assert.equal(link("json_format", { input: "data.json" }), "https://snowkit.io/json-formatter/");
  assert.equal(link("color_convert", { color: "teal" }), "https://snowkit.io/color-converter/");
  assert.equal(link("json_format", { text: "x".repeat(25000) }), "https://snowkit.io/json-formatter/");
});

test("PDF tools point to the PDF app", () => {
  assert.equal(link("pdf_merge", { inputs: ["a.pdf", "b.pdf"] }), "https://snowkit.io/pdf-workspace/");
  assert.match(linkLabel(findTool("pdf_rotate"), {}), /Snowkit PDF/);
});
