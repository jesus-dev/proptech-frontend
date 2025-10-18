#!/bin/bash

echo "🔍 Diagnosticando problema de producción..."
echo ""

# 1. Verificar estado del servicio
echo "1️⃣ Verificando servicio proptech-frontend..."
sudo systemctl status proptech-frontend --no-pager -l
echo ""

# 2. Verificar que el puerto 3007 responde
echo "2️⃣ Verificando puerto 3007..."
curl -I http://localhost:3007 || echo "❌ Puerto 3007 no responde"
echo ""

# 3. Verificar archivos estáticos
echo "3️⃣ Verificando archivos estáticos..."
if [ -d "/home/dan/next-app/.next/static" ]; then
    echo "✅ Directorio .next/static existe"
    ls -lh /home/dan/next-app/.next/static/ | head -10
else
    echo "❌ Directorio .next/static NO existe"
fi
echo ""

# 4. Ver logs recientes
echo "4️⃣ Logs recientes del servicio..."
sudo journalctl -u proptech-frontend --no-pager -n 50
echo ""

# 5. Reiniciar servicio
echo "5️⃣ Reiniciando servicio..."
sudo systemctl restart proptech-frontend
sleep 5

# 6. Verificar que inició correctamente
echo "6️⃣ Verificando reinicio..."
if systemctl is-active --quiet proptech-frontend; then
    echo "✅ Servicio activo"
else
    echo "❌ Servicio NO está activo"
fi
echo ""

# 7. Verificar endpoint nuevamente
echo "7️⃣ Verificando endpoint después del reinicio..."
curl -I http://localhost:3007
echo ""

echo "✅ Diagnóstico completado"

