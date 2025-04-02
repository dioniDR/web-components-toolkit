import os
import json
from config.config import COMPONENTES_DIR

def read_file(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            return f.read()
    except Exception as e:
        print(f"Error leyendo archivo {filepath}: {e}")
        return None

def write_file(filepath, content):
    try:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        return True
    except Exception as e:
        print(f"Error escribiendo archivo {filepath}: {e}")
        return False

def remove_file(filepath):
    try:
        os.remove(filepath)
        print(f"Archivo eliminado: {filepath}")
        return True
    except Exception as e:
        print(f"Error eliminando archivo {filepath}: {e}")
        return False

def cargar_configuracion():
    config_path = os.path.join(COMPONENTES_DIR, "config.json")
    try:
        if not os.path.exists(config_path):
            print(f"Creando archivo de configuración por defecto en {config_path}")
            config_default = {
                "componentes": [
                    {"archivo": "openia-chat.js", "tag": "openai-chat"},
                    {"archivo": "chat-capture.js", "tag": "chat-capture"},
                    {"archivo": "contador.js", "tag": "contador-app"},
                    {"archivo": "word-collector.js", "tag": "word-collector"},
                    {"archivo": "todo-list.js", "tag": "todo-list"},
                    {"archivo": "cargador-dinamico.js", "tag": "preguntas-menu"}
                ]
            }
            with open(config_path, 'w', encoding='utf-8') as f:
                json.dump(config_default, f, indent=4)
            return config_default
            
        with open(config_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception as e:
        print(f"Error cargando configuración: {e}")
        return {"componentes": []} 