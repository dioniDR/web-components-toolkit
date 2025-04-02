/**
 * Componente Simple - Carga dinámica de HTML y CSS
 */
(function() {
    // Evitar registrar el componente más de una vez
    if (customElements.get('preguntas-menu')) return;

    class PreguntasMenu extends HTMLElement {
        constructor() {
            super();
            this.attachShadow({ mode: 'open' });
        }

        connectedCallback() {
            // Cargar HTML y CSS dinámicamente
            this.cargarRecursos();
        }

        async cargarRecursos() {
            try {
                // 1. Cargar CSS
                await this.cargarCSS('preguntas-menu.css');
                
                // 2. Cargar HTML
                await this.cargarHTML('preguntas-menu.html');
                
                console.log('✅ Recursos cargados correctamente');
            } catch (error) {
                console.error('Error al cargar recursos:', error);
            }
        }

        async cargarCSS(url) {
            // Intentar cargar el CSS desde una URL
            try {
                const response = await fetch(url);
                
                if (!response.ok) {
                    throw new Error(`Error al cargar CSS: ${response.status}`);
                }
                
                const cssTexto = await response.text();
                
                // Crear elemento style e insertar el CSS
                const style = document.createElement('style');
                style.textContent = cssTexto;
                this.shadowRoot.appendChild(style);
                
                console.log('✅ CSS cargado correctamente');
            } catch (error) {
                console.error('Error al cargar CSS:', error);
                // Cargar CSS de respaldo
                const style = document.createElement('style');
                style.textContent = 'div { padding: 10px; border: 1px solid #ccc; }';
                this.shadowRoot.appendChild(style);
            }
        }

        async cargarHTML(url) {
            // Intentar cargar el HTML desde una URL
            try {
                const response = await fetch(url);
                
                if (!response.ok) {
                    throw new Error(`Error al cargar HTML: ${response.status}`);
                }
                
                const htmlTexto = await response.text();
                
                // Crear un template e insertar el HTML
                const template = document.createElement('template');
                template.innerHTML = htmlTexto;
                this.shadowRoot.appendChild(template.content.cloneNode(true));
                
                console.log('✅ HTML cargado correctamente');
            } catch (error) {
                console.error('Error al cargar HTML:', error);
                // Crear HTML de respaldo
                const div = document.createElement('div');
                div.textContent = 'Error al cargar el componente';
                this.shadowRoot.appendChild(div);
            }
        }
    }

    // Registrar el componente
    customElements.define('preguntas-menu', PreguntasMenu);
    console.log('✅ Componente registrado correctamente');

    // Crear una función global para insertar el componente
    window.insertarPreguntasMenu = function() {
        document.body.appendChild(document.createElement('preguntas-menu'));
        return '✅ Componente insertado correctamente';
    };

    // Insertar automáticamente la primera instancia
    window.insertarPreguntasMenu();
})();