// Script de contenido - se ejecuta en el contexto de la página web

// Al inicio del archivo
console.log("Content script de Web Components Toolkit inicializando...");

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
            script.onload = () => {
                console.log(`Script ${scriptSrc} cargado correctamente`);
                // Insertar el componente después de cargar el script
                insertComponentTag(tagName);
            };
            script.onerror = () => {
                throw new Error(`Error al cargar el script: ${scriptSrc}`);
            };
            document.head.appendChild(script);
        } else {
            // Si el script ya está cargado, simplemente insertamos el componente
            insertComponentTag(tagName);
        }
    } catch (error) {
        console.error('Error al insertar componente:', error);
        throw error;
    }
}

// Función para insertar la etiqueta del componente
function insertComponentTag(tagName) {
    console.log(`Insertando etiqueta del componente: ${tagName}`);
    
    // Crear el elemento
    const component = document.createElement(tagName);
    
    // Crear un contenedor para el componente
    const container = document.createElement('div');
    container.className = 'web-component-container';
    container.style.cssText = `
        margin: 20px auto;
        padding: 10px;
        border: 2px solid #4361ee;
        border-radius: 8px;
        position: fixed;
        top: 0;
        left: 50%;
        transform: translateX(-50%);
        width: 350px;
        z-index: 9999;
        background-color: white;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
    `;
    
    // Hacer que el contenedor sea arrastrable
    makeDraggable(container);
    
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
    removeBtn.onclick = function() {
        console.log(`Eliminando componente: ${tagName}`);
        container.remove();
    };
    toolbar.appendChild(removeBtn);
    
    // Ensamblar todo
    container.appendChild(toolbar);
    container.appendChild(component);
    
    // Insertar al final del body en vez de usar la selección o posición del cursor
    document.body.appendChild(container);
    
    console.log(`Componente ${tagName} insertado correctamente`);
}

// Función para hacer un elemento arrastrable
function makeDraggable(element) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    const toolbar = element.querySelector('.web-component-toolbar');
    
    if (toolbar) {
        // Si hay toolbar, solo permitir arrastrar desde allí
        toolbar.onmousedown = dragMouseDown;
    } else {
        // Si no hay toolbar, permitir arrastrar desde todo el elemento
        element.onmousedown = dragMouseDown;
    }
    
    function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();
        
        // Obtener la posición del cursor del mouse al inicio
        pos3 = e.clientX;
        pos4 = e.clientY;
        
        // Al soltar el mouse, detener el movimiento
        document.onmouseup = closeDragElement;
        
        // Al mover el mouse, mover el elemento
        document.onmousemove = elementDrag;
    }
    
    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        
        // Calcular la nueva posición
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        
        // Establecer la nueva posición del elemento
        const top = (element.offsetTop - pos2);
        const left = (element.offsetLeft - pos1);
        
        // Asegurarse de que el elemento no salga de la ventana
        if (top > 0 && top < window.innerHeight - element.offsetHeight) {
            element.style.top = top + "px";
        }
        
        if (left > 0 && left < window.innerWidth - element.offsetWidth) {
            element.style.left = left + "px";
        }
        
        // Si el elemento ha sido movido, eliminamos la transformación para que no interfiera
        if (element.style.transform) {
            element.style.transform = "";
        }
    }
    
    function closeDragElement() {
        // Detener el movimiento al soltar el mouse
        document.onmouseup = null;
        document.onmousemove = null;
    }
}

console.log("Content script de Web Components Toolkit cargado correctamente");