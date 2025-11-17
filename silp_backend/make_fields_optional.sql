-- Script para hacer campos opcionales en tablas users y contacts
-- Solo first_name y last_name permanecen como NOT NULL
-- Última actualización: 2024

-- ============================================
-- TABLA USERS
-- ============================================

-- Hacer email opcional (eliminar NOT NULL)
ALTER TABLE users 
ALTER COLUMN email DROP NOT NULL;

-- Hacer phone opcional
ALTER TABLE users 
ALTER COLUMN phone DROP NOT NULL;

-- Hacer municipality_id opcional
ALTER TABLE users 
ALTER COLUMN municipality_id DROP NOT NULL;

-- address, occupation_id, cedula ya son opcionales, no necesitan cambios

-- ============================================
-- TABLA CONTACTS
-- ============================================

-- Hacer email opcional (eliminar NOT NULL)
ALTER TABLE contacts 
ALTER COLUMN email DROP NOT NULL;

-- Hacer phone opcional
ALTER TABLE contacts 
ALTER COLUMN phone DROP NOT NULL;

-- Hacer municipality_id opcional
ALTER TABLE contacts 
ALTER COLUMN municipality_id DROP NOT NULL;

-- address, occupation_id, cedula ya son opcionales, no necesitan cambios

-- ============================================
-- VERIFICACIÓN
-- ============================================

-- Verificar el estado final de las columnas en users
SELECT 
    'users' as tabla,
    column_name,
    is_nullable,
    data_type,
    character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'users' 
    AND column_name IN ('first_name', 'last_name', 'email', 'phone', 'municipality_id', 'occupation_id', 'cedula', 'address')
ORDER BY column_name;

-- Verificar el estado final de las columnas en contacts
SELECT 
    'contacts' as tabla,
    column_name,
    is_nullable,
    data_type,
    character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'contacts' 
    AND column_name IN ('first_name', 'last_name', 'email', 'phone', 'municipality_id', 'occupation_id', 'cedula', 'address')
ORDER BY column_name;

