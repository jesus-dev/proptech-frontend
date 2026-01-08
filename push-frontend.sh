#!/bin/bash
set -e

# ========================
# CONFIGURACIÓN
# ========================
REPO_URL=git@github.com:jesus-dev/proptech-frontend.git

cd /Users/jesusgonzalez/Dev/proptech/frontend

echo "📦 Preparando commit en DEV (macOS) - PropTech Frontend..."

# Obtener la rama actual
CURRENT_BRANCH=$(git branch --show-current)
echo "📍 Rama actual: $CURRENT_BRANCH"

# Guardar versiones exactas de Node y NPM
node -v > .node-version
npm -v > .npm-version

echo "✅ Archivos de versiones creados: .node-version y .npm-version"

# Congelar dependencias en package-lock.json (respeta lock actual)
echo "📦 Asegurando dependencias..."
npm install --legacy-peer-deps

echo "✅ Dependencias aseguradas en package-lock.json"

# Verificar estado del repositorio
echo "🔍 Verificando estado del repositorio..."
git status

# Subir al repo
echo "⬆️  Subiendo cambios..."
git add .
git commit -m "deploy: actualizar código y dependencias PropTech" || echo "ℹ️  No hay cambios para commitear"
git push origin $CURRENT_BRANCH

echo "✅ Código y dependencias subidos a $REPO_URL ($CURRENT_BRANCH)"

