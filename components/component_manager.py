import os
from config.config import COMPONENTES_DIR, EXTENSION_DIR, SYSTEM_FILES
from utils.file_manager import read_file, write_file, remove_file

class ComponentManager:
    def __init__(self, config):
        self.config = config
        self.current_components = [comp["archivo"] for comp in config["componentes"]]

    def clean_old_components(self):
        """Limpia los componentes antiguos que ya no existen en la configuración"""
        for archivo in os.listdir(os.path.join(EXTENSION_DIR, "js")):
            if archivo in SYSTEM_FILES:
                continue
            
            ruta_archivo = os.path.join(EXTENSION_DIR, "js", archivo)
            if archivo.endswith('.js') and archivo not in self.current_components:
                remove_file(ruta_archivo)

    def update_components(self):
        """Actualiza todos los componentes según la configuración actual"""
        for comp in self.config["componentes"]:
            ruta_origen = os.path.join(COMPONENTES_DIR, comp["archivo"])
            
            if not os.path.exists(ruta_origen):
                print(f"Advertencia: {comp['archivo']} no existe en componentes")
                continue
                
            ruta_destino = os.path.join(EXTENSION_DIR, "js", comp["archivo"])
            contenido = read_file(ruta_origen)
            
            if contenido:
                if write_file(ruta_destino, contenido):
                    print(f"Componente actualizado: {comp['archivo']} - Tag: {comp.get('tag', 'sin tag')}") 