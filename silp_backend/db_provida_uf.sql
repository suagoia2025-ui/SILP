-- Tabla para los municipios
CREATE TABLE municipalities (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    department VARCHAR(100) NOT NULL DEFAULT 'Norte de Santander'
);

-- Tabla para las ocupaciones
CREATE TABLE occupations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
);

-- Tabla para los usuarios del sistema
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    phone VARCHAR(20) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('superadmin', 'admin', 'lider')),
    address VARCHAR(255) NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    municipality_id INTEGER NOT NULL REFERENCES municipalities(id),
    occupation_id INTEGER NULL REFERENCES occupations(id)
);

-- Tabla para los contactos registrados por los usuarios
CREATE TABLE contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    address VARCHAR(255) NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE, -- Si se borra un usuario, se borran sus contactos.
    municipality_id INTEGER NOT NULL REFERENCES municipalities(id),
    occupation_id INTEGER NULL REFERENCES occupations(id)
);

-- Crear índices para mejorar la búsqueda en llaves foráneas
CREATE INDEX ON users (email);
CREATE INDEX ON contacts (user_id);