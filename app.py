import os
from flask import Flask, render_template, jsonify, send_from_directory # type: ignore
import json
import time
import threading
import re
import shutil
from watchdog.observers import Observer # type: ignore
from watchdog.events import FileSystemEventHandler # type: ignore

# Importaciones de nuestros módulos
from config.config import COMPONENTES_DIR, EXTENSION_DIR
from extension.extension_builder import generar_extension_files

# Configuración
PUERTO = 8000
CONFIG_FILE = "componentes_config.json"

app = Flask(__name__)

# Asegurar que existen los directorios necesarios
for directory in [COMPONENTES_DIR, EXTENSION_DIR, f"{EXTENSION_DIR}/js", f"{EXTENSION_DIR}/images"]:
    if not os.path.exists(directory):
        os.makedirs(directory)

# Funciones para gestionar la configuración
def crear_configuracion_inicial():
    config = {
        "componentes": [],
        "ultima_actualizacion": time.time()
    }
    with open(CONFIG_FILE, 'w') as f:
        json.dump(config, f, indent=2)
    return config

def cargar_configuracion():
    if not os.path.exists(CONFIG_FILE):
        return crear_configuracion_inicial()
    
    try:
        with open(CONFIG_FILE, 'r') as f:
            return json.load(f)
    except:
        return crear_configuracion_inicial()

def guardar_configuracion(config):
    config["ultima_actualizacion"] = time.time()
    with open(CONFIG_FILE, 'w') as f:
        json.dump(config, f, indent=2)

def extraer_nombre_componente(ruta_archivo):
    try:
        with open(ruta_archivo, 'r', encoding='utf-8') as f:
            contenido = f.read()
            
        # Buscar definición de Web Component
        match = re.search(r'customElements\.define\([\'"]([a-zA-Z0-9-]+)[\'"]', contenido)
        if match:
            return match.group(1)
        return None
    except Exception as e:
        print(f"Error al analizar {ruta_archivo}: {e}")
        return None

def actualizar_componente(ruta_archivo, deleted=False):
    config = cargar_configuracion()
    nombre_archivo = os.path.basename(ruta_archivo)
    ruta_relativa = os.path.join(COMPONENTES_DIR, nombre_archivo)
    
    # Buscar si ya existe el componente en la configuración
    componente_existente = None
    for comp in config["componentes"]:
        if comp["archivo"] == nombre_archivo:
            componente_existente = comp
            break
    
    if deleted:
        if componente_existente:
            config["componentes"].remove(componente_existente)
            print(f"Componente eliminado: {nombre_archivo}")
    else:
        nombre_tag = extraer_nombre_componente(ruta_archivo)
        
        if componente_existente:
            # Actualizar componente existente
            componente_existente["tag"] = nombre_tag
            componente_existente["ultima_modificacion"] = time.time()
            print(f"Componente actualizado: {nombre_archivo} - Tag: {nombre_tag}")
        else:
            # Agregar nuevo componente
            nuevo_componente = {
                "archivo": nombre_archivo,
                "tag": nombre_tag,
                "ruta": ruta_relativa,
                "ultima_modificacion": time.time()
            }
            config["componentes"].append(nuevo_componente)
            print(f"Nuevo componente detectado: {nombre_archivo} - Tag: {nombre_tag}")
    
    guardar_configuracion(config)
    generar_extension_files()

class ComponentChangeHandler(FileSystemEventHandler):
    def on_modified(self, event):
        """Se dispara cuando hay cambios en los archivos de componentes"""
        if event.is_directory:
            return
        if event.src_path.endswith('.js'):
            nombre_archivo = os.path.basename(event.src_path)
            print(f"Cambio detectado en componente: {nombre_archivo}")
            generar_extension_files()
            print("Extensión actualizada - Recarga la extensión en el navegador")

    def on_created(self, event):
        """Se dispara cuando se crea un nuevo componente"""
        if event.is_directory:
            return
        if event.src_path.endswith('.js'):
            nombre_archivo = os.path.basename(event.src_path)
            print(f"Nuevo componente detectado: {nombre_archivo}")
            generar_extension_files()
            print("Extensión actualizada - Recarga la extensión en el navegador")

    def on_deleted(self, event):
        """Se dispara cuando se elimina un componente"""
        if event.is_directory:
            return
        if event.src_path.endswith('.js'):
            nombre_archivo = os.path.basename(event.src_path)
            print(f"Componente eliminado: {nombre_archivo}")
            generar_extension_files()
            print("Extensión actualizada - Recarga la extensión en el navegador")

def verificar_directorios():
    """Verifica y crea los directorios necesarios"""
    directorios = [
        COMPONENTES_DIR,
        EXTENSION_DIR,
        os.path.join(EXTENSION_DIR, "js")
    ]
    
    for directorio in directorios:
        if not os.path.exists(directorio):
            os.makedirs(directorio)
            print(f"Directorio creado: {directorio}")

