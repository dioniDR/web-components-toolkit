// Script de contenido - se ejecuta en el contexto de la página web

// Al inicio del archivo
console.log("Content script de Web Components Toolkit inicializando...");

// Variable global para controlar el offset de posicionamiento de nuevos componentes
let componentCounter = 0;

// Registrar listener para mensajes del popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log("Mensaje recibido en content script:", message);
    
    if (message.action === "insertComponent") {
        console.log("Intentando insertar componente:", message.tagName);
        insertComponent(message.tagName, message.scriptSrc)
            .then(() => sendResponse({ success: true }))
            .catch(error => {
                console.error('Error al insertar componente:', error);
                sendResponse({ success: false, error: error.message });
            });
    } else if (message.action === "checkStatus") {
        console.log("Verificación de estado recibida");
        sendResponse({ status: "ready" });
    }
    return true; // Indica que vamos a enviar una respuesta asíncrona
});

// Función para insertar un componente en la página
async function insertComponent(tagName, scriptSrc) {
    try {
        // Comprobar si el script ya está cargado
        const scriptExists = Array.from(document.querySelectorAll('script')).some(
            script => script.src.includes(scriptSrc)
        );
        
        // Si el script no está cargado, lo cargamos primero
        if (!scriptExists) {
            const script = document.createElement('script');
            const scriptUrl = chrome.runtime.getURL(`js/${scriptSrc}`);
            console.log('URL generada para el script:', scriptUrl);
            script.src = scriptUrl;
            
            // Crear una promesa para manejar la carga del script
            await new Promise((resolve, reject) => {
                script.onload = () => {
                    console.log(`Script ${scriptSrc} cargado correctamente`);
                    resolve();
                };
                script.onerror = () => {
                    reject(new Error(`Error al cargar el script: ${scriptSrc}`));
                };
                document.head.appendChild(script);
            });
        }
        
        // Ahora insertamos el componente
        insertComponentTag(tagName);
        return true;
    } catch (error) {
        console.error('Error al insertar componente:', error);
        throw error;
    }
}

// Función para insertar la etiqueta del componente
function insertComponentTag(tagName) {
    console.log(`Insertando etiqueta del componente: ${tagName}`);
    
    // Incrementar el contador global para offset de posicionamiento
    componentCounter++;
    
    // Crear el elemento
    const component = document.createElement(tagName);
    
    // Crear un contenedor para el componente
    const container = document.createElement('div');
    container.className = 'web-component-container';
    
    // Calcular posición inicial con desplazamiento para evitar superposición
    const verticalOffset = 100 + (componentCounter % 5) * 40;
    const horizontalOffset = (componentCounter % 3) * 50;
    
    container.style.cssText = `
        padding: 10px;
        border: 2px solid #4361ee;
        border-radius: 8px;
        position: absolute;
        top: ${verticalOffset}px;
        left: ${horizontalOffset + 100}px;
        width: 350px;
        z-index: 10000;
        background-color: white;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        user-select: none;
    `;
    
    // Añadir barra de herramientas
    const toolbar = document.createElement('div');
    toolbar.className = 'web-component-toolbar';
    toolbar.style.cssText = `
        background-color: #4361ee;
        color: white;
        padding: 5px 10px;
        border-radius: 4px 4px 0 0;
        margin-bottom: 10px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        cursor: move; /* Indicar que es arrastrable */
    `;
    
    // Añadir título
    const title = document.createElement('span');
    title.textContent = tagName;
    title.style.fontWeight = 'bold';
    toolbar.appendChild(title);
    
    // Añadir botón para eliminar
    const removeBtn = document.createElement('button');
    removeBtn.textContent = 'X';
    removeBtn.style.cssText = `
        background: none;
        border: none;
        color: white;
        font-weight: bold;
        cursor: pointer;
        font-size: 14px;
    `;
    removeBtn.onclick = function(e) {
        e.stopPropagation(); // Evitar que el evento llegue al toolbar
        console.log(`Eliminando componente: ${tagName}`);
        container.remove();
    };
    toolbar.appendChild(removeBtn);
    
    // Ensamblar todo
    container.appendChild(toolbar);
    container.appendChild(component);
    
    // Insertar al final del body
    document.body.appendChild(container);
    
    // Aplicar funcionalidad de arrastre simplificada
    makeSimpleDraggable(container, toolbar);
    
    console.log(`Componente ${tagName} insertado correctamente`);
    return container;
}

// Función simplificada para hacer un elemento arrastrable
function makeSimpleDraggable(element, handle) {
    // Variables para el arrastre
    let isDragging = false;
    let offsetX, offsetY;
    
    // El elemento que usaremos como "manija" para arrastrar
    const dragHandle = handle || element;
    
    // Evento de inicio de arrastre
    dragHandle.addEventListener('mousedown', function(e) {
        // Solo procesar clics del botón principal (usualmente izquierdo)
        if (e.button !== 0) return;
        
        e.preventDefault();
        isDragging = true;
        
        // Calcular el offset del mouse dentro del elemento
        const rect = element.getBoundingClientRect();
        offsetX = e.clientX - rect.left;
        offsetY = e.clientY - rect.top;
        
        // Aplicar estilo durante el arrastre
        element.style.opacity = '0.8';
        element.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.3)';
    });
    
    // Evento de movimiento (a nivel de documento para mayor robustez)
    document.addEventListener('mousemove', function(e) {
        if (!isDragging) return;
        
        // Calcular la nueva posición
        const left = e.clientX - offsetX;
        const top = e.clientY - offsetY;
        
        // Aplicar la nueva posición sin restricciones
        element.style.left = `${left}px`;
        element.style.top = `${top}px`;
    });
    
    // Evento para terminar el arrastre
    document.addEventListener('mouseup', function() {
        if (!isDragging) return;
        
        isDragging = false;
        
        // Restaurar estilo original
        element.style.opacity = '1';
        element.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.2)';
        
        // Comprobar la posición final para evitar que salga completamente de la vista
        const rect = element.getBoundingClientRect();
        
        // Si está fuera por arriba, reposicionar
        if (rect.top < 0) {
            element.style.top = '0px';
        }
        
        // Si está muy afuera por la izquierda, reposicionar
        if (rect.right < 50) {
            element.style.left = `${-rect.width + 50}px`;
        }
        
        // Si está muy afuera por la derecha, reposicionar
        if (rect.left > window.innerWidth - 50) {
            element.style.left = `${window.innerWidth - 50}px`;
        }
    });
    
    // Prevenir el arrastre predeterminado del navegador
    dragHandle.addEventListener('dragstart', function(e) {
        e.preventDefault();
    });
}

console.log("Content script de Web Components Toolkit cargado correctamente");