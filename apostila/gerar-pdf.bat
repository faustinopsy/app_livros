@echo off
rem Atalho de dois cliques: junta os capitulos .md e gera o apostila.pdf
cd /d "%~dp0"
node gerar-pdf.js
pause
