from fastapi import FastAPI
from .routers import auth, users, contacts, password_recovery, municipalities, occupations, admin, network
#Esta importacion es necesaria para decirle a la API que permita las peticiones del Frontend
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="SILP API")

# Define de qué orígenes (direcciones) se permitirán peticiones
origins = [
    "http://localhost:5173", # La dirección de tu frontend de React
    "http://localhost:3000", # Otra dirección común para React
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins, # Permite los orígenes definidos
    allow_credentials=True,
    allow_methods=["*"], # Permite todos los métodos (GET, POST, etc.)
    allow_headers=["*"], # Permite todas las cabeceras
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