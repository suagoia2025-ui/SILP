-- Script para agregar las columnas is_active y mdv a las tablas users y contacts
-- Ejecutar este script en la base de datos db_provida_uf

-- Agregar columnas a la tabla users
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS mdv VARCHAR(255) NULL;

-- Agregar columnas a la tabla contacts
ALTER TABLE contacts 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS mdv VARCHAR(255) NULL;

-- Actualizar registros existentes para que tengan is_active = TRUE por defecto
UPDATE users SET is_active = TRUE WHERE is_active IS NULL;
UPDATE contacts SET is_active = TRUE WHERE is_active IS NULL;

