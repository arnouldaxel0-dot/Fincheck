@echo off
title Fincheck - Demarrage
echo ========================================
echo    FINCHECK - Suivi Financier
echo ========================================
echo.

if not exist "backend\.env" (
    echo [INFO] Creation du fichier .env...
    copy backend\.env.example backend\.env
    echo [!] IMPORTANT : Modifiez backend\.env et changez la SECRET_KEY !
    echo.
)

if not exist "backend\venv" (
    echo [1/3] Creation de l'environnement virtuel Python...
    python -m venv backend\venv
)

echo [2/3] Installation des dependances Python...
call backend\venv\Scripts\activate.bat
pip install -r backend\requirements.txt --quiet

if not exist "frontend\node_modules" (
    echo [3/3] Installation des dependances Node.js...
    cd frontend && npm install && cd ..
)

echo.
echo [OK] Demarrage des serveurs...
echo  Backend  : http://localhost:8000
echo  Frontend : http://localhost:5173
echo  API Docs : http://localhost:8000/docs
echo.

start "Fincheck Backend" cmd /k "cd backend && ..\backend\venv\Scripts\activate.bat && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"
timeout /t 2 /nobreak > nul
start "Fincheck Frontend" cmd /k "cd frontend && npm run dev"

echo Serveurs demarres ! Ouvrez http://localhost:5173
pause
