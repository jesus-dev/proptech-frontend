#!/bin/bash
set -euo pipefail

# ========================
# Script para limpiar cache de Cloudflare
# ========================

CREDENTIALS_FILE="/home/dan/.cloudflare-credentials"

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "🧹 Limpiando cache de Cloudflare..."

# Verificar si existen credenciales
if [ ! -f "$CREDENTIALS_FILE" ]; then
    echo -e "${YELLOW}⚠️  Credenciales de Cloudflare no configuradas${NC}"
    echo ""
    echo "Para configurar limpieza automática:"
    echo "1. Crear archivo: sudo nano $CREDENTIALS_FILE"
    echo "2. Agregar:"
    echo "   CLOUDFLARE_ZONE_ID=tu_zone_id"
    echo "   CLOUDFLARE_API_TOKEN=tu_api_token"
    echo "3. Guardar y proteger: sudo chmod 600 $CREDENTIALS_FILE"
    echo ""
    echo "📖 Obtener credenciales:"
    echo "   - Zone ID: Dashboard > dominio > API (esquina inferior derecha)"
    echo "   - API Token: Dashboard > My Profile > API Tokens > Create Token"
    echo "     Permisos necesarios: Zone.Cache Purge"
    echo ""
    echo -e "${YELLOW}🔧 Por ahora, limpia manualmente desde el Dashboard de Cloudflare${NC}"
    echo "   https://dash.cloudflare.com > proptech.com.py > Caching > Purge Everything"
    exit 0
fi

# Cargar credenciales
source "$CREDENTIALS_FILE"

# Verificar que las variables están definidas
if [ -z "${CLOUDFLARE_ZONE_ID:-}" ] || [ -z "${CLOUDFLARE_API_TOKEN:-}" ]; then
    echo -e "${RED}❌ Error: Credenciales incompletas en $CREDENTIALS_FILE${NC}"
    echo "Debe contener CLOUDFLARE_ZONE_ID y CLOUDFLARE_API_TOKEN"
    exit 1
fi

# Purgar todo el cache
echo "🚀 Purgando cache completo..."
RESPONSE=$(curl -s -X POST "https://api.cloudflare.com/client/v4/zones/$CLOUDFLARE_ZONE_ID/purge_cache" \
    -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
    -H "Content-Type: application/json" \
    --data '{"purge_everything":true}')

# Verificar respuesta
SUCCESS=$(echo "$RESPONSE" | grep -o '"success":[^,]*' | cut -d':' -f2)

if [ "$SUCCESS" = "true" ]; then
    echo -e "${GREEN}✅ Cache de Cloudflare limpiado exitosamente${NC}"
    echo ""
    echo "🎉 Ahora los usuarios recibirán el contenido más reciente"
    echo "⚠️  Recuerda hacer Hard Refresh en el navegador:"
    echo "   - Chrome/Edge: Ctrl+Shift+R (Win) o Cmd+Shift+R (Mac)"
    echo "   - Firefox: Ctrl+Shift+Delete"
else
    echo -e "${RED}❌ Error al limpiar cache de Cloudflare${NC}"
    echo "Respuesta de API:"
    echo "$RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$RESPONSE"
    echo ""
    echo "💡 Verifica:"
    echo "   1. Que el API Token tenga permisos de Cache Purge"
    echo "   2. Que el Zone ID sea correcto"
    echo "   3. Que el token no haya expirado"
    exit 1
fi

