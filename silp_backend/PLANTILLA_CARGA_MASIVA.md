# Plantilla para Carga Masiva de Contactos

> **Última actualización**: 16 de noviembre de 2025

## Formato del Archivo

El sistema acepta archivos en formato **CSV** o **Excel** (.csv, .xlsx, .xls).

## Columnas Requeridas y Opcionales

### Columnas Requeridas (Obligatorias)

⚠️ **IMPORTANTE**: La carga masiva es indulgente y solo requiere el nombre del contacto.

| Columna | Tipo | Descripción | Ejemplo |
|---------|------|-------------|---------|
| `first_name` | String | Nombre del contacto (OBLIGATORIO) | Juan |
| `last_name` | String | Apellido del contacto (OBLIGATORIO) | Pérez |

### Columnas Opcionales

Todas las demás columnas son **opcionales**. Puedes omitirlas o dejarlas vacías:

| Columna | Tipo | Descripción | Valor por Defecto | Ejemplo |
|---------|------|-------------|-------------------|---------|
| `email` | Email | Correo electrónico válido. Si se omite o es inválido, se establecerá como `null` | `null` | juan.perez@example.com |
| `phone` | String | Número de teléfono | `null` | 3001234567 |
| `municipality_id` | INTEGER | ID del municipio (debe existir en la base de datos si se proporciona). Si se omite o no existe, se establecerá como `null` | `null` | 3 |
| `cedula` | String | Cédula de identificación (solo dígitos, 5-15 caracteres). Si se omite, el contacto se creará sin cédula. | `null` | 1234567890 |
| `address` | String | Dirección del contacto | `null` | Calle 123 #45-67 |
| `occupation_id` | INTEGER | ID de la ocupación (debe existir en la base de datos si se proporciona) | `null` | 1 |
| `mdv` | String(255) | Referencia alfanumérica personalizada | `null` | REF-001 |
| `is_active` | BOOLEAN | Estado activo/inactivo del contacto | `true` | true, false, 1, 0, "sí", "no" |

## Valores Aceptados para `is_active`

El campo `is_active` acepta los siguientes valores (case-insensitive):
- `true`, `1`, `yes`, `sí`, `si`, `verdadero`, `activo` → Se interpreta como `true`
- `false`, `0`, `no`, `falso`, `inactivo` → Se interpreta como `false`
- Si está vacío o no se proporciona → Se usa el valor por defecto `true`

## Importante: IDs de Referencia

⚠️ **NOTA**: Los valores de `municipality_id` y `occupation_id` son **opcionales**. Si los proporcionas, deben existir en la base de datos. Si no existen o están vacíos, se establecerán como `null`.

### Cómo obtener los IDs válidos:

1. **Municipality IDs**: Consulta la tabla `municipalities` en la base de datos
2. **Occupation IDs**: Consulta la tabla `occupations` en la base de datos

Puedes obtener estos valores desde la interfaz web o consultando directamente la base de datos.

## Ejemplo de Archivo CSV

### Ejemplo mínimo (solo campos requeridos):
```csv
first_name,last_name
Juan,Pérez
María,González
Carlos,Rodríguez
```

### Ejemplo completo (con todos los campos opcionales):
```csv
first_name,last_name,cedula,email,phone,address,municipality_id,occupation_id,mdv,is_active
Juan,Pérez,1234567890,juan.perez@example.com,3001234567,Calle 123 #45-67,3,1,REF-001,true
María,González,2345678901,maria.gonzalez@example.com,3002345678,Avenida Principal 89,3,2,REF-002,true
Carlos,Rodríguez,3456789012,carlos.rodriguez@example.com,3003456789,Carrera 50 #30-20,6,,REF-003,false
Ana,Martínez,4567890123,ana.martinez@example.com,3004567890,Transversal 10 #5-10,6,3,REF-004,true
Pedro,Sánchez,,,,,,,,
```

**Nota**: Como puedes ver en el último ejemplo (Pedro Sánchez), puedes crear contactos con solo el nombre y apellido. Todos los demás campos son opcionales.

