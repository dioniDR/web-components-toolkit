// Background script para la extensión

// Escuchar a la instalación o actualización de la extensión
chrome.runtime.onInstalled.addListener(() => {
    console.log('Extensión Kit de Herramientas Web instalada o actualizada');
  });
  
  // Escuchar mensajes desde el popup
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('Mensaje recibido en background script:', message);
    
    if (message.action === 'insertComponentBackground') {
      chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
        try {
          const tabId = tabs[0].id;
          
          // Primero inyectar el script del componente
          await chrome.scripting.executeScript({
            target: { tabId },
            files: [`js/${message.scriptSrc}`]
          });
          
          // Luego insertar el componente
          const result = await chrome.scripting.executeScript({
            target: { tabId },
            func: (tagName) => {
              // Crear el elemento
              const component = document.createElement(tagName);
              
              // Crear un contenedor con estilos
              const container = document.createElement('div');
              container.style.margin = '20px 0';
              container.style.padding = '10px';
              container.style.border = '2px solid #4361ee';
              container.style.borderRadius = '8px';
              
              // Añadir el componente al contenedor
              container.appendChild(component);
              
              // Buscar el área de prueba si existe
              const testArea = document.querySelector('.test-area');
              if (testArea) {
                testArea.innerHTML = '';
                testArea.appendChild(container);
              } else {
                // Si no hay área de prueba, añadir al body
                document.body.appendChild(container);
              }
              
              return true;
            },
            args: [message.tagName]
          });
          
          sendResponse({ success: true, result });
        } catch (error) {
          console.error('Error al insertar componente:', error);
          sendResponse({ success: false, error: error.message });
        }
      });
      
      return true; // Mantener el canal abierto para respuesta asíncrona
    }
  });