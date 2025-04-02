import os

# Rutas base
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
COMPONENTES_DIR = os.path.join(BASE_DIR, "componentes")
EXTENSION_DIR = os.path.join(BASE_DIR, "extension")

# Archivos del sistema
SYSTEM_FILES = ["background.js", "content-script.js", "popup.js"] 