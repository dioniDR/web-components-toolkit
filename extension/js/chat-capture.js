/**
 * PreguntasMenu - Componente Web para navegar por tus preguntas en el chat
 * Basado en la estructura de WordCollector
 */
(function() {
    if (customElements.get('preguntas-menu')) return;

    class PreguntasMenu extends HTMLElement {
        constructor() {
            super();
            this.attachShadow({ mode: 'open' });
            this.punteros = [];
        }

        connectedCallback() {
            this.punteros = this.crearPunteros();
            this.render();
            this.setupEventListeners();
        }

        crearPunteros() {
            const preguntas = [...document.querySelectorAll('.text-base:has(.whitespace-pre-wrap)')];
            const respuestas = [...document.querySelectorAll('.markdown')];

            return preguntas.map((preguntaNodo, i) => {
                const respuestaNodo = respuestas[i] || null;
                return {
                    id: `pregunta-${i}`,
                    nodoPregunta: preguntaNodo,
                    nodoRespuesta: respuestaNodo,
                    scroll: () => preguntaNodo.scrollIntoView({ behavior: 'smooth', block: 'center' }),
                    obtenerTexto: () =>
                        preguntaNodo.querySelector('.whitespace-pre-wrap')?.innerText.trim().slice(0, 50) || `Pregunta ${i + 1}`
                };
            });
        }

        render() {
            const style = `
                <style>
                    :host {
                        position: fixed;
                        top: 70px;
                        left: 20px;
                        z-index: 9999;
                        background: white;
                        border: 1px solid #ccc;
                        padding: 10px;
                        max-height: 80vh;
                        overflow-y: auto;
                        font-family: sans-serif;
                        font-size: 13px;
                        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
                    }
                    ul {
                        list-style: none;
                        padding: 0;
                        margin: 10px 0 0 0;
                    }
                    li {
                        margin: 5px 0;
                    }
                    a {
                        color: #333;
                        text-decoration: none;
                        padding: 4px 6px;
                        display: block;
                    }
                    a:hover {
                        background-color: #f0f0f0;
                    }
                </style>
            `;

            let html = `
                ${style}
                <div>
                    <strong>📋 Preguntas:</strong>
                    <ul>
                        ${this.punteros.map(p => `
                            <li><a href="#" data-id="${p.id}">🔹 ${p.obtenerTexto()}</a></li>
                        `).join('')}
                    </ul>
                </div>
            `;

            this.shadowRoot.innerHTML = html;
        }

        setupEventListeners() {
            const links = this.shadowRoot.querySelectorAll('a[data-id]');
            links.forEach(link => {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    const id = link.getAttribute('data-id');
                    const puntero = this.punteros.find(p => p.id === id);
                    if (puntero) puntero.scroll();
                });
            });
        }
    }

    try {
        customElements.define('preguntas-menu', PreguntasMenu);
        console.log('✅ Componente preguntas-menu registrado');
        document.body.appendChild(document.createElement('preguntas-menu'));
    } catch (e) {
        console.error('Error al registrar preguntas-menu:', e);
    }
})();
