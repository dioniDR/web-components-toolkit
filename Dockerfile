FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Crear directorios necesarios
RUN mkdir -p componentes extension extension/js extension/images

# Copiar iconos por defecto
COPY default_icons/* extension/images/

EXPOSE 8000

CMD ["python", "app.py"]
