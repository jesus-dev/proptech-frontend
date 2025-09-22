#!/bin/zsh
set -e

cd /Users/jesusgonzalez/Dev/proptech/frontend

echo "📦 Preparando commit en DEV (frontend)..."

# Guardar versiones exactas
node -v > .node-version
npm -v > .npm-version

npm install

git add .

# Solo commitear si hay cambios
if ! git diff --cached --quiet; then
  git commit -m "deploy: actualizar frontend"
else
  echo "ℹ️ No hay cambios para commitear"
fi

# Detectar si la rama tiene upstream configurado
if git rev-parse --abbrev-ref --symbolic-full-name @{u} >/dev/null 2>&1; then
  git push
else
  git push -u origin main
fi

echo "✅ Frontend subido al repo"