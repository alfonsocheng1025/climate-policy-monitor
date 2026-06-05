// Generate HANDBOOK.pdf / HANDBOOK.en.pdf from the Markdown handbooks.
//
//   cd tools && npm install        # one-time (marked + mermaid)
//   node tools/build-pdf.mjs       # from repo root
//
// Renders Mermaid diagrams OFFLINE (inlines mermaid.min.js from node_modules — no
// CDN, works behind the GFW) and prints to PDF using a locally-installed
// Chrome or Edge in headless mode. No pandoc/LaTeX needed.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');

// --- deps ---
let marked;
try {
  ({ marked } = await import('marked'));
} catch {
  console.error('Missing deps. Run:  cd tools && npm install');
  process.exit(1);
}
const MERMAID_JS = (() => {
  const p = path.join(HERE, 'node_modules', 'mermaid', 'dist', 'mermaid.min.js');
  if (!existsSync(p)) {
    console.error('mermaid.min.js not found. Run:  cd tools && npm install');
    process.exit(1);
  }
  return readFileSync(p, 'utf8');
})();

// --- find a Chromium-based browser for headless print ---
function findBrowser() {
  const c = [
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  ];
  const found = c.find(existsSync);
  if (!found) { console.error('No Chrome/Edge found for headless PDF print.'); process.exit(1); }
  return found;
}
const BROWSER = findBrowser();

const CSS = `
  @page { size: A4; margin: 15mm 14mm; }
  * { box-sizing: border-box; }
  body { font: 14px/1.65 -apple-system,"Segoe UI",Roboto,"PingFang SC","Microsoft YaHei",sans-serif;
         color: #14202b; max-width: 100%; margin: 0; }
  h1 { font-size: 26px; border-bottom: 3px solid #3da9d9; padding-bottom: 8px; }
  h2 { font-size: 20px; margin-top: 26px; border-bottom: 1px solid #d8e0e8; padding-bottom: 5px;
       page-break-after: avoid; }
  h3 { font-size: 16px; margin-top: 18px; page-break-after: avoid; }
  h1,h2,h3,h4 { color: #0a2a3a; }
  a { color: #1d6b9c; text-decoration: none; }
  code { font-family: "JetBrains Mono",Consolas,monospace; font-size: 12px;
         background: #eef3f7; padding: 1px 5px; border-radius: 3px; }
  pre { background: #0f1620; color: #e6edf5; padding: 12px 14px; border-radius: 8px;
        overflow-x: auto; font-size: 11.5px; line-height: 1.5; page-break-inside: avoid; }
  pre code { background: none; color: inherit; padding: 0; font-size: 11.5px; }
  pre.mermaid { background: #fff; color: #14202b; text-align: center; border: 1px solid #e3e9ef; }
  table { border-collapse: collapse; width: 100%; font-size: 12px; margin: 10px 0;
          page-break-inside: avoid; }
  th, td { border: 1px solid #d4dde6; padding: 6px 9px; text-align: left; vertical-align: top; }
  th { background: #eef3f7; }
  blockquote { border-left: 4px solid #ff7a3d; margin: 10px 0; padding: 4px 14px;
               background: #fff6f1; color: #5a4636; border-radius: 4px; }
  hr { border: 0; border-top: 1px solid #d8e0e8; margin: 22px 0; }
  ul, ol { padding-left: 22px; }
  .mermaid svg { max-width: 100%; height: auto; }
`;

function build(mdFile, pdfFile, title) {
  let md = readFileSync(path.join(ROOT, mdFile), 'utf8');
  // Turn ```mermaid fences into <pre class="mermaid"> blocks (raw HTML passed through by marked).
  md = md.replace(/```mermaid\n([\s\S]*?)```/g, (_, code) => `<pre class="mermaid">\n${code}</pre>`);
  const bodyHtml = marked.parse(md, { mangle: false, headerIds: true });
  const htmlPath = path.join(ROOT, mdFile.replace(/\.md$/, '.gen.html'));
  const pdfPath = path.join(ROOT, pdfFile);
  const html = `<!doctype html><html lang="zh"><head><meta charset="utf-8"><title>${title}</title>
<style>${CSS}</style></head><body>
${bodyHtml}
<script>${MERMAID_JS}</script>
<script>
  mermaid.initialize({ startOnLoad: false, theme: 'neutral', flowchart: { useMaxWidth: true } });
  mermaid.run();
</script>
</body></html>`;
  writeFileSync(htmlPath, html, 'utf8');

  const url = 'file:///' + htmlPath.replace(/\\/g, '/');
  console.log(`[pdf] rendering ${mdFile} -> ${pdfFile} ...`);
  execFileSync(BROWSER, [
    '--headless=new', '--disable-gpu', '--no-sandbox',
    '--run-all-compositor-stages-before-draw',
    '--virtual-time-budget=25000',
    '--no-pdf-header-footer',
    `--print-to-pdf=${pdfPath}`,
    url,
  ], { stdio: 'inherit' });
  console.log(`[pdf] wrote ${pdfFile}`);
}

build('HANDBOOK.md', 'HANDBOOK.pdf', 'Climate Policy Monitor 操作手册');
build('HANDBOOK.en.md', 'HANDBOOK.en.pdf', 'Climate Policy Monitor Handbook');
console.log('[pdf] done.');
