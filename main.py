import os
from dotenv import load_dotenv
from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
import openai

app = FastAPI()

# Cargar variables de entorno desde .env
load_dotenv()

# Obtener la clave API desde las variables de entorno
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Archivos estáticos desde /static
app.mount("/static", StaticFiles(directory="static", html=True), name="static")

# Ruta raíz
@app.get("/")
async def root():
    return FileResponse("static/index.html")

# Crear cliente OpenAI (CLAVE EN UNA SOLA LÍNEA)
client = openai.OpenAI(
    api_key=OPENAI_API_KEY
)

@app.post("/chat-completion")
async def chat_completion(request: Request):
    body = await request.json()
    model = body.get("model", "gpt-3.5-turbo")
    messages = body.get("messages", [])

    try:
        response = client.chat.completions.create(
            model=model,
            messages=messages,
        )
        return response.dict()  # Devuelve como JSON
    except Exception as e:
        return {"error": {"message": str(e)}}
