#!/usr/bin/env node
/**
 * Generates docs/PORTFOLIO-TECH-STACK-RESUME-GUIDE.html and .pdf
 * Usage: npm install marked --no-save && node scripts/generate-portfolio-pdf.mjs
 * Or:    MARKED_DIR=/path/to/dir/with/marked node scripts/generate-portfolio-pdf.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";
import { execSync } from "child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(path.join(__dirname, ".."));
const mdPath = path.join(root, "docs/PORTFOLIO-TECH-STACK-RESUME-GUIDE.md");
const htmlPath = path.join(root, "docs/PORTFOLIO-TECH-STACK-RESUME-GUIDE.html");
const pdfPath = path.join(root, "docs/PORTFOLIO-TECH-STACK-RESUME-GUIDE.pdf");

async function loadMarked() {
  const candidates = [
    process.env.MARKED_DIR
      ? path.join(process.env.MARKED_DIR, "node_modules/marked/lib/marked.esm.js")
      : null,
    path.join(root, "node_modules/marked/lib/marked.esm.js"),
  ].filter(Boolean);

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return import(pathToFileURL(candidate).href);
    }
  }

  throw new Error(
    "marked not found. Run: cd acadmap && npm install marked --no-save && node scripts/generate-portfolio-pdf.mjs",
  );
}

const { marked } = await loadMarked();
const md = fs.readFileSync(mdPath, "utf8");
const body = marked.parse(md);

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<title>iGauchoBack — Portfolio Tech Stack & Resume Guide</title>
<style>
  @page { margin: 0.65in; size: letter; }
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif; font-size: 10pt; line-height: 1.45; color: #1a1a1a; margin: 0; padding: 0.5in; }
  h1 { font-size: 21pt; color: #003660; border-bottom: 3px solid #FEBC11; padding-bottom: 8px; page-break-after: avoid; }
  h2 { font-size: 13pt; color: #003660; margin-top: 1.3em; page-break-after: avoid; border-bottom: 1px solid #ddd; padding-bottom: 3px; }
  h3 { font-size: 11pt; color: #333; margin-top: 0.9em; page-break-after: avoid; }
  h4 { font-size: 10pt; color: #555; page-break-after: avoid; }
  table { border-collapse: collapse; width: 100%; margin: 0.6em 0; font-size: 8.5pt; page-break-inside: avoid; }
  th, td { border: 1px solid #bbb; padding: 5px 7px; text-align: left; vertical-align: top; }
  th { background: #003660; color: white; font-weight: 600; }
  tr:nth-child(even) td { background: #f6f8fa; }
  blockquote { border-left: 4px solid #FEBC11; margin: 0.8em 0; padding: 0.4em 0.9em; background: #fffbf0; font-style: italic; page-break-inside: avoid; }
  code { background: #f0f0f0; padding: 1px 4px; border-radius: 3px; font-size: 8.5pt; font-family: ui-monospace, monospace; }
  pre { background: #f4f4f4; padding: 10px; border-radius: 5px; font-size: 8pt; page-break-inside: avoid; white-space: pre-wrap; word-wrap: break-word; }
  pre code { background: none; padding: 0; }
  ul, ol { margin: 0.4em 0; padding-left: 1.3em; }
  li { margin: 0.2em 0; }
  hr { border: none; border-top: 1px solid #ddd; margin: 1.2em 0; }
  strong { color: #003660; }
  a { color: #003660; text-decoration: none; }
  p { margin: 0.5em 0; }
</style>
</head>
<body>${body}</body>
</html>`;

fs.writeFileSync(htmlPath, html);
console.log("Wrote", htmlPath);

const chromePaths = [
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Chromium.app/Contents/MacOS/Chromium",
];

const chrome = chromePaths.find((p) => fs.existsSync(p));
if (!chrome) {
  console.log("Chrome not found — open HTML in browser and Print → Save as PDF");
  process.exit(0);
}

execSync(
  `"${chrome}" --headless=new --disable-gpu --no-pdf-header-footer --print-to-pdf="${pdfPath}" "file://${htmlPath}"`,
  { stdio: "inherit" },
);
console.log("Wrote", pdfPath);
