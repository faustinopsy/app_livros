/**
 * Gera a apostila completa em PDF a partir dos capítulos em Markdown.
 *
 * Uso:
 *   cd apostila
 *   npm install markdown-it        (apenas na primeira vez)
 *   node build/gerar-pdf.js
 *
 * O script:
 *  1. Lê todos os capítulos de capitulos/ em ordem alfabética (00, 01, 02...).
 *  2. Converte cada um de Markdown para HTML.
 *  3. Monta uma capa + sumário + todos os capítulos num único HTML estilizado.
 *  4. Usa o Microsoft Edge (ou Chrome) em modo headless para imprimir em PDF.
 *
 * Saída: build/apostila-completa.pdf  e  build/apostila-completa.html
 */

const fs = require("fs");
const path = require("path");
const os = require("os");
const { execFileSync } = require("child_process");

const RAIZ = path.resolve(__dirname, "..");
const DIR_CAPITULOS = path.join(RAIZ, "capitulos");
const DIR_BUILD = path.join(RAIZ, "build");
const HTML_SAIDA = path.join(DIR_BUILD, "apostila-completa.html");
const PDF_SAIDA = path.join(DIR_BUILD, "apostila-completa.pdf");

// ---- 1. Markdown -> HTML ---------------------------------------------------
let MarkdownIt;
try {
  MarkdownIt = require("markdown-it");
} catch (e) {
  console.error("\n[erro] Dependência 'markdown-it' não encontrada.");
  console.error("Rode, dentro da pasta apostila/:  npm install markdown-it\n");
  process.exit(1);
}
const md = new MarkdownIt({ html: true, linkify: true, typographer: true });

// ---- 2. Localizar o navegador para imprimir --------------------------------
function acharNavegador() {
  // Chrome primeiro: o print-to-pdf do Edge se mostrou instável quando há uma
  // janela do Edge já aberta (retorna sucesso sem gravar o arquivo).
  const candidatos = [
    process.env.PROGRAMFILES + "\\Google\\Chrome\\Application\\chrome.exe",
    process.env["PROGRAMFILES(X86)"] + "\\Google\\Chrome\\Application\\chrome.exe",
    process.env.PROGRAMFILES + "\\Microsoft\\Edge\\Application\\msedge.exe",
    process.env["PROGRAMFILES(X86)"] + "\\Microsoft\\Edge\\Application\\msedge.exe",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium-browser",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
  ];
  return candidatos.find((c) => c && fs.existsSync(c));
}

// ---- 3. Estilo visual da apostila -----------------------------------------
const CSS = `
  @page { size: A4; margin: 22mm 18mm; }
  * { box-sizing: border-box; }
  body {
    font-family: "Segoe UI", Roboto, -apple-system, sans-serif;
    color: #1f2937; line-height: 1.6; font-size: 11pt;
  }
  h1, h2, h3, h4 { color: #1e293b; line-height: 1.25; page-break-after: avoid; }
  h1 { font-size: 21pt; border-bottom: 3px solid #3b82f6; padding-bottom: .3em; margin-top: 0; }
  h2 { font-size: 15pt; margin-top: 1.6em; border-bottom: 1px solid #e5e7eb; padding-bottom: .2em; }
  h3 { font-size: 12.5pt; margin-top: 1.3em; color: #334155; }
  p, li { text-align: justify; }
  a { color: #2563eb; text-decoration: none; }
  code {
    font-family: "Cascadia Code", "Courier New", monospace;
    background: #f1f5f9; padding: .12em .35em; border-radius: 4px;
    font-size: .88em; color: #b91c1c;
  }
  pre {
    background: #0f172a; color: #e2e8f0; padding: 14px 16px;
    border-radius: 8px; overflow-x: auto; font-size: 9.2pt; line-height: 1.45;
    page-break-inside: avoid;
  }
  pre code { background: none; color: inherit; padding: 0; font-size: inherit; }
  blockquote {
    border-left: 4px solid #3b82f6; background: #f8fafc;
    margin: 1em 0; padding: .6em 1em; border-radius: 0 6px 6px 0;
    page-break-inside: avoid;
  }
  blockquote p { margin: .3em 0; }
  table { border-collapse: collapse; width: 100%; margin: 1em 0; font-size: 9.6pt; page-break-inside: avoid; }
  th, td { border: 1px solid #cbd5e1; padding: 6px 10px; text-align: left; }
  th { background: #eff6ff; }
  hr { border: none; border-top: 1px solid #e5e7eb; margin: 1.5em 0; }
  .capitulo { page-break-before: always; }
  /* Capa */
  .capa {
    height: 245mm; display: flex; flex-direction: column;
    justify-content: center; align-items: center; text-align: center;
    page-break-after: always;
  }
  .capa .selo { font-size: 13pt; letter-spacing: .3em; color: #3b82f6; text-transform: uppercase; }
  .capa h1 { font-size: 34pt; border: none; margin: .3em 0; color: #0f172a; }
  .capa .sub { font-size: 15pt; color: #475569; max-width: 70%; }
  .capa .rodape { margin-top: 3em; font-size: 11pt; color: #64748b; }
  .capa .puzzle { font-size: 48pt; margin-bottom: .2em; }
  /* Sumário */
  .sumario { page-break-after: always; }
  .sumario h1 { border-bottom: 3px solid #3b82f6; }
  .sumario ol { line-height: 1.9; }
`;

