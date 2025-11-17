# 🔄 Sincronización de Base de Datos - SILP

Este documento explica cómo sincronizar la base de datos local con la base de datos de Docker.

## 📋 Opciones Disponibles

### Opción 1: Usar Base de Datos Local desde Docker (Recomendado)

Esta opción permite que Docker use directamente tu base de datos PostgreSQL local, evitando la necesidad de sincronizar datos.

**Ventajas:**
- ✅ No necesitas sincronizar manualmente
- ✅ Los datos siempre están actualizados
- ✅ No duplicas datos
- ✅ Más rápido para desarrollo

**Uso:**

1. Asegúrate de que PostgreSQL esté corriendo localmente:
   ```bash
   # Verificar que PostgreSQL esté corriendo
   psql -h localhost -U postgres -d db_provida_uf -c "SELECT 1;"
   ```

2. Configura la contraseña de PostgreSQL local en `.env`:
   ```env
   LOCAL_POSTGRES_PASSWORD=tu_contraseña_postgres
   ```

3. Levanta los servicios usando el archivo especial:
   ```bash
   docker compose -f docker-compose.localdb.yml up -d
   ```

4. Verifica que el backend se conectó correctamente:
   ```bash
   docker compose -f docker-compose.localdb.yml logs backend | grep -i "database\|connection"
   ```

**Nota:** En Linux, puede que necesites agregar `host.docker.internal` a `/etc/hosts` o usar la IP del host.

---

### Opción 2: Sincronizar Base de Datos Local → Docker

Esta opción copia todos los datos de tu base de datos local a la base de datos de Docker.

**Ventajas:**
- ✅ Docker tiene su propia base de datos (aislada)
- ✅ Puedes experimentar sin afectar datos locales
- ✅ Útil para testing

**Uso:**

1. Ejecuta el script de sincronización:
   ```bash
   # Opción A: Proporcionar contraseña como argumento
   ./scripts/sync_db_to_docker.sh tu_contraseña_postgres
   
   # Opción B: Usar variable de entorno
   PGPASSWORD=tu_contraseña_postgres ./scripts/sync_db_to_docker.sh
   
   # Opción C: Se pedirá interactivamente
   ./scripts/sync_db_to_docker.sh
   ```

2. El script:
   - Crea un dump de la base de datos local
   - Limpia la base de datos de Docker
   - Restaura el dump en Docker
   - Verifica que los datos se copiaron correctamente

**Requisitos:**
- PostgreSQL local corriendo
- Contenedor de Docker `silp_db` corriendo
- Acceso a la base de datos local con usuario `postgres`

---

## 🔍 Verificación

Después de sincronizar, verifica que los datos estén correctos:

```bash
# Ver usuarios en Docker
docker compose exec db psql -U silp_user -d db_provida_uf -c "SELECT email, role FROM users LIMIT 5;"

# Ver contactos en Docker
docker compose exec db psql -U silp_user -d db_provida_uf -c "SELECT COUNT(*) FROM contacts;"
```

---

## ⚠️ Notas Importantes

1. **Backup:** Siempre haz backup antes de sincronizar:
   ```bash
   pg_dump -h localhost -U postgres -d db_provida_uf > backup_$(date +%Y%m%d).sql
   ```

2. **Contraseñas:** Nunca commitees archivos `.env` con contraseñas reales.

3. **Producción:** En producción, usa migraciones (Alembic) en lugar de dumps manuales.

4. **Puertos:** Asegúrate de que no haya conflictos de puertos:
   - PostgreSQL local: `5432`
   - PostgreSQL Docker: `5433` (por defecto)

---

## 🐛 Troubleshooting

### Error: "No se pudo hacer dump"
- Verifica que PostgreSQL esté corriendo: `pg_isready -h localhost`
- Verifica que tengas acceso: `psql -h localhost -U postgres -d db_provida_uf`
- Verifica la contraseña

### Error: "No se pudo restaurar en Docker"
- Verifica que el contenedor esté corriendo: `docker compose ps`
- Verifica los logs: `docker compose logs db`
- Verifica que la base de datos de Docker esté lista: `docker compose exec db pg_isready`

### Error: "host.docker.internal no resuelve" (Linux)
- Agrega a `docker-compose.localdb.yml`:
  ```yaml
  extra_hosts:
    - "host.docker.internal:172.17.0.1"  # O la IP de tu host
  ```
- O usa la IP de tu host directamente en `DATABASE_URL`

---

## 📚 Referencias

- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [pg_dump Documentation](https://www.postgresql.org/docs/current/app-pgdump.html)

