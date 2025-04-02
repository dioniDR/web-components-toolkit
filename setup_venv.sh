#!/bin/bash

# Crear entorno virtual
python -m venv venv

# Activar entorno virtual
source venv/bin/activate

# Instalar dependencias
pip install -r requirements.txt

echo "Entorno virtual creado y dependencias instaladas"
echo "Para activar el entorno, ejecuta: source venv/bin/activate"
