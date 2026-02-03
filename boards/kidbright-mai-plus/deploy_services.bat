
@echo off
set "PATH=%~dp0;%PATH%"
REM This script uploads and executes the WebSocket shell server on the KidBright MAI V2 board.

REM Prerequisites:
REM 1. OpenSSH (for scp and ssh) must be installed and in your system's PATH.
REM    (Often included with Git for Windows: C:\Program Files\Git\usr\bin)
REM 2. sshpass must be installed and in your system's PATH to handle password authentication automatically.

REM --- Configuration ---
set "BOARD_IP=10.150.36.1"
set "BOARD_USER=root"
set "BOARD_PASS=root"
set "LOCAL_SCRIPT_PATH=scripts\ws_shell.py"
set "REMOTE_SCRIPT_PATH=/root/ws_shell.py"

REM --- Prerequisite Check ---
where sshpass >nul 2>nul
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] sshpass is not installed or not in your system's PATH.
    echo Please install sshpass to automate password entry.
    echo You can often install it using a package manager like Chocolatey or Scoop.
    echo.
    goto :eof
)

cls
echo ===================================================================
echo ===================================================================
echo  Deploying Board Services (Shell + Stream) to KidBright MAI V2
echo ===================================================================
echo.
echo    Board IP: %BOARD_IP%
echo    Local file: %LOCAL_SCRIPT_PATH%
echo    Remote path: %REMOTE_SCRIPT_PATH%
echo.


REM --- Step 1: Upload the script ---
echo [1/3] Uploading ws_shell.py via scp...
echo.
sshpass -p "%BOARD_PASS%" scp -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null "%LOCAL_SCRIPT_PATH%" %BOARD_USER%@%BOARD_IP%:%REMOTE_SCRIPT_PATH%

if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Failed to upload ws_shell.py.
    goto :error_end
)

echo [1.5/3] Fixing line endings for ws_shell.py...
sshpass -p "%BOARD_PASS%" ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null %BOARD_USER%@%BOARD_IP% "dos2unix %REMOTE_SCRIPT_PATH%"

REM --- Step 2: Upload startup script ---
echo [2/3] Uploading enable_startup.sh...
set "LOCAL_STARTUP_SCRIPT=scripts\enable_startup.sh"
set "REMOTE_STARTUP_SCRIPT=/root/enable_startup.sh"

sshpass -p "%BOARD_PASS%" scp -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null "%LOCAL_STARTUP_SCRIPT%" %BOARD_USER%@%BOARD_IP%:%REMOTE_STARTUP_SCRIPT%

if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Failed to upload enable_startup.sh.
    goto :error_end
)

REM --- Step 2.5: Upload stream script ---
echo [2.5/3] Uploading maix_stream.py...
set "LOCAL_STREAM_SCRIPT=maix_stream.py"
set "REMOTE_STREAM_SCRIPT=/root/maix_stream.py"

sshpass -p "%BOARD_PASS%" scp -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null "%LOCAL_STREAM_SCRIPT%" %BOARD_USER%@%BOARD_IP%:%REMOTE_STREAM_SCRIPT%

if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Failed to upload maix_stream.py.
    goto :error_end
)

echo [2.6/3] Fixing line endings for maix_stream.py...
sshpass -p "%BOARD_PASS%" ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null %BOARD_USER%@%BOARD_IP% "dos2unix %REMOTE_STREAM_SCRIPT%"

)

)

REM --- Step 2.8: Generate SSL Certificates LOCALLY and Upload ---
echo [2.8/3] Generating SSL Certificates locally...
if not exist "cert.pem" (
    echo Generating new self-signed certs...
    openssl req -x509 -newkey rsa:2048 -keyout key.pem -out cert.pem -days 365 -nodes -subj "//CN=10.150.36.1"
) else (
    echo Certs already exist locally.
)

echo Uploading certs to board...
sshpass -p "%BOARD_PASS%" scp -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null "cert.pem" %BOARD_USER%@%BOARD_IP%:/root/cert.pem
sshpass -p "%BOARD_PASS%" scp -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null "key.pem" %BOARD_USER%@%BOARD_IP%:/root/key.pem

if %errorlevel% neq 0 (
    echo.
    echo [WARNING] Failed to upload SSL certs. WSS might not work.
)

REM --- Step 3: Execute startup script ---
echo [3/3] executing enable_startup.sh...
REM Use dos2unix to safely convert line endings
sshpass -p "%BOARD_PASS%" ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null %BOARD_USER%@%BOARD_IP% "chmod +x %REMOTE_STARTUP_SCRIPT% && %REMOTE_STARTUP_SCRIPT%"

if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Failed to execute startup script.
    goto :error_end
)

echo.
echo ===================================================================
echo  Deployment Successful!
echo  ws_shell.py is now running and configured to start on boot.
echo ===================================================================
echo.
goto :eof

:error_end
echo.
echo [FAIL] Deployment failed. Please check connection and try again.
exit /b 1
