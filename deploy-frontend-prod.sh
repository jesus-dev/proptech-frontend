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

# Limpiar logs antiguos (mantener últimos 30 días)
find "$LOG_DIR" -name "frontend-deploy-*.log" -mtime +30 -delete 2>/dev/null || true

# Rotar log de deploy
if [ -f "$DEPLOY_LOG" ]; then
    TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    mv "$DEPLOY_LOG" "$LOG_DIR/frontend-deploy-$TIMESTAMP.log"
fi

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
# Verificar espacio en disco
# ========================
echo "💾 Verificando espacio en disco..."
AVAILABLE_SPACE=$(df -BM "$DEPLOY_DIR" | awk 'NR==2 {print $4}' | sed 's/M//')
if [ "$AVAILABLE_SPACE" -lt 1000 ]; then
    echo "❌ Error: Espacio insuficiente en disco (menos de 1GB disponible)"
    exit 1
fi
echo "✅ Espacio disponible: ${AVAILABLE_SPACE}MB"

# ========================
# Detener servicio COMPLETAMENTE
# ========================
echo "🛑 Deteniendo servicio existente..."
if systemctl is-active --quiet "$SERVICE_NAME" 2>/dev/null; then
    echo "🔍 Servicio $SERVICE_NAME está activo, deteniendo..."
    sudo systemctl stop "$SERVICE_NAME"
    
    # Esperar a que el servicio se detenga completamente
    for i in {1..30}; do
        if ! systemctl is-active --quiet "$SERVICE_NAME"; then
            echo "✅ Servicio detenido correctamente"
            break
        fi
        echo "⏳ Esperando a que el servicio termine... ($i/30)"
        sleep 1
    done
    
    # Si aún está activo, forzar detención BRUTAL
    if systemctl is-active --quiet "$SERVICE_NAME"; then
        echo "⚠️ Servicio no se detuvo, forzando con kill..."
        sudo systemctl kill -s SIGKILL "$SERVICE_NAME"
        sleep 3
    fi
else
    echo "ℹ️ Servicio no estaba ejecutándose"
fi

# Verificar y MATAR todos los procesos en el puerto (asegurar limpieza total)
echo "🔍 Verificando y limpiando puerto 3007..."
if lsof -ti:3007 >/dev/null 2>&1; then
    echo "⚠️ Puerto 3007 en uso, MATANDO todos los procesos..."
    sudo kill -9 $(lsof -ti:3007) 2>/dev/null || true
    sleep 2
    echo "✅ Puerto 3007 liberado"
else
    echo "✅ Puerto 3007 ya está libre"
fi

# Matar cualquier proceso de node/npm que pueda quedar zombie
echo "🧹 Limpiando procesos node/npm zombies..."
pkill -9 -f "npm.*start" 2>/dev/null || true
sleep 1

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
# Limpiar cache y dependencias
# ========================
echo "🧹 Limpiando cache de npm y Next.js..."
rm -rf node_modules .next package-lock.json 2>/dev/null || true
npm cache clean --force 2>/dev/null || true

# ========================
# Instalar dependencias LIMPIAS
# ========================
echo "📦 Instalando dependencias limpias..."
npm install

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
# Compilar aplicación con BUILD_ID único
# ========================
BUILD_ID="build-$(date +%Y%m%d-%H%M%S)"
echo "🔨 Compilando aplicación para producción..."
echo "📦 Build ID: $BUILD_ID"
BUILD_ID=$BUILD_ID npm run build

# ========================
# Verificar que el build fue exitoso
# ========================
if [ ! -d ".next" ]; then
    echo "❌ Error: El build falló - directorio .next no encontrado"
    exit 1
fi

if [ ! -d ".next/standalone" ]; then
    echo "❌ Error: Output standalone no generado"
    exit 1
fi

echo "✅ Build completado exitosamente con ID: $BUILD_ID"

# ========================
# Configurar directorio de producción
# ========================
PROD_DIR="/home/dan/next-app"
echo "📁 Configurando directorio de producción: $PROD_DIR"

# Hacer backup del build anterior si existe
if [ -d "$PROD_DIR/.next" ]; then
    BACKUP_DIR="$PROD_DIR/backups"
    sudo mkdir -p "$BACKUP_DIR"
    TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    echo "💾 Creando backup del build anterior..."
    sudo tar -czf "$BACKUP_DIR/next-build-$TIMESTAMP.tar.gz" -C "$PROD_DIR" .next public package.json 2>/dev/null || true
    echo "✅ Backup guardado en: $BACKUP_DIR/next-build-$TIMESTAMP.tar.gz"
    
    # Mantener solo los últimos 3 backups
    sudo ls -t "$BACKUP_DIR"/next-build-*.tar.gz 2>/dev/null | tail -n +4 | xargs -r sudo rm -f
fi

# Limpiar directorio de producción COMPLETAMENTE (excepto backups)
echo "🧹 Limpiando TODO el directorio de producción..."
sudo find "$PROD_DIR" -mindepth 1 -maxdepth 1 ! -name 'backups' -exec rm -rf {} + 2>/dev/null || true
sudo mkdir -p "$PROD_DIR"

# Asegurar que no queden archivos ocultos o cache
sudo rm -rf "$PROD_DIR"/.next "$PROD_DIR"/node_modules "$PROD_DIR"/.npm 2>/dev/null || true

# 🔥 COPIAR BUILD STANDALONE (más eficiente y correcto)
echo "📦 Copiando build standalone..."
sudo cp -r .next/standalone/. "$PROD_DIR/"
sudo cp -r .next/static "$PROD_DIR/.next/"
sudo cp -r public "$PROD_DIR/"

