@echo off
set "PATH=%~dp0;%PATH%"
REM ===================================================================
REM Initial setup: brings a fresh KidBright MAI V2 board to a state
REM where the IDE can connect and take over.
REM
REM Lays down:
REM   /root/ws_shell.py             - WSS server the IDE connects to
REM   /root/maix_stream.py          - MJPEG camera streamer (port 8000)
REM   /root/scripts/voice_stream.py - voice capture daemon (port 5000)
REM   /root/scripts/mjpg.py         - rpyc helper used by AI flows
REM   /etc/init.d/S99ws_shell       - boots ws_shell + maix_stream on power-up
REM   /root/cert.pem + /root/key.pem - self-signed cert for wss://
REM
REM After the first run, the IDE re-pushes /root/ws_shell.py and
REM /root/scripts/* on every connect (see _uploadBoardScripts in
REM websocket-shell.js), so subsequent updates don't need this script —
REM they ride along on the next IDE session and a board reboot.
REM
REM Prerequisites:
REM   1. OpenSSH (scp, ssh) on PATH — typically C:\Program Files\Git\usr\bin
REM   2. sshpass on PATH — install via Chocolatey/Scoop
REM   3. openssl on PATH (only needed if cert.pem doesn't already exist)
REM ===================================================================

REM --- Configuration ---
set "BOARD_IP=10.155.55.1"
set "BOARD_USER=root"
set "BOARD_PASS=root"

set "SCP=sshpass -p %BOARD_PASS% scp -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null"
set "SSH=sshpass -p %BOARD_PASS% ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null %BOARD_USER%@%BOARD_IP%"

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
echo  Deploying Board Services to KidBright MAI V2
echo ===================================================================
echo    Board IP: %BOARD_IP%
echo.

REM --- Step 1: Make sure /root/scripts/ exists on the board ---
echo [1/6] Ensuring /root/scripts/ exists on the board...
%SSH% "mkdir -p /root/scripts"
if %errorlevel% neq 0 (
    echo [ERROR] Failed to create /root/scripts/.
    goto :error_end
)

REM --- Step 2: Upload all board scripts ---
echo [2/6] Uploading ws_shell.py and subsystem scripts...
%SCP% "scripts\ws_shell.py"     %BOARD_USER%@%BOARD_IP%:/root/ws_shell.py
if %errorlevel% neq 0 ( echo [ERROR] ws_shell.py upload failed. & goto :error_end )

%SCP% "scripts\voice_stream.py" %BOARD_USER%@%BOARD_IP%:/root/scripts/voice_stream.py
if %errorlevel% neq 0 ( echo [ERROR] voice_stream.py upload failed. & goto :error_end )

%SCP% "scripts\mjpg.py"         %BOARD_USER%@%BOARD_IP%:/root/scripts/mjpg.py
if %errorlevel% neq 0 ( echo [ERROR] mjpg.py upload failed. & goto :error_end )

%SCP% "maix_stream.py"          %BOARD_USER%@%BOARD_IP%:/root/maix_stream.py
if %errorlevel% neq 0 ( echo [ERROR] maix_stream.py upload failed. & goto :error_end )

%SCP% "scripts\S99ws_shell"     %BOARD_USER%@%BOARD_IP%:/root/S99ws_shell
if %errorlevel% neq 0 ( echo [ERROR] S99ws_shell upload failed. & goto :error_end )

REM --- Step 3: Convert CRLF -> LF for any file scp may have left in
REM      Windows EOL form (busybox sh chokes on \r\n) ---
echo [3/6] Fixing line endings on uploaded files...
%SSH% "dos2unix /root/ws_shell.py /root/scripts/voice_stream.py /root/scripts/mjpg.py /root/maix_stream.py /root/S99ws_shell"

REM --- Step 4: Generate / upload SSL certificates ---
echo [4/6] Generating SSL Certificates locally (if needed)...
if not exist "cert.pem" (
    echo Generating new self-signed certs...
    openssl req -x509 -newkey rsa:2048 -keyout key.pem -out cert.pem -days 365 -nodes -subj "//CN=10.150.36.1"
) else (
    echo Certs already exist locally — reusing.
)

echo [5/6] Uploading certs to board...
%SCP% "cert.pem" %BOARD_USER%@%BOARD_IP%:/root/cert.pem
%SCP% "key.pem"  %BOARD_USER%@%BOARD_IP%:/root/key.pem
if %errorlevel% neq 0 (
    echo [WARNING] Failed to upload SSL certs. WSS might not work.
)

REM --- Step 6: Move S99 init script into place + chmod ---
echo [6/6] Wiring S99ws_shell into /etc/init.d/...
%SSH% "mv /root/S99ws_shell /etc/init.d/S99ws_shell && chmod 755 /etc/init.d/S99ws_shell && sync"
if %errorlevel% neq 0 (
    echo [ERROR] Failed to configure init script.
    goto :error_end
)

echo.
echo ===================================================================
echo  Deployment Successful!
echo  Reboot the board to start ws_shell + maix_stream automatically.
echo  After that, the IDE will keep /root/scripts/* in sync on each
echo  connect — no need to rerun this script for ordinary updates.
echo ===================================================================
echo.
goto :eof

:error_end
echo.
echo [FAIL] Deployment failed. Please check connection and try again.
exit /b 1
