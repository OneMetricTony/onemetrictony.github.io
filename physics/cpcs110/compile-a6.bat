@echo off
REM ──────────────────────────────────────────────────────────────────────────
REM  compile-a6.bat  —  Build a6-solution-key.pdf from LaTeX source
REM  Run twice so cross-references (TOC, \label/\ref, LastPage) resolve.
REM  Requires a TeX distribution on PATH: MiKTeX or TeX Live recommended.
REM ──────────────────────────────────────────────────────────────────────────

cd /d "%~dp0"

echo [1/2] First pdflatex pass...
pdflatex -interaction=nonstopmode a6-solution-key.tex
if errorlevel 1 (
    echo ERROR: First pdflatex pass failed. See a6-solution-key.log for details.
    pause
    exit /b 1
)

echo [2/2] Second pdflatex pass (resolving cross-references)...
pdflatex -interaction=nonstopmode a6-solution-key.tex
if errorlevel 1 (
    echo ERROR: Second pdflatex pass failed. See a6-solution-key.log for details.
    pause
    exit /b 1
)

echo.
echo Done! a6-solution-key.pdf is ready.
echo You can delete auxiliary files with:
echo   del a6-solution-key.aux a6-solution-key.log a6-solution-key.out a6-solution-key.toc
pause
