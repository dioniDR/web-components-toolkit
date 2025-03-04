class Contador extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.count = 0;
    }

    connectedCallback() {
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
        const decrementBtn = this.shadowRoot.querySelector('.decrement');
        const incrementBtn = this.shadowRoot.querySelector('.increment');
        const resetBtn = this.shadowRoot.querySelector('.reset');
        
        decrementBtn.addEventListener('click', () => {
            this.count--;
            this.updateDisplay();
        });
        
        incrementBtn.addEventListener('click', () => {
            this.count++;
            this.updateDisplay();
        });
        
        resetBtn.addEventListener('click', () => {
            this.count = 0;
            this.updateDisplay();
        });
    }
    
    updateDisplay() {
        const display = this.shadowRoot.querySelector('.display');
        display.textContent = this.count;
    }
}

// Registrar el componente personalizado
customElements.define('contador-app', Contador);
