/**
 * Word Collector - Componente web para recolectar palabras seleccionadas
 * Permite capturar palabras con Ctrl+Q y organizarlas en categorías
 */
(function() {
    // Verificar si ya existe el componente
    if (customElements.get('word-collector')) {
      console.log('El componente Word Collector ya está registrado');
      return;
    }
    
    console.log('Registrando componente Word Collector...');
    
    class WordCollector extends HTMLElement {
        constructor() {
            super();
            this.attachShadow({ mode: 'open' });
            
            // Estructura de datos para las palabras recolectadas
            this.collections = JSON.parse(localStorage.getItem('word-collections')) || {
                'General': []  // Colección por defecto
            };
            
            this.activeCollection = 'General';
            this.isExpanded = true;  // Estado inicial expandido
            this.isListening = true; // Escucha activada por defecto
            
            // Bind methods
            this.handleKeyDown = this.handleKeyDown.bind(this);
            this.handleSelection = this.handleSelection.bind(this);
        }
    
        connectedCallback() {
            console.log('Word Collector conectado al DOM');
            
            // Registrar listener global para la combinación de teclas
            document.addEventListener('keydown', this.handleKeyDown);
            
            // Listener para la selección de texto
            document.addEventListener('mouseup', this.handleSelection);
            
            this.render();
            this.setupEventListeners();
        }
        
        disconnectedCallback() {
            // Limpiar listeners cuando el componente es removido
            document.removeEventListener('keydown', this.handleKeyDown);
            document.removeEventListener('mouseup', this.handleSelection);
        }
    
        handleKeyDown(event) {
            // Capturar Ctrl+Q (o Cmd+Q en Mac)
            if (!this.isListening) return;
            
            if ((event.ctrlKey || event.metaKey) && event.key === 'q') {
                event.preventDefault();
                
                const selection = window.getSelection();
                const selectedText = selection.toString().trim();
                
                if (selectedText) {
                    this.addWord(selectedText);
                    // Mostrar una notificación visual
                    this.showNotification(`"${selectedText}" añadido a ${this.activeCollection}`);
                    
                    // Limpiar la selección para feedback visual
                    selection.removeAllRanges();
                }
            }
        }
        
        handleSelection(event) {
            // Mostrar un tooltip si hay texto seleccionado y el componente está escuchando
            if (!this.isListening) return;
            
            const selection = window.getSelection();
            const selectedText = selection.toString().trim();
            
            // Si el clic fue dentro del componente, no mostrar tooltip
            if (this.shadowRoot.contains(event.target)) return;
            
            if (selectedText && selectedText.length > 0) {
                // Aquí podríamos mostrar un tooltip, pero eso requeriría manipular el DOM externo
                // Por ahora, usaremos un indicador visual en el componente mismo
                const indicator = this.shadowRoot.querySelector('.selection-indicator');
                if (indicator) {
                    indicator.textContent = `"${selectedText.substring(0, 20)}${selectedText.length > 20 ? '...' : ''}" - Pulse Ctrl+Q para añadir`;
                    indicator.style.display = 'block';
                    
                    // Ocultar después de 3 segundos
                    clearTimeout(this.indicatorTimeout);
                    this.indicatorTimeout = setTimeout(() => {
                        indicator.style.display = 'none';
                    }, 3000);
                }
            }
        }
        
        addWord(word) {
            // Evitar duplicados en la misma colección
            if (!this.collections[this.activeCollection].includes(word)) {
                this.collections[this.activeCollection].push(word);
                this.saveToLocalStorage();
                this.render();
                this.setupEventListeners();
            }
        }
        
        showNotification(message) {
            const notification = this.shadowRoot.querySelector('.notification');
            if (notification) {
                notification.textContent = message;
                notification.style.display = 'block';
                
                // Ocultar después de 2 segundos
                clearTimeout(this.notificationTimeout);
                this.notificationTimeout = setTimeout(() => {
                    notification.style.display = 'none';
                }, 2000);
            }
        }
    
        render() {
            const style = `
                <style>
                    :host {
                        display: block;
                        font-family: 'Segoe UI', Arial, sans-serif;
                        contain: content;
                    }
                    
                    .collector-container {
                        background-color: #f8f9fa;
                        border-radius: 8px;
                        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
                        overflow: hidden;
                        transition: all 0.3s ease;
                        max-width: 350px;
                        border: 1px solid #e1e4e8;
                    }
                    
                    .header {
                        background-color: #4361ee;
                        color: white;
                        padding: 10px 15px;
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        cursor: move;
                    }
                    
                    .title {
                        font-weight: 600;
                        font-size: 16px;
                        margin: 0;
                        user-select: none;
                    }
                    
                    .controls {
                        display: flex;
                        gap: 8px;
                    }
                    
                    button {
                        background: none;
                        border: none;
                        color: inherit;
                        cursor: pointer;
                        font-size: 14px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        padding: 4px;
                        border-radius: 4px;
                        transition: background-color 0.2s;
                    }
                    
                    button:hover {
                        background-color: rgba(255, 255, 255, 0.2);
                    }
                    
                    .btn-icon {
                        width: 16px;
                        height: 16px;
                        display: inline-flex;
                        align-items: center;
                        justify-content: center;
                    }
                    
                    .content {
                        padding: 15px;
                        display: flex;
                        flex-direction: column;
                        gap: 10px;
                        max-height: 300px;
                        overflow-y: auto;
                    }
                    
                    .collapsed .content {
                        display: none;
                    }
                    
                    .collections-dropdown {
                        padding: 8px;
                        border-radius: 4px;
                        border: 1px solid #ddd;
                        font-size: 14px;
                        background-color: white;
                        width: 100%;
                    }
                    
                    .actions {
                        display: flex;
                        justify-content: space-between;
                        margin-bottom: 10px;
                    }
                    
                    .new-collection {
                        display: flex;
                        gap: 5px;
                        margin-top: 5px;
                    }
                    
                    .new-collection input {
                        flex-grow: 1;
                        padding: 6px 8px;
                        border: 1px solid #ddd;
                        border-radius: 4px;
                        font-size: 14px;
                    }
                    
                    .btn-small {
                        padding: 6px 10px;
                        background-color: #4361ee;
                        color: white;
                        border: none;
                        border-radius: 4px;
                        font-size: 12px;
                        cursor: pointer;
                        transition: background-color 0.2s;
                    }
                    
                    .btn-small:hover {
                        background-color: #3a56d4;
                    }
                    
                    .words-container {
                        background-color: white;
                        border: 1px solid #e1e4e8;
                        border-radius: 4px;
                        padding: 10px;
                        max-height: 200px;
                        overflow-y: auto;
                    }
                    
                    .word-item {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        padding: 5px 0;
                        border-bottom: 1px solid #f0f0f0;
                    }
                    
                    .word-item:last-child {
                        border-bottom: none;
                    }
                    
                    .word-text {
                        flex-grow: 1;
                        font-size: 14px;
                    }
                    
                    .word-actions {
                        display: flex;
                        gap: 5px;
                    }
                    
                    .btn-icon-small {
                        font-size: 12px;
                        color: #666;
                        background: none;
                        border: none;
                        cursor: pointer;
                        padding: 2px 5px;
                        border-radius: 3px;
                    }
                    
                    .btn-icon-small:hover {
                        background-color: #f0f0f0;
                        color: #333;
                    }
                    
                    .status-bar {
                        background-color: #f0f0f0;
                        padding: 8px 15px;
                        font-size: 12px;
                        color: #666;
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                    }
                    
                    .listening-indicator {
                        display: flex;
                        align-items: center;
                        gap: 5px;
                    }
                    
                    .indicator-dot {
                        width: 8px;
                        height: 8px;
                        border-radius: 50%;
                        background-color: #4caf50;
                    }
                    
                    .not-listening .indicator-dot {
                        background-color: #f44336;
                    }
                    
                    .export-options {
                        margin-top: 10px;
                        display: flex;
                        gap: 5px;
                    }
                    
                    .notification {
                        position: absolute;
                        top: 10px;
                        right: 10px;
                        background-color: rgba(67, 97, 238, 0.9);
                        color: white;
                        padding: 8px 12px;
                        border-radius: 4px;
                        font-size: 12px;
                        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
                        z-index: 1000;
                        display: none;
                    }
                    
                    .selection-indicator {
                        background-color: #f8f9fa;
                        border: 1px solid #ddd;
                        padding: 8px 12px;
                        margin-top: 10px;
                        border-radius: 4px;
                        font-size: 12px;
                        color: #666;
                        display: none;
                    }
                    
                    /* Estilos para modo oscuro */
                    @media (prefers-color-scheme: dark) {
                        .collector-container {
                            background-color: #2d2d2d;
                            border-color: #444;
                        }
                        
                        .words-container {
                            background-color: #333;
                            border-color: #444;
                        }
                        
                        .word-item {
                            border-color: #444;
                        }
                        
                        .word-text, .collections-dropdown {
                            color: #eee;
                        }
                        
                        .status-bar {
                            background-color: #222;
                            color: #aaa;
                        }
                        
                        .selection-indicator {
                            background-color: #333;
                            border-color: #444;
                            color: #bbb;
                        }
                        
                        .collections-dropdown, input {
                            background-color: #333;
                            color: #eee;
                            border-color: #555;
                        }
                    }
                </style>
            `;
            
            // Preparar la lista de colecciones
            let collectionsOptions = '';
            Object.keys(this.collections).forEach(collection => {
                collectionsOptions += `<option value="${collection}" ${collection === this.activeCollection ? 'selected' : ''}>${collection}</option>`;
            });
            
            // Preparar la lista de palabras
            let wordsHTML = '';
            if (this.collections[this.activeCollection].length === 0) {
                wordsHTML = '<div class="empty-state">No hay palabras recolectadas en esta categoría</div>';
            } else {
                this.collections[this.activeCollection].forEach((word, index) => {
                    wordsHTML += `
                        <div class="word-item">
                            <span class="word-text">${word}</span>
                            <div class="word-actions">
                                <button class="btn-icon-small copy-btn" data-word="${word}">Copiar</button>
                                <button class="btn-icon-small delete-btn" data-index="${index}">✕</button>
                            </div>
                        </div>
                    `;
                });
            }
            
            // Contador de palabras
            const totalWords = Object.values(this.collections).reduce((count, words) => count + words.length, 0);
            const currentWords = this.collections[this.activeCollection].length;
            
            this.shadowRoot.innerHTML = `
                ${style}
                <div class="collector-container ${this.isExpanded ? '' : 'collapsed'}">
                    <div class="header">
                        <h3 class="title">Recolector de Palabras</h3>
                        <div class="controls">
                            <button class="listen-toggle" title="${this.isListening ? 'Pausar captura' : 'Reanudar captura'}">
                                <span class="btn-icon">${this.isListening ? '⏸' : '▶️'}</span>
                            </button>
                            <button class="toggle-btn" title="${this.isExpanded ? 'Contraer' : 'Expandir'}">
                                <span class="btn-icon">${this.isExpanded ? '▲' : '▼'}</span>
                            </button>
                        </div>
                    </div>
                    
                    <div class="content">
                        <div class="actions">
                            <select class="collections-dropdown">
                                ${collectionsOptions}
                            </select>
                            <button class="btn-small btn-add-collection">+ Categoría</button>
                        </div>
                        
                        <div class="new-collection" style="display: none;">
                            <input type="text" placeholder="Nombre de la categoría" class="new-collection-input">
                            <button class="btn-small btn-create-collection">Crear</button>
                            <button class="btn-small btn-cancel-collection">Cancelar</button>
                        </div>
                        
                        <div class="words-container">
                            ${wordsHTML}
                        </div>
                        
                        <div class="selection-indicator"></div>
                        
                        <div class="export-options">
                            <button class="btn-small export-txt">Exportar TXT</button>
                            <button class="btn-small export-csv">Exportar CSV</button>
                            <button class="btn-small clear-category">Limpiar Categoría</button>
                        </div>
                    </div>
                    
                    <div class="status-bar ${!this.isListening ? 'not-listening' : ''}">
                        <div class="listening-indicator">
                            <span class="indicator-dot"></span>
                            <span>${this.isListening ? 'Capturando (Ctrl+Q)' : 'Captura pausada'}</span>
                        </div>
                        <div class="word-counter">${currentWords} palabras (${totalWords} total)</div>
                    </div>
                </div>
                
                <div class="notification"></div>
            `;
        }
    
        setupEventListeners() {
            // Manejo de clic en botón de expandir/contraer
            const toggleBtn = this.shadowRoot.querySelector('.toggle-btn');
            if (toggleBtn) {
                toggleBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.isExpanded = !this.isExpanded;
                    this.render();
                    this.setupEventListeners();
                });
            }
            
            // Manejo de cambio de colección
            const collectionDropdown = this.shadowRoot.querySelector('.collections-dropdown');
            if (collectionDropdown) {
                collectionDropdown.addEventListener('change', (e) => {
                    e.stopPropagation();
                    this.activeCollection = e.target.value;
                    this.render();
                    this.setupEventListeners();
                });
            }
            
            // Botón para añadir nueva colección
            const addCollectionBtn = this.shadowRoot.querySelector('.btn-add-collection');
            if (addCollectionBtn) {
                addCollectionBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const newCollectionForm = this.shadowRoot.querySelector('.new-collection');
                    newCollectionForm.style.display = 'flex';
                    
                    // Enfocar el input
                    const input = this.shadowRoot.querySelector('.new-collection-input');
                    if (input) setTimeout(() => input.focus(), 0);
                });
            }
            
            // Botones para crear y cancelar nueva colección
            const createCollectionBtn = this.shadowRoot.querySelector('.btn-create-collection');
            if (createCollectionBtn) {
                createCollectionBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const input = this.shadowRoot.querySelector('.new-collection-input');
                    const newCollectionName = input?.value?.trim();
                    
                    if (newCollectionName && !this.collections[newCollectionName]) {
                        this.collections[newCollectionName] = [];
                        this.activeCollection = newCollectionName;
                        this.saveToLocalStorage();
                        this.showNotification(`Categoría "${newCollectionName}" creada`);
                    }
                    
                    this.render();
                    this.setupEventListeners();
                });
            }
            
            const cancelCollectionBtn = this.shadowRoot.querySelector('.btn-cancel-collection');
            if (cancelCollectionBtn) {
                cancelCollectionBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.shadowRoot.querySelector('.new-collection').style.display = 'none';
                });
            }
            
            // Botones de eliminar palabra
            const deleteButtons = this.shadowRoot.querySelectorAll('.delete-btn');
            deleteButtons.forEach(button => {
                button.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const index = parseInt(e.target.dataset.index);
                    if (!isNaN(index)) {
                        const wordRemoved = this.collections[this.activeCollection][index];
                        this.collections[this.activeCollection].splice(index, 1);
                        this.saveToLocalStorage();
                        this.showNotification(`"${wordRemoved}" eliminado`);
                        this.render();
                        this.setupEventListeners();
                    }
                });
            });
            
            // Botones de copiar palabra
            const copyButtons = this.shadowRoot.querySelectorAll('.copy-btn');
            copyButtons.forEach(button => {
                button.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const word = e.target.dataset.word;
                    if (word) {
                        navigator.clipboard.writeText(word)
                            .then(() => {
                                this.showNotification(`"${word}" copiado al portapapeles`);
                            })
                            .catch(err => {
                                console.error('Error al copiar: ', err);
                                this.showNotification('Error al copiar. Permiso denegado.');
                            });
                    }
                });
            });
            
            // Botón para exportar como texto
            const exportTxtBtn = this.shadowRoot.querySelector('.export-txt');
            if (exportTxtBtn) {
                exportTxtBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.exportAsFile('txt');
                });
            }
            
            // Botón para exportar como CSV
            const exportCsvBtn = this.shadowRoot.querySelector('.export-csv');
            if (exportCsvBtn) {
                exportCsvBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.exportAsFile('csv');
                });
            }
            
            // Botón para limpiar categoría
            const clearCategoryBtn = this.shadowRoot.querySelector('.clear-category');
            if (clearCategoryBtn) {
                clearCategoryBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    if (confirm(`¿Estás seguro de que deseas eliminar todas las palabras de "${this.activeCollection}"?`)) {
                        this.collections[this.activeCollection] = [];
                        this.saveToLocalStorage();
                        this.showNotification(`Categoría "${this.activeCollection}" limpiada`);
                        this.render();
                        this.setupEventListeners();
                    }
                });
            }
            
            // Botón para alternar captura
            const listenToggleBtn = this.shadowRoot.querySelector('.listen-toggle');
            if (listenToggleBtn) {
                listenToggleBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.isListening = !this.isListening;
                    this.showNotification(this.isListening ? 'Captura activada' : 'Captura pausada');
                    this.render();
                    this.setupEventListeners();
                });
            }
            
            // Hacer el componente arrastrable
            const header = this.shadowRoot.querySelector('.header');
            const container = this.shadowRoot.querySelector('.collector-container');
            
            if (header && container) {
                this.makeElementDraggable(container, header);
            }
            
            // Evitar propagación en contenedor principal
            const content = this.shadowRoot.querySelector('.content');
            if (content) {
                content.addEventListener('click', (e) => e.stopPropagation());
                content.addEventListener('keydown', (e) => e.stopPropagation());
            }
        }
        
        exportAsFile(format) {
            const words = this.collections[this.activeCollection];
            if (words.length === 0) {
                this.showNotification('No hay palabras para exportar');
                return;
            }
            
            let content = '';
            let filename = `palabras_${this.activeCollection.toLowerCase().replace(/\s+/g, '_')}_${new Date().toISOString().slice(0,10)}`;
            
            if (format === 'txt') {
                content = words.join('\n');
                filename += '.txt';
                this.downloadFile(content, filename, 'text/plain');
            } 
            else if (format === 'csv') {
                content = 'Palabra\n' + words.map(word => `"${word.replace(/"/g, '""')}"`).join('\n');
                filename += '.csv';
                this.downloadFile(content, filename, 'text/csv');
            }
            
            this.showNotification(`Archivo exportado como ${format.toUpperCase()}`);
        }
        
        downloadFile(content, filename, contentType) {
            const a = document.createElement('a');
            const file = new Blob([content], {type: contentType});
            a.href = URL.createObjectURL(file);
            a.download = filename;
            a.click();
            URL.revokeObjectURL(a.href);
        }
        
        makeElementDraggable(element, handle) {
            let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
            
            handle.style.cursor = 'move';
            handle.addEventListener('mousedown', dragMouseDown);
            
            function dragMouseDown(e) {
                e.preventDefault();
                e.stopPropagation();
                
                // Obtener posición inicial del mouse
                pos3 = e.clientX;
                pos4 = e.clientY;
                
                // Activar eventos para mover y soltar
                document.addEventListener('mousemove', elementDrag);
                document.addEventListener('mouseup', closeDragElement);
            }
            
            function elementDrag(e) {
                e.preventDefault();
                e.stopPropagation();
                
                // Calcular nueva posición
                pos1 = pos3 - e.clientX;
                pos2 = pos4 - e.clientY;
                pos3 = e.clientX;
                pos4 = e.clientY;
                
                // Establecer nueva posición del elemento
                element.style.position = 'absolute';
                element.style.top = (element.offsetTop - pos2) + "px";
                element.style.left = (element.offsetLeft - pos1) + "px";
                element.style.zIndex = "10000";
            }
            
            function closeDragElement() {
                // Detener eventos de movimiento
                document.removeEventListener('mousemove', elementDrag);
                document.removeEventListener('mouseup', closeDragElement);
            }
        }
    
        saveToLocalStorage() {
            localStorage.setItem('word-collections', JSON.stringify(this.collections));
        }
    }
    
    // Registrar el componente personalizado
    try {
        customElements.define('word-collector', WordCollector);
        console.log('Componente Word Collector registrado correctamente');
    } catch (error) {
        console.error('Error al registrar componente Word Collector:', error);
    }
    
})();