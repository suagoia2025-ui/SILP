-- Script para agregar la columna cedula a las tablas users y contacts
-- Ejecutar este script en la base de datos db_provida_uf
-- Este script es compatible con bases de datos existentes (usa IF NOT EXISTS)

-- Agregar columna cedula a la tabla users
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS cedula VARCHAR(20) NULL;

-- Agregar índice único para cedula en users (si no existe)
CREATE UNIQUE INDEX IF NOT EXISTS users_cedula_key ON users (cedula) WHERE cedula IS NOT NULL;

-- Agregar índice para búsquedas rápidas por cedula en users
CREATE INDEX IF NOT EXISTS users_cedula_idx ON users (cedula) WHERE cedula IS NOT NULL;

-- Agregar columna cedula a la tabla contacts
ALTER TABLE contacts 
ADD COLUMN IF NOT EXISTS cedula VARCHAR(20) NULL;

-- Agregar índice único para cedula en contacts (si no existe)
CREATE UNIQUE INDEX IF NOT EXISTS contacts_cedula_key ON contacts (cedula) WHERE cedula IS NOT NULL;

-- Agregar índice para búsquedas rápidas por cedula en contacts
CREATE INDEX IF NOT EXISTS contacts_cedula_idx ON contacts (cedula) WHERE cedula IS NOT NULL;

