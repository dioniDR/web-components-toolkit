// Background script para la extensión

// Escuchar a la instalación o actualización de la extensión
chrome.runtime.onInstalled.addListener(() => {
    console.log('Extensión Kit de Herramientas Web instalada o actualizada');
  });
  
  // Caché para almacenar contenido de scripts
  const scriptCache = {};
  
  // Escuchar mensajes desde el popup
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('Mensaje recibido en background script:', message);
    
    if (message.action === 'insertComponentBackground') {
      handleInsertComponent(message, sendResponse);
      return true; // Mantener el canal abierto para respuesta asíncrona
    }
  });
  
  async function handleInsertComponent(message, sendResponse) {
    console.log('Manejando la inserción del componente:', message.tagName);
    
    try {
      const scriptContent = await getScriptContent(message.scriptSrc);
      
      chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
        try {
          const tabId = tabs[0].id;
          
          // Enviar el contenido del script al content script
          chrome.tabs.sendMessage(tabId, {
            action: "insertComponent",
            tagName: message.tagName,
            scriptSrc: message.scriptSrc,
            scriptContent: scriptContent
          }, response => {
            console.log('Respuesta del content script:', response);
            
            if (response && response.success) {
              sendResponse({ success: true });
            } else {
              const errorMsg = response ? response.error : "Error desconocido en content script";
              console.error('Error reportado por content script:', errorMsg);
              sendResponse({ success: false, error: errorMsg });
            }
          });
        } catch (error) {
          console.error('Error al comunicarse con la pestaña:', error);
          sendResponse({ success: false, error: error.message });
        }
      });
    } catch (error) {
      console.error('Error al obtener el contenido del script:', error);
      sendResponse({ success: false, error: error.message });
    }
  }
  
  // Función para obtener el contenido del script
  async function getScriptContent(scriptSrc) {
    // Revisamos primero si ya tenemos el script en caché
    if (scriptCache[scriptSrc]) {
      console.log(`Usando script en caché para: ${scriptSrc}`);
      return scriptCache[scriptSrc];
    }
    
    // Si no está en caché, lo cargamos
    console.log(`Cargando script: ${scriptSrc}`);
    
    try {
      const response = await fetch(chrome.runtime.getURL(`js/${scriptSrc}`));
      if (!response.ok) {
        throw new Error(`No se pudo cargar el script: ${response.status} ${response.statusText}`);
      }
      
      const scriptContent = await response.text();
      
      // Guardamos en caché para futuros usos
      scriptCache[scriptSrc] = scriptContent;
      
      return scriptContent;
    } catch (error) {
      console.error('Error cargando script:', error);
      throw error;
    }
  }