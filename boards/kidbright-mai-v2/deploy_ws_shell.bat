
@echo off
REM This script uploads and executes the WebSocket shell server on the KidBright MAI V2 board.

REM Prerequisites:
REM 1. OpenSSH (for scp and ssh) must be installed and in your system's PATH.
REM    (Often included with Git for Windows: C:\Program Files\Git\usr\bin)
REM 2. sshpass must be installed and in your system's PATH to handle password authentication automatically.

REM --- Configuration ---
set "BOARD_IP=10.90.153.1"
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
echo  Deploying WebSocket Shell to KidBright MAI V2
necho ===================================================================
echo.
echo    Board IP: %BOARD_IP%
echo    Local file: %LOCAL_SCRIPT_PATH%
echo    Remote path: %REMOTE_SCRIPT_PATH%
echo.


REM --- Step 1: Upload the script ---
echo [1/2] Uploading ws_shell.py via scp...
echo.
sshpass -p "%BOARD_PASS%" scp -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null "%LOCAL_SCRIPT_PATH%" %BOARD_USER%@%BOARD_IP%:%REMOTE_SCRIPT_PATH%

if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Failed to upload the script.
    echo Please check the following:
    echo   - The board is connected to the network and the IP address is correct.
    echo   - The password is correct.
    echo   - scp and sshpass are working correctly.
    echo.
    goto :eof
)


echo.
echo Upload complete.
echo.

ssh root@10.90.153.1
