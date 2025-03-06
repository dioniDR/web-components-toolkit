// Script del popup
document.addEventListener('DOMContentLoaded', function() {
    console.log("Popup inicializado");
    
    // Encontrar todos los botones de inserción
    const insertButtons = document.querySelectorAll('.insert-btn');
    console.log("Botones encontrados:", insertButtons.length);
    
    const statusMessage = document.getElementById('status-message');
    
    // Agregar eventos a los botones de inserción
    insertButtons.forEach(button => {
        button.addEventListener('click', function() {
            console.log("Botón presionado");
            
            const componentItem = this.closest('.component-item');
            const tagName = componentItem.dataset.tag;
            const scriptSrc = componentItem.dataset.script;
            
            console.log("Componente a insertar:", tagName, scriptSrc);
            
            statusMessage.textContent = "Procesando...";
            statusMessage.className = "status-message";
            statusMessage.style.display = "block";
            
            try {
                console.log('Intentando enviar mensaje al background');
                // Enviar mensaje al background script
                chrome.runtime.sendMessage({
                    action: "insertComponentBackground",
                    tagName: tagName,
                    scriptSrc: scriptSrc
                }, function(response) {
                    console.log('Respuesta recibida:', response);
                    if (response && response.success) {
                        statusMessage.textContent = "Componente insertado correctamente";
                        statusMessage.className = "status-message status-success";
                    } else {
                        const errorMsg = response ? response.error : "Error desconocido";
                        statusMessage.textContent = `Error: ${errorMsg}`;
                        statusMessage.className = "status-message status-error";
                    }
                });
            } catch (error) {
                console.error('Error detallado:', error);
                statusMessage.textContent = `Error: ${error.message || "No se pudo insertar el componente"}`;
                statusMessage.className = "status-message status-error";
                console.error("Error insertando componente:", error);
            }
        });
    });
});