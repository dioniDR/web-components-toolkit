// Script del popup
document.addEventListener('DOMContentLoaded', function() {
    console.log("Popup inicializado");
    
    // Encontrar todos los botones de inserción
    const insertButtons = document.querySelectorAll('.insert-btn');
    console.log("Botones encontrados:", insertButtons.length);
    
    const statusMessage = document.getElementById('status-message');
    
    // Comprobar que los botones se han encontrado
    if (insertButtons.length === 0) {
        mostrarError("No se encontraron componentes disponibles");
        return;
    }
    
    // Agregar eventos a los botones de inserción
    insertButtons.forEach(button => {
        button.addEventListener('click', function() {
            console.log("Botón presionado");
            
            const componentItem = this.closest('.component-item');
            if (!componentItem) {
                mostrarError("Error: No se pudo encontrar información del componente");
                return;
            }
            
            const tagName = componentItem.dataset.tag;
            const scriptSrc = componentItem.dataset.script;
            
            if (!tagName || !scriptSrc) {
                mostrarError("Error: Información de componente incompleta");
                return;
            }
            
            console.log("Componente a insertar:", tagName, scriptSrc);
            
            statusMessage.textContent = "Procesando...";
            statusMessage.className = "status-message";
            statusMessage.style.display = "block";
            
            // Comprobamos primero si la pestaña activa permite la inyección
            chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
                const currentTab = tabs[0];
                
                // Verificar si podemos inyectar en esta pestaña
                const url = new URL(currentTab.url);
                if (url.protocol !== 'http:' && url.protocol !== 'https:') {
                    mostrarError(`No se puede insertar en páginas ${url.protocol}`);
                    return;
                }
                
                // Todo está bien, procedemos con la inserción
                enviarMensajeInsercion(tagName, scriptSrc);
            });
        });
    });
    
    function enviarMensajeInsercion(tagName, scriptSrc) {
        try {
            console.log('Enviando mensaje al background script');
            // Enviar mensaje al background script
            chrome.runtime.sendMessage({
                action: "insertComponentBackground",
                tagName: tagName,
                scriptSrc: scriptSrc
            }, function(response) {
                console.log('Respuesta recibida:', response);
                
                if (chrome.runtime.lastError) {
                    mostrarError(`Error: ${chrome.runtime.lastError.message}`);
                    return;
                }
                
                if (response && response.success) {
                    statusMessage.textContent = "Componente insertado correctamente";
                    statusMessage.className = "status-message status-success";
                } else {
                    const errorMsg = response ? response.error : "Error desconocido";
                    mostrarError(`Error: ${errorMsg}`);
                }
            });
        } catch (error) {
            console.error('Error detallado:', error);
            mostrarError(`Error: ${error.message || "No se pudo insertar el componente"}`);
        }
    }
    
    function mostrarError(mensaje) {
        console.error(mensaje);
        statusMessage.textContent = mensaje;
        statusMessage.className = "status-message status-error";
        statusMessage.style.display = "block";
    }
});