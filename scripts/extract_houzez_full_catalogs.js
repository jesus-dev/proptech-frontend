const fetch = require('node-fetch');

const WP_API = 'https://onbienesraices.com.py/wp-json/wp/v2/properties';

async function extractCatalogs() {
  let page = 1;
  const countries = new Set();
  const departments = new Set();
  const cities = new Set();
  const propertyTypes = new Set();
  const amenities = new Set();
  const services = new Set();
  const agents = new Set();
  const agencies = new Set();

  while (true) {
    const res = await fetch(`${WP_API}?per_page=20&page=${page}`);
    if (!res.ok) break;
    const properties = await res.json();
    if (properties.length === 0) break;

    for (const prop of properties) {
      // País
      let countryName = prop.country || prop.property_country_name || '';
      if (!countryName && prop.property_country?.[0]) countryName = await getTaxonomyName('property_country', prop.property_country[0]);
      if (countryName) countries.add(countryName.trim());

      // Departamento/Estado
      let stateName = prop.state || prop.property_state_name || '';
      if (!stateName && prop.property_state?.[0]) stateName = await getTaxonomyName('property_state', prop.property_state[0]);
      if (stateName) departments.add(stateName.trim());

      // Ciudad
      let cityName = prop.city || prop.property_city_name || '';
      if (!cityName && prop.property_city?.[0]) cityName = await getTaxonomyName('property_city', prop.property_city[0]);
      if (cityName) cities.add(cityName.trim());

      // Tipo de propiedad
      let propertyTypeName = prop.property_type_name || '';
      if (!propertyTypeName && prop.property_type?.[0]) propertyTypeName = await getTaxonomyName('property_type', prop.property_type[0]);
      if (propertyTypeName) propertyTypes.add(propertyTypeName.trim());

      // Amenities
      if (Array.isArray(prop.property_feature)) {
        for (const id of prop.property_feature) {
          const name = await getTaxonomyName('property_feature', id);
          if (name) amenities.add(name.trim());
        }
      }
      // Servicios (labels)
      if (Array.isArray(prop.property_label)) {
        for (const id of prop.property_label) {
          const name = await getTaxonomyName('property_label', id);
          if (name) services.add(name.trim());
        }
      }
      // Agente
      if (prop.property_meta?.fave_property_agent?.[0]) {
        agents.add(prop.property_meta.fave_property_agent[0].trim());
      }
      // Agencia
      if (prop.property_meta?.fave_property_agency?.[0]) {
        agencies.add(prop.property_meta.fave_property_agency[0].trim());
      }
    }
    page++;
  }

  console.log('\n--- Países ---');
  countries.forEach(c => console.log(c));
  console.log('\n--- Departamentos/Estados ---');
  departments.forEach(d => console.log(d));
  console.log('\n--- Ciudades ---');
  cities.forEach(c => console.log(c));
  console.log('\n--- Tipos de propiedad ---');
  propertyTypes.forEach(t => console.log(t));
  console.log('\n--- Amenities ---');
  amenities.forEach(a => console.log(a));
  console.log('\n--- Servicios ---');
  services.forEach(s => console.log(s));
  console.log('\n--- Agentes ---');
  agents.forEach(a => console.log(a));
  console.log('\n--- Agencias ---');
  agencies.forEach(a => console.log(a));
}

async function getTaxonomyName(tax, id) {
  if (!id) return '';
  const res = await fetch(`https://onbienesraices.com.py/wp-json/wp/v2/${tax}/${id}`);
  if (!res.ok) return '';
  const data = await res.json();
  return data.name || '';
}

extractCatalogs(); 