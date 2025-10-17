#!/bin/bash
set -euo pipefail

# ========================
# CONFIGURACIÓN DE PRODUCCIÓN
# ========================
REPO_URL=git@github.com:jesus-dev/proptech-backend.git
BRANCH=main
DEPLOY_DIR="/home/dan"
BACKEND_DIR="$DEPLOY_DIR/proptech-backend"
SERVICE_NAME="proptech-backend"
JAVA_VERSION="21"
MAVEN_VERSION="3.9"

LOG_DIR="/var/log/proptech"
DEPLOY_LOG="$LOG_DIR/deploy.log"

mkdir -p "$LOG_DIR"
exec > >(tee -a "$DEPLOY_LOG") 2>&1

echo "======================================="
echo "🚀 Despliegue Backend PropTech"
echo "📅 $(date)"
echo "======================================="

# ========================
# Verificar dependencias
# ========================
echo "🔍 Verificando dependencias..."

if ! java -version 2>&1 | grep -q "version \"$JAVA_VERSION"; then
    echo "❌ Java $JAVA_VERSION no encontrado. Instalando..."
    sudo apt update -y
    sudo apt install -y openjdk-$JAVA_VERSION-jdk
fi

if ! mvn -version 2>&1 | grep -q "Apache Maven $MAVEN_VERSION"; then
    echo "❌ Maven $MAVEN_VERSION no encontrado. Instalando..."
    sudo apt install -y maven
fi

# ========================
# Clonar o actualizar repositorio
# ========================
if [ -d "$BACKEND_DIR" ]; then
    echo "📥 Actualizando repositorio existente..."
    cd "$BACKEND_DIR"
    git fetch origin
    git reset --hard origin/$BRANCH
    git clean -fd
else
    echo "📥 Clonando repositorio..."
    cd "$DEPLOY_DIR"
    git clone -b "$BRANCH" "$REPO_URL" proptech-backend
    cd "$BACKEND_DIR"
fi

# ========================
# Configurar permisos
# ========================
mkdir -p "$LOG_DIR" /var/lib/proptech/uploads
sudo chown -R $USER:$USER "$BACKEND_DIR" "$LOG_DIR" /var/lib/proptech

# ========================
# Compilar aplicación
# ========================
echo "🔨 Compilando aplicación limpia..."
cd "$BACKEND_DIR"
mvn clean package -DskipTests -Dquarkus.package.type=uber-jar -q

JAR_FILE=$(ls -1 target/on-backend-*-runner.jar 2>/dev/null | head -n1 || true)
if [[ -z "${JAR_FILE:-}" ]]; then
    echo "❌ Error: no se generó el runner JAR"
    exit 1
fi
echo "✅ Runner JAR generado: $JAR_FILE"

# ========================
# Detener servicio existente
# ========================
echo "🛑 Deteniendo servicio existente..."
if systemctl is-active --quiet "$SERVICE_NAME" 2>/dev/null; then
    sudo systemctl stop "$SERVICE_NAME"
    echo "✅ Servicio detenido"
else
    echo "ℹ️ Servicio no estaba ejecutándose"
fi

# ========================
# Crear directorio de aplicación
# ========================
APP_DIR="/opt/proptech-backend"
echo "📁 Configurando directorio de aplicación: $APP_DIR"
sudo mkdir -p "$APP_DIR"
sudo cp "$JAR_FILE" "$APP_DIR/"
sudo chown -R $USER:$USER "$APP_DIR"

# ========================
# Crear script de inicio
# ========================
echo "📝 Creando script de inicio..."
cat > "$APP_DIR/start.sh" << 'EOF'
#!/bin/bash
cd /opt/proptech-backend
java -jar on-backend-*-runner.jar \
    --quarkus.http.host=0.0.0.0 \
    --quarkus.http.port=8080 \
    --quarkus.datasource.jdbc.url=jdbc:postgresql://localhost:5432/proptech \
    --quarkus.datasource.username=proptech_user \
    --quarkus.datasource.password=proptech_pass \
    --quarkus.log.level=INFO \
    --quarkus.log.file.path=/var/log/proptech/backend.log \
    --quarkus.log.file.enable=true
EOF

chmod +x "$APP_DIR/start.sh"

# ========================
# Crear servicio systemd
# ========================
echo "⚙️ Configurando servicio systemd..."
sudo tee /etc/systemd/system/$SERVICE_NAME.service > /dev/null << EOF
[Unit]
Description=PropTech Backend Service
After=network.target postgresql.service
Wants=postgresql.service

[Service]
Type=simple
User=$USER
Group=$USER
WorkingDirectory=$APP_DIR
ExecStart=$APP_DIR/start.sh
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal
SyslogIdentifier=proptech-backend

# Variables de entorno
Environment=JAVA_HOME=/usr/lib/jvm/java-$JAVA_VERSION-openjdk-amd64
Environment=PATH=/usr/lib/jvm/java-$JAVA_VERSION-openjdk-amd64/bin:\$PATH

# Límites de recursos
LimitNOFILE=65536
LimitNPROC=32768

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
echo "🚀 Iniciando servicio..."
sudo systemctl start "$SERVICE_NAME"

# ========================
# Verificar estado
# ========================
echo "🔍 Verificando estado del servicio..."
sleep 5

if systemctl is-active --quiet "$SERVICE_NAME"; then
    echo "✅ Servicio iniciado correctamente"
    echo "📊 Estado del servicio:"
    sudo systemctl status "$SERVICE_NAME" --no-pager -l
else
    echo "❌ Error: El servicio no se inició correctamente"
    echo "📋 Logs del servicio:"
    sudo journalctl -u "$SERVICE_NAME" --no-pager -l -n 20
    exit 1
fi

# ========================
# Verificar endpoint
# ========================
echo "🌐 Verificando endpoint de salud..."
sleep 10

if curl -s http://localhost:8080/api/health > /dev/null; then
    echo "✅ Endpoint de salud respondiendo correctamente"
else
    echo "⚠️ Endpoint de salud no responde, verificando logs..."
    sudo journalctl -u "$SERVICE_NAME" --no-pager -l -n 10
fi

# ========================
# Resumen final
# ========================
echo "======================================="
echo "🎉 DESPLIEGUE BACKEND COMPLETADO"
echo "======================================="
echo "📁 Directorio: $APP_DIR"
echo "🔧 Servicio: $SERVICE_NAME"
echo "🌐 Puerto: 8080"
echo "🌍 URL API: https://apiproptech.ontech.com.py"
echo "📋 Logs: sudo journalctl -u $SERVICE_NAME -f"
echo "🔄 Reiniciar: sudo systemctl restart $SERVICE_NAME"
echo "📊 Estado: sudo systemctl status $SERVICE_NAME"
echo "======================================="