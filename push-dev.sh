#!/bin/bash
set -e

# ========================
# CONFIGURACIÓN
# ========================
REPO_URL="git@github.com:jesus-dev/proptech-frontend.git"
BRANCH="main"

echo "📦 Preparando commit en DEV (macOS)..."

# Guardar versiones exactas de Node y NPM
node -v > .node-version
npm -v > .npm-version

echo "📄 Archivos de versiones creados: .node-version y .npm-version"

# Congelar dependencias en package-lock.json (respeta lock actual)
npm install

echo "🔒 Dependencias aseguradas en package-lock.json"

# Subir al repo
git add .
git commit -m "deploy: actualizar código y dependencias"
git push origin $BRANCH

echo "✅ Código y dependencias subidos a $REPO_URL ($BRANCH)"
