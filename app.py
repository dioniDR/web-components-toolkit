from flask import Flask, render_template, jsonify, send_from_directory
import json
import os
import time
import threading
import re
import shutil
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

# Configuración
PUERTO = 8000
COMPONENTES_DIR = "componentes"
EXTENSION_DIR = "extension"
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

def generar_extension_files():
    config = cargar_configuracion()
    
    # Copiar todos los archivos JS de componentes a la carpeta de la extensión
    for comp in config["componentes"]:
        ruta_origen = os.path.join(COMPONENTES_DIR, comp["archivo"])
        ruta_destino = os.path.join(EXTENSION_DIR, "js", comp["archivo"])
        
        try:
            with open(ruta_origen, 'r', encoding='utf-8') as f_origen:
                contenido = f_origen.read()
                
            with open(ruta_destino, 'w', encoding='utf-8') as f_destino:
                f_destino.write(contenido)
        except Exception as e:
            print(f"Error al copiar {comp['archivo']}: {e}")
    
    # Generar content-script.js si no existe
    content_script_path = os.path.join(EXTENSION_DIR, "js", "content-script.js")
    if not os.path.exists(content_script_path):
        with open(content_script_path, 'w', encoding='utf-8') as f:
            f.write("""// Script de contenido - se ejecuta en el contexto de la página web

// Registrar listener para mensajes del popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log("Mensaje recibido en content script:", message);
    
    if (message.action === "insertComponent") {
        console.log("Intentando insertar componente:", message.tagName);
        insertComponent(message.tagName, message.scriptSrc);
        sendResponse({ success: true });
    } else if (message.action === "checkStatus") {
        console.log("Verificación de estado recibida");
        sendResponse({ status: "ready" });
    }
    return true; // Indica que vamos a enviar una respuesta asíncrona
});

// Función para insertar un componente en la página
function insertComponent(tagName, scriptSrc) {
    try {
        // Comprobar si el script ya está cargado
        const scriptExists = Array.from(document.querySelectorAll('script')).some(
            script => script.src.includes(scriptSrc)
        );
        
        // Si el script no está cargado, lo cargamos primero
        if (!scriptExists) {
            const script = document.createElement('script');
            script.src = chrome.runtime.getURL(`js/${scriptSrc}`);
            script.onload = () => {
                console.log(`Script ${scriptSrc} cargado correctamente`);
                // Insertar el componente después de cargar el script
                insertComponentTag(tagName);
            };
            document.head.appendChild(script);
        } else {
            // Si el script ya está cargado, simplemente insertamos el componente
            insertComponentTag(tagName);
        }
    } catch (error) {
        console.error('Error al insertar componente:', error);
    }
}

// Función para insertar la etiqueta del componente
function insertComponentTag(tagName) {
    // Crear el elemento
    const component = document.createElement(tagName);
    
    // Crear un contenedor para el componente
    const container = document.createElement('div');
    container.className = 'web-component-container';
    container.style.cssText = `
        margin: 20px 0;
        padding: 10px;
        border: 2px solid #4361ee;
        border-radius: 8px;
        position: relative;
    `;
    
    // Añadir barra de herramientas
    const toolbar = document.createElement('div');
    toolbar.className = 'web-component-toolbar';
    toolbar.style.cssText = `
        background-color: #4361ee;
        color: white;
        padding: 5px 10px;
        border-radius: 4px 4px 0 0;
        margin-bottom: 10px;
        display: flex;
        justify-content: space-between;
        align-items: center;
    `;
    
    // Añadir título
    const title = document.createElement('span');
    title.textContent = tagName;
    title.style.fontWeight = 'bold';
    toolbar.appendChild(title);
    
    // Añadir botón para eliminar
    const removeBtn = document.createElement('button');
    removeBtn.textContent = 'X';
    removeBtn.style.cssText = `
        background: none;
        border: none;
        color: white;
        font-weight: bold;
        cursor: pointer;
        font-size: 14px;
    `;
    removeBtn.onclick = function() {
        container.remove();
    };
    toolbar.appendChild(removeBtn);
    
    // Ensamblar todo
    container.appendChild(toolbar);
    container.appendChild(component);
    
    // Buscar el área de prueba si existe
    const testArea = document.querySelector('.test-area');
    if (testArea) {
        testArea.innerHTML = '';
        testArea.appendChild(container);
    } else {
        // Insertar en el lugar seleccionado o al final del body
        if (window.getSelection) {
            const selection = window.getSelection();
            if (selection.rangeCount > 0) {
                const range = selection.getRangeAt(0);
                range.deleteContents();
                range.insertNode(container);
                return;
            }
        }
        
        // Si no hay selección, insertar al final
        document.body.appendChild(container);
    }
    
    // Scroll hacia el componente
    container.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

console.log("Content script de Web Components Toolkit cargado correctamente");""")
    
    # Generar background.js si no existe
    background_script_path = os.path.join(EXTENSION_DIR, "js", "background.js")
    if not os.path.exists(background_script_path):
        with open(background_script_path, 'w', encoding='utf-8') as f:
            f.write("""// Background script para la extensión

// Escuchar a la instalación o actualización de la extensión
chrome.runtime.onInstalled.addListener(() => {
  console.log('Extensión Kit de Herramientas Web instalada o actualizada');
});

// Escuchar mensajes desde el popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Mensaje recibido en background script:', message);
  
  if (message.action === 'insertComponentBackground') {
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      try {
        const tabId = tabs[0].id;
        
        // Primero inyectar el script del componente
        await chrome.scripting.executeScript({
          target: { tabId },
          files: [`js/${message.scriptSrc}`]
        });
        
        // Luego insertar el componente
        const result = await chrome.scripting.executeScript({
          target: { tabId },
          func: (tagName) => {
            // Crear el elemento
            const component = document.createElement(tagName);
            
            // Crear un contenedor con estilos
            const container = document.createElement('div');
            container.style.margin = '20px 0';
            container.style.padding = '10px';
            container.style.border = '2px solid #4361ee';
            container.style.borderRadius = '8px';
            
            // Añadir el componente al contenedor
            container.appendChild(component);
            
            // Buscar el área de prueba si existe
            const testArea = document.querySelector('.test-area');
            if (testArea) {
              testArea.innerHTML = '';
              testArea.appendChild(container);
            } else {
              // Si no hay área de prueba, añadir al body
              document.body.appendChild(container);
            }
            
            return true;
          },
          args: [message.tagName]
        });
        
        sendResponse({ success: true, result });
      } catch (error) {
        console.error('Error al insertar componente:', error);
        sendResponse({ success: false, error: error.message });
      }
    });
    
    return true; // Mantener el canal abierto para respuesta asíncrona
  }
});""")
    
    # Generar popup.js si no existe
    popup_js_path = os.path.join(EXTENSION_DIR, "js", "popup.js")
    if not os.path.exists(popup_js_path):
        with open(popup_js_path, 'w', encoding='utf-8') as f:
            f.write("""// Script del popup
document.addEventListener('DOMContentLoaded', function() {
    // Encontrar todos los botones de inserción
    const insertButtons = document.querySelectorAll('.insert-btn');
    const statusMessage = document.getElementById('status-message');
    
    // Agregar eventos a los botones de inserción
    insertButtons.forEach(button => {
        button.addEventListener('click', function() {
            const componentItem = this.closest('.component-item');
            const tagName = componentItem.dataset.tag;
            const scriptSrc = componentItem.dataset.script;
            
            statusMessage.textContent = "Procesando...";
            statusMessage.className = "status-message";
            statusMessage.style.display = "block";
            
            try {
                // Enviar mensaje al background script
                chrome.runtime.sendMessage({
                    action: "insertComponentBackground",
                    tagName: tagName,
                    scriptSrc: scriptSrc
                }, function(response) {
                    if (response && response.success) {
                        statusMessage.textContent = "Componente insertado correctamente";
                        statusMessage.className = "status-message status-success";
                    } else {
                        const errorMsg = response ? response.error : "Error desconocido";
                        statusMessage.textContent = `Error: ${errorMsg}`;
                        statusMessage.className = "status-message status-error";
                    }
                });
            } catch (error) {
                statusMessage.textContent = `Error: ${error.message || "No se pudo insertar el componente"}`;
                statusMessage.className = "status-message status-error";
                console.error("Error insertando componente:", error);
            }
        });
    });
});""")
    
    # Generar componentes para el popup.html
    componentes_html = ""
    for comp in config["componentes"]:
        if comp["tag"]:  # Solo incluir si se detectó la etiqueta
            nombre_visible = comp["tag"].replace("-", " ").title()
            descripcion = "Un componente web personalizado"
            
            componentes_html += f"""
    <div class="component-item" data-tag="{comp["tag"]}" data-script="{comp["archivo"]}">
        <div class="component-title">{nombre_visible}</div>
        <div class="component-preview">
            <p>{descripcion}</p>
        </div>
        <button class="insert-btn">Insertar en página</button>
    </div>
"""
    
    # Generar popup.html
    popup_html = f"""<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Kit de Herramientas Web</title>
    <style>
        body {{
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            width: 400px;
            min-height: 400px;
            padding: 15px;
            margin: 0;
            background-color: #f7f9fc;
        }}
        
        h1 {{
            text-align: center;
            color: #333;
            margin-bottom: 15px;
            border-bottom: 2px solid #4361ee;
            padding-bottom: 10px;
        }}
        
        .component-item {{
            background-color: white;
            border-radius: 10px;
            padding: 15px;
            margin-bottom: 15px;
            box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
        }}
        
        .component-title {{
            font-size: 1.2em;
            font-weight: 600;
            margin-bottom: 10px;
            color: #4361ee;
        }}
        
        .component-preview {{
            padding: 10px;
            background-color: #f5f7fa;
            border-radius: 5px;
            margin-bottom: 15px;
        }}
        
        .insert-btn {{
            display: block;
            width: 100%;
            background-color: #4361ee;
            color: white;
            border: none;
            border-radius: 5px;
            padding: 8px 0;
            cursor: pointer;
            font-weight: 500;
            transition: background-color 0.2s;
        }}
        
        .insert-btn:hover {{
            background-color: #3a56d4;
        }}
        
        .status-message {{
            margin-top: 15px;
            padding: 10px;
            border-radius: 5px;
            font-size: 0.9em;
            display: none;
        }}
        
        .status-success {{
            background-color: #e8f5e9;
            border-left: 4px solid #4caf50;
            color: #2e7d32;
        }}
        
        .status-error {{
            background-color: #ffebee;
            border-left: 4px solid #f44336;
            color: #c62828;
        }}
        
        footer {{
            text-align: center;
            margin-top: 20px;
            font-size: 0.8em;
            color: #888;
        }}
    </style>
    <script src="js/popup.js" defer></script>
</head>
<body>
    <h1>Kit de Herramientas Web</h1>
    
{componentes_html}
    
    <div id="status-message" class="status-message"></div>
    
    <footer>
        Web Components Toolkit - v{time.strftime("%Y.%m.%d")}
    </footer>
</body>
</html>"""
    
    with open(os.path.join(EXTENSION_DIR, "popup.html"), 'w', encoding='utf-8') as f:
        f.write(popup_html)
    
    # Generar manifest.json mejorado
    manifest_json = """{
  "manifest_version": 3,
  "name": "Kit de Herramientas Web",
  "version": "1.0",
  "description": "Colección de componentes web personalizados",
  "action": {
    "default_popup": "popup.html",
    "default_icon": {
      "16": "images/icon16.png",
      "48": "images/icon48.png",
      "128": "images/icon128.png"
    }
  },
  "permissions": ["activeTab", "scripting"],
  "host_permissions": ["<all_urls>"],
  "background": {
    "service_worker": "js/background.js"
  },
  "content_scripts": [
    {
      "matches": ["<all_urls>"],
      "js": ["js/content-script.js"],
      "run_at": "document_idle"
    }
  ],
  "web_accessible_resources": [
    {
      "resources": ["js/*.js"],
      "matches": ["<all_urls>"]
    }
  ],
  "icons": {
    "16": "images/icon16.png",
    "48": "images/icon48.png",
    "128": "images/icon128.png"
  }
}"""
    
    with open(os.path.join(EXTENSION_DIR, "manifest.json"), 'w', encoding='utf-8') as f:
        f.write(manifest_json)
        
    print("Archivos de extensión generados con éxito")