# Copiar configuración
sudo cp next.config.js "$PROD_DIR/" 2>/dev/null || sudo cp next.config.ts "$PROD_DIR/" 2>/dev/null || echo "⚠️ No se encontró next.config"
sudo cp .env.production "$PROD_DIR/" 2>/dev/null || echo "⚠️ .env.production ya configurado"

# Con standalone NO se necesita npm install (todo viene incluido)
cd "$PROD_DIR"

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
ExecStart=/usr/bin/node server.js
Restart=always
Environment=NODE_ENV=production
Environment=PORT=3007
Environment=HOSTNAME=0.0.0.0

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
FRONTEND_PORT=3007
echo "🌐 Verificando endpoint frontend..."

# Esperar a que el servicio esté completamente iniciado
MAX_WAIT=60
WAIT_COUNT=0
while [ $WAIT_COUNT -lt $MAX_WAIT ]; do
    if curl -s http://localhost:$FRONTEND_PORT > /dev/null 2>&1; then
        echo "✅ Frontend respondiendo correctamente en puerto $FRONTEND_PORT"
        break
    fi
    WAIT_COUNT=$((WAIT_COUNT + 1))
    if [ $((WAIT_COUNT % 5)) -eq 0 ]; then
        echo "⏳ Esperando a que el frontend esté listo... ($WAIT_COUNT/$MAX_WAIT segundos)"
    fi
    sleep 1
done

if [ $WAIT_COUNT -ge $MAX_WAIT ]; then
    echo "⚠️ Frontend no responde después de $MAX_WAIT segundos"
    echo "📋 Últimos logs del servicio:"
    sudo journalctl -u "$SERVICE_NAME" --no-pager -l -n 30
    echo ""
    echo "⚠️ El despliegue continuó pero requiere verificación manual"
fi

# ========================
# 🔥 LIMPIAR CACHE DE CLOUDFLARE (CRÍTICO)
# ========================
echo ""
echo "======================================="
echo "🔥 PASO CRÍTICO: LIMPIAR CACHE"
echo "======================================="

# Intentar ejecutar script de purge automático
if [ -f "$FRONTEND_DIR/scripts/purge-cloudflare.sh" ]; then
    echo "🚀 Ejecutando limpieza automática de Cloudflare..."
    bash "$FRONTEND_DIR/scripts/purge-cloudflare.sh" || {
        echo ""
        echo "⚠️  Limpieza automática no disponible"
        echo "📖 Ver: $FRONTEND_DIR/CACHE_CLOUDFLARE.md para configurar API"
    }
else
    echo "⚠️ Script de purge no encontrado"
fi

echo ""
echo "🔴 IMPORTANTE - LIMPIAR CACHE MANUALMENTE:"
echo "   1. Ir a: https://dash.cloudflare.com"
echo "   2. Seleccionar: proptech.com.py"
echo "   3. Caching > Configuration > Purge Everything"
echo "   4. Confirmar la limpieza"
echo ""
echo "⚠️  SIN ESTE PASO, los usuarios verán errores 404 de chunks viejos"
echo "======================================="
echo ""
sleep 3

# ========================
# Resumen final
# ========================
echo "======================================="
echo "🎉 DESPLIEGUE FRONTEND COMPLETADO"
echo "======================================="
echo "📁 Directorio: $PROD_DIR"
echo "🔧 Servicio: $SERVICE_NAME"
echo "🌐 Puerto: $FRONTEND_PORT"
echo "🌍 URL: https://proptech.com.py"
echo "🔍 Local: http://localhost:$FRONTEND_PORT"
echo ""
echo "📋 Comandos útiles:"
echo "  Ver logs en vivo: sudo journalctl -u $SERVICE_NAME -f"
echo "  Ver logs archivo: tail -f /var/log/proptech/frontend-deploy.log"
echo "  Reiniciar servicio: sudo systemctl restart $SERVICE_NAME"
echo "  Detener servicio: sudo systemctl stop $SERVICE_NAME"
echo "  Estado servicio: sudo systemctl status $SERVICE_NAME"
echo "  Ver backups: ls -lh $PROD_DIR/backups/"
echo ""
echo "🔄 Para hacer rollback al backup anterior:"
echo "  1. sudo systemctl stop $SERVICE_NAME"
echo "  2. cd $PROD_DIR"
echo "  3. sudo tar -xzf backups/\$(ls -t backups/*.tar.gz | head -1)"
echo "  4. sudo systemctl start $SERVICE_NAME"
echo ""
echo ""
echo "🔥🔥🔥 PASOS CRÍTICOS POST-DEPLOY 🔥🔥🔥"
echo ""
echo "1️⃣  LIMPIAR CACHE DE CLOUDFLARE (OBLIGATORIO)"
echo "   → https://dash.cloudflare.com"
echo "   → proptech.com.py > Caching > Purge Everything"
echo "   ⚠️  SIN ESTO = CHUNKS 404 PARA TODOS LOS USUARIOS"
echo ""
echo "2️⃣  HARD REFRESH EN EL NAVEGADOR"
echo "   → Chrome/Edge: Ctrl+Shift+R (Win) o Cmd+Shift+R (Mac)"
echo "   → Firefox: Ctrl+Shift+Delete"
echo "   → O: DevTools (F12) > Click derecho en Recargar > Vaciar caché"
echo ""
echo "📖 Documentación completa:"
echo "   $FRONTEND_DIR/CACHE_CLOUDFLARE.md"
echo ""
echo "🤖 Para automatizar limpieza de Cloudflare:"
echo "   Ver instrucciones en CACHE_CLOUDFLARE.md sección 'API'"
echo "======================================="
