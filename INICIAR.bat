@echo off
setlocal EnableExtensions
chcp 65001 >nul
cd /d "%~dp0"
title Conectemos - Instalacion y arranque

echo.
echo   Conectemos  ·  SOFOM E.N.R.
echo   Instalacion y arranque en un solo paso
echo.

where node >nul 2>&1
if errorlevel 1 (
  echo No se encontro Node.js. Se abrira la pagina de descarga.
  echo Instala la version LTS, cierra esta ventana y vuelve a dar
  echo doble clic en INICIAR.bat
  echo.
  start https://nodejs.org
  pause
  exit /b 1
)

echo [1/4] Node.js
node -v
npm -v

if not exist ".env" (
  copy /y ".env.example" ".env" >nul
  echo [2/4] Archivo .env creado
) else (
  echo [2/4] Configuracion lista
)

if not exist "uploads" mkdir uploads
if not exist "prisma" mkdir prisma

echo [3/4] Librerias y base de datos
if not exist "node_modules\next" (
  call npm ci --no-fund --no-audit
  if errorlevel 1 call npm install --no-fund --no-audit
)
call npx prisma generate
call npx prisma db push --skip-generate
call npx prisma db seed

echo [4/4] Encendiendo Conectemos...
start "" "http://localhost:3110"
call npx next dev --turbopack --hostname 0.0.0.0 --port 3110

echo.
echo La plataforma se detuvo. Pulsa una tecla para cerrar.
pause >nul
