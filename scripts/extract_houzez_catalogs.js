const fetch = require('node-fetch');

const WP_API = 'https://onbienesraices.com.py/wp-json/wp/v2/properties';

async function extractCatalogs() {
  let page = 1;
  const countries = new Set();
  const departments = new Set();
  const cities = new Set();
  const propertyTypes = new Set();

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
}

async function getTaxonomyName(tax, id) {
  if (!id) return '';
  const res = await fetch(`https://onbienesraices.com.py/wp-json/wp/v2/${tax}/${id}`);
  if (!res.ok) return '';
  const data = await res.json();
  return data.name || '';
}

extractCatalogs(); 