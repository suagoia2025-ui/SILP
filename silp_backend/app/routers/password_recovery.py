# app/routers/password_recovery.py
from fastapi import APIRouter, Depends, HTTPException, status, Body
from sqlalchemy.orm import Session
import logging

from app import crud, schemas, security
from app.database import get_db
from app.email_utils import send_email
from app.security import get_password_hash

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/password-recovery", tags=["Password Recovery"])
async def recover_password(email: str = Body(..., embed=True), db: Session = Depends(get_db)):
    """
    Inicia el flujo de recuperación de contraseña.
    """
    user = crud.get_user_by_email(db, email=email)
    
    # Por seguridad, no revelamos si el usuario existe o no.
    # Simplemente enviamos el correo si lo encontramos.
    if user:
        password_reset_token = security.create_password_reset_token(email=email)
        
        # Aquí defines la URL que irá en el correo. Apunta a tu frontend.
        reset_link = f"http://localhost:5173/reset-password?token={password_reset_token}"
        
        email_body = f"""
        <h1>Restablecimiento de Contraseña</h1>
        <p>Hola {user.first_name},</p>
        <p>Has solicitado restablecer tu contraseña. Haz clic en el siguiente enlace para continuar:</p>
        <a href="{reset_link}">Restablecer Contraseña</a>
        <p>Si no solicitaste esto, por favor ignora este correo.</p>
        """
        
        try:
            await send_email(
                subject="Restablecimiento de Contraseña para SILP",
                recipients=[user.email],
                body=email_body
            )
            logger.info(f"✅ Email de recuperación enviado a: {user.email}")
        except Exception as e:
            # Log el error pero no lo exponemos al usuario por seguridad
            logger.error(f"❌ Error al enviar email de recuperación: {type(e).__name__}: {str(e)}")
            # Por seguridad, devolvemos el mismo mensaje genérico
            # En producción, podrías querer notificar al administrador
        
    return {"message": "Si existe una cuenta con este correo, se ha enviado un enlace para restablecer la contraseña."}

@router.post("/reset-password", tags=["Password Recovery"])
def reset_password(
    token: str = Body(...), 
    new_password: str = Body(...),
    db: Session = Depends(get_db)
):
    """
    Completa el flujo de recuperación con el token y la nueva contraseña.
    """
    # Validar longitud de contraseña antes de procesar
    password_bytes = new_password.encode('utf-8')
    if len(password_bytes) > 72:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"La contraseña no puede exceder 72 bytes. Tu contraseña tiene {len(password_bytes)} bytes. Por favor, usa una contraseña más corta."
        )
    
    email = security.verify_password_reset_token(token)
    if not email:
        raise HTTPException(status_code=400, detail="El token no es válido o ha expirado")
        
    user = crud.get_user_by_email(db, email=email)
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    hashed_password = get_password_hash(new_password)
    user.password_hash = hashed_password
    db.commit()
    
    return {"message": "La contraseña ha sido actualizada exitosamente."}

