# app/email_utils.py
import os
import logging
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

# Creamos la configuración para la conexión con Mailtrap
conf = ConnectionConfig(
    MAIL_USERNAME=os.getenv("MAIL_USERNAME"),
    MAIL_PASSWORD=os.getenv("MAIL_PASSWORD"),
    MAIL_FROM=os.getenv("MAIL_FROM"),
    MAIL_PORT=int(os.getenv("MAIL_PORT")),
    MAIL_SERVER=os.getenv("MAIL_SERVER"),
    MAIL_FROM_NAME=os.getenv("MAIL_FROM_NAME"),
    MAIL_STARTTLS=True,
    MAIL_SSL_TLS=False,
    USE_CREDENTIALS=True,
    VALIDATE_CERTS=True
)

# Función para enviar un correo (la usaremos en el siguiente paso)
async def send_email(subject: str, recipients: list, body: str):
    message = MessageSchema(
        subject=subject,
        recipients=recipients,
        body=body,
        subtype="html"
    )
    
    fm = FastMail(conf)
    await fm.send_message(message)
    logger.info(f"Correo enviado a: {recipients}")