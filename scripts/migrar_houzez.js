const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const mime = require('mime-types');
const axios = require('axios');

const WP_API = 'https://onbienesraices.com.py/wp-json/wp/v2/properties';
const WP_MEDIA = 'https://onbienesraices.com.py/wp-json/wp/v2/media/';
const WP_TAX = 'https://onbienesraices.com.py/wp-json/wp/v2/';
const BACKEND_API = 'http://localhost:8080/api/properties'; // Cambia esto a tu endpoint real

// 🔐 JWT TOKEN - Obtén el token desde el frontend después de hacer login
// Instrucciones:
// 1. Abre http://localhost:3000 en tu navegador
// 2. Haz login como admin
// 3. Abre DevTools (F12) → Application → LocalStorage → http://localhost:3000
// 4. Copia el valor de 'token' y pégalo aquí abajo
const JWT_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJwZXJtaXNzaW9ucyI6WyJDT05UUkFDVFNfQ1JFQVRFIiwiUEVSTUlTU0lPTlNfUkVBRCIsIlNBTEVTX1VQREFURSIsIlNVQlNDUklQVElPTlNfQ1JFQVRFIiwiT1dORVJTX1BST1BFUlRZX1VQREFURSIsIlBFUk1JU1NJT05TX1VQREFURSIsIkRFVkVMT1BNRU5UX0NSRUFURSIsIkRFVkVMT1BNRU5UU19SRUFEIiwiUEVSTUlTU0lPTl9VUERBVEUiLCJDT05UQUNUU19VUERBVEUiLCJST0xFX0FTU0lHTl9QRVJNSVNTSU9OUyIsIlBFUk1JU1NJT05fQ1JFQVRFIiwiUFJPUEVSVFlfUkVBRCIsIlVTRVJTX0RFQUNUSVZBVEUiLCJTWVNURU1fQkFDS1VQIiwiUk9MRV9VUERBVEUiLCJVU0VSX0FDVElWQVRFIiwiQ09OVEFDVFNfREVMRVRFIiwiT1dORVJTX1BST1BFUlRZX0NSRUFURSIsIkRFVkVMT1BNRU5UX1JFQUQiLCJDT05UUkFDVFNfVVBEQVRFIiwiUEVSTUlTU0lPTl9ERUxFVEUiLCJDQUxFTkRBUl9ERUxFVEUiLCJQUk9QRVJUSUVTX1JFQUQiLCJQRVJNSVNTSU9OX1JFQUQiLCJQUk9QRVJUWV9DUkVBVEUiLCJDQUxFTkRBUl9SRUFEIiwiVVNFUl9VUERBVEUiLCJSRVBPUlRfUkVBRCIsIkRFVkVMT1BNRU5UX0RFTEVURSIsIlNBTEVTX0RFTEVURSIsIkNBTEVOREFSX1VQREFURSIsIlZJU0lUU19ERUxFVEUiLCJTWVNURU1fUkVTVE9SRSIsIlVTRVJTX0NSRUFURSIsIlJPTEVTX0FTU0lHTl9QRVJNSVNTSU9OUyIsIlNBTEVTX1JFQUQiLCJQQVJUTkVSU19SRUFEIiwiQUdFTkRBX1JFQUQiLCJVU0VSX0NSRUFURSIsIklOQk9YX1VQREFURSIsIlNVQlNDUklQVElPTlNfREVMRVRFIiwiT1dORVJTX1BST1BFUlRZX0RFTEVURSIsIkRBU0hCT0FSRF9SRUFEIiwiVVNFUl9ERUxFVEUiLCJQUk9QRVJUWV9ERUxFVEUiLCJTWVNURU1fQ09ORklHIiwiVVNFUl9ERUFDVElWQVRFIiwiUkVQT1JUX0VYUE9SVCIsIkFHRU5EQV9DUkVBVEUiLCJVU0VSU19SRUFEIiwiUk9MRVNfQ1JFQVRFIiwiUFJPUEVSVElFU19VUERBVEUiLCJST0xFU19SRUFEIiwiUk9MRV9SRUFEIiwiVklTSVRTX1JFQUQiLCJDQUxFTkRBUl9DUkVBVEUiLCJQRVJNSVNTSU9OU19DUkVBVEUiLCJERVZFTE9QTUVOVFNfVVBEQVRFIiwiUk9MRVNfREVMRVRFIiwiU1VCU0NSSVBUSU9OU19SRUFEIiwiU1VCU0NSSVBUSU9OU19VUERBVEUiLCJWSVNJVFNfQ1JFQVRFIiwiUEFSVE5FUlNfQ1JFQVRFIiwiREVWRUxPUE1FTlRTX0RFTEVURSIsIlNBTEVTX0NSRUFURSIsIlBBUlRORVJTX0RFTEVURSIsIlBST1BFUlRZX1VQREFURSIsIlZJU0lUU19VUERBVEUiLCJST0xFX0NSRUFURSIsIkNPTlRBQ1RTX0NSRUFURSIsIlJFUE9SVF9DUkVBVEUiLCJVU0VSU19VUERBVEUiLCJERVZFTE9QTUVOVFNfQ1JFQVRFIiwiQ09OVFJBQ1RTX0RFTEVURSIsIlBST1BFUlRJRVNfQ1JFQVRFIiwiUFJPUEVSVElFU19ERUxFVEUiLCJST0xFX0RFTEVURSIsIlVTRVJTX0RFTEVURSIsIkRFVkVMT1BNRU5UX1VQREFURSIsIk9XTkVSU19QUk9QRVJUWV9SRUFEIiwiQ09OVEFDVFNfUkVBRCIsIlVTRVJfUkVBRCIsIlJPTEVTX1VQREFURSIsIlVTRVJTX0FDVElWQVRFIiwiUEFSVE5FUlNfVVBEQVRFIiwiSU5CT1hfUkVBRCIsIkNPTlRSQUNUU19SRUFEIiwiUEVSTUlTU0lPTlNfREVMRVRFIl0sInJvbGVzIjpbIlNVUEVSX0FETUlOIl0sImZ1bGxOYW1lIjoiWW9hbmEgIEJlbnRvcyAiLCJ1c2VyVHlwZSI6IlNVUEVSX0FETUlOIiwidXNlcklkIjoxLCJlbWFpbCI6ImRldkBwcm9wdGVjaC5jb20iLCJzdWIiOiJkZXZAcHJvcHRlY2guY29tIiwiaWF0IjoxNzYxNTk4MDkxLCJleHAiOjE3NjE2MDE2OTF9.VCgprC9iPn88rCXbj5zcddTHcc-kmqMlOacEbntiExg';

