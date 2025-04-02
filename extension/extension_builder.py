from utils.file_manager import cargar_configuracion
from components.component_manager import ComponentManager

def generar_extension_files():
    """Genera los archivos de la extensión basados en la configuración actual"""
    try:
        # Cargar configuración
        config = cargar_configuracion()
        
        # Crear instancia del manejador de componentes
        component_manager = ComponentManager(config)
        
        # Limpiar componentes antiguos
        component_manager.clean_old_components()
        
        # Actualizar componentes
        component_manager.update_components()
        
        print("Archivos de extensión generados con éxito")
        return True
    except Exception as e:
        print(f"Error generando archivos de extensión: {e}")
        return False 