# Web Components Toolkit

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Python 3.8+](https://img.shields.io/badge/Python-3.8+-green.svg)](https://www.python.org/downloads/)

Un sistema dinámico para desarrollar componentes web, probarlos en tiempo real, y automáticamente generar una extensión de navegador que los contenga.

## 📋 Descripción

Web Components Toolkit es una solución completa para el desarrollo, prueba y distribución de componentes web. El sistema detecta automáticamente tus componentes web JavaScript, proporciona un entorno para probarlos, y genera una extensión de navegador lista para usar que permite insertar estos componentes en cualquier página web.

## ✨ Características

- 🔄 **Detección automática** de componentes web en la carpeta `componentes/`
- 🌐 **Servidor de desarrollo** con visualización en tiempo real
- 🧩 **Generación automática** de extensión de navegador
- 🔍 **Análisis de código** para identificar etiquetas de componentes
- 🐳 **Compatible con Docker** para desarrollo consistente
- 🔌 **Extensión plug-and-play** para Chrome, Edge, Brave y otros navegadores basados en Chromium

## 🎮 Componentes incluidos

El toolkit viene con algunos componentes de ejemplo:

- **Contador** (`contador-app`): Un simple contador interactivo con botones para incrementar, decrementar y reiniciar.
- **Lista de Tareas** (`todo-list`): Un gestor de tareas con almacenamiento local.
- **Recolector de Palabras** (`word-collector`): Una herramienta para recolectar palabras seleccionadas en cualquier página web (usando Ctrl+Q).

## 🛠️ Requisitos previos

- Python 3.8 o superior
- pip para instalar dependencias
- Docker y Docker Compose (opcional, para desarrollo con contenedores)
- Navegador Chrome/Edge/Brave para usar la extensión

## 🚀 Inicio rápido

### Instalación tradicional

1. **Clonar el repositorio**:
   ```bash
   git clone https://github.com/tu-usuario/web-components-toolkit.git
   cd web-components-toolkit
   ```

2. **Crear un entorno virtual e instalar dependencias**:
   ```bash
   # En Linux/macOS
   python -m venv venv
   source venv/bin/activate  # O use: . venv/bin/activate
   pip install -r requirements.txt

   # En Windows
   python -m venv venv
   venv\Scripts\activate
   pip install -r requirements.txt
   ```

   También puede usar el script de configuración en sistemas Unix:
   ```bash
   chmod +x setup_venv.sh
   ./setup_venv.sh
   ```

3. **Iniciar el servidor**:
   ```bash
   python app.py
   ```

4. **Acceder al servidor de desarrollo**:
   - Abrir [http://localhost:8000](http://localhost:8000) en su navegador

### Usando Docker

1. **Clonar el repositorio**:
   ```bash
   git clone https://github.com/tu-usuario/web-components-toolkit.git
   cd web-components-toolkit
   ```

2. **Iniciar con Docker Compose**:
   ```bash
   docker-compose up -d
   ```

3. **Acceder al servidor de desarrollo**:
   - Abrir [http://localhost:8000](http://localhost:8000) en su navegador

## 🔌 Instalación de la extensión

1. Una vez iniciado el servidor, la extensión se generará en la carpeta `extension/`.

2. Para instalar la extensión en Chrome/Edge/Brave:
   - Navegar a `chrome://extensions/` (o equivalente en su navegador)
   - Activar "Modo de desarrollador" (switch en la esquina superior derecha)
   - Hacer clic en "Cargar descomprimida" y seleccionar la carpeta `extension/` de este proyecto

3. La extensión aparecerá en la barra de herramientas de su navegador. Al hacer clic en ella, verá los componentes disponibles para insertar en cualquier página web.

## 🖥️ Uso del servidor de desarrollo

- El servidor detecta automáticamente los archivos JavaScript en la carpeta `componentes/` y muestra una vista previa.
- Puede acceder a la página de prueba de la extensión en [http://localhost:8000/test-extension](http://localhost:8000/test-extension).
- Los cambios en los componentes se detectan automáticamente y actualizan la extensión.

## 🧩 Desarrollo de nuevos componentes

Para crear un nuevo componente web:

1. Cree un nuevo archivo JavaScript en la carpeta `componentes/`.
2. Defina su componente usando la API estándar de Web Components.
3. Registre su componente con `customElements.define('mi-componente', MiClase)`.
4. ¡El servidor detectará automáticamente su nuevo componente!

Ejemplo básico de componente:

```javascript
(function() {
    class MiComponente extends HTMLElement {
        constructor() {
            super();
            this.attachShadow({ mode: 'open' });
        }
        
        connectedCallback() {
            this.shadowRoot.innerHTML = `
                <style>
                    :host { display: block; padding: 20px; }
                </style>
                <div>¡Hola mundo desde mi componente!</div>
            `;
        }
    }
    
    customElements.define('mi-componente', MiComponente);
})();
```

## 📁 Estructura del proyecto

```
web-components-toolkit/
├── app.py                  # Servidor principal Flask
├── componentes/            # Carpeta para componentes web
│   ├── contador.js         # Componente de contador
│   ├── todo-list.js        # Componente lista de tareas
│   └── word-collector.js   # Componente recolector de palabras
├── extension/              # Carpeta para la extensión generada
│   ├── images/             # Iconos de la extensión
│   ├── js/                 # Scripts de la extensión
│   ├── manifest.json       # Configuración de la extensión
│   └── popup.html          # Interfaz de la extensión
├── default_icons/          # Iconos por defecto
├── requirements.txt        # Dependencias Python
├── setup_venv.sh           # Script de configuración
└── docker-compose.yml      # Configuración de Docker
```

## ❓ Solución de problemas

- **No se detectan mis componentes**:
  - Asegúrese de que el componente esté en la carpeta `componentes/` y tenga extensión `.js`.
  - Verifique que use `customElements.define('nombre-etiqueta', ClaseComponente)` en su código.

- **La extensión no aparece en el navegador**:
  - Compruebe que ha activado el Modo de desarrollador en la página de extensiones.
  - Asegúrese de que la carpeta `extension/` contiene un archivo `manifest.json` válido.

- **Los componentes no se insertan en algunas páginas**:
  - Algunas páginas tienen restricciones de Política de Seguridad de Contenido (CSP) que pueden bloquear la inserción de scripts personalizados.

## 🤝 Contribuir

Las contribuciones son bienvenidas. Para cambios importantes:

1. Primero abra un issue para discutir lo que le gustaría cambiar.
2. Haga un fork del repositorio.
3. Cree una rama para su función.
4. Envíe un pull request.

## 📜 Licencia

Este proyecto está licenciado bajo la Licencia MIT - vea el archivo LICENSE para más detalles.

## 📧 Contacto

Si tiene preguntas o comentarios, no dude en abrir un issue en este repositorio.
