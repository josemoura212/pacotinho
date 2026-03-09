#!/bin/sh
set -e

echo "========================================="
echo "  Pacotinho - Iniciando servidor"
echo "========================================="

exec ./node_modules/.bin/tsx src/server.ts
