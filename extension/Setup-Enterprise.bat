@echo off
TITLE Phishing Detective Enterprise - System Installer
COLOR 1F

:: Check for Administrative privileges (optional but good for pro feel)
:: Using basic user mode install to %LOCALAPPDATA% (Preferred for Chrome extensions)

ECHO.
ECHO  ###############################################################
ECHO  #                                                             #
ECHO  #      PHISHING DETECTIVE ENTERPRISE - INSTALLATION WIZARD    #
ECHO  #                                                             #
ECHO  ###############################################################
ECHO.
ECHO  Welcome. This wizard will install the Enterprise Security Agent.
ECHO.
ECHO  Target Directory: %LOCALAPPDATA%\PhishingDetectiveEnterprise
ECHO.
ECHO  [1] Installing files...

:: Create target directory
if not exist "%LOCALAPPDATA%\PhishingDetectiveEnterprise" mkdir "%LOCALAPPDATA%\PhishingDetectiveEnterprise"

:: Copy files
xcopy /E /I /Y "extension\*" "%LOCALAPPDATA%\PhishingDetectiveEnterprise\" >nul
xcopy /Y "extension\manifest.json" "%LOCALAPPDATA%\PhishingDetectiveEnterprise\" >nul

ECHO  [OK] Files installed successfully.
ECHO.
ECHO  [2] Configuring Browser Integration...
ECHO.
ECHO  -------------------------------------------------------------
ECHO  ACTION REQUIRED:
ECHO  1. A folder window will open.
ECHO  2. Chrome Extensions page will open.
ECHO  3. Drag the folder into Chrome.
ECHO  -------------------------------------------------------------
ECHO.
ECHO  Press any key to complete installation...
PAUSE > NUL

:: Open the installed folder
start "" "%LOCALAPPDATA%\PhishingDetectiveEnterprise"

:: Open Chrome Extensions
start chrome://extensions

CLS
ECHO.
ECHO  ###############################################################
ECHO  #               INSTALLATION COMPLETE                         #
ECHO  ###############################################################
ECHO.
ECHO  The agent is now active. You can delete this downloaded zip file.
ECHO.
PAUSE
