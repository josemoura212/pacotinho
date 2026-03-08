#!/bin/sh
set -e

echo "========================================="
echo "  Pacotinho - Inicializando container"
echo "========================================="

echo "[1/3] Sincronizando schema do banco..."
./node_modules/.bin/drizzle-kit push --config=drizzle.config.ts --force
echo "[1/3] Schema sincronizado!"

echo "[2/3] Rodando seed..."
./node_modules/.bin/tsx src/lib/db/seed.ts
echo "[2/3] Seed concluído!"

echo "[3/3] Iniciando servidor Next.js..."
exec node server.js
