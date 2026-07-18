// gerar-pdf.js
// Junta todos os capitulos .md desta pasta em um unico HTML e imprime o
// apostila.pdf usando o Microsoft Edge em modo headless (ja vem no Windows).
//
// Como executar (dentro da pasta apostila):
//   node gerar-pdf.js
// Ou de dois cliques no gerar-pdf.bat
//
// O arquivo intermediario apostila.html tambem fica na pasta: ele pode ser
// aberto no navegador ou no Word caso queira editar ou conferir o visual.

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const pasta = __dirname;
const htmlPath = path.join(pasta, 'apostila.html');
const pdfPath = path.join(pasta, 'apostila.pdf');

// ---------------------------------------------------------------------------
// 1. Coleta dos capitulos, em ordem
// ---------------------------------------------------------------------------
const arquivos = fs.readdirSync(pasta)
    .filter(f => /^capitulo-\d+.*\.md$/.test(f))
    .sort();

if (arquivos.length === 0) {
    console.error('Nenhum arquivo capitulo-*.md encontrado em ' + pasta);
    process.exit(1);
}

// ---------------------------------------------------------------------------
// 2. Conversor de Markdown para HTML (subconjunto usado na apostila)
// ---------------------------------------------------------------------------
function escapeHtml(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function inline(s) {
    s = escapeHtml(s);
    s = s.replace(/`([^`]+)`/g, '<code>$1</code>');
    s = s.replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>');
    // links externos viram <a>; links para arquivos locais viram texto simples
    s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (m, txt, url) =>
        /^https?:/.test(url) ? `<a href="${url}">${txt}</a>` : txt);
    return s;
}

function converter(md, idCapitulo) {
    const linhas = md.split(/\r?\n/);
    const html = [];
    let i = 0;
    while (i < linhas.length) {
        const l = linhas[i];

        // bloco de codigo cercado
        if (l.startsWith('```')) {
            const corpo = [];
            i++;
            while (i < linhas.length && !linhas[i].startsWith('```')) {
                corpo.push(escapeHtml(linhas[i]));
                i++;
            }
            i++;
            html.push('<pre>' + corpo.join('\n') + '</pre>');
            continue;
        }

        // titulos
        const h = l.match(/^(#{1,4})\s+(.*)$/);
        if (h) {
            const nivel = h[1].length;
            // o h1 do capitulo ganha uma ancora para o sumario
            const ancora = nivel === 1 ? ` id="${idCapitulo}"` : '';
            html.push(`<h${nivel}${ancora}>${inline(h[2])}</h${nivel}>`);
            i++;
            continue;
        }

        // tabela
        if (l.startsWith('|')) {
            const brutas = [];
            while (i < linhas.length && linhas[i].startsWith('|')) {
                brutas.push(linhas[i]);
                i++;
            }
            const uteis = brutas.filter(t => !/^\|[\s:|-]+\|$/.test(t));
            let out = '<table>';
            uteis.forEach((t, idx) => {
                const celulas = t.replace(/^\||\|$/g, '').split('|')
                    .map(c => inline(c.trim().replace(/\\\|/g, '|')));
                const tag = idx === 0 ? 'th' : 'td';
                out += '<tr>' + celulas.map(c => `<${tag}>${c}</${tag}>`).join('') + '</tr>';
            });
            out += '</table>';
            html.push(out);
            continue;
        }

        // lista nao ordenada
        if (/^-\s+/.test(l)) {
            const itens = [];
            while (i < linhas.length && /^-\s+/.test(linhas[i])) {
                itens.push('<li>' + inline(linhas[i].replace(/^-\s+/, '')) + '</li>');
                i++;
            }
            html.push('<ul>' + itens.join('\n') + '</ul>');
            continue;
        }

        // lista ordenada
        if (/^\d+\.\s+/.test(l)) {
            const itens = [];
            while (i < linhas.length && /^\d+\.\s+/.test(linhas[i])) {
                itens.push('<li>' + inline(linhas[i].replace(/^\d+\.\s+/, '')) + '</li>');
                i++;
            }
            html.push('<ol>' + itens.join('\n') + '</ol>');
            continue;
        }

        // citacao
        if (/^>\s?/.test(l)) {
            const corpo = [];
            while (i < linhas.length && /^>\s?/.test(linhas[i])) {
                corpo.push(inline(linhas[i].replace(/^>\s?/, '')));
                i++;
            }
            html.push('<blockquote>' + corpo.join(' ') + '</blockquote>');
            continue;
        }

        if (l.trim() === '') { i++; continue; }

        // paragrafo: junta linhas consecutivas de texto
        const corpo = [l];
        i++;
        while (i < linhas.length && linhas[i].trim() !== '' &&
               !/^(#|```|\||- |\d+\. |> )/.test(linhas[i])) {
            corpo.push(linhas[i]);
            i++;
        }
        html.push('<p>' + inline(corpo.join(' ')) + '</p>');
    }
    return html.join('\n');
}

// ---------------------------------------------------------------------------
// 3. Montagem do documento: capa, sumario e capitulos
// ---------------------------------------------------------------------------
const estilo = `
<style>
    @page { size: A4; margin: 2cm 1.8cm; }
    * { box-sizing: border-box; }
    body {
        font-family: "Segoe UI", Calibri, sans-serif;
        font-size: 11pt; line-height: 1.5; color: #1a1a1a; margin: 0;
    }
    h1 { font-size: 20pt; color: #1F3864; border-bottom: 2px solid #2E5395;
         padding-bottom: 6px; margin: 0 0 14px 0; }
    h2 { font-size: 14.5pt; color: #2E5395; margin: 22px 0 8px 0; }
    h3 { font-size: 12pt; color: #2E5395; margin: 16px 0 6px 0; }
    p { margin: 0 0 10px 0; text-align: justify; }
    a { color: #2E5395; word-break: break-all; }
    ul, ol { margin: 0 0 10px 0; padding-left: 24px; }
    li { margin-bottom: 3px; }
    pre {
        font-family: Consolas, "Courier New", monospace; font-size: 9pt;
        line-height: 1.4; background: #F4F4F4; border: 1px solid #DDDDDD;
        border-left: 4px solid #2E5395; border-radius: 3px;
        padding: 10px 12px; margin: 0 0 12px 0;
        white-space: pre-wrap; word-wrap: break-word;
    }
    code {
        font-family: Consolas, "Courier New", monospace; font-size: 9.5pt;
        background: #F4F4F4; padding: 1px 4px; border-radius: 3px;
    }
    pre code { background: none; padding: 0; }
    table { border-collapse: collapse; font-size: 9.5pt; margin: 0 0 12px 0; width: 100%; }
    th, td { border: 1px solid #BBBBBB; padding: 5px 8px; text-align: left; }
    th { background: #DEEAF6; color: #1F3864; }
    blockquote { color: #555555; font-style: italic; border-left: 3px solid #CCCCCC;
                 margin: 0 0 10px 0; padding: 2px 14px; }
    .capitulo { page-break-before: always; }
    pre, table, blockquote { page-break-inside: avoid; }
    h1, h2, h3 { page-break-after: avoid; }

    .capa { height: 90vh; display: flex; flex-direction: column;
            justify-content: center; align-items: center; text-align: center; }
    .capa h1 { font-size: 30pt; border: none; }
    .capa .sub { font-size: 15pt; color: #2E5395; margin-bottom: 30px; }
    .capa .desc { font-size: 11pt; color: #555555; max-width: 70%; }

    .sumario { page-break-before: always; }
    .sumario ol { padding-left: 30px; }
    .sumario li { margin-bottom: 8px; font-size: 11.5pt; }
    .sumario a { text-decoration: none; word-break: normal; }
</style>`;

const partes = [];

// capa
partes.push(`
<div class="capa">
    <h1>Apostila Front-End 2</h1>
    <div class="sub">JavaScript na pr&aacute;tica com o App Livros</div>
    <div class="desc">
        Curso constru&iacute;do aula a aula: dos fundamentos da linguagem
        (vari&aacute;veis, condicionais, la&ccedil;os, fun&ccedil;&otilde;es e eventos) at&eacute; uma SPA
        completa com roteamento por hash, componentes, assincronismo e
        consumo de API, fechando com o uso de LLMs no fluxo de trabalho
        do desenvolvedor.
    </div>
</div>`);

// converte capitulos e coleta os titulos para o sumario
const capitulos = arquivos.map((arq, idx) => {
    const md = fs.readFileSync(path.join(pasta, arq), 'utf8');
    const titulo = (md.match(/^#\s+(.*)$/m) || [null, arq])[1];
    const id = 'cap' + String(idx + 1).padStart(2, '0');
    return { id, titulo, html: converter(md, id) };
});

// sumario com links internos
partes.push(`
<div class="sumario">
    <h1>Sum&aacute;rio</h1>
    <ol>
        ${capitulos.map(c => `<li><a href="#${c.id}">${inline(c.titulo)}</a></li>`).join('\n        ')}
    </ol>
</div>`);

// capitulos
capitulos.forEach(c => partes.push(`<div class="capitulo">${c.html}</div>`));

const documento = `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><title>Apostila Front-End 2</title>${estilo}</head>
<body>
${partes.join('\n')}
</body>
</html>`;

fs.writeFileSync(htmlPath, documento, 'utf8');
console.log('HTML montado com ' + capitulos.length + ' capitulos: ' + htmlPath);

// ---------------------------------------------------------------------------
// 4. Impressao do PDF com o Edge headless
// ---------------------------------------------------------------------------
const caminhosEdge = [
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe'
];
const edge = caminhosEdge.find(p => fs.existsSync(p));
if (!edge) {
    console.error('Microsoft Edge nao encontrado. O apostila.html foi gerado;');
    console.error('abra-o no navegador e use Ctrl+P > Salvar como PDF.');
    process.exit(1);
}

const urlHtml = 'file:///' + htmlPath.replace(/\\/g, '/');
try { fs.rmSync(pdfPath, { force: true }); } catch (e) {}

console.log('Gerando PDF com o Edge...');
execFileSync(edge, [
    '--headless',
    '--disable-gpu',
    '--no-pdf-header-footer',
    '--print-to-pdf=' + pdfPath,
    urlHtml
], { stdio: 'ignore', timeout: 120000 });

if (fs.existsSync(pdfPath)) {
    const kb = Math.round(fs.statSync(pdfPath).size / 1024);
    console.log('PDF gerado com sucesso: ' + pdfPath + ' (' + kb + ' KB)');
} else {
    console.error('O Edge terminou mas o PDF nao apareceu. Abra o apostila.html');
    console.error('no navegador e use Ctrl+P > Salvar como PDF.');
    process.exit(1);
}
