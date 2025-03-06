// Script de contenido - se ejecuta en el contexto de la página web

// Al inicio del archivo
console.log("Content script de Web Components Toolkit inicializando...");

// Registrar listener para mensajes del popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log("Mensaje recibido en content script:", message);
    
    if (message.action === "insertComponent") {
        console.log("Intentando insertar componente:", message.tagName);
        insertComponent(message.tagName, message.scriptSrc, message.scriptContent)
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
async function insertComponent(tagName, scriptSrc, scriptContent) {
    try {
        // Verificar si el componente ya está definido
        if (!customElements.get(tagName)) {
            console.log(`Componente '${tagName}' no está registrado, inyectando script...`);
            
            // Inyectamos el código directamente en vez de cargar el archivo
            // Esto evita problemas con CSP y asegura que el script se ejecute en el contexto correcto
            const script = document.createElement('script');
            script.textContent = scriptContent;
            document.head.appendChild(script);
            
            // Esperamos un poco para asegurar que el componente se registre
            await new Promise(resolve => setTimeout(resolve, 100));
            
            // Verificamos que el componente se haya registrado correctamente
            if (!customElements.get(tagName)) {
                console.warn(`El componente '${tagName}' no se registró correctamente después de inyectar el script`);
                // Continuamos de todos modos, tal vez el componente use un registro asíncrono
            } else {
                console.log(`Componente '${tagName}' registrado correctamente`);
            }
        } else {
            console.log(`Componente '${tagName}' ya está registrado`);
        }
        
        // Insertamos la etiqueta del componente
        insertComponentTag(tagName);
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
        top: 100px;
        left: 50%;
        transform: translateX(-50%);
        width: 350px;
        z-index: 9999;
        background-color: white;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
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

console.log("Content script de Web Components Toolkit cargado correctamente");