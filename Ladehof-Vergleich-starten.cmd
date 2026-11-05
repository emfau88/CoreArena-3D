@echo off
setlocal
cd /d "%~dp0"
echo Ladehof-Vergleich auf diesem PC starten.
echo Dieses Fenster beim Spielen offen lassen und einen der Playlinks oeffnen.
call npm.cmd run preview:environment-test
if errorlevel 1 pause
