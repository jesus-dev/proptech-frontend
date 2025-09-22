const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const mime = require('mime-types');
const axios = require('axios');

const WP_API = 'https://onbienesraices.com.py/wp-json/wp/v2/properties';
const WP_MEDIA = 'https://onbienesraices.com.py/wp-json/wp/v2/media/';
const WP_TAX = 'https://onbienesraices.com.py/wp-json/wp/v2/';
const BACKEND_API = 'http://localhost:8080/api/properties'; // Cambia esto a tu endpoint real

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

async function getMediaUrl(id) {
  if (!id) return '';
  const res = await fetch(WP_MEDIA + id);
  if (!res.ok) return '';
  const data = await res.json();
  return data.source_url || '';
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
    return 2; // USD tiene ID 2
  }

  const cleanCode = currencyCode.trim().toUpperCase();
  
  // Usar los IDs específicos de la base de datos
  if (cleanCode === 'PYG') {
    console.log(`✅ Moneda PYG encontrada, usando ID: 1`);
    return 1;
  }
  if (cleanCode === 'USD') {
    console.log(`✅ Moneda USD encontrada, usando ID: 2`);
    return 2;
  }

  // Para cualquier otra moneda, usar USD por defecto
  console.warn(`⚠️ Moneda "${cleanCode}" no reconocida, usando USD por defecto (ID: 2)`);
  return 2;
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
      if (!propertyTypeName && prop.property_type?.[0]) {
        propertyTypeName = await getTaxonomyName('property_type', prop.property_type[0]);
      }
      
      // Log de depuración de nombres
      console.log(`[DEBUG] countryName: ${countryName}, stateName: ${stateName}, cityName: ${cityName}, propertyTypeName: ${propertyTypeName}`);
      // Validar nombres de catálogos antes de crear
      if (!countryName || !countryName.trim()) {
        console.error(`[MIGRACIÓN] countryName vacío para propiedad ${prop.title?.rendered || prop.id}`);
        skipped++;
        continue;
      }
      if (!cityName || !cityName.trim()) {
        console.error(`[MIGRACIÓN] cityName vacío para propiedad ${prop.title?.rendered || prop.id}`);
        skipped++;
        continue;
      }
      // Permitir migrar aunque falte stateName o propertyTypeName, pero loguear
      if (!stateName || !stateName.trim()) {
        console.warn(`[MIGRACIÓN] stateName vacío para propiedad ${prop.title?.rendered || prop.id}`);
      }
      if (!propertyTypeName || !propertyTypeName.trim()) {
        console.warn(`[MIGRACIÓN] propertyTypeName vacío para propiedad ${prop.title?.rendered || prop.id}`);
      }

      // Obtener IDs de catálogos usando los endpoints estándar
      const countryId = await getCatalogIdOnly('http://localhost:8080/api/countries', countryName);
      if (!countryId) {
        console.error(`[ERROR] No se encontró el país en catálogos: ${countryName}`);
        skipped++;
        continue;
      }
      const departmentId = stateName && stateName.trim() ? await getCatalogIdOnly('http://localhost:8080/api/departments', stateName, { countryId }) : null;
      if (stateName && stateName.trim() && !departmentId) {
        console.error(`[ERROR] No se encontró el departamento en catálogos: ${stateName}`);
      }
      const cityId = cityName ? await getCatalogIdOnly('http://localhost:8080/api/cities', cityName, { departmentId }) : null;
      if (!cityId) {
        console.error(`[ERROR] No se encontró la ciudad en catálogos: ${cityName}`);
        skipped++;
        continue;
      }
      const propertyTypeId = propertyTypeName && propertyTypeName.trim() ? await getCatalogIdOnly('http://localhost:8080/api/property-types', propertyTypeName) : null;
      if (!propertyTypeId) {
        console.error(`[ERROR] No se encontró el tipo de propiedad en catálogos: ${propertyTypeName}`);
        skipped++;
        continue;
      }

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
      
      // Validar campos obligatorios antes de enviar
      const requiredFields = {
        title: prop.title?.rendered || 'Sin título',
        description: prop.content?.rendered || '',
        address: meta.fave_property_address?.[0] || 'Sin dirección',
        price: parseFloat(meta.fave_property_price?.[0] || '0'),
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
      const agentName = meta.fave_property_agent?.[0] || 'Agente Migración';
      const agencyName = meta.fave_property_agency?.[0] || 'Agencia Desconocida';
      const agentId = agentName ? await getCatalogIdOnly('http://localhost:8080/api/agents', agentName) : null;
      if (!agentId && agentName) {
        console.error(`[ERROR] Agente no encontrado en catálogos: ${agentName}`);
      }
      const agencyId = agencyName ? await getCatalogIdOnly('http://localhost:8080/api/agencies', agencyName) : null;
      if (!agencyId && agencyName) {
        console.error(`[ERROR] Agencia no encontrada en catálogos: ${agencyName}`);
      }

      // Verificar si ya existe una propiedad con el mismo slug
      const existsRes = await fetch(`http://localhost:8080/api/properties?slug=${encodeURIComponent(prop.slug)}`);
      if (existsRes.ok) {
        const items = await existsRes.json();
        const found = Array.isArray(items) && items.some(item => item.slug === prop.slug);
        console.log(`[DEBUG] Respuesta de búsqueda de slug ${prop.slug}:`, items, '¿Coincidencia exacta?', found);
        if (found) {
          console.warn(`⚠️ Propiedad con slug ${prop.slug} ya existe. Saltando...`);
          skipped++;
          continue;
        }
      }

      // Log de depuración de campos críticos antes de crear/actualizar
      console.log(`[PAYLOAD DEBUG] status: ${mapPropertyStatus(prop.status)}, cityId: ${cityId}, propertyTypeId: ${propertyTypeId}`);
      const basicProperty = {
        externalId: houzezId,
        title: requiredFields.title,
        description: requiredFields.description,
        slug: prop.slug,
        status: mapPropertyStatus(prop.status), // Debe ser 'ACTIVE' o 'INACTIVE'
        createdAt: prop.date,
        updatedAt: prop.modified,
        address: requiredFields.address,
        cityId: cityId,         // Debe ser un número válido
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
      console.log(`Creando propiedad: ${basicProperty.title} (CurrencyId: ${basicProperty.currencyId})`);
      console.log(`🔍 JSON completo a enviar:`, JSON.stringify(basicProperty, null, 2));
      
      const backendRes = await fetch(BACKEND_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
      
      // Ahora usar el ID real para las rutas de archivos
      const uploadDir = path.join(process.cwd(), 'uploads', 'properties', String(realPropertyId));

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
              const headers = formData.getHeaders();
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
                let errorText = '';
                try { errorText = JSON.stringify(galleryRes.data); } catch {}
                console.error(`❌ Error subiendo imagen ${idx} a galería`);
                console.error(`[STATUS] ${galleryRes.status}`);
                console.error(`[BODY] ${errorText}`);
                console.error(`[PROPERTY ID] ${realPropertyId}`);
                console.error(`[HOUZEZ ID] ${houzezId}`);
                console.error(`[PROPERTY TITLE] ${basicProperty.title}`);
                throw new Error(`Error subiendo imagen ${idx} a galería: ${galleryRes.status} - ${errorText}`);
              }
            } catch (error) {
              console.error(`❌ Error procesando imagen ${idx}:`, error.message);
              throw error; // Re-lanzar el error para detener el proceso
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
            const headers = formData.getHeaders();
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
              let errorText = '';
              try { errorText = JSON.stringify(galleryRes.data); } catch {}
              console.error(`❌ Error subiendo imagen destacada a galería`);
              console.error(`[STATUS] ${galleryRes.status}`);
              console.error(`[BODY] ${errorText}`);
              console.error(`[PROPERTY ID] ${realPropertyId}`);
              console.error(`[HOUZEZ ID] ${houzezId}`);
              console.error(`[PROPERTY TITLE] ${basicProperty.title}`);
              throw new Error(`Error subiendo imagen destacada a galería: ${galleryRes.status} - ${errorText}`);
            }
          } catch (error) {
            console.error(`❌ Error procesando imagen destacada:`, error.message);
            throw error; // Re-lanzar el error para detener el proceso
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
          const id = await getCatalogIdOnly('http://localhost:8080/api/amenities', fname);
          if (id) {
            amenityIds.push(id);
          } else {
            console.error(`[ERROR] Amenity no encontrado en catálogos: ${fname}`);
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
          const id = await getCatalogIdOnly('http://localhost:8080/api/services', lname);
          if (id) {
            serviceIds.push(id);
          } else {
            console.error(`[ERROR] Servicio no encontrado en catálogos: ${lname}`);
          }
        }
      }
      // Eliminar duplicados
      const uniqueServiceIds = [...new Set(serviceIds)];

      // Actualizar la propiedad con las imágenes y relaciones
      const updateData = {
        images,
        featuredImage,
        amenities: uniqueAmenityIds,
        services: uniqueServiceIds,
        agencyId: agencyId, // ID dinámico para agencia
        agentId: agentId, // ID dinámico para agente
        status: mapPropertyStatus(prop.status), // Usar el status mapeado
        propertyStatusId: 1, // Forzar siempre 1
        // Incluir todos los campos obligatorios para evitar errores de null
        title: prop.title?.rendered || 'Sin título',
        description: prop.content?.rendered || '',
        slug: prop.slug,
        address: meta.fave_property_address?.[0] || 'Sin dirección',
        cityId: cityId,         // Debe ser un número válido
        countryId: countryId,
        propertyTypeId: propertyTypeId, // Debe ser un número válido
        price: parseFloat(meta.fave_property_price?.[0] || '0'),
        currencyId: currencyId, // <-- Solo usar el ID que sabemos que funciona
        bedrooms: parseInt(meta.fave_property_bedrooms?.[0] || '0'),
        bathrooms: parseInt(meta.fave_property_bathrooms?.[0] || '0'),
        area: parseFloat(meta.fave_property_size?.[0] || '0'),
        garage: parseInt(meta.fave_property_garage?.[0] || '0'),
        operacion: operationType === 'VENTA' ? 'SALE' : operationType === 'ALQUILER' ? 'RENT' : 'BOTH'
      };
      // Log de depuración
      console.log('Payload enviado al backend:', JSON.stringify(updateData, null, 2));

      // Actualizar la propiedad con las imágenes
      const updateRes = await fetch(`${BACKEND_API}/${realPropertyId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
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
      console.error(`🚨 ERROR CRÍTICO procesando propiedad ${prop.id}:`);
      console.error(`[HOUZEZ ID] ${prop.id}`);
      console.error(`[TITLE] ${prop.title?.rendered}`);
      console.error(`[ERROR] ${error.message}`);
      console.error(`[STACK] ${error.stack}`);
      console.error(`\n🛑 MIGRACIÓN DETENIDA. Corrige el error antes de continuar.\n`);
      throw error; // Detener completamente el proceso
    }
  }
  page++;
}
console.log(`Migradas ${migrated} propiedades, saltadas ${skipped}`);
}

migrateProperties(); 