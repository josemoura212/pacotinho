#!/bin/sh
set -e

echo "Rodando migrations..."
node node_modules/drizzle-kit/bin.cjs push --config=drizzle.config.ts

echo "Rodando seed..."
node --import tsx src/lib/db/seed.ts

echo "Iniciando app..."
exec node server.js
