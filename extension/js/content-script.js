// Script de contenido - se ejecuta en el contexto de la página web

// Registrar listener para mensajes del popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log("Mensaje recibido en content script:", message);
    
    if (message.action === "insertComponent") {
        console.log("Intentando insertar componente:", message.tagName);
        insertComponent(message.tagName, message.scriptSrc);
        sendResponse({ success: true });
    } else if (message.action === "checkStatus") {
        console.log("Verificación de estado recibida");
        sendResponse({ status: "ready" });
    }
    return true; // Indica que vamos a enviar una respuesta asíncrona
});

// Función para insertar un componente en la página
function insertComponent(tagName, scriptSrc) {
    try {
        // Comprobar si el script ya está cargado
        const scriptExists = Array.from(document.querySelectorAll('script')).some(
            script => script.src.includes(scriptSrc)
        );
        
        // Si el script no está cargado, lo cargamos primero
        if (!scriptExists) {
            const script = document.createElement('script');
            script.src = chrome.runtime.getURL(`js/${scriptSrc}`);
            script.onload = () => {
                console.log(`Script ${scriptSrc} cargado correctamente`);
                // Insertar el componente después de cargar el script
                insertComponentTag(tagName);
            };
            document.head.appendChild(script);
        } else {
            // Si el script ya está cargado, simplemente insertamos el componente
            insertComponentTag(tagName);
        }
    } catch (error) {
        console.error('Error al insertar componente:', error);
    }
}

// Función para insertar la etiqueta del componente
function insertComponentTag(tagName) {
    // Crear el elemento
    const component = document.createElement(tagName);
    
    // Crear un contenedor para el componente
    const container = document.createElement('div');
    container.className = 'web-component-container';
    container.style.cssText = `
        margin: 20px 0;
        padding: 10px;
        border: 2px solid #4361ee;
        border-radius: 8px;
        position: relative;
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
        container.remove();
    };
    toolbar.appendChild(removeBtn);
    
    // Ensamblar todo
    container.appendChild(toolbar);
    container.appendChild(component);
    
    // Buscar el área de prueba si existe
    const testArea = document.querySelector('.test-area');
    if (testArea) {
        testArea.innerHTML = '';
        testArea.appendChild(container);
    } else {
        // Insertar en el lugar seleccionado o al final del body
        if (window.getSelection) {
            const selection = window.getSelection();
            if (selection.rangeCount > 0) {
                const range = selection.getRangeAt(0);
                range.deleteContents();
                range.insertNode(container);
                return;
            }
        }
        
        // Si no hay selección, insertar al final
        document.body.appendChild(container);
    }
    
    // Scroll hacia el componente
    container.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

console.log("Content script de Web Components Toolkit cargado correctamente");