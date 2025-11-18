from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
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

# Si no hay origins configurados, usar wildcard temporalmente para debugging
if not origins:
    print("⚠️  ADVERTENCIA: CORS_ORIGINS no configurado, usando wildcard (solo para debugging)")
    origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins, # Permite los orígenes definidos
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"], # Métodos explícitos
    allow_headers=["*"], # Permite todas las cabeceras
    expose_headers=["*"], # Expone todas las cabeceras
    max_age=3600, # Cache preflight por 1 hora
)

# Handler explícito para OPTIONS (preflight requests)
@app.options("/{full_path:path}")
async def options_handler(request: Request, full_path: str):
    """
    Maneja peticiones OPTIONS (preflight) explícitamente.
    Esto asegura que todas las rutas respondan correctamente a preflight requests.
    """
    origin = request.headers.get("origin")
    
    # Verificar si el origen está permitido
    if origin and (origin in origins or "*" in origins):
        return Response(
            status_code=200,
            headers={
                "Access-Control-Allow-Origin": origin,
                "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS, PATCH",
                "Access-Control-Allow-Headers": "*",
                "Access-Control-Allow-Credentials": "true",
                "Access-Control-Max-Age": "3600",
            }
        )
    else:
        # Si el origen no está permitido, retornar 403
        return Response(status_code=403)

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