// Headers de autenticación
const AUTH_HEADERS = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${JWT_TOKEN}`
};

// Funciones para consultar o crear catálogos en el backend
async function getOrCreateCatalog(endpoint, name) {
  // Buscar por nombre
  let res = await fetch(`${endpoint}?name=${encodeURIComponent(name)}`);
  if (res.ok) {
    const items = await res.json();
    if (Array.isArray(items) && items.length > 0) return items[0].id;
  }
  // Crear si no existe
  res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name })
  });
  if (res.ok) {
    const item = await res.json();
    return item.id;
  }
  // Log detallado de error
  let errorText = '';
  try { errorText = await res.text(); } catch {}
  console.error(`\n[ERROR] No se pudo crear o encontrar en ${endpoint}: ${name}`);
  console.error(`[STATUS] ${res.status}`);
  console.error(`[BODY] ${errorText}`);
  return null; // Devuelve null para que la migración siga
}

async function getMediaUrl(id, retries = 3) {
  if (!id) return '';
  
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(WP_MEDIA + id, { 
        timeout: 10000,
        signal: AbortSignal.timeout(10000)
      });
      if (!res.ok) {
        console.warn(`⚠️  Media ${id} no disponible (HTTP ${res.status})`);
        return '';
      }
      const data = await res.json();
      return data.source_url || '';
    } catch (error) {
      console.warn(`⚠️  Intento ${attempt}/${retries} falló para media ${id}: ${error.message}`);
      if (attempt === retries) {
        console.error(`❌ No se pudo obtener media ${id} después de ${retries} intentos, continuando...`);
        return '';
      }
      // Esperar antes de reintentar
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }
  return '';
}

async function getTaxonomyName(tax, id) {
  if (!id) return '';
  const res = await fetch(`${WP_TAX}${tax}/${id}`);
  if (!res.ok) return '';
  const data = await res.json();
  return data.name || '';
}

async function downloadImage(url, destFolder, filename) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`No se pudo descargar ${url}`);
  const arrayBuffer = await res.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  if (!fs.existsSync(destFolder)) fs.mkdirSync(destFolder, { recursive: true });
  const destPath = path.join(destFolder, filename);
  fs.writeFileSync(destPath, buffer);
  return destPath.replace(process.cwd(), '').replace(/\\/g, '/');
}

// Cache para evitar duplicados
const amenityCache = new Map();
const serviceCache = new Map();

// Función para obtener o crear amenity en el backend
async function getOrCreateAmenityByName(name) {
  console.log(`🔍 Buscando amenity: "${name}"`);
  
  // Verificar cache primero
  if (amenityCache.has(name)) {
    const cachedId = amenityCache.get(name);
    console.log(`✅ Amenity encontrado en cache: "${name}" (ID: ${cachedId})`);
    return cachedId;
  }

  try {
    console.log(`🔍 Buscando amenity en backend: "${name}"`);
    const searchRes = await axios.get(`http://localhost:8080/api/amenities?name=${encodeURIComponent(name)}`);
    if (searchRes.status === 200) {
      const items = searchRes.data;
      if (Array.isArray(items) && items.length > 0) {
        const id = items[0].id;
        amenityCache.set(name, id);
        console.log(`✅ Amenity encontrado en backend: "${name}" (ID: ${id})`);
        return id;
      }
    }
    
    // Crear si no existe
    console.log(`🔍 Creando amenity: "${name}"`);
    const createRes = await axios.post('http://localhost:8080/api/amenities', {
      name,
      description: `Amenity importado desde Houzez: ${name}`,
      category: 'General',
      icon: 'home',
      active: true
    });
    if (createRes.status === 200 || createRes.status === 201) {
      const id = createRes.data.id;
      amenityCache.set(name, id);
      console.log(`✅ Amenity creado: "${name}" (ID: ${id})`);
      return id;
    } else {
      console.error(`❌ Error creando amenity: "${name}" - Status: ${createRes.status}`);
    }
  } catch (error) {
    console.error(`❌ Error procesando amenity: "${name}"`, error.message);
  }
  console.log(`❌ Amenity no pudo ser procesado: "${name}"`);
  return null;
}

// Función para obtener o crear servicio en el backend
async function getOrCreateServiceByName(name) {
  // Verificar cache primero
  if (serviceCache.has(name)) {
    return serviceCache.get(name);
  }

  try {
    const searchRes = await axios.get(`http://localhost:8080/api/services?name=${encodeURIComponent(name)}`);
    if (searchRes.status === 200) {
      const items = searchRes.data;
      if (Array.isArray(items) && items.length > 0) {
        const id = items[0].id;
        serviceCache.set(name, id);
        console.log(`✅ Servicio encontrado en cache: ${name} (ID: ${id})`);
        return id;
      }
    }
    // Crear si no existe
    const createRes = await axios.post('http://localhost:8080/api/services', {
      name,
      description: `Servicio importado desde Houzez: ${name}`,
      type: 'General',
      includedInRent: false,
      includedInSale: false,
      active: true
    });
    if (createRes.status === 200 || createRes.status === 201) {
      const id = createRes.data.id;
      serviceCache.set(name, id);
      console.log(`✅ Servicio creado: ${name} (ID: ${id})`);
      return id;
    }
  } catch (error) {
    console.error(`❌ Error procesando servicio: ${name}`, error.message);
  }
  return null;
}