## Ejemplo de Archivo Excel

El archivo Excel debe tener las mismas columnas en la primera fila (encabezados).

## Validaciones del Sistema

El sistema realizará las siguientes validaciones:

1. ✅ **Formato de archivo**: Solo acepta .csv, .xlsx, .xls
2. ✅ **Columnas requeridas**: Solo verifica que existan `first_name` y `last_name`
3. ✅ **Tipos de datos**:
   - `first_name` y `last_name` son obligatorios y no pueden estar vacíos
   - `cedula` es opcional. Si se proporciona, debe contener solo dígitos numéricos (5-15 caracteres) o puede ser un valor histórico con prefijo 'TEMP'
   - `email` es opcional. Si se proporciona pero es inválido, se establecerá como `null` y se mostrará una advertencia
   - `phone` es opcional
   - `municipality_id` es opcional. Si se proporciona, debe ser un número entero válido
   - `occupation_id` es opcional. Si se proporciona, debe ser un número entero válido
   - `is_active` se convierte automáticamente a booleano (por defecto `true`)
4. ✅ **Existencia en BD** (solo si se proporcionan):
   - Si `municipality_id` se proporciona pero no existe, se establecerá como `null` y se mostrará una advertencia
   - Si `occupation_id` se proporciona pero no existe, se establecerá como `null` y se mostrará una advertencia
5. ✅ **Cédula única**: Si se proporciona una cédula, no debe estar duplicada en la base de datos
6. ✅ **Email válido**: Si se proporciona, debe contener el símbolo `@`. Si no es válido, se establecerá como `null`

## Resultado de la Carga

Después de cargar el archivo, recibirás un reporte con:
- ✅ **Contactos creados**: Número de contactos insertados exitosamente
- ⚠️ **Contactos omitidos**: Número de filas que no se pudieron procesar
- 📊 **Total de filas**: Número total de filas en el archivo
- ❌ **Errores**: Lista detallada de errores encontrados (si los hay)

## Notas Importantes

1. **Asociación de contactos**: Todos los contactos cargados se asociarán automáticamente al usuario que realiza la carga (según el token JWT).

2. **Permisos**: Solo usuarios con roles `superadmin`, `admin` o `lider` pueden realizar cargas masivas.

3. **Errores por fila**: Si una fila tiene errores, se omitirá pero el proceso continuará con las siguientes filas.

4. **Límite de errores**: El sistema mostrará hasta 50 errores en el reporte. Si hay más, se indicará en el mensaje.

5. **Encoding**: Los archivos CSV deben estar en codificación UTF-8.

## Solución de Problemas Comunes

### Advertencia: "municipality_id X no existe en la base de datos, se omitirá"
**Solución**: El sistema establecerá el campo como `null` y continuará. Si quieres asignar un municipio, verifica que el ID exista consultando la tabla `municipalities`.

### Advertencia: "occupation_id X no existe en la base de datos"
**Solución**: El sistema establecerá el campo como `null` y continuará. Si quieres asignar una ocupación, verifica que el ID exista consultando la tabla `occupations`, o deja el campo vacío.

### Advertencia: "email inválido (formato incorrecto), se omitirá"
**Solución**: El sistema establecerá el email como `null` y continuará. Si quieres asignar un email, asegúrate de que contenga el símbolo `@` y tenga un formato válido.

### Error: "municipality_id debe ser un número entero"
**Solución**: Verifica que el valor sea un número entero (ej: 1, 2, 3) y no un decimal o texto.

### Error: "La cédula ya está registrada en el sistema"
**Solución**: La cédula que intentas cargar ya existe en la base de datos. Verifica que no estés duplicando contactos.

### Error: "la cédula debe tener entre 5 y 15 dígitos"
**Solución**: Asegúrate de que la cédula contenga solo dígitos numéricos y tenga entre 5 y 15 caracteres.

---

**Última actualización**: 2024

