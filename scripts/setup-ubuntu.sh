#!/bin/bash

# 🛠️ PROPTECH - Setup Inicial Ubuntu VM
# =====================================

set -e

# Configuración
PROJECT_NAME="proptech-frontend"
USER="ubuntu"
APP_DIR="/opt/proptech"

# Colores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m'

echo -e "${PURPLE}"
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                  🛠️  PROPTECH SETUP                         ║"
echo "║                Configuración Inicial Ubuntu                  ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Función para instalar dependencias básicas
install_basics() {
    echo -e "${BLUE}📦 Instalando dependencias básicas...${NC}"
    
    sudo apt update
    sudo apt upgrade -y
    sudo apt install -y curl wget git unzip software-properties-common
    
    echo -e "${GREEN}✅ Dependencias básicas instaladas${NC}"
}

# Función para instalar Node.js
install_nodejs() {
    echo -e "${BLUE}📦 Instalando Node.js 18 LTS...${NC}"
    
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
    
    echo -e "${GREEN}✅ Node.js instalado: $(node --version)${NC}"
}

# Función para instalar PM2
install_pm2() {
    echo -e "${BLUE}📦 Instalando PM2...${NC}"
    
    sudo npm install -g pm2
    
    echo -e "${GREEN}✅ PM2 instalado: $(pm2 --version)${NC}"
}

# Función para instalar Nginx
install_nginx() {
    echo -e "${BLUE}📦 Instalando Nginx...${NC}"
    
    sudo apt install -y nginx
    sudo systemctl enable nginx
    sudo systemctl start nginx
    
    echo -e "${GREEN}✅ Nginx instalado y iniciado${NC}"
}

# Función para instalar cloudflared
install_cloudflared() {
    echo -e "${BLUE}📦 Instalando cloudflared...${NC}"
    
    wget -q https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
    sudo dpkg -i cloudflared-linux-amd64.deb
    rm cloudflared-linux-amd64.deb
    
    echo -e "${GREEN}✅ cloudflared instalado${NC}"
}

# Función para configurar usuario
setup_user() {
    echo -e "${BLUE}👤 Configurando usuario $USER...${NC}"
    
    # Agregar usuario a grupos necesarios
    sudo usermod -aG www-data $USER
    sudo usermod -aG sudo $USER
    
    # Crear directorios con permisos correctos
    sudo mkdir -p $APP_DIR
    sudo mkdir -p /opt/backups
    sudo mkdir -p /var/log
    
    sudo chown -R $USER:$USER $APP_DIR
    sudo chown -R $USER:$USER /opt/backups
    
    echo -e "${GREEN}✅ Usuario configurado${NC}"
}

# Función para configurar firewall
setup_firewall() {
    echo -e "${BLUE}🔥 Configurando firewall...${NC}"
    
    sudo ufw allow 22/tcp   # SSH
    sudo ufw allow 80/tcp   # HTTP
    sudo ufw allow 443/tcp  # HTTPS
    sudo ufw --force enable
    
    echo -e "${GREEN}✅ Firewall configurado${NC}"
}

# Función para configurar swap (si es necesario)
setup_swap() {
    echo -e "${BLUE}💾 Verificando memoria swap...${NC}"
    
    if [ $(free -m | awk 'NR==2{printf "%.0f", $3/$2*100}') -gt 80 ]; then
        echo -e "${BLUE}📈 Configurando swap de 2GB...${NC}"
        
        sudo fallocate -l 2G /swapfile
        sudo chmod 600 /swapfile
        sudo mkswap /swapfile
        sudo swapon /swapfile
        
        echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
        
        echo -e "${GREEN}✅ Swap configurado${NC}"
    else
        echo -e "${GREEN}✅ Memoria suficiente, no se necesita swap${NC}"
    fi
}

# Función para configurar Git
setup_git() {
    echo -e "${BLUE}🔧 Configurando Git...${NC}"
    
    echo "Por favor configura tu Git:"
    read -p "Git username: " git_username
    read -p "Git email: " git_email
    
    git config --global user.name "$git_username"
    git config --global user.email "$git_email"
    
    echo -e "${GREEN}✅ Git configurado${NC}"
}

# Función para configurar SSH keys
setup_ssh() {
    echo -e "${BLUE}🔑 Configurando SSH...${NC}"
    
    if [ ! -f ~/.ssh/id_rsa ]; then
        echo "Generando clave SSH..."
        ssh-keygen -t rsa -b 4096 -f ~/.ssh/id_rsa -N ""
        
        echo -e "${GREEN}✅ Clave SSH generada${NC}"
        echo -e "${BLUE}📋 Tu clave pública SSH:${NC}"
        cat ~/.ssh/id_rsa.pub
        echo ""
        echo "Agrega esta clave a tu GitHub/GitLab para clonar repositorios privados"
    else
        echo -e "${GREEN}✅ Clave SSH ya existe${NC}"
    fi
}

# Función principal
main() {
    install_basics
    install_nodejs
    install_pm2
    install_nginx
    install_cloudflared
    setup_user
    setup_firewall
    setup_swap
    setup_git
    setup_ssh
    
    echo -e "\n${PURPLE}🎉 SETUP COMPLETADO EXITOSAMENTE!${NC}"
    echo -e "\n${BLUE}📋 Próximos pasos:${NC}"
    echo "1. Clona tu repositorio: git clone <tu-repo> $APP_DIR"
    echo "2. Ejecuta el deploy: ./scripts/deploy-ubuntu.sh"
    echo "3. Configura tu dominio en Cloudflare"
    echo ""
    echo -e "${GREEN}🚀 ¡Tu servidor está listo para producción!${NC}"
}

# Ejecutar setup
main
