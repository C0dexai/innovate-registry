@echo off
start cmd /k "php -S localhost:8000 -t public"
start cmd /k "npm install && npx tsx server.ts"
