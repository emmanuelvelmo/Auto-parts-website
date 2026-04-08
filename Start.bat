@echo off
chcp 65001 >nul
title Autoparts Store - Servidor Node.js

cd /d %~dp0

for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8000 ^| findstr LISTENING 2^>nul') do (
    taskkill /F /PID %%a >nul 2>&1
)

start /min cmd /c timeout /t 2 >nul 2>&1 ^&^& start http://localhost:8000

node backend/server.js >nul 2>&1

pause >nul