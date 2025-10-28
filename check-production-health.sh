#!/bin/bash

# ========================
# VERIFICACIÓN DE SALUD DE PRODUCCIÓN
# ========================
# Verifica el estado de la aplicación en producción desde local
# ========================

PROD_URL="https://proptech.com.py"
API_URL="https://api.proptech.com.py"

echo "======================================="
echo "🏥 VERIFICACIÓN DE SALUD - PRODUCCIÓN"
echo "📅 $(date)"
echo "======================================="

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# ========================
# 1. Verificar frontend principal
# ========================
echo ""
echo "1️⃣ Verificando Frontend Principal..."
echo "   URL: $PROD_URL"
echo ""

RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -L "$PROD_URL" 2>/dev/null)
if [ "$RESPONSE" = "200" ]; then
    echo -e "${GREEN}✅ Frontend principal respondiendo (HTTP $RESPONSE)${NC}"
else
    echo -e "${RED}❌ Frontend principal con error (HTTP $RESPONSE)${NC}"
fi

# ========================
# 2. Verificar página de login
# ========================
echo ""
echo "2️⃣ Verificando Página de Login..."
echo "   URL: $PROD_URL/login"
echo ""

RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -L "$PROD_URL/login" 2>/dev/null)
if [ "$RESPONSE" = "200" ]; then
    echo -e "${GREEN}✅ Página de login respondiendo (HTTP $RESPONSE)${NC}"
else
    echo -e "${RED}❌ Página de login con error (HTTP $RESPONSE)${NC}"
fi

# ========================
# 3. Verificar archivos estáticos (Next.js chunks)
# ========================
echo ""
echo "3️⃣ Verificando Archivos Estáticos de Next.js..."
echo ""

# Obtener el HTML de la página de login para extraer las rutas de los chunks
HTML=$(curl -s -L "$PROD_URL/login" 2>/dev/null)

# Extraer algunas URLs de chunks del HTML
CHUNK_URLS=$(echo "$HTML" | grep -oP '/_next/static/[^"]+\.(js|css)' | head -5)

if [ -n "$CHUNK_URLS" ]; then
    echo "📦 Verificando chunks encontrados en el HTML:"
    echo ""
    
    ERROR_COUNT=0
    SUCCESS_COUNT=0
    
    while IFS= read -r CHUNK_PATH; do
        if [ -n "$CHUNK_PATH" ]; then
            CHUNK_URL="$PROD_URL$CHUNK_PATH"
            RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -L "$CHUNK_URL" 2>/dev/null)
            CONTENT_TYPE=$(curl -s -I -L "$CHUNK_URL" 2>/dev/null | grep -i "content-type" | cut -d: -f2 | tr -d '[:space:]')
            
            # Verificar si es el tipo correcto
            if [[ "$CHUNK_PATH" == *.js ]]; then
                EXPECTED_TYPE="application/javascript"
            elif [[ "$CHUNK_PATH" == *.css ]]; then
                EXPECTED_TYPE="text/css"
            fi
            
            # Verificar respuesta
            if [ "$RESPONSE" = "200" ]; then
                # Verificar content-type
                if [[ "$CONTENT_TYPE" == *"$EXPECTED_TYPE"* ]] || [[ "$CONTENT_TYPE" == *"javascript"* && "$CHUNK_PATH" == *.js ]] || [[ "$CONTENT_TYPE" == *"css"* && "$CHUNK_PATH" == *.css ]]; then
                    echo -e "  ${GREEN}✅${NC} $CHUNK_PATH (HTTP $RESPONSE, $CONTENT_TYPE)"
                    SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
                elif [[ "$CONTENT_TYPE" == *"text/html"* ]]; then
                    echo -e "  ${RED}❌${NC} $CHUNK_PATH (HTTP $RESPONSE, PERO retorna HTML - 404 page)"
                    ERROR_COUNT=$((ERROR_COUNT + 1))
                else
                    echo -e "  ${YELLOW}⚠️${NC}  $CHUNK_PATH (HTTP $RESPONSE, $CONTENT_TYPE - tipo inesperado)"
                    ERROR_COUNT=$((ERROR_COUNT + 1))
                fi
            else
                echo -e "  ${RED}❌${NC} $CHUNK_PATH (HTTP $RESPONSE)"
                ERROR_COUNT=$((ERROR_COUNT + 1))
            fi
        fi
    done <<< "$CHUNK_URLS"
    
    echo ""
    if [ $ERROR_COUNT -eq 0 ]; then
        echo -e "${GREEN}✅ Todos los archivos estáticos se sirven correctamente ($SUCCESS_COUNT/$((SUCCESS_COUNT + ERROR_COUNT)))${NC}"
    else
        echo -e "${RED}❌ Hay problemas con archivos estáticos ($ERROR_COUNT errores)${NC}"
        echo -e "${YELLOW}   Esto explica el error 'ChunkLoadError' en el navegador${NC}"
    fi
else
    echo -e "${RED}❌ No se pudieron extraer URLs de chunks del HTML${NC}"
    echo "   Esto indica que la página de login no está cargando correctamente"
fi

# ========================
# 4. Verificar API Backend
# ========================
echo ""
echo "4️⃣ Verificando Backend API..."
echo "   URL: $API_URL/health"
echo ""

RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -L "$API_URL/health" 2>/dev/null)
if [ "$RESPONSE" = "200" ]; then
    echo -e "${GREEN}✅ Backend API respondiendo (HTTP $RESPONSE)${NC}"
    
    # Obtener info adicional del health check
    HEALTH_DATA=$(curl -s -L "$API_URL/health" 2>/dev/null)
    if [ -n "$HEALTH_DATA" ]; then
        echo "   Información de salud:"
        echo "$HEALTH_DATA" | python3 -m json.tool 2>/dev/null || echo "$HEALTH_DATA"
    fi
else
    echo -e "${RED}❌ Backend API con error (HTTP $RESPONSE)${NC}"
fi

# ========================
# 5. Verificar conectividad general
# ========================
echo ""
echo "5️⃣ Verificando Conectividad General..."
echo ""

# Verificar DNS
echo "🌐 DNS Resolution:"
DNS_RESULT=$(dig +short proptech.com.py 2>/dev/null | head -1)
if [ -n "$DNS_RESULT" ]; then
    echo -e "  ${GREEN}✅${NC} proptech.com.py → $DNS_RESULT"
else
    echo -e "  ${YELLOW}⚠️${NC}  No se pudo resolver DNS (puede ser normal si usa Cloudflare)"
fi

# Verificar SSL
echo ""
echo "🔒 SSL Certificate:"
SSL_INFO=$(echo | openssl s_client -servername proptech.com.py -connect proptech.com.py:443 2>/dev/null | openssl x509 -noout -dates 2>/dev/null)
if [ -n "$SSL_INFO" ]; then
    echo -e "  ${GREEN}✅${NC} Certificado SSL válido"
    echo "$SSL_INFO" | sed 's/^/     /'
else
    echo -e "  ${YELLOW}⚠️${NC}  No se pudo verificar SSL"
fi

# ========================
# 6. Resumen
# ========================
echo ""
echo "======================================="
echo "📊 RESUMEN:"
echo "======================================="
echo ""

# Determinar estado general
FRONTEND_OK=false
API_OK=false
STATIC_FILES_OK=false

RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -L "$PROD_URL" 2>/dev/null)
[ "$RESPONSE" = "200" ] && FRONTEND_OK=true

RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -L "$API_URL/health" 2>/dev/null)
[ "$RESPONSE" = "200" ] && API_OK=true

[ $ERROR_COUNT -eq 0 ] && STATIC_FILES_OK=true

if $FRONTEND_OK && $API_OK && $STATIC_FILES_OK; then
    echo -e "${GREEN}✅ Sistema completamente operativo${NC}"
    echo ""
    echo "🎉 ¡Todo funciona correctamente!"
elif ! $STATIC_FILES_OK; then
    echo -e "${RED}❌ PROBLEMA CRÍTICO: Archivos estáticos no se sirven correctamente${NC}"
    echo ""
    echo "🔧 SOLUCIONES:"
    echo "   1. Ejecutar script de fix en el servidor:"
    echo "      ssh dan@servidor 'cd /home/dan && ./fix-production-static-files.sh'"
    echo ""
    echo "   2. O rebuild manual:"
    echo "      ssh dan@servidor 'cd /home/dan && ./deploy-frontend-prod.sh'"
    echo ""
    echo "   3. Limpiar caché de Cloudflare:"
    echo "      https://dash.cloudflare.com > proptech.com.py > Purge Everything"
    echo ""
    echo "📖 Documentación completa: PRODUCTION_STATIC_FILES_FIX.md"
else
    echo -e "${YELLOW}⚠️  Sistema parcialmente operativo${NC}"
    echo ""
    [ ! $FRONTEND_OK ] && echo "  • Frontend: ❌ No responde"
    [ ! $API_OK ] && echo "  • API Backend: ❌ No responde"
    echo ""
    echo "Ver documentación para más detalles"
fi

echo ""
echo "======================================="

# ========================
# 7. Test adicional: Intentar cargar la página completa
# ========================
echo ""
echo "7️⃣ Test Adicional: Cargando página completa..."
echo ""

# Intentar obtener el HTML completo de login
HTML_SIZE=$(curl -s -L "$PROD_URL/login" 2>/dev/null | wc -c)
if [ $HTML_SIZE -gt 1000 ]; then
    echo -e "${GREEN}✅ Página de login tiene contenido ($HTML_SIZE bytes)${NC}"
else
    echo -e "${RED}❌ Página de login muy pequeña o vacía ($HTML_SIZE bytes)${NC}"
fi

# Verificar si el HTML contiene errores conocidos
HTML_CONTENT=$(curl -s -L "$PROD_URL/login" 2>/dev/null)
if echo "$HTML_CONTENT" | grep -q "Application error"; then
    echo -e "${RED}❌ Página contiene 'Application error'${NC}"
elif echo "$HTML_CONTENT" | grep -q "ChunkLoadError"; then
    echo -e "${RED}❌ Página contiene 'ChunkLoadError'${NC}"
else
    echo -e "${GREEN}✅ No se detectaron errores en el contenido HTML${NC}"
fi

echo ""
echo "🏁 Verificación completa."
echo ""

