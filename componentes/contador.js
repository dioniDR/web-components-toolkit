/**
 * Wrapper para componentes web que garantiza aislamiento y compatibilidad
 * en contextos con restricciones de Content Security Policy (CSP)
 */
(function() {
    // Verificar si ya existe el componente
    if (customElements.get('contador-app')) {
      console.log('El componente Contador ya está registrado');
      return;
    }
    
    console.log('Registrando componente Contador...');
    
    class Contador extends HTMLElement {
      constructor() {
          super();
          this.attachShadow({ mode: 'open' });
          this.count = 0;
      }
  
      connectedCallback() {
          console.log('Contador conectado al DOM');
          this.render();
          this.setupEventListeners();
      }
  
      render() {
          const style = `
              <style>
                  :host {
                      display: block;
                      font-family: 'Arial', sans-serif;
                  }
                  
                  .contador-container {
                      display: flex;
                      flex-direction: column;
                      align-items: center;
                      max-width: 300px;
                      margin: 0 auto;
                      padding: 20px;
                      border-radius: 8px;
                      background-color: #f0f4f8;
                      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                  }
                  
                  .display {
                      font-size: 3rem;
                      font-weight: bold;
                      color: #2c3e50;
                      margin: 15px 0;
                      min-width: 100px;
                      text-align: center;
                  }
                  
                  .buttons {
                      display: flex;
                      gap: 10px;
                      margin-top: 10px;
                  }
                  
                  button {
                      padding: 8px 16px;
                      font-size: 1.2rem;
                      border: none;
                      border-radius: 4px;
                      cursor: pointer;
                      transition: all 0.2s ease;
                  }
                  
                  .decrement {
                      background-color: #e74c3c;
                      color: white;
                  }
                  
                  .increment {
                      background-color: #2ecc71;
                      color: white;
                  }
                  
                  .reset {
                      background-color: #3498db;
                      color: white;
                      margin-top: 10px;
                  }
                  
                  button:hover {
                      transform: scale(1.05);
                      opacity: 0.9;
                  }
                  
                  button:active {
                      transform: scale(0.95);
                  }
              </style>
          `;
  
          this.shadowRoot.innerHTML = `
              ${style}
              <div class="contador-container">
                  <h2>Contador</h2>
                  <div class="display">${this.count}</div>
                  <div class="buttons">
                      <button class="decrement">-</button>
                      <button class="increment">+</button>
                  </div>
                  <button class="reset">Reset</button>
              </div>
          `;
      }
  
      setupEventListeners() {
          // Usar bind para asegurar el contexto correcto de 'this'
          const decrementBtn = this.shadowRoot.querySelector('.decrement');
          const incrementBtn = this.shadowRoot.querySelector('.increment');
          const resetBtn = this.shadowRoot.querySelector('.reset');
          
          if (decrementBtn) {
              decrementBtn.addEventListener('click', this.decrement.bind(this));
          }
          
          if (incrementBtn) {
              incrementBtn.addEventListener('click', this.increment.bind(this));
          }
          
          if (resetBtn) {
              resetBtn.addEventListener('click', this.reset.bind(this));
          }
      }
      
      // Métodos separados para mejor mantenimiento
      decrement() {
          this.count--;
          this.updateDisplay();
      }
      
      increment() {
          this.count++;
          this.updateDisplay();
      }
      
      reset() {
          this.count = 0;
          this.updateDisplay();
      }
      
      updateDisplay() {
          const display = this.shadowRoot.querySelector('.display');
          if (display) {
              display.textContent = this.count;
          }
      }
  }
  
  // Registrar el componente personalizado
  try {
      customElements.define('contador-app', Contador);
      console.log('Componente Contador registrado correctamente');
  } catch (error) {
      console.error('Error al registrar componente Contador:', error);
  }
  
  })(); // IIFE para aislar el scope