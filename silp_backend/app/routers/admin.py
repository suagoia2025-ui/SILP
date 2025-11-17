from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
import pandas as pd
import io
import traceback
import logging
from app import models, schemas, security, crud
from app.database import get_db

logger = logging.getLogger(__name__)

router = APIRouter()

@router.post("/admin/upload-contacts", tags=["Admin"])
async def upload_contacts(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(security.require_roles(["superadmin", "admin", "lider"]))
):
    """
    Carga masiva de contactos desde un archivo CSV o Excel.
    
    El archivo debe tener las siguientes columnas:
    - first_name
    - last_name
    - email
    - phone
    - municipality_id (INTEGER)
    - cedula (opcional, solo dígitos, 5-15 caracteres, o valores históricos con prefijo 'TEMP')
    - address (opcional)
    - occupation_id (INTEGER, opcional)
    - mdv (VARCHAR, opcional)
    - is_active (BOOLEAN, opcional, por defecto True)
    
    Los contactos se crearán asociados al usuario autenticado (user_id del token JWT).
    """
    
    # Validar tipo de archivo
    if not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No se proporcionó un archivo"
        )
    
    file_extension = file.filename.split('.')[-1].lower()
    if file_extension not in ['csv', 'xlsx', 'xls']:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El archivo debe ser CSV o Excel (.csv, .xlsx, .xls)"
        )
    
    try:
        # Leer el contenido del archivo
        contents = await file.read()
        
        if not contents or len(contents) == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El archivo está vacío o no se pudo leer"
            )
        
        # Procesar según el tipo de archivo
        try:
            if file_extension == 'csv':
                # Leer CSV con manejo de valores vacíos
                df = pd.read_csv(io.BytesIO(contents), encoding='utf-8', keep_default_na=True, na_values=['', ' ', 'nan', 'NaN', 'None'])
            else:  # xlsx o xls
                df = pd.read_excel(io.BytesIO(contents), keep_default_na=True, na_values=['', ' ', 'nan', 'NaN', 'None'])
        except Exception as read_error:
            logger.error(f"Error al leer el archivo: {traceback.format_exc()}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Error al leer el archivo. Asegúrate de que el formato sea correcto: {str(read_error)}"
            )
        
        # Limpiar nombres de columnas (eliminar espacios en blanco)
        df.columns = df.columns.str.strip()
        
        # Eliminar filas completamente vacías
        df = df.dropna(how='all')
        
        # Validar que el DataFrame no esté vacío después de limpiar
        if df.empty:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El archivo no contiene datos válidos (todas las filas están vacías)"
            )
        
        # Validar columnas requeridas (solo first_name y last_name son obligatorios)
        required_columns = ['first_name', 'last_name']
        missing_columns = [col for col in required_columns if col not in df.columns]
        if missing_columns:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Faltan las siguientes columnas requeridas: {', '.join(missing_columns)}. Solo se requieren 'first_name' y 'last_name'."
            )
        
        # Todas las demás columnas son opcionales
        optional_columns = ['cedula', 'email', 'phone', 'address', 'municipality_id', 'occupation_id', 'mdv', 'is_active']
        
        # Validar y convertir tipos de datos
        errors = []
        created_count = 0
        skipped_count = 0
        
        for index, row in df.iterrows():
            try:
                # Validar y procesar campos requeridos primero
                # Saltar filas donde first_name y last_name estén completamente vacíos (NaN)
                if pd.isna(row.get('first_name')) and pd.isna(row.get('last_name')):
                    skipped_count += 1
                    continue
                
                # Procesar y validar campos requeridos (solo first_name y last_name)
                first_name = str(row['first_name']).strip() if pd.notna(row.get('first_name')) else ''
                last_name = str(row['last_name']).strip() if pd.notna(row.get('last_name')) else ''
                
                # Validar que los campos requeridos no estén vacíos
                if not first_name:
                    errors.append(f"Fila {index + 2}: first_name es requerido y no puede estar vacío")
                    skipped_count += 1
                    continue
                
                if not last_name:
                    errors.append(f"Fila {index + 2}: last_name es requerido y no puede estar vacío")
                    skipped_count += 1
                    continue
                
                # Procesar campos opcionales
                phone = str(row['phone']).strip() if 'phone' in df.columns and pd.notna(row.get('phone')) else None
                if phone == '':
                    phone = None
                
                email = str(row['email']).strip() if 'email' in df.columns and pd.notna(row.get('email')) else None
                if email == '' or (email and '@' not in email):
                    # Si el email está presente pero es inválido, establecer como None
                    if email and '@' not in email:
                        errors.append(f"Fila {index + 2}: email inválido (formato incorrecto), se omitirá")
                    email = None
                
                # Validar y convertir municipality_id a INTEGER (opcional)
                municipality_id = None
                if 'municipality_id' in df.columns and pd.notna(row.get('municipality_id')):
                    try:
                        municipality_id_value = row['municipality_id']
                        municipality_id = int(float(municipality_id_value))
                        # Validar que municipality_id exista en la base de datos
                        municipality = db.query(models.Municipality).filter(
                            models.Municipality.id == municipality_id
                        ).first()
                        if not municipality:
                            errors.append(f"Fila {index + 2}: municipality_id {municipality_id} no existe en la base de datos, se omitirá")
                            municipality_id = None
                    except (ValueError, TypeError) as e:
                        errors.append(f"Fila {index + 2}: municipality_id inválido (valor: {row.get('municipality_id')}), se omitirá")
                        municipality_id = None
                
                # Validar y convertir occupation_id a INTEGER (si está presente y no está vacío)
                occupation_id = None
                if 'occupation_id' in df.columns:
                    occupation_value = row.get('occupation_id')
                    # Verificar que no sea NaN, None, o string vacío
                    if pd.notna(occupation_value) and str(occupation_value).strip() != '':
                        try:
                            occupation_id = int(float(occupation_value))
                            # Validar que occupation_id exista en la base de datos
                            occupation = db.query(models.Occupation).filter(
                                models.Occupation.id == occupation_id
                            ).first()
                            if not occupation:
                                errors.append(f"Fila {index + 2}: occupation_id {occupation_id} no existe en la base de datos")
                                skipped_count += 1
                                continue
                        except (ValueError, TypeError):
                            errors.append(f"Fila {index + 2}: occupation_id debe ser un número entero válido (valor: {occupation_value})")
                            skipped_count += 1
                            continue
                
                # Validar y convertir is_active a BOOLEAN (si está presente)
                is_active = True  # Valor por defecto
                if 'is_active' in df.columns and pd.notna(row.get('is_active')):
                    value = row['is_active']
                    # Convertir diferentes representaciones de boolean
                    if isinstance(value, bool):
                        is_active = value
                    elif isinstance(value, str):
                        is_active = value.lower() in ['true', '1', 'yes', 'sí', 'si', 'verdadero', 'activo']
                    elif isinstance(value, (int, float)):
                        is_active = bool(value)
                    else:
                        is_active = True  # Por defecto si no se puede convertir
                
                # Obtener valores de campos opcionales
                address = None
                if 'address' in df.columns and pd.notna(row.get('address')):
                    address_value = str(row.get('address')).strip()
                    address = address_value if address_value else None
                
                mdv = None
                if 'mdv' in df.columns and pd.notna(row.get('mdv')):
                    mdv_value = str(row.get('mdv')).strip()
                    mdv = mdv_value if mdv_value else None
                
                # Validar y procesar cédula (opcional)
                cedula = None
                if 'cedula' in df.columns and pd.notna(row.get('cedula')):
                    cedula = str(row['cedula']).strip()
                    # Permitir valores TEMP (datos históricos)
                    if not cedula.startswith('TEMP'):
                        # Remover cualquier carácter no numérico
                        cedula = ''.join(filter(str.isdigit, cedula))
                        if cedula:
                            if len(cedula) < 5 or len(cedula) > 15:
                                errors.append(f"Fila {index + 2}: la cédula debe tener entre 5 y 15 dígitos")
                                skipped_count += 1
                                continue
                        else:
                            # Si después de filtrar está vacía, establecer como None
                            cedula = None
                    # Si empieza con TEMP, mantener el valor original
                # Si no hay columna cedula o está vacía, cedula será None
                
                # Crear el contacto
                contact_data = schemas.ContactCreate(
                    first_name=first_name,
                    last_name=last_name,
                    cedula=cedula,
                    email=email,
                    phone=phone,
                    address=address,
                    municipality_id=municipality_id,
                    occupation_id=occupation_id,
                    mdv=mdv,
                    is_active=is_active
                )
                
                # Insertar en la base de datos
                try:
                    crud.create_user_contact(db=db, contact=contact_data, user_id=current_user.id)
                    created_count += 1
                except ValueError as ve:
                    # Errores de validación (cédula duplicada, etc.)
                    errors.append(f"Fila {index + 2}: {str(ve)}")
                    skipped_count += 1
                    continue
                except Exception as db_error:
                    # Otros errores de base de datos
                    error_msg = f"Fila {index + 2}: Error al crear contacto - {str(db_error)}"
                    errors.append(error_msg)
                    logger.error(f"Error al crear contacto en fila {index + 2}: {traceback.format_exc()}")
                    skipped_count += 1
                    continue
                
            except Exception as e:
                error_msg = f"Fila {index + 2}: Error al procesar - {str(e)}"
                errors.append(error_msg)
                logger.error(f"Error en fila {index + 2}: {traceback.format_exc()}")
                skipped_count += 1
                continue
        
        # Preparar respuesta
        response_data = {
            "message": "Carga masiva completada",
            "created": created_count,
            "skipped": skipped_count,
            "total_rows": len(df)
        }
        
        if errors:
            response_data["errors"] = errors[:50]  # Limitar a 50 errores para no sobrecargar la respuesta
            if len(errors) > 50:
                response_data["errors_message"] = f"Se encontraron {len(errors)} errores. Mostrando los primeros 50."
        
        return response_data
        
    except pd.errors.EmptyDataError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El archivo está vacío"
        )
    except HTTPException:
        # Re-lanzar HTTPException sin modificar
        raise
    except Exception as e:
        # Log del error completo para debugging
        error_trace = traceback.format_exc()
        logger.error(f"Error al procesar archivo de carga masiva: {error_trace}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al procesar el archivo: {str(e)}. Revisa los logs del servidor para más detalles."
        )

