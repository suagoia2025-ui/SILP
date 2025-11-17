from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from .routers import auth, users, contacts, password_recovery, municipalities, occupations, admin, network

app = FastAPI(title="SILP API")

# Define de qué orígenes (direcciones) se permitirán peticiones
# Lee desde variable de entorno CORS_ORIGINS (separados por comas)
# Por defecto usa localhost:3000 y localhost:5173
cors_origins_str = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://localhost:5173")
origins = [origin.strip() for origin in cors_origins_str.split(",") if origin.strip()]

# Log para debugging (siempre mostrar en Railway para troubleshooting)
print(f"🔍 CORS Origins configurados: {origins}")
print(f"🔍 CORS_ORIGINS variable: {cors_origins_str}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins, # Permite los orígenes definidos
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"], # Métodos explícitos
    allow_headers=["*"], # Permite todas las cabeceras
    expose_headers=["*"], # Expone todas las cabeceras
    max_age=3600, # Cache preflight por 1 hora
)

# Esta es la línea que usa el 'router' del otro archivo
app.include_router(auth.router, prefix="/api/v1", tags=["Authentication"])
app.include_router(users.router, prefix="/api/v1", tags=["Users"])
app.include_router(contacts.router, prefix="/api/v1")
app.include_router(password_recovery.router, prefix="/api/v1")
app.include_router(municipalities.router, prefix="/api/v1")
app.include_router(occupations.router, prefix="/api/v1")
app.include_router(admin.router, prefix="/api/v1")
app.include_router(network.router, prefix="/api/v1", tags=["Network"])

@app.get("/")
def read_root():
    return {"Proyecto": "SILP - Sistema Integración de Líderes Privada"}