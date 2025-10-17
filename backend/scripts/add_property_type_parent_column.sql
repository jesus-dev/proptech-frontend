-- Script para agregar la columna parent_id a la tabla property_types
-- Ejecutar este script en la base de datos para soportar la jerarquía de tipos de propiedad

-- Agregar la columna parent_id
ALTER TABLE proptech.property_types 
ADD COLUMN parent_id BIGINT;

-- Agregar la foreign key constraint
ALTER TABLE proptech.property_types 
ADD CONSTRAINT fk_property_type_parent 
FOREIGN KEY (parent_id) REFERENCES proptech.property_types(id);

-- Crear índice para mejorar el rendimiento
CREATE INDEX idx_property_type_parent_id ON proptech.property_types(parent_id);

-- Comentarios para documentar la nueva estructura
COMMENT ON COLUMN proptech.property_types.parent_id IS 'Referencia al tipo de propiedad padre para crear jerarquías';
