@echo off
chcp 65001
title Autoparts Store - Servidor Node.js
echo =================================
echo    AUTOPARTS STORE
echo =================================
echo.
echo Iniciando servidor...
echo.

cd /d %~dp0

for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8000 ^| findstr LISTENING') do (
    echo Terminando proceso con PID %%a que usa el puerto 8000...
    taskkill /F /PID %%a
)

echo.
echo NOTA: Las sesiones son temporales.
echo.
echo Para acceder al sitio web:
echo http://localhost:8000
echo http://localhost:8000/frontend/index.html
echo.

start /min cmd /c timeout /t 2 ^&^& start http://localhost:8000

echo Presiona Ctrl+C para detener el servidor
echo.
node backend/server.js

echo.
echo Servidor detenido
echo =================================
echo.
pause