# Clase para manejar los eventos del sistema de archivos
class ComponentesHandler(FileSystemEventHandler):
    def on_created(self, event):
        if event.is_directory or not event.src_path.endswith('.js'):
            return
        print(f"Archivo creado: {event.src_path}")
        actualizar_componente(event.src_path)
        
    def on_modified(self, event):
        if event.is_directory or not event.src_path.endswith('.js'):
            return
        print(f"Archivo modificado: {event.src_path}")
        actualizar_componente(event.src_path)
        
    def on_deleted(self, event):
        if event.is_directory or not event.src_path.endswith('.js'):
            return
        print(f"Archivo eliminado: {event.src_path}")
        actualizar_componente(event.src_path, deleted=True)

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

def iniciar_observador():
    # Escanear directorio de componentes para detectar componentes existentes
    for filename in os.listdir(COMPONENTES_DIR):
        if filename.endswith('.js'):
            ruta_completa = os.path.join(COMPONENTES_DIR, filename)
            actualizar_componente(ruta_completa)
    
    # Configurar observer para vigilar el directorio
    event_handler = ComponentesHandler()
    observer = Observer()
    observer.schedule(event_handler, COMPONENTES_DIR, recursive=False)
    observer.start()
    print(f"Observador iniciado para la carpeta: {COMPONENTES_DIR}")
    return observer

if __name__ == "__main__":
    observer = iniciar_observador()
    try:
        app.run(host='0.0.0.0', port=PUERTO, debug=True, use_reloader=False)
    finally:
        observer.stop()
        observer.join()