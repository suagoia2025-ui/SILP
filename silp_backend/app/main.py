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

# Si no hay origins configurados, agregar URLs de Vercel por defecto
if not origins:
    print("⚠️  ADVERTENCIA: CORS_ORIGINS no configurado")
    print("💡 Agrega CORS_ORIGINS=https://silp-taupe.vercel.app en Railway")
    # Incluir URLs comunes de Vercel (producción y preview)
    origins = [
        "https://silp-taupe.vercel.app",
        "http://localhost:3000",
        "http://localhost:5173"
    ]

# Función para verificar si un origen está permitido
# Acepta subdominios de vercel.app si el dominio base está en la lista
def is_origin_allowed(origin: str) -> bool:
    if not origin:
        return False
    
    # Verificación exacta
    if origin in origins:
        return True
    
    # Verificación de subdominios de vercel.app
    # Si tenemos silp-taupe.vercel.app, aceptamos cualquier *.vercel.app
    for allowed_origin in origins:
        if allowed_origin.endswith(".vercel.app") and origin.endswith(".vercel.app"):
            return True
    
    return False

# Determinar si hay dominios de vercel.app para usar regex
has_vercel_domains = any(o.endswith(".vercel.app") for o in origins)
vercel_regex = r"https://.*\.vercel\.app" if has_vercel_domains else None

# Separar origins en vercel y no-vercel
vercel_origins = [o for o in origins if o.endswith(".vercel.app")]
non_vercel_origins = [o for o in origins if not o.endswith(".vercel.app")]

# Si hay dominios de vercel, usar regex para aceptar todos los subdominios
# Si no, usar la lista de origins directamente
if vercel_regex:
    # Usar regex para vercel.app y lista para otros
    app.add_middleware(
        CORSMiddleware,
        allow_origin_regex=vercel_regex,
        allow_origins=non_vercel_origins if non_vercel_origins else None,
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
        allow_headers=["*"],
        expose_headers=["*"],
        max_age=3600,
    )
else:
    # Usar solo lista de origins
    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
        allow_headers=["*"],
        expose_headers=["*"],
        max_age=3600,
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
    if origin and is_origin_allowed(origin):
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
        print(f"⚠️  Origen bloqueado: {origin}")
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