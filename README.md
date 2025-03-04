# Web Components Toolkit

Un sistema dinámico para desarrollar componentes web, probarlos en tiempo real, y automáticamente generar una extensión de navegador que los contenga.

## Características

- 🔄 **Detección automática** de componentes web
- 🌐 **Servidor de desarrollo** para probar componentes
- 🧩 **Generación automática** de extensión de navegador
- 🔍 **Análisis de código** para identificar etiquetas de componentes
- 🐳 **Compatible con Docker** para desarrollo consistente

## Requisitos

- Python 3.8 o superior
- pip para instalar dependencias
- Docker y Docker Compose (opcional)
- Navegador Chrome/Edge/Brave para usar la extensión

## Inicio rápido

### Instalación tradicional

1. Clonar el repositorio:
   ```bash
   git clone https://github.com/tu-usuario/web-components-toolkit.git
   cd web-components-toolkit
   ```

2. Crear un entorno virtual e instalar dependencias:
   ```bash
   python -m venv venv
   source venv/bin/activate  # En Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

3. Iniciar el servidor:
   ```bash
   python app.py
   ```

4. Visitar [http://localhost:8000](http://localhost:8000) en tu navegador

### Usando Docker

1. Clonar el repositorio:
   ```bash
   git clone https://github.com/tu-usuario/web-components-toolkit.git
   cd web-components-toolkit
   ```

2. Iniciar con Docker Compose:
   ```bash
   docker-compose up -d
   ```

3. Visitar [http://localhost:8000](http://localhost:8000) en tu navegador
