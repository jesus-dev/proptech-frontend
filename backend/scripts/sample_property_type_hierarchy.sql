-- Script para insertar datos de ejemplo con jerarquía de tipos de propiedad
-- Ejecutar después de agregar la columna parent_id

-- Insertar tipos padre (categorías principales)
INSERT INTO proptech.property_types (name, description, active, parent_id) VALUES
('Residencial', 'Propiedades destinadas a vivienda', true, NULL),
('Comercial', 'Propiedades destinadas a actividades comerciales', true, NULL),
('Industrial', 'Propiedades destinadas a actividades industriales', true, NULL),
('Terrenos', 'Lotes y terrenos sin construcción', true, NULL);

-- Obtener los IDs de los tipos padre para las referencias
-- (En una implementación real, estos IDs se obtendrían dinámicamente)

-- Insertar tipos hijo para Residencial
INSERT INTO proptech.property_types (name, description, active, parent_id) VALUES
('Casa', 'Vivienda unifamiliar', true, (SELECT id FROM proptech.property_types WHERE name = 'Residencial' AND parent_id IS NULL)),
('Apartamento', 'Unidad residencial en edificio', true, (SELECT id FROM proptech.property_types WHERE name = 'Residencial' AND parent_id IS NULL)),
('Casa Quinta', 'Casa con terreno amplio', true, (SELECT id FROM proptech.property_types WHERE name = 'Residencial' AND parent_id IS NULL)),
('Duplex', 'Vivienda de dos niveles', true, (SELECT id FROM proptech.property_types WHERE name = 'Residencial' AND parent_id IS NULL)),
('Townhouse', 'Casa adosada', true, (SELECT id FROM proptech.property_types WHERE name = 'Residencial' AND parent_id IS NULL));

-- Insertar tipos hijo para Comercial
INSERT INTO proptech.property_types (name, description, active, parent_id) VALUES
('Local Comercial', 'Espacio para negocio', true, (SELECT id FROM proptech.property_types WHERE name = 'Comercial' AND parent_id IS NULL)),
('Oficina', 'Espacio de trabajo', true, (SELECT id FROM proptech.property_types WHERE name = 'Comercial' AND parent_id IS NULL)),
('Bodega', 'Almacén o depósito', true, (SELECT id FROM proptech.property_types WHERE name = 'Comercial' AND parent_id IS NULL)),
('Centro Comercial', 'Complejo comercial', true, (SELECT id FROM proptech.property_types WHERE name = 'Comercial' AND parent_id IS NULL));

-- Insertar tipos hijo para Industrial
INSERT INTO proptech.property_types (name, description, active, parent_id) VALUES
('Planta Industrial', 'Instalación industrial', true, (SELECT id FROM proptech.property_types WHERE name = 'Industrial' AND parent_id IS NULL)),
('Parque Industrial', 'Complejo industrial', true, (SELECT id FROM proptech.property_types WHERE name = 'Industrial' AND parent_id IS NULL)),
('Nave Industrial', 'Edificio industrial', true, (SELECT id FROM proptech.property_types WHERE name = 'Industrial' AND parent_id IS NULL));

-- Insertar tipos hijo para Terrenos
INSERT INTO proptech.property_types (name, description, active, parent_id) VALUES
('Terreno Residencial', 'Lote para construcción de vivienda', true, (SELECT id FROM proptech.property_types WHERE name = 'Terrenos' AND parent_id IS NULL)),
('Terreno Comercial', 'Lote para construcción comercial', true, (SELECT id FROM proptech.property_types WHERE name = 'Terrenos' AND parent_id IS NULL)),
('Terreno Industrial', 'Lote para construcción industrial', true, (SELECT id FROM proptech.property_types WHERE name = 'Terrenos' AND parent_id IS NULL)),
('Terreno Agrícola', 'Lote para actividades agrícolas', true, (SELECT id FROM proptech.property_types WHERE name = 'Terrenos' AND parent_id IS NULL));
