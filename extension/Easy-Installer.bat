@echo off
TITLE Phishing Detective Enterprise - System Installer
COLOR 0A
CLS

:: =========================================================================
::  TIER-1 BROWSER EXTENSION INSTALLATION UTILITY
::  Target: Google Chrome
::  Objective: Securely launch extension management for sideloading
::  Context: Professional Web Security Tooling
:: =========================================================================

ECHO.
ECHO  [ SYSTEM SECURITY AGENT ]
ECHO  Initializing installation environment...
ECHO.

:: -------------------------------------------------------------------------
::  PATH DETECTION LOGIC
::  Objective: Locate the authentic Chrome binary.
::  Rationale: We avoid shell protocol handlers (start chrome://) to prevent
::             OS-level interference, default browser conflicts, or Store 
::             popups on hardened Windows builds.
:: -------------------------------------------------------------------------

set "CHROME_EXE="

:: 1. Check Standard 64-bit Program Files (Most common enterprise path)
IF EXIST "%ProgramFiles%\Google\Chrome\Application\chrome.exe" (
    set "CHROME_EXE=%ProgramFiles%\Google\Chrome\Application\chrome.exe"
)

:: 2. Check 32-bit Program Files (Legacy/Compatibility mode)
IF NOT DEFINED CHROME_EXE (
    IF EXIST "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe" (
        set "CHROME_EXE=%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe"
    )
)

:: 3. Check User Local AppData (User-mode installs)
IF NOT DEFINED CHROME_EXE (
    IF EXIST "%LocalAppData%\Google\Chrome\Application\chrome.exe" (
        set "CHROME_EXE=%LocalAppData%\Google\Chrome\Application\chrome.exe"
    )
)

:: -------------------------------------------------------------------------
::  EXECUTION OR FAILURE HANDLING
:: -------------------------------------------------------------------------

IF DEFINED CHROME_EXE (
    ECHO  [+] Google Chrome detected at:
    ECHO      "%CHROME_EXE%"
    ECHO.
    ECHO  [+] Launching Extension Management Console...
    ECHO.
    ECHO  -------------------------------------------------------------
    ECHO   ACTION REQUIRED:
    ECHO   1. Toggle 'Developer mode' ON (Top Right Toggle)
    ECHO   2. Drag the 'extension' folder onto the Chrome window
    ECHO  -------------------------------------------------------------
    ECHO.
    
    :: Launch Chrome directly to the target URL. 
    :: Quoting handles spaces in paths securely. Empty quotes are for Title.
    start "" "%CHROME_EXE%" "chrome://extensions"
    
) ELSE (
    :: Chrome not found. Fail secure and silent (no popups).
    COLOR 0C
    ECHO.
    ECHO  [!] CRITICAL: Google Chrome was not detected on this system.
    ECHO.
    ECHO      Please open Chrome manually and navigate to:
    ECHO      chrome://extensions
    ECHO.
    ECHO      Then proceed with the installation steps.
    ECHO.
)

ECHO.
PAUSE
