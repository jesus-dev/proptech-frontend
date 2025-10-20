const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Encontrar todos los archivos con errores de sintaxis
const output = execSync('npm run build 2>&1 || true', { encoding: 'utf8' });

// Extraer archivos con errores
const errorFiles = [...output.matchAll(/\[36;1;4m([^\[]+\.(?:tsx?|jsx?))\[0m/g)].map(m => m[1]);
const uniqueFiles = [...new Set(errorFiles)];

console.log(`Encontrados ${uniqueFiles.length} archivos con errores`);
uniqueFiles.forEach(f => console.log(`  - ${f}`));

process.exit(0);