def iniciar_observador():
    """Inicia el observador de cambios en la carpeta de componentes"""
    event_handler = ComponentChangeHandler()
    observer = Observer()
    observer.schedule(event_handler, COMPONENTES_DIR, recursive=False)
    observer.start()
    print(f"Observador iniciado para la carpeta: {COMPONENTES_DIR}")
    return observer

# Rutas Flask
@app.route('/')
def index():
    config = cargar_configuracion()
    
    head_scripts = ""
    body_components = ""
    
    for comp in config["componentes"]:
        archivo = comp["archivo"]
        tag = comp["tag"] if comp["tag"] else "div"
        nombre_visible = tag.replace("-", " ").title()
        
        head_scripts += f'    <script src="{COMPONENTES_DIR}/{archivo}" defer></script>\n'
        body_components += f"""    <div class="component-container">
        <h3 class="component-title">{nombre_visible}</h3>
        <{tag}></{tag}>
    </div>
"""
    
    html_content = f"""<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Kit de Componentes Web</title>
    <style>
        body {{
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f7f9fc;
        }}
        
        h1, h2 {{
            color: #333;
        }}
        
        .components-grid {{
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
            gap: 20px;
            margin-top: 20px;
        }}
        
        .component-container {{
            background-color: white;
            border-radius: 10px;
            padding: 20px;
            box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
        }}
        
        .component-title {{
            font-size: 1.2em;
            margin-top: 0;
            color: #4361ee;
            border-bottom: 1px solid #eee;
            padding-bottom: 10px;
        }}
        
        .info-box {{
            background-color: #e3f2fd;
            border-left: 4px solid #2196f3;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
        }}
    </style>
{head_scripts}
</head>
<body>
    <h1>Kit de Componentes Web</h1>
    
    <div class="info-box">
        <h2>Información del servidor</h2>
        <p>Se han detectado {len(config["componentes"])} componentes en la carpeta '{COMPONENTES_DIR}'.</p>
        <p>La extensión para Chrome está disponible en la carpeta '{EXTENSION_DIR}'.</p>
    </div>
    
    <h2>Componentes disponibles:</h2>
    <div class="components-grid">
{body_components}
    </div>
</body>
</html>"""
    
    return html_content

@app.route('/components.json')
def components_json():
    config = cargar_configuracion()
    return jsonify(config)

@app.route('/extension/<path:path>')
def send_extension_file(path):
    return send_from_directory(EXTENSION_DIR, path)

@app.route('/componentes/<path:path>')
def send_component_file(path):
    return send_from_directory(COMPONENTES_DIR, path)

@app.route('/test-extension')
def test_extension_page():
    html_content = """<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Prueba de Extensión de Componentes Web</title>
    <style>
        body {
            font-family: 'Segoe UI', sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
        }
        
        h1 {
            color: #4361ee;
            border-bottom: 2px solid #4361ee;
            padding-bottom: 10px;
        }
        
        .test-area {
            border: 2px dashed #ccc;
            padding: 30px;
            margin: 20px 0;
            min-height: 200px;
            text-align: center;
            color: #777;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .instructions {
            background-color: #f0f4f8;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 20px;
        }
        
        .instruction-step {
            margin-bottom: 10px;
        }
    </style>
</head>
<body>
    <h1>Página de Prueba para Extensión de Componentes Web</h1>
    
    <div class="instructions">
        <h2>Instrucciones:</h2>
        <div class="instruction-step">1. Haz clic en el icono de la extensión en la barra de herramientas</div>
        <div class="instruction-step">2. Selecciona un componente y haz clic en "Insertar en página"</div>
        <div class="instruction-step">3. El componente debería aparecer en el área de prueba a continuación</div>
    </div>
    
    <div class="test-area">
        <p>Los componentes web se insertarán aquí</p>
    </div>
    
    <p>Esta página está específicamente diseñada para probar la funcionalidad de inserción de componentes web de la extensión.</p>
</body>
</html>"""
    return html_content

@app.route('/update', methods=['POST'])
def update_extension():
    if generar_extension_files():
        return {"status": "success", "message": "Extensión actualizada correctamente"}
    return {"status": "error", "message": "Error al actualizar la extensión"}, 500

if __name__ == '__main__':
    try:
        verificar_directorios()
        # Generación inicial de la extensión
        generar_extension_files()
        # Iniciar el observador de cambios
        observer = iniciar_observador()
        print("Servidor iniciado en http://localhost:8000")
        app.run(host='0.0.0.0', port=8000, debug=True)
    except Exception as e:
        print(f"Error al iniciar la aplicación: {e}")