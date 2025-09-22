#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Patrones para encontrar imágenes no optimizadas
const IMG_PATTERNS = [
  'src/**/*.tsx',
  'src/**/*.jsx',
  'src/**/*.ts',
  'src/**/*.js'
];

// Función para optimizar un archivo
function optimizeFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Reemplazar <img> con <Image> de Next.js
  const imgRegex = /<img([^>]*?)src=["']([^"']+)["']([^>]*?)>/g;
  content = content.replace(imgRegex, (match, before, src, after) => {
    // Verificar si ya es un componente Image
    if (content.includes('import Image from "next/image"') || 
        content.includes("import Image from 'next/image'")) {
      return match; // Ya está optimizado
    }

    // Extraer atributos
    const altMatch = after.match(/alt=["']([^"']+)["']/);
    const alt = altMatch ? altMatch[1] : '';
    const classNameMatch = (before + after).match(/className=["']([^"']+)["']/);
    const className = classNameMatch ? classNameMatch[1] : '';

    // Crear componente Image optimizado
    const optimizedImg = `<Image
      src="${src}"
      alt="${alt}"
      ${className ? `className="${className}"` : ''}
      width={500}
      height={300}
      style={{ objectFit: 'cover' }}
    />`;

    modified = true;
    return optimizedImg;
  });

  // Agregar import de Image si se encontraron imágenes
  if (modified && !content.includes('import Image from "next/image"') && !content.includes("import Image from 'next/image'")) {
    const importRegex = /import React[^;]+;/;
    const imageImport = 'import Image from "next/image";';
    
    if (importRegex.test(content)) {
      content = content.replace(importRegex, `$&\n${imageImport}`);
    } else {
      content = `${imageImport}\n${content}`;
    }
  }

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Optimizado: ${filePath}`);
  }
}

// Función principal
function main() {
  console.log('🚀 Iniciando optimización de imágenes...\n');

  let totalFiles = 0;
  let optimizedFiles = 0;

  IMG_PATTERNS.forEach(pattern => {
    const files = glob.sync(pattern, { cwd: process.cwd() });
    totalFiles += files.length;

    files.forEach(file => {
      try {
        optimizeFile(file);
        optimizedFiles++;
      } catch (error) {
        console.error(`❌ Error optimizando ${file}:`, error.message);
      }
    });
  });

  console.log(`\n📊 Resumen:`);
  console.log(`   - Archivos procesados: ${totalFiles}`);
  console.log(`   - Archivos optimizados: ${optimizedFiles}`);
  console.log(`\n✨ Optimización completada!`);
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  main();
}

module.exports = { optimizeFile, main }; 