// Función para obtener o crear agente en el backend
async function getOrCreateAgentByName(name) {
  if (!name) return null;
  let res = await fetch(`http://localhost:8080/api/agents?name=${encodeURIComponent(name)}`);
  if (res.ok) {
    const items = await res.json();
    if (Array.isArray(items) && items.length > 0) return items[0].id;
  }
  res = await fetch('http://localhost:8080/api/agents', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name })
  });
  if (res.ok) {
    const item = await res.json();
    return item.id;
  }
  return null;
}

// Función para obtener o crear agencia en el backend
async function getOrCreateAgencyByName(name) {
  if (!name) return null;
  let res = await fetch(`http://localhost:8080/api/agencies?name=${encodeURIComponent(name)}`);
  if (res.ok) {
    const items = await res.json();
    if (Array.isArray(items) && items.length > 0) return items[0].id;
  }
  res = await fetch('http://localhost:8080/api/agencies', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name })
  });
  if (res.ok) {
    const item = await res.json();
    return item.id;
  }
  return null;
}

// Función para obtener el nombre de un amenity o label de Houzez
async function getHouzezTaxonomyName(tax, id) {
  try {
    const res = await axios.get(`https://onbienesraices.com.py/wp-json/wp/v2/${tax}/${id}`);
    if (res.status === 200) {
      return res.data.name;
    }
  } catch (error) {
    console.error(`❌ Error obteniendo ${tax} de Houzez ID ${id}:`, error.message);
  }
  return null;
}

// Función para obtener el ID de moneda basado en el código
async function getOrCreateCurrencyId(currencyCode) {
  // Validar entrada
  if (!currencyCode || currencyCode.trim() === '') {
    console.warn(`⚠️ Código de moneda vacío, usando USD por defecto`);
    return 1; // USD tiene ID 1 en la base de datos
  }

  const cleanCode = currencyCode.trim().toUpperCase();
  
  // Usar los IDs específicos de la base de datos
  // IMPORTANTE: Estos IDs deben coincidir con la tabla currencies en la BD
  if (cleanCode === 'USD') {
    console.log(`✅ Moneda USD encontrada, usando ID: 1`);
    return 1; // USD = ID 1 en la base de datos
  }
  if (cleanCode === 'PYG') {
    console.log(`✅ Moneda PYG encontrada, usando ID: 2`);
    return 2; // PYG = ID 2 en la base de datos
  }

  // Para cualquier otra moneda, usar USD por defecto
  console.warn(`⚠️ Moneda "${cleanCode}" no reconocida, usando USD por defecto (ID: 1)`);
  return 1; // USD = ID 1
}

// Función para mapear el status de WordPress a status de backend
function mapPropertyStatus(wpStatus) {
  if (!wpStatus) return 'INACTIVE';
  if (wpStatus === 'publish') return 'ACTIVE';
  if (wpStatus === 'draft') return 'INACTIVE';
  if (wpStatus === 'pending') return 'INACTIVE';
  // Agrega más mapeos según tus necesidades
  return 'INACTIVE';
}

