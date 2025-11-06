#!/bin/bash
set -euo pipefail

# ========================
# Script para testear build standalone localmente
# ========================

echo "🧪 Testeando configuración de build standalone..."

# Limpiar builds anteriores
echo "🧹 Limpiando builds anteriores..."
rm -rf .next

# Build con output standalone
echo "🔨 Generando build..."
BUILD_ID="test-$(date +%Y%m%d-%H%M%S)" npm run build

# Verificar que standalone se generó
if [ ! -d ".next/standalone" ]; then
    echo "❌ Error: Output standalone no se generó"
    echo "Verifica que next.config.js tenga: output: 'standalone'"
    exit 1
fi

if [ ! -f ".next/standalone/server.js" ]; then
    echo "❌ Error: server.js no encontrado en standalone"
    exit 1
fi

echo "✅ Build standalone generado correctamente"

# Verificar estructura
echo ""
echo "📁 Estructura del build:"
echo "   - .next/standalone/server.js: $([ -f .next/standalone/server.js ] && echo '✅' || echo '❌')"
echo "   - .next/static/: $([ -d .next/static ] && echo "✅ ($(ls -1 .next/static/chunks/*.js 2>/dev/null | wc -l) chunks)" || echo '❌')"
echo "   - public/: $([ -d public ] && echo '✅' || echo '❌')"

# Contar chunks generados
CHUNK_COUNT=$(ls -1 .next/static/chunks/*.js 2>/dev/null | wc -l | tr -d ' ')
echo ""
echo "📊 Estadísticas del build:"
echo "   - Chunks JS generados: $CHUNK_COUNT"
echo "   - Tamaño .next/: $(du -sh .next 2>/dev/null | cut -f1)"
echo "   - Tamaño standalone/: $(du -sh .next/standalone 2>/dev/null | cut -f1)"

# Test de inicio rápido
echo ""
echo "🚀 Para probar el build localmente:"
echo "   cd .next/standalone"
echo "   cp -r ../../public ./public"
echo "   cp -r ../.next/static ./.next/"
echo "   PORT=3007 node server.js"
echo ""
echo "   Luego abrir: http://localhost:3007"

echo ""
echo "✅ Build standalone listo para deploy"

