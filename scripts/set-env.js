#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const environment = process.argv[2] || 'development';

const envFiles = {
  development: '.env.local',
  production: '.env.production'
};

const envFile = envFiles[environment];

if (!envFile) {
  console.error(`❌ Entorno no válido: ${environment}`);
  console.log('Entornos disponibles: development, production');
  process.exit(1);
}

const envPath = path.join(__dirname, '..', envFile);

if (!fs.existsSync(envPath)) {
  console.error(`❌ Archivo ${envFile} no encontrado`);
  process.exit(1);
}

console.log(`✅ Usando configuración para: ${environment}`);
console.log(`📁 Archivo: ${envFile}`);

// Mostrar configuración actual
const envContent = fs.readFileSync(envPath, 'utf8');
console.log('\n📋 Configuración actual:');
console.log(envContent);
