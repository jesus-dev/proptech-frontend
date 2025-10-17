#!/bin/bash
set -e

# ========================
# CONFIGURACIÓN
# ========================
REPO_URL=git@github.com:jesus-dev/proptech-backend.git
BRANCH=main

cd "/Users/jesusgonzalez/Dev/proptech/backend"

echo "📦 Preparando commit en DEV (macOS) - PropTech Backend..."

# Guardar versiones exactas de Java y Maven
java -version 2>&1 | head -n1 > .java-version
mvn -version | head -n1 > .maven-version

echo "📄 Archivos de versiones creados: .java-version y .maven-version"

# Limpiar y compilar para verificar que todo funciona
echo "🔨 Compilando backend PropTech..."
mvn clean compile -q

echo "✅ Compilación exitosa"

# Verificar si el remoto existe
if ! git remote get-url origin >/dev/null 2>&1; then
    echo "⚠️  Configurando repositorio remoto..."
    git remote add origin "$REPO_URL"
fi

# Subir al repo
git add .
git commit -m "deploy: actualizar código backend PropTech" || echo "ℹ️  No hay cambios para commitear"

# Intentar push, si falla mostrar instrucciones
if ! git push -u origin "$BRANCH" 2>/dev/null; then
    echo "❌ Error al hacer push. Posibles causas:"
    echo "   1. El repositorio $REPO_URL no existe en GitHub"
    echo "   2. No tienes permisos de escritura"
    echo "   3. Necesitas crear el repositorio primero"
    echo ""
    echo "💡 Soluciones:"
    echo "   - Crear el repositorio en GitHub: https://github.com/new"
    echo "   - Verificar permisos de acceso"
    echo "   - Usar HTTPS en lugar de SSH si es necesario"
    exit 1
fi

echo "✅ Código backend PropTech subido a $REPO_URL ($BRANCH)"
