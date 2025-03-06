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
            
            // Intentar insertar directamente usando chrome.tabs.query y comunicándonos con el content script
            insertarComponenteDirectamente(tagName, scriptSrc);
        });
    });
    
    function insertarComponenteDirectamente(tagName, scriptSrc) {
        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
            if (!tabs || tabs.length === 0) {
                mostrarError("Error: No se pudo obtener la pestaña activa");
                return;
            }
            
            const activeTab = tabs[0];
            
            // Verificar si podemos inyectar en esta pestaña
            const url = new URL(activeTab.url);
            if (url.protocol !== 'http:' && url.protocol !== 'https:') {
                mostrarError(`No se puede insertar en páginas ${url.protocol}`);
                return;
            }
            
            // Enviar mensaje directamente al content script
            chrome.tabs.sendMessage(
                activeTab.id,
                {
                    action: "insertComponent",
                    tagName: tagName,
                    scriptSrc: scriptSrc
                },
                function(response) {
                    if (chrome.runtime.lastError) {
                        console.error("Error enviando mensaje:", chrome.runtime.lastError);
                        mostrarError("Error: No se pudo comunicar con la página. Intente recargar la página.");
                        return;
                    }
                    
                    if (response && response.success) {
                        mostrarExito("Componente insertado correctamente");
                    } else {
                        const errorMsg = response && response.error ? response.error : "Error desconocido";
                        mostrarError(`Error: ${errorMsg}`);
                    }
                }
            );
        });
    }
    
    function mostrarExito(mensaje) {
        console.log(mensaje);
        statusMessage.textContent = mensaje;
        statusMessage.className = "status-message status-success";
        statusMessage.style.display = "block";
    }
    
    function mostrarError(mensaje) {
        console.error(mensaje);
        statusMessage.textContent = mensaje;
        statusMessage.className = "status-message status-error";
        statusMessage.style.display = "block";
    }
});