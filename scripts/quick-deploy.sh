#!/bin/bash

# ⚡ PROPTECH - Deploy Rápido
# ===========================

set -e

# Configuración
APP_DIR="/opt/proptech/frontend"
SERVICE_NAME="proptech-frontend"
PORT=3000

# Colores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}⚡ DEPLOY RÁPIDO - PROPTECH${NC}"
echo "=============================="

# Función para backup rápido
quick_backup() {
    echo -e "${YELLOW}📦 Creando backup rápido...${NC}"
    
    BACKUP_NAME="quick-backup-$(date +%H%M%S)"
    cp -r $APP_DIR /opt/backups/$BACKUP_NAME 2>/dev/null || true
    
    echo -e "${GREEN}✅ Backup creado${NC}"
}

# Función para actualizar código
update_code() {
    echo -e "${BLUE}🔄 Actualizando código...${NC}"
    
    cd $APP_DIR
    git pull origin main
    
    echo -e "${GREEN}✅ Código actualizado${NC}"
}

# Función para build rápido
quick_build() {
    echo -e "${BLUE}🏗️  Build rápido...${NC}"
    
    cd $APP_DIR
    
    # Solo reinstalar si cambió package.json
    if git diff HEAD~1 --name-only | grep -q package.json; then
        echo "📦 Reinstalando dependencias..."
        npm ci
    fi
    
    # Build optimizado
    npm run build
    
    echo -e "${GREEN}✅ Build completado${NC}"
}

# Función para restart
restart_app() {
    echo -e "${BLUE}🔄 Reiniciando aplicación...${NC}"
    
    pm2 restart $SERVICE_NAME
    
    echo -e "${GREEN}✅ Aplicación reiniciada${NC}"
}

# Función para health check
quick_health() {
    echo -e "${BLUE}🏥 Health check...${NC}"
    
    sleep 5
    
    if curl -f http://localhost:$PORT/api/health > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Aplicación funcionando correctamente${NC}"
    else
        echo -e "${RED}❌ Error en health check${NC}"
        pm2 logs $SERVICE_NAME --lines 20
        exit 1
    fi
}

# Función principal
main() {
    quick_backup
    update_code
    quick_build
    restart_app
    quick_health
    
    echo -e "\n${GREEN}🎉 DEPLOY RÁPIDO COMPLETADO!${NC}"
    echo -e "${BLUE}🌐 Aplicación disponible en: https://onproptech.com${NC}"
}

# Ejecutar
main
