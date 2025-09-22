#!/bin/bash
set -e

# ========================
# CONFIGURACIÓN
# ========================
REPO_URL="git@github.com:jesus-dev/proptech-frontend.git"
BRANCH="main"
APP_DIR="/home/dan/next-app"

echo "⬇️ Deploy desde $REPO_URL ($BRANCH)"
echo "📂 Carpeta destino: $APP_DIR"

# ========================
# CLONAR O ACTUALIZAR
# ========================
if [ ! -d "$APP_DIR/.git" ]; then
  echo "📥 Clonando repo en $APP_DIR..."
  rm -rf "$APP_DIR"
  git clone -b "$BRANCH" "$REPO_URL" "$APP_DIR"
  cd "$APP_DIR"
else
  echo "🔄 Actualizando repo existente..."
  cd "$APP_DIR"
  git fetch origin
  git checkout "$BRANCH"
  git pull origin "$BRANCH"
fi

# ========================
# CONFIGURAR AMBIENTE
# ========================
echo "⚙️ Configurando ambiente..."

NODE_VERSION=$(cat .node-version)
NPM_VERSION=$(cat .npm-version)

echo "📦 Usando Node $NODE_VERSION y NPM $NPM_VERSION"

# Requiere nvm instalado
nvm install $NODE_VERSION
nvm use $NODE_VERSION
npm install -g npm@$NPM_VERSION

# ========================
# DEPENDENCIAS Y BUILD
# ========================
echo "📦 Instalando dependencias..."
rm -rf node_modules
npm ci

echo "🏗️ Construyendo Next.js..."
export NEXT_PUBLIC_API_URL=https://api.proptech.com.py
export NEXT_PUBLIC_UPLOADS_URL=https://api.proptech.com.py/uploads
export NEXT_PUBLIC_ENABLE_MOCK_DATA=false
export NEXT_PUBLIC_ENABLE_ANALYTICS=true
npm run build

echo "🚀 Iniciando aplicación..."
npm run start
