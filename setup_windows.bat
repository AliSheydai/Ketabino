@echo off
echo Running Docker Mirror Setup for Windows...
PowerShell -NoProfile -ExecutionPolicy Bypass -Command "& '%~dp0setup_docker_mirrors_windows.ps1'"
pause