// Nueva función para amenities, servicios, agentes y agencias: solo buscar, nunca crear
async function getCatalogIdOnly(endpoint, name, extraParams = {}) {
  if (!name) return null;
  let url = `${endpoint}?name=${encodeURIComponent(name)}`;
  for (const [key, value] of Object.entries(extraParams)) {
    url += `&${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
  }
  const res = await fetch(url);
  if (res.ok) {
    const items = await res.json();
    if (Array.isArray(items) && items.length > 0) return items[0].id;
  }
  return null;
}

async function migrateProperties() {
  let page = 1;
  let total = 0;
  let skipped = 0;
  let migrated = 0;
  while (true) {
    const res = await fetch(`${WP_API}?per_page=20&page=${page}`);
    if (!res.ok) break;
    const properties = await res.json();
    if (properties.length === 0) break;

    for (const prop of properties) {
      try {
        const meta = prop.property_meta || {};
        const houzezId = prop.id;
      
      // Primero creamos la propiedad en el backend para obtener el ID real
      // Preparar datos básicos para crear la propiedad
      // Obtener nombres de catálogos: primero directo, luego taxonomía
      let cityName = prop.city || prop.property_city_name || '';
      if (!cityName && prop.property_city?.[0]) {
        cityName = await getTaxonomyName('property_city', prop.property_city[0]);
      }
      let stateName = prop.state || prop.property_state_name || '';
      if (!stateName && prop.property_state?.[0]) {
        stateName = await getTaxonomyName('property_state', prop.property_state[0]);
      }
      let countryName = prop.country || prop.property_country_name || '';
      if (!countryName && prop.property_country?.[0]) {
        countryName = await getTaxonomyName('property_country', prop.property_country[0]);
      }
      let propertyTypeName = prop.property_type_name || '';
      console.log(`\n🔍 [TIPO DE HOUZEZ] Para propiedad "${prop.title?.rendered}"`);
      console.log(`   property_type_name: "${prop.property_type_name || 'NO EXISTE'}"`);
      console.log(`   property_type array: ${JSON.stringify(prop.property_type || 'NO EXISTE')}`);
      
      if (!propertyTypeName && prop.property_type?.[0]) {
        console.log(`   Buscando nombre de taxonomía para ID: ${prop.property_type[0]}`);
        propertyTypeName = await getTaxonomyName('property_type', prop.property_type[0]);
        console.log(`   Taxonomía retornó: "${propertyTypeName}"`);
      }
      
      // Log del tipo original de Houzez
      console.log(`   ✅ propertyTypeName RAW FINAL de Houzez: "${propertyTypeName}"`);
      
      // Mapeo de tipos de Houzez a tipos del backend
      // IMPORTANTE: Estos nombres deben coincidir EXACTAMENTE con los del backend
      const propertyTypeMapping = {
        // Tipos principales
        'Casa': 'Residencial',                        // En el backend se llama "Residencial"
        'Departamento': 'Departamento',               // ✓ Existe (ID: 6)
        'Apartamento': 'Departamento',                // → Departamento
        'Edificio': 'Edificio',                       // ✓ Existe (ID: 5)
        'Terreno': 'Terreno Urbano',                  // Por defecto urbano
        'Terreno Rural': 'Terreno Rural',             // ✓ Existe (ID: 1)
        'Terreno Urbano': 'Terreno Urbano',           // ✓ Existe (ID: 4)
        'Depósito': 'Depósito o Galpón',              // ✓ Existe (ID: 9)
        'Galpón': 'Depósito o Galpón',                // ✓ Existe (ID: 9)
        'Depósito o Galpón': 'Depósito o Galpón',     // ✓ Existe (ID: 9)
        'Dúplex': 'Dúplex',                           // ✓ Existe (ID: 10)
        'Duplex': 'Dúplex',                           // → Dúplex
        'Penthouse': 'Departamento',                  // → Departamento
        'Comercial': 'Comercial',                     // ✓ Existe (ID: 8)
        'Oficina': 'Comercial',                       // → Comercial
        'Local Comercial': 'Comercial',               // → Comercial
        'Residencial': 'Residencial',                 // ✓ Existe (ID: 7)
        'Condominio': 'Condominio/Barrio Cerrado',    // ✓ Existe (ID: 2)
        'Barrio Cerrado': 'Condominio/Barrio Cerrado', // ✓ Existe (ID: 2)
        'Casa Colonial': 'Casa Colonial'              // ✓ Existe (ID: 3)
      };
      
      // Normalizar el tipo de propiedad
      if (propertyTypeName && propertyTypeName.trim()) {
        const originalType = propertyTypeName;
        
        // 1. Buscar mapeo exacto (case-sensitive)
        if (propertyTypeMapping[propertyTypeName]) {
          propertyTypeName = propertyTypeMapping[propertyTypeName];
          console.log(`[MAPEO EXACTO] "${originalType}" → "${propertyTypeName}"`);
        }
        // 2. Buscar mapeo case-insensitive
        else {
          const foundKey = Object.keys(propertyTypeMapping).find(key => 
            key.toLowerCase() === propertyTypeName.toLowerCase()
          );
          if (foundKey) {
            propertyTypeName = propertyTypeMapping[foundKey];
            console.log(`[MAPEO CASE-INSENSITIVE] "${originalType}" → "${propertyTypeName}"`);
          }
          // 3. Buscar mapeo parcial (contiene)
          else {
            const partialKey = Object.keys(propertyTypeMapping).find(key => 
              key.toLowerCase().includes(propertyTypeName.toLowerCase()) ||
              propertyTypeName.toLowerCase().includes(key.toLowerCase())
            );
            if (partialKey) {
              propertyTypeName = propertyTypeMapping[partialKey];
              console.log(`[MAPEO PARCIAL] "${originalType}" → "${propertyTypeName}"`);
            } else {
              console.warn(`[MAPEO] No se encontró mapeo para tipo "${originalType}", usando tal cual`);
            }
          }
        }
      }
      
      // Log de depuración de nombres
      console.log(`[DEBUG] countryName: ${countryName}, stateName: ${stateName}, cityName: ${cityName}, propertyTypeName: ${propertyTypeName}`);
      
      // Usar valores por defecto si faltan datos en lugar de saltar la propiedad
      if (!countryName || !countryName.trim()) {
        console.warn(`[MIGRACIÓN] countryName vacío para propiedad ${prop.title?.rendered || prop.id}, usando "Paraguay" por defecto`);
        countryName = 'Paraguay';
      }
      if (!cityName || !cityName.trim()) {
        console.warn(`[MIGRACIÓN] cityName vacío para propiedad ${prop.title?.rendered || prop.id}, usando "Asunción" por defecto`);
        cityName = 'Asunción';
      }
      if (!stateName || !stateName.trim()) {
        console.warn(`[MIGRACIÓN] stateName vacío para propiedad ${prop.title?.rendered || prop.id}, usando "Central" por defecto`);
        stateName = 'Central';
      }
      if (!propertyTypeName || !propertyTypeName.trim()) {
        console.warn(`[MIGRACIÓN] propertyTypeName vacío para propiedad ${prop.title?.rendered || prop.id}, usando "Residencial" por defecto`);
        propertyTypeName = 'Residencial';
      }

      // Obtener IDs de catálogos usando los endpoints estándar
      console.log(`\n🌍 [UBICACIÓN] Buscando catálogos para: "${prop.title?.rendered}"`);
      console.log(`   📍 País: "${countryName}"`);
      console.log(`   📍 Departamento: "${stateName}"`);
      console.log(`   📍 Ciudad: "${cityName}"`);
      
      let countryId = await getCatalogIdOnly('http://localhost:8080/api/countries', countryName);
      console.log(`   ✅ countryId encontrado: ${countryId || 'null'}`);
      if (!countryId) {
        console.warn(`[MIGRACIÓN] No se encontró el país "${countryName}", intentando crear...`);
        countryId = await getOrCreateCatalog('http://localhost:8080/api/countries', countryName);
        if (!countryId) {
          console.error(`[ERROR] No se pudo crear el país: ${countryName}, usando país por defecto`);
          // Intentar obtener Paraguay como fallback
          countryId = await getCatalogIdOnly('http://localhost:8080/api/countries', 'Paraguay');
          if (!countryId) {
            console.error(`[ERROR CRÍTICO] No se encontró país por defecto, saltando propiedad`);
            skipped++;
            continue;
          }
        }
      }
      
      let departmentId = stateName && stateName.trim() ? await getCatalogIdOnly('http://localhost:8080/api/departments', stateName, { countryId }) : null;
      console.log(`   ✅ departmentId encontrado: ${departmentId || 'null'}`);
      if (stateName && stateName.trim() && !departmentId) {
        console.warn(`[MIGRACIÓN] No se encontró el departamento "${stateName}", intentando crear...`);
        departmentId = await getOrCreateCatalog('http://localhost:8080/api/departments', stateName);
      }
      
      let cityId = cityName ? await getCatalogIdOnly('http://localhost:8080/api/cities', cityName, { departmentId }) : null;
      console.log(`   ✅ cityId encontrado: ${cityId || 'null'}`);
      if (!cityId) {
        console.warn(`[MIGRACIÓN] No se encontró la ciudad "${cityName}", intentando crear...`);
        cityId = await getOrCreateCatalog('http://localhost:8080/api/cities', cityName);
        if (!cityId) {
          console.error(`[ERROR] No se pudo crear la ciudad: ${cityName}, usando ciudad por defecto`);
          // Intentar obtener Asunción como fallback
          cityId = await getCatalogIdOnly('http://localhost:8080/api/cities', 'Asunción');
          if (!cityId) {
            console.error(`[ERROR CRÍTICO] No se encontró ciudad por defecto, saltando propiedad`);
            skipped++;
            continue;
          }
        }
      }
      
      let propertyTypeId = propertyTypeName && propertyTypeName.trim() ? await getCatalogIdOnly('http://localhost:8080/api/property-types', propertyTypeName) : null;
      console.log(`   ✅ propertyTypeId encontrado: ${propertyTypeId || 'null'}`);
      if (!propertyTypeId) {
        console.warn(`[MIGRACIÓN] No se encontró el tipo "${propertyTypeName}", intentando crear...`);
        propertyTypeId = await getOrCreateCatalog('http://localhost:8080/api/property-types', propertyTypeName);
        if (!propertyTypeId) {
          console.error(`[ERROR] No se pudo crear el tipo: ${propertyTypeName}, usando tipo por defecto`);
          // Intentar obtener "Residencial" como fallback
          propertyTypeId = await getCatalogIdOnly('http://localhost:8080/api/property-types', 'Residencial');
          if (!propertyTypeId) {
            console.error(`[ERROR CRÍTICO] No se encontró tipo por defecto "Residencial", saltando propiedad`);
            skipped++;
            continue;
          }
        }
      }
      
      console.log(`\n📊 [RESUMEN UBICACIÓN]`);
      console.log(`   🌍 País: "${countryName}" → ID: ${countryId}`);
      console.log(`   🏛️  Departamento: "${stateName}" → ID: ${departmentId || 'null'}`);
      console.log(`   🏙️  Ciudad: "${cityName}" → ID: ${cityId}`);
      console.log(`   🏠 Tipo: "${propertyTypeName}" → ID: ${propertyTypeId}`);

      // Detectar tipo de operación (venta/alquiler)
      let operationType = '';
      if (prop.property_status?.[0]) {
        const statusName = await getTaxonomyName('property_status', prop.property_status[0]);
        if (statusName) {
          if (statusName.toLowerCase().includes('venta')) operationType = 'VENTA';
          else if (statusName.toLowerCase().includes('alquiler')) operationType = 'ALQUILER';
          else operationType = statusName.toUpperCase();
        }
      }

      // Crear la propiedad básica
      const currencyCode = (meta.fave_currency?.[0] || 'USD').toUpperCase().trim();
      const currencyId = await getOrCreateCurrencyId(currencyCode);
      
      // Debug: mostrar TODOS los campos relacionados con ubicación en meta
      console.log(`\n🔍 DEBUG CAMPOS DE UBICACIÓN en meta para ${prop.title?.rendered}:`);
      Object.keys(meta).filter(key => 
        key.toLowerCase().includes('lat') || 
        key.toLowerCase().includes('lng') || 
        key.toLowerCase().includes('long') ||
        key.toLowerCase().includes('geo') ||
        key.toLowerCase().includes('map') ||
        key.toLowerCase().includes('location')
      ).forEach(key => {
        console.log(`     - ${key}: "${meta[key]?.[0] || meta[key]}"`);
      });
      
      // Obtener coordenadas de ubicación desde Houzez
      const latitude = meta.houzez_geolocation_lat?.[0] || meta.fave_property_lat?.[0] || meta.fave_property_map?.[0] || null;
      const longitude = meta.houzez_geolocation_long?.[0] || meta.fave_property_lng?.[0] || meta.fave_property_map?.[1] || null;
      
      console.log(`\n📍 UBICACIÓN FINAL para ${prop.title?.rendered}:`);
      console.log(`  - Dirección: ${meta.fave_property_address?.[0] || 'No disponible'}`);
      console.log(`  - Latitud: ${latitude || 'No disponible'}`);
      console.log(`  - Longitud: ${longitude || 'No disponible'}`);
      
      // Validar campos obligatorios antes de enviar
      // Log para debug de precio - mostrar TODOS los campos relacionados con precio
      console.log(`\n🔍 DEBUG PRECIO para ${prop.title?.rendered}:`);
      console.log(`  📋 TODOS los campos de precio en meta:`);
      Object.keys(meta).filter(key => key.toLowerCase().includes('price')).forEach(key => {
        console.log(`     - ${key}: "${meta[key]?.[0]}"`);
      });
      console.log(`  - fave_currency: ${meta.fave_currency?.[0]}`);
      console.log(`  - Código de moneda detectado: ${currencyCode}`);
      
      // Tomar el precio directamente de Houzez
      let rawPrice = meta.fave_property_price?.[0] || '0';
      let parsedPrice = parseFloat(rawPrice) || 0;
      
      console.log(`  - Precio RAW de Houzez: "${rawPrice}"`);
      console.log(`  - Precio parseado: ${parsedPrice}`);
      console.log(`  - Precio final a guardar: ${parsedPrice} ${currencyCode} (Currency ID: ${currencyId})\n`);
      
      const requiredFields = {
        title: prop.title?.rendered || 'Sin título',
        description: prop.content?.rendered || '',
        address: meta.fave_property_address?.[0] || 'Sin dirección',
        price: parsedPrice,
        currency: currencyCode, // <-- Asegurar que sea el código real
        currencyId: currencyId,
        bedrooms: parseInt(meta.fave_property_bedrooms?.[0] || '0'),
        bathrooms: parseInt(meta.fave_property_bathrooms?.[0] || '0'),
        area: parseFloat(meta.fave_property_size?.[0] || '0'),
        garage: parseInt(meta.fave_property_garage?.[0] || '0')
      };

      // Verificar que no haya campos nulos o undefined
      const nullFields = Object.entries(requiredFields).filter(([key, value]) => value === null || value === undefined);
      if (nullFields.length > 0) {
        console.error(`❌ Campos nulos encontrados para propiedad ${houzezId}:`, nullFields.map(([key]) => key));
        continue;
      }

      // Obtener nombres de agente y agencia desde el meta o usar valores por defecto
      const agentName = meta.fave_property_agent?.[0] || null;
      const agencyName = meta.fave_property_agency?.[0] || null;
      let agentId = agentName ? await getCatalogIdOnly('http://localhost:8080/api/agents', agentName) : null;
      if (!agentId) {
        // Si no se encuentra agente, usar el agente ID 1 (Yoana Bentos - dev@proptech.com)
        // Esto es necesario porque el @PrePersist de Property requiere un agent para auto-asignar tenant
        console.warn(`[MIGRACIÓN] Agente no encontrado, usando agente por defecto (ID: 1)`);
        agentId = 1;
      }
      let agencyId = agencyName ? await getCatalogIdOnly('http://localhost:8080/api/agencies', agencyName) : null;
      if (!agencyId) {
        // Si no se encuentra agencia, usar la agencia ID 1 (ON Bienes Raíces)
        console.warn(`[MIGRACIÓN] Agencia no encontrada, usando agencia por defecto (ID: 1)`);
        agencyId = 1;
      }

      // VERIFICACIÓN DESACTIVADA TEMPORALMENTE - El backend aún no soporta filtro por houzezId
      // TODO: Implementar endpoint /api/properties/by-houzez-id/{houzezId} en el backend
      // const existsRes = await fetch(`http://localhost:8080/api/properties?houzezId=${houzezId}`);
      // if (existsRes.ok) {
      //   const items = await existsRes.json();
      //   if (Array.isArray(items) && items.length > 0) {
      //     console.warn(`⚠️ Propiedad con houzezId ${houzezId} ya existe (ID: ${items[0].id}). Saltando migración...`);
      //     console.log(`   Título: ${items[0].title}`);
      //     console.log(`   Puedes eliminarla manualmente si quieres re-migrarla.`);
      //     skipped++;
      //     continue;
      //   }
      // }
      
      // El slug puede ser el mismo que Houzez o generar uno único si hay conflicto
      let finalSlug = prop.slug || `propiedad-${houzezId}`;

      // Log de depuración de campos críticos antes de crear/actualizar
      console.log(`[PAYLOAD DEBUG] status: ${mapPropertyStatus(prop.status)}, cityId: ${cityId}, propertyTypeId: ${propertyTypeId}`);
      const basicProperty = {
        houzezId: String(houzezId), // ID de Houzez para evitar duplicados
        title: requiredFields.title,
        description: requiredFields.description,
        slug: finalSlug,
        status: mapPropertyStatus(prop.status), // Debe ser 'ACTIVE' o 'INACTIVE'
        createdAt: prop.date,
        updatedAt: prop.modified,
        address: requiredFields.address,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        cityId: cityId,         // Debe ser un número válido
        departmentId: departmentId, // ID del departamento/estado
        countryId: countryId,
        propertyTypeId: propertyTypeId, // Debe ser un número válido
        propertyStatusId: 1, // Forzar siempre 1
        agencyId: agencyId,
        agentId: agentId,
        price: requiredFields.price,
        currencyId: currencyId, // <-- Solo usar el ID que sabemos que funciona
        bedrooms: requiredFields.bedrooms,
        bathrooms: requiredFields.bathrooms,
        area: requiredFields.area,
        garage: requiredFields.garage,
        operacion: operationType === 'VENTA' ? 'SALE' : operationType === 'ALQUILER' ? 'RENT' : 'BOTH'
      };

      // Crear la propiedad en el backend
      console.log(`\n📤 Creando propiedad: ${basicProperty.title}`);
      console.log(`   🏷️  Houzez ID: ${houzezId}`);
      console.log(`   💰 Precio: ${requiredFields.price} (Currency ID: ${basicProperty.currencyId})`);
      console.log(`🔍 JSON completo a enviar:`, JSON.stringify(basicProperty, null, 2));
      
      const backendRes = await fetch(BACKEND_API, {
        method: 'POST',
        headers: AUTH_HEADERS,
        body: JSON.stringify(basicProperty),
      });
      
      if (!backendRes.ok) {
        let errorText = '';
        try { errorText = await backendRes.text(); } catch {}
        console.error(`❌ Error creando propiedad: ${basicProperty.title}`);
        console.error(`[STATUS] ${backendRes.status}`);
        console.error(`[BODY] ${errorText}`);
        console.error(`[DATA SENT]`, JSON.stringify(basicProperty, null, 2));
        
        // Intentar identificar el campo problemático
        if (errorText.includes('currency')) {
          console.error(`🔍 Error relacionado con moneda. Currency: "${basicProperty.currency}", CurrencyId: ${basicProperty.currencyId}`);
        }
        if (errorText.includes('propertyTypeId')) {
          console.error(`🔍 Error relacionado con tipo de propiedad. PropertyTypeId: ${basicProperty.propertyTypeId}`);
        }
        if (errorText.includes('cityId')) {
          console.error(`🔍 Error relacionado con ciudad. CityId: ${basicProperty.cityId}`);
        }
        if (errorText.includes('countryId')) {
          console.error(`🔍 Error relacionado con país. CountryId: ${basicProperty.countryId}`);
        }
        
        continue; // Saltar a la siguiente propiedad
      }
      
      // Obtener el ID real de la propiedad creada
      const createdProperty = await backendRes.json();
      const realPropertyId = createdProperty.id;
      
      console.log(`Propiedad creada con ID real: ${realPropertyId} (Houzez ID: ${houzezId})`);

      // Subir imágenes adicionales a la galería
      let images = [];
      if (meta.fave_property_images) {
        for (const [idx, imgId] of meta.fave_property_images.entries()) {
          const url = await getMediaUrl(imgId);
          if (url) {
            try {
              // Descargar la imagen
              const response = await fetch(url);
              const arrayBuffer = await response.arrayBuffer();
              const buffer = Buffer.from(arrayBuffer);
              // Detectar el tipo MIME real
              const ext = path.extname(url).split('?')[0] || '.jpg';
              const filename = `img_${realPropertyId}_${idx}${ext}`;
              const mimeType = mime.lookup(filename) || 'application/octet-stream';
              // Crear FormData para subir
              const formData = new FormData();
              formData.append('file', buffer, {
                filename: filename,
                contentType: mimeType
              });
              formData.append('fileName', filename);
              // Subir a la galería
              console.log(`Subiendo imagen ${idx} a galería para propiedad ${realPropertyId}...`);
              const headers = {
                ...formData.getHeaders(),
                'Authorization': `Bearer ${JWT_TOKEN}`
              };
              const galleryRes = await axios.post(
                `http://localhost:8080/api/gallery-images/property/${realPropertyId}`,
                formData,
                { headers }
              );
              if (galleryRes.status === 200) {
                const galleryData = galleryRes.data;
                images.push(galleryData.url);
                console.log(`✅ Imagen ${idx} subida a galería: ${galleryData.url}`);
              } else {
                console.error(`❌ Error subiendo imagen ${idx}, continuando...`);
              }
            } catch (error) {
              console.error(`❌ Error procesando imagen ${idx}: ${error.message}, continuando...`);
              // NO throw - continuar con la siguiente imagen
            }
          }
        }
      }
      
      // Subir imagen destacada
      let featuredImage = '';
      if (prop.featured_media) {
        const url = await getMediaUrl(prop.featured_media);
        if (url) {
          try {
            // Descargar la imagen
            const response = await fetch(url);
            const arrayBuffer = await response.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            // Detectar el tipo MIME real
            const ext = path.extname(url).split('?')[0] || '.jpg';
            const filename = `featured_${realPropertyId}${ext}`;
            const mimeType = mime.lookup(filename) || 'application/octet-stream';
            // Crear FormData para subir
            const formData = new FormData();
            formData.append('file', buffer, {
              filename: filename,
              contentType: mimeType
            });
            formData.append('fileName', filename);
            // Subir a la galería
            console.log(`Subiendo imagen destacada a galería para propiedad ${realPropertyId}...`);
            const headers = {
              ...formData.getHeaders(),
              'Authorization': `Bearer ${JWT_TOKEN}`
            };
            const galleryRes = await axios.post(
              `http://localhost:8080/api/gallery-images/property/${realPropertyId}`,
              formData,
              { headers }
            );
            if (galleryRes.status === 200) {
              const galleryData = galleryRes.data;
              featuredImage = galleryData.url;
              console.log(`✅ Imagen destacada subida a galería: ${galleryData.url}`);
            } else {
              console.error(`❌ Error subiendo imagen destacada, continuando...`);
            }
          } catch (error) {
            console.error(`❌ Error procesando imagen destacada: ${error.message}, continuando...`);
            // NO throw - continuar sin imagen destacada
          }
        }
      }

      // Ahora procesar amenities y servicios
      // Log de los IDs de amenities de Houzez para esta propiedad
      console.log('Propiedad:', basicProperty.title);
      console.log('IDs de amenities:', prop.property_feature);
      // Obtener nombres de amenities de Houzez y loguear el mapeo
      const featureNames = [];
      if (prop.property_feature) {
        for (const id of prop.property_feature) {
          const name = await getHouzezTaxonomyName('property_feature', id);
          console.log(`Amenity Houzez ID ${id} => ${name}`);
          if (name) featureNames.push(name);
        }
      }
      // Eliminar duplicados de nombres
      const uniqueFeatureNames = [...new Set(featureNames)];
      console.log('Nombres de amenities únicos:', uniqueFeatureNames);
      // Advertir si todos los nombres son iguales
      if (uniqueFeatureNames.length === 1 && featureNames.length > 1) {
        console.warn('⚠️ Todos los amenities para esta propiedad son iguales:', uniqueFeatureNames[0]);
      }
      // Mapear y crear amenities
      const amenityIds = [];
      console.log(`🔍 Procesando ${uniqueFeatureNames.length} amenities para propiedad: ${basicProperty.title}`);
      for (const fname of uniqueFeatureNames) {
        if (fname) {
          const id = await getOrCreateAmenityByName(fname);
          if (id) {
            amenityIds.push(id);
          } else {
            console.error(`[ERROR] Amenity no pudo ser creado/encontrado: ${fname}`);
          }
        }
      }
      // Eliminar duplicados
      const uniqueAmenityIds = [...new Set(amenityIds)];
      // Log de depuración
      console.log('Amenities enviados:', uniqueAmenityIds, 'para propiedad', basicProperty.title);

      // Procesar servicios (labelNames)
      const labelNames = [];
      if (prop.property_label) {
        for (const id of prop.property_label) {
          const name = await getHouzezTaxonomyName('property_label', id);
          console.log(`Servicio Houzez ID ${id} => ${name}`);
          if (name) labelNames.push(name);
        }
      }
      const uniqueLabelNames = [...new Set(labelNames)];
      // Mapear y crear servicios
      const serviceIds = [];
      console.log(`🔍 Procesando ${uniqueLabelNames.length} servicios para propiedad: ${basicProperty.title}`);
      for (const lname of uniqueLabelNames) {
        if (lname) {
          const id = await getOrCreateServiceByName(lname);
          if (id) {
            serviceIds.push(id);
          } else {
            console.error(`[ERROR] Servicio no pudo ser creado/encontrado: ${lname}`);
          }
        }
      }
      // Eliminar duplicados
      const uniqueServiceIds = [...new Set(serviceIds)];

      // Procesar Floor Plans desde Houzez
      const floorPlans = [];
      // Houzez guarda floor plans como arrays separados para cada campo
      const floorPlanTitles = meta.fave_floor_plan_title || [];
      const floorPlanBeds = meta.fave_floor_plan_beds || [];
      const floorPlanBaths = meta.fave_floor_plan_baths || [];
      const floorPlanPrices = meta.fave_floor_plan_price || [];
      const floorPlanSizes = meta.fave_floor_plan_size || [];
      const floorPlanDescriptions = meta.fave_floor_plan_description || [];
      const floorPlanImages = meta.fave_floor_plan_image || [];
      
      console.log(`🏗️  Procesando Floor Plans para propiedad: ${basicProperty.title}`);
      console.log(`   Títulos: ${floorPlanTitles.length}, Beds: ${floorPlanBeds.length}, Precios: ${floorPlanPrices.length}`);
      
      // Determinar cuántos floor plans hay (el array más largo)
      const floorPlanCount = Math.max(
        floorPlanTitles.length,
        floorPlanBeds.length,
        floorPlanBaths.length,
        floorPlanPrices.length,
        floorPlanSizes.length
      );
      
      for (let i = 0; i < floorPlanCount; i++) {
        const floorPlan = {
          title: floorPlanTitles[i] || `Plano ${i + 1}`,
          bedrooms: parseInt(floorPlanBeds[i] || '0'),
          bathrooms: parseInt(floorPlanBaths[i] || '0'),
          price: parseFloat(floorPlanPrices[i] || '0'),
          priceSuffix: 'mensual', // o detectar desde el tipo de operación
          size: parseFloat(floorPlanSizes[i] || '0'),
          description: floorPlanDescriptions[i] || '',
          image: floorPlanImages[i] || null
        };
        
        console.log(`   Floor Plan ${i + 1}: ${floorPlan.title} - ${floorPlan.bedrooms} dorm, ${floorPlan.bathrooms} baños, ${floorPlan.size}m²`);
        floorPlans.push(floorPlan);
      }

      // Actualizar la propiedad con las imágenes y relaciones
      const updateData = {
        houzezId: String(houzezId), // ID de Houzez para evitar duplicados
        images,
        featuredImage,
        amenities: uniqueAmenityIds,
        services: uniqueServiceIds,
        floorPlans: floorPlans.length > 0 ? floorPlans : undefined, // Solo incluir si hay floor plans
        agencyId: agencyId, // ID dinámico para agencia
        agentId: agentId, // ID dinámico para agente
        status: mapPropertyStatus(prop.status), // Usar el status mapeado
        propertyStatusId: 1, // Forzar siempre 1
        // Incluir todos los campos obligatorios para evitar errores de null
        title: prop.title?.rendered || 'Sin título',
        description: prop.content?.rendered || '',
        slug: finalSlug,
        address: meta.fave_property_address?.[0] || 'Sin dirección',
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        cityId: cityId,         // Debe ser un número válido
        departmentId: departmentId, // ID del departamento/estado
        countryId: countryId,
        propertyTypeId: propertyTypeId, // Debe ser un número válido
        price: parsedPrice, // Usar el precio ya limpiado y parseado
        currencyId: currencyId, // <-- Solo usar el ID que sabemos que funciona
        bedrooms: parseInt(meta.fave_property_bedrooms?.[0] || '0'),
        bathrooms: parseInt(meta.fave_property_bathrooms?.[0] || '0'),
        area: parseFloat(meta.fave_property_size?.[0] || '0'),
        garage: parseInt(meta.fave_property_garage?.[0] || '0'),
        operacion: operationType === 'VENTA' ? 'SALE' : operationType === 'ALQUILER' ? 'RENT' : 'BOTH'
      };
      // Log de depuración
      console.log(`\n📤 Actualizando propiedad ID ${realPropertyId}: ${basicProperty.title}`);
      console.log(`   🏷️  Houzez ID: ${houzezId}`);
      console.log(`   💰 Precio: ${parsedPrice} (Currency ID: ${currencyId})`);
      console.log(`   🖼️  Imágenes: ${images.length} en galería${featuredImage ? ' + 1 destacada' : ''}`);
      console.log(`   🏷️  Amenities: ${uniqueAmenityIds.length}, Servicios: ${uniqueServiceIds.length}`);
      console.log(`   🏗️  Floor Plans: ${floorPlans.length}`);

      // Actualizar la propiedad con amenities, servicios y floor plans
      const updateRes = await fetch(`${BACKEND_API}/${realPropertyId}`, {
        method: 'PUT',
        headers: AUTH_HEADERS,
        body: JSON.stringify(updateData),
      });
      
      if (updateRes.ok) {
        total++;
        migrated++;
        console.log(`✅ Migrada propiedad: ${basicProperty.title} (ID: ${realPropertyId})`);
      } else {
        let errorText = '';
        try { errorText = await updateRes.text(); } catch {}
        console.error(`❌ Error actualizando propiedad: ${basicProperty.title}`);
        console.error(`[STATUS] ${updateRes.status}`);
        console.error(`[BODY] ${errorText}`);
        console.error(`[DATA SENT]`, JSON.stringify(updateData, null, 2));
      }
    } catch (error) {
      console.error(`🚨 ERROR procesando propiedad ${prop.id}:`);
      console.error(`[HOUZEZ ID] ${prop.id}`);
      console.error(`[TITLE] ${prop.title?.rendered}`);
      console.error(`[ERROR] ${error.message}`);
      console.error(`[STACK] ${error.stack}`);
      console.error(`\n⚠️  Saltando esta propiedad y continuando con la siguiente...\n`);
      skipped++;
      continue; // Continuar con la siguiente propiedad en lugar de detener todo
    }
  }
  page++;
}
console.log(`Migradas ${migrated} propiedades, saltadas ${skipped}`);
}

migrateProperties(); 