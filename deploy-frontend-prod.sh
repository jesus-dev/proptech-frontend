#!/bin/bash
set -euo pipefail

# ========================
# CONFIGURACIÓN DE PRODUCCIÓN FRONTEND
# ========================
REPO_URL=git@github.com:jesus-dev/proptech-frontend.git
BRANCH=main
DEPLOY_DIR="/home/dan"
FRONTEND_DIR="$DEPLOY_DIR/proptech-frontend"
SERVICE_NAME="proptech-frontend"
NODE_VERSION="20"

LOG_DIR="/var/log/proptech"
DEPLOY_LOG="$LOG_DIR/frontend-deploy.log"

mkdir -p "$LOG_DIR"
exec > >(tee -a "$DEPLOY_LOG") 2>&1

echo "======================================="
echo "🚀 Despliegue Frontend PropTech"
echo "📅 $(date)"
echo "======================================="

# ========================
# Verificar dependencias
# ========================
echo "🔍 Verificando dependencias..."

if ! command -v node &> /dev/null || ! node -v | grep -q "v$NODE_VERSION"; then
    echo "❌ Node.js $NODE_VERSION no encontrado. Instalando..."
    curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# Nginx no se usa en este proyecto

# ========================
# Limpiar instalación anterior
# ========================
echo "🧹 Limpiando instalación anterior..."
if [ -d "$FRONTEND_DIR" ]; then
    echo "🗑️ Eliminando directorio existente..."
    rm -rf "$FRONTEND_DIR"
fi

# ========================
# Clonar repositorio limpio
# ========================
echo "📥 Clonando repositorio limpio..."
cd "$DEPLOY_DIR"
git clone -b "$BRANCH" "$REPO_URL" proptech-frontend
cd "$FRONTEND_DIR"

# ========================
# Verificar que estamos en el commit correcto
# ========================
echo "🔍 Verificando commit actual..."
CURRENT_COMMIT=$(git rev-parse HEAD)
echo "📋 Commit actual: $CURRENT_COMMIT"
echo "📋 Rama: $(git branch --show-current)"

# ========================
# Instalar dependencias
# ========================
echo "📦 Instalando dependencias..."
npm ci --production=false

# ========================
# Actualizar información de versión (opcional)
# ========================
echo "📋 Actualizando información de versión..."
if [ -f "update-version.js" ]; then
  node update-version.js
else
  echo "⚠️ update-version.js no encontrado, saltando..."
fi

# ========================
# Configurar variables de entorno
# ========================
echo "⚙️ Configurando variables de entorno..."
cat > .env.production << EOF
# Configuración de producción para PropTech Frontend
# URL del backend a través de Cloudflare Tunnel
# API Configuration
NEXT_PUBLIC_API_URL=https://api.proptech.com.py
NEXT_PUBLIC_UPLOADS_URL=https://api.proptech.com.py/uploads
NEXT_PUBLIC_IMAGE_BASE_URL=https://api.proptech.com.py

# Configuración de la aplicación
NEXT_PUBLIC_APP_NAME=PropTech
NEXT_PUBLIC_APP_VERSION=1.0.0

# Configuración de entorno
NODE_ENV=production
NEXT_PUBLIC_ENVIRONMENT=production

# Configuración de logging
NEXT_PUBLIC_ENABLE_DEBUG=false
NEXT_PUBLIC_ENABLE_CONSOLE_LOGS=false

# Configuración de timeout
NEXT_PUBLIC_API_TIMEOUT=30000

# Configuración de CORS
NEXT_PUBLIC_CORS_ENABLED=true

# Información de build
BUILD_NUMBER=$(date +%Y%m%d%H%M%S)
GIT_COMMIT=$CURRENT_COMMIT
EOF

# ========================
# Compilar aplicación
# ========================
echo "🔨 Compilando aplicación para producción..."
npm run build

# ========================
# Verificar que el build fue exitoso
# ========================
if [ ! -d ".next" ]; then
    echo "❌ Error: El build falló - directorio .next no encontrado"
    exit 1
fi

echo "✅ Build completado exitosamente"

# ========================
# Configurar directorio de producción
# ========================
PROD_DIR="/home/dan/next-app"
echo "📁 Configurando directorio de producción: $PROD_DIR"

# Limpiar directorio de producción
sudo rm -rf "$PROD_DIR"
sudo mkdir -p "$PROD_DIR"

# Copiar archivos necesarios
sudo cp -r .next "$PROD_DIR/"
sudo cp -r public "$PROD_DIR/"
sudo cp package.json "$PROD_DIR/"
sudo cp package-lock.json "$PROD_DIR/"
sudo cp next.config.ts "$PROD_DIR/"

# Instalar solo dependencias de producción
cd "$PROD_DIR"
sudo npm ci --production=true

# Configurar permisos
sudo chown -R dan:dan "$PROD_DIR"
sudo chmod -R 755 "$PROD_DIR"

# Nginx no se usa - Next.js corre directamente en puerto 3000

# ========================
# Crear servicio systemd para Next.js (respeta configuración existente)
# ========================
echo "⚙️ Configurando servicio systemd para Next.js..."
sudo tee /etc/systemd/system/$SERVICE_NAME.service > /dev/null << EOF
[Unit]
Description=PropTech App
After=network.target

[Service]
Type=simple
User=dan
WorkingDirectory=$PROD_DIR
ExecStart=/usr/bin/npm run start -- -p 3007
Restart=always
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
EOF

# ========================
# Recargar systemd y habilitar servicio
# ========================
echo "🔄 Recargando configuración de systemd..."
sudo systemctl daemon-reload
sudo systemctl enable "$SERVICE_NAME"

# ========================
# Iniciar servicio
# ========================
echo "🚀 Iniciando servicio frontend..."
sudo systemctl start "$SERVICE_NAME"

# ========================
# Verificar estado
# ========================
echo "🔍 Verificando estado del servicio..."
sleep 10

if systemctl is-active --quiet "$SERVICE_NAME"; then
    echo "✅ Servicio frontend iniciado correctamente"
    echo "📊 Estado del servicio:"
    sudo systemctl status "$SERVICE_NAME" --no-pager -l
else
    echo "❌ Error: El servicio frontend no se inició correctamente"
    echo "📋 Logs del servicio:"
    sudo journalctl -u "$SERVICE_NAME" --no-pager -l -n 20
    exit 1
fi

# ========================
# Verificar endpoint
# ========================
echo "🌐 Verificando endpoint frontend..."
sleep 15

if curl -s http://localhost:3007 > /dev/null; then
    echo "✅ Frontend respondiendo en puerto 3007"
else
    echo "⚠️ Frontend no responde en puerto 3007, verificando logs..."
    sudo journalctl -u "$SERVICE_NAME" --no-pager -l -n 10
fi

# ========================
# Resumen final
# ========================
echo "======================================="
echo "🎉 DESPLIEGUE FRONTEND COMPLETADO"
echo "======================================="
echo "📁 Directorio: $PROD_DIR"
echo "🔧 Servicio: $SERVICE_NAME"
echo "🌐 Puerto: 3007 (directo)"
echo "🌍 URL: https://proptech.com.py"
echo "📋 Logs: sudo journalctl -u $SERVICE_NAME -f"
echo "🔄 Reiniciar: sudo systemctl restart $SERVICE_NAME"
echo "📊 Estado: sudo systemctl status $SERVICE_NAME"
echo "======================================="
