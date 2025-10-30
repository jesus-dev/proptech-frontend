#!/bin/bash

############################################
# Script de Deploy LIMPIO - Frontend
# Limpia todo y hace deploy desde cero
############################################

set -e

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}"
echo "============================================"
echo "🧹 DEPLOY LIMPIO - Proptech Frontend"
echo "============================================"
echo -e "${NC}"
echo "📅 $(date)"
echo ""

# Configuración
PROD_DIR="/home/dan/next-app"
SERVICE_NAME="proptech-frontend"
PORT=3007

# 1. Detener servicio
echo -e "${YELLOW}1️⃣ Deteniendo servicio...${NC}"
sudo systemctl stop "$SERVICE_NAME" 2>/dev/null || echo "Servicio no estaba corriendo"
sleep 2

# 2. Matar procesos en puerto
echo -e "${YELLOW}2️⃣ Liberando puerto $PORT...${NC}"
sudo lsof -ti:$PORT | xargs -r sudo kill -9 2>/dev/null || echo "Puerto ya libre"
sleep 1

# 3. Limpiar directorio de producción
echo -e "${YELLOW}3️⃣ Limpiando directorio de producción...${NC}"
if [ -d "$PROD_DIR" ]; then
    # Hacer backup antes de limpiar
    BACKUP_DIR="$PROD_DIR/backups"
    sudo mkdir -p "$BACKUP_DIR"
    TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    
    if [ -d "$PROD_DIR/.next" ]; then
        echo "💾 Creando backup..."
        sudo tar -czf "$BACKUP_DIR/pre-clean-$TIMESTAMP.tar.gz" -C "$PROD_DIR" . 2>/dev/null || true
    fi
    
    # Limpiar TODO excepto backups
    echo "🗑️ Eliminando archivos antiguos..."
    sudo find "$PROD_DIR" -mindepth 1 -maxdepth 1 ! -name 'backups' -exec rm -rf {} + 2>/dev/null || true
fi

sudo mkdir -p "$PROD_DIR"

# 4. Limpiar node_modules local
echo -e "${YELLOW}4️⃣ Limpiando node_modules local...${NC}"
rm -rf node_modules
rm -rf .next
rm -f package-lock.json

# 5. Instalar dependencias limpias
echo -e "${YELLOW}5️⃣ Instalando dependencias limpias...${NC}"
npm install

# 6. Build de producción
echo -e "${YELLOW}6️⃣ Compilando para producción...${NC}"
NODE_ENV=production npm run build

if [ ! -d ".next" ]; then
    echo -e "${RED}❌ Build falló - directorio .next no encontrado${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Build completado${NC}"

# 7. Copiar archivos al servidor
echo -e "${YELLOW}7️⃣ Copiando archivos al directorio de producción...${NC}"
sudo cp -r .next "$PROD_DIR/"
sudo cp -r public "$PROD_DIR/"
sudo cp package.json "$PROD_DIR/"
sudo cp package-lock.json "$PROD_DIR/"

if [ -f "next.config.js" ]; then
    sudo cp next.config.js "$PROD_DIR/"
elif [ -f "next.config.ts" ]; then
    sudo cp next.config.ts "$PROD_DIR/"
fi

# 8. Configurar variables de entorno
echo -e "${YELLOW}8️⃣ Configurando variables de entorno...${NC}"
sudo tee "$PROD_DIR/.env.production" > /dev/null << 'EOF'
# Producción - Proptech Frontend
NEXT_PUBLIC_API_URL=https://api.proptech.com.py
NEXT_PUBLIC_UPLOADS_URL=https://api.proptech.com.py/uploads
NEXT_PUBLIC_IMAGE_BASE_URL=https://api.proptech.com.py
NODE_ENV=production
NEXT_PUBLIC_ENVIRONMENT=production
EOF

# 9. Instalar dependencias en producción
echo -e "${YELLOW}9️⃣ Instalando dependencias de producción...${NC}"
cd "$PROD_DIR"
sudo npm ci --production=true --no-audit

# 10. Configurar permisos
echo -e "${YELLOW}🔐 Configurando permisos...${NC}"
sudo chown -R dan:dan "$PROD_DIR"
sudo chmod -R 755 "$PROD_DIR"

# 11. Reiniciar servicio
echo -e "${YELLOW}🔄 Reiniciando servicio...${NC}"
sudo systemctl daemon-reload
sudo systemctl enable "$SERVICE_NAME"
sudo systemctl restart "$SERVICE_NAME"

# 12. Verificar
echo -e "${YELLOW}🔍 Verificando servicio...${NC}"
sleep 5

if systemctl is-active --quiet "$SERVICE_NAME"; then
    echo -e "${GREEN}✅ Servicio ACTIVO${NC}"
else
    echo -e "${RED}❌ Servicio NO ACTIVO${NC}"
    echo "Ver logs: sudo journalctl -u $SERVICE_NAME -n 50"
    exit 1
fi

# 13. Test de conexión
echo -e "${YELLOW}🌐 Verificando endpoint...${NC}"
RETRIES=20
for i in $(seq 1 $RETRIES); do
    if curl -s http://localhost:$PORT > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Frontend respondiendo en puerto $PORT${NC}"
        break
    fi
    if [ $i -eq $RETRIES ]; then
        echo -e "${RED}❌ Frontend no responde después de $RETRIES intentos${NC}"
        exit 1
    fi
    echo "⏳ Esperando... ($i/$RETRIES)"
    sleep 2
done

# Resumen
echo ""
echo -e "${GREEN}"
echo "============================================"
echo "🎉 DEPLOY LIMPIO COMPLETADO"
echo "============================================"
echo -e "${NC}"
echo "📁 Directorio: $PROD_DIR"
echo "🔧 Servicio: $SERVICE_NAME"
echo "🌐 Puerto: $PORT"
echo "🌍 URL: https://proptech.com.py"
echo ""
echo "📋 Comandos útiles:"
echo "  sudo systemctl status $SERVICE_NAME"
echo "  sudo journalctl -u $SERVICE_NAME -f"
echo "  sudo systemctl restart $SERVICE_NAME"
echo ""
echo -e "${GREEN}✨ Sistema actualizado y funcionando${NC}"

