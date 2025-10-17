-- Crear tabla de zonas urbanas
CREATE TABLE IF NOT EXISTS proptech.city_zones (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    active BOOLEAN NOT NULL DEFAULT true,
    city_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraint único para evitar duplicados de nombre por ciudad
    CONSTRAINT uk_city_zones_name_city UNIQUE (name, city_id),
    
    -- Foreign key a la tabla cities
    CONSTRAINT fk_city_zones_city FOREIGN KEY (city_id) REFERENCES proptech.cities(id) ON DELETE CASCADE
);

-- Crear índices para mejorar performance
CREATE INDEX IF NOT EXISTS idx_city_zones_city_id ON proptech.city_zones(city_id);
CREATE INDEX IF NOT EXISTS idx_city_zones_active ON proptech.city_zones(active);
CREATE INDEX IF NOT EXISTS idx_city_zones_name ON proptech.city_zones(name);

-- Insertar algunas zonas urbanas de ejemplo para Asunción
INSERT INTO proptech.city_zones (name, description, city_id, active) VALUES
('Centro', 'Zona céntrica de Asunción con edificios comerciales y residenciales', 1, true),
('Villa Morra', 'Zona residencial de alto nivel con casas y edificios modernos', 1, true),
('Carmelitas', 'Zona residencial tradicional con casas antiguas y modernas', 1, true),
('Las Mercedes', 'Zona residencial con amplias casas y jardines', 1, true),
('Mburicaó', 'Zona comercial y residencial en crecimiento', 1, true)
ON CONFLICT (name, city_id) DO NOTHING;

-- Comentarios en la tabla
COMMENT ON TABLE proptech.city_zones IS 'Tabla de zonas urbanas dentro de las ciudades';
COMMENT ON COLUMN proptech.city_zones.id IS 'Identificador único de la zona urbana';
COMMENT ON COLUMN proptech.city_zones.name IS 'Nombre de la zona urbana';
COMMENT ON COLUMN proptech.city_zones.description IS 'Descripción detallada de la zona urbana';
COMMENT ON COLUMN proptech.city_zones.active IS 'Indica si la zona urbana está activa';
COMMENT ON COLUMN proptech.city_zones.city_id IS 'ID de la ciudad a la que pertenece la zona';
COMMENT ON COLUMN proptech.city_zones.created_at IS 'Fecha de creación del registro';
COMMENT ON COLUMN proptech.city_zones.updated_at IS 'Fecha de última actualización del registro';