// ---- 4. Montar o documento -------------------------------------------------
const arquivos = fs
  .readdirSync(DIR_CAPITULOS)
  .filter((f) => f.endsWith(".md"))
  .sort();

console.log(`Encontrados ${arquivos.length} capítulos.`);

const capa = `
  <div class="capa">
    <div class="puzzle">🧩</div>
    <div class="selo">Front-End Avançado</div>
    <h1>JavaScript na Prática</h1>
    <div class="sub">Construindo uma Single Page Application do zero, sem frameworks — do primeiro <code>console.log</code> ao consumo de APIs reais.</div>
    <div class="rodape">Apostila do curso · Projeto <strong>App Livros</strong></div>
  </div>`;

// Sumário a partir dos títulos H1 de cada arquivo
const itensSumario = arquivos
  .map((f) => {
    const conteudo = fs.readFileSync(path.join(DIR_CAPITULOS, f), "utf8");
    const m = conteudo.match(/^#\s+(.+)$/m);
    return m ? m[1].trim() : f;
  })
  .map((titulo) => `<li>${titulo}</li>`)
  .join("\n");

const sumario = `
  <div class="sumario">
    <h1>Sumário</h1>
    <ol>${itensSumario}</ol>
  </div>`;

const corpo = arquivos
  .map((f) => {
    const conteudo = fs.readFileSync(path.join(DIR_CAPITULOS, f), "utf8");
    return `<section class="capitulo">${md.render(conteudo)}</section>`;
  })
  .join("\n");

const htmlFinal = `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><title>JavaScript na Prática — App Livros</title>
<style>${CSS}</style></head>
<body>${capa}${sumario}${corpo}</body>
</html>`;

fs.writeFileSync(HTML_SAIDA, htmlFinal, "utf8");
console.log(`HTML gerado: ${HTML_SAIDA}`);

// ---- 5. Imprimir em PDF via navegador headless -----------------------------
const navegador = acharNavegador();
if (!navegador) {
  console.error("\n[aviso] Edge/Chrome não encontrado para gerar o PDF.");
  console.error("Abra o HTML gerado no navegador e use Ctrl+P > Salvar como PDF.\n");
  process.exit(0);
}

console.log(`Imprimindo com: ${navegador}`);

function imprimir(headlessFlag) {
  // Um perfil temporário próprio força uma instância limpa e evita que uma janela
  // já aberta do navegador faça o modo headless "não fazer nada" (no-op).
  const perfilTemp = path.join(os.tmpdir(), "apostila-print-" + Date.now());
  if (fs.existsSync(PDF_SAIDA)) fs.rmSync(PDF_SAIDA, { force: true });
  execFileSync(
    navegador,
    [
      headlessFlag,
      "--disable-gpu",
      "--no-sandbox", // necessário ao rodar como root (ex.: GitHub Actions)
      "--no-pdf-header-footer",
      `--user-data-dir=${perfilTemp}`,
      `--print-to-pdf=${PDF_SAIDA}`,
      "file:///" + HTML_SAIDA.replace(/\\/g, "/")
    ],
    { stdio: "inherit" }
  );
  return fs.existsSync(PDF_SAIDA) && fs.statSync(PDF_SAIDA).size > 0;
}

// Alguns pares navegador/SO gravam com "--headless" (legado), outros só com
// "--headless=new". Tentamos ambos e confirmamos que o arquivo saiu de verdade.
try {
  const ok = imprimir("--headless") || imprimir("--headless=new");
  if (ok) {
    console.log(`\n✅ PDF gerado: ${PDF_SAIDA}`);
  } else {
    console.error("\n[aviso] O navegador não gravou o PDF.");
    console.error("Abra o HTML no navegador e use Ctrl+P > Salvar como PDF.");
    process.exit(1);
  }
} catch (e) {
  console.error("Falha ao imprimir em PDF:", e.message);
  console.error("Abra o HTML no navegador e use Ctrl+P > Salvar como PDF.");
  process.exit(1);
}
