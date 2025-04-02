import os

def generar_extension_files():
    config = cargar_configuracion()
    
    # 1. NUEVO: Limpiar archivos JS de componentes antiguos
    archivos_componentes_actuales = [comp["archivo"] for comp in config["componentes"]]
    
    # Eliminar archivos de componentes que ya no existen
    for archivo in os.listdir(os.path.join(EXTENSION_DIR, "js")):
        if archivo in ["background.js", "content-script.js", "popup.js"]:
            continue
            
        ruta_archivo = os.path.join(EXTENSION_DIR, "js", archivo)
        if archivo.endswith('.js') and archivo not in archivos_componentes_actuales:
            try:
                os.remove(ruta_archivo)
                print(f"Archivo eliminado de la extensión: {archivo}")
            except Exception as e:
                print(f"Error al eliminar archivo {archivo}: {e}")
    
    # 2. Copiar todos los archivos JS de componentes actuales
    for comp in config["componentes"]:
        ruta_origen = os.path.join(COMPONENTES_DIR, comp["archivo"])
        
        # Verificar si el archivo existe antes de intentar copiarlo
        if not os.path.exists(ruta_origen):
            print(f"Advertencia: El archivo {comp['archivo']} no existe en el directorio de componentes. Saltando...")
            continue
            
        ruta_destino = os.path.join(EXTENSION_DIR, "js", comp["archivo"])
        
        try:
            with open(ruta_origen, 'r', encoding='utf-8') as f_origen:
                contenido = f_origen.read()
                
            with open(ruta_destino, 'w', encoding='utf-8') as f_destino:
                f_destino.write(contenido)
            print(f"Archivo copiado exitosamente: {comp['archivo']}")
        except Exception as e:
            print(f"Error al copiar {comp['archivo']}: {e}") 