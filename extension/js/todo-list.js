/**
 * Componente web Todo List - Versión Mejorada para interfaces de chat
 * Incluye mejoras para evitar conflictos con la interfaz de Claude
 */
(function() {
    // Verificar si ya existe el componente
    if (customElements.get('todo-list')) {
      console.log('El componente ToDo List ya está registrado');
      return;
    }
    
    console.log('Registrando componente ToDo List...');
    
    class TodoList extends HTMLElement {
        constructor() {
            super();
            this.attachShadow({ mode: 'open' });
            this.todos = JSON.parse(localStorage.getItem('todos')) || [];
        }
    
        connectedCallback() {
            console.log('ToDo List conectado al DOM');
            this.render();
            this.setupEventListeners();
        }
    
        render() {
            const style = `
                <style>
                    :host {
                        display: block;
                        font-family: 'Arial', sans-serif;
                        contain: content; /* Ayuda a aislar el componente */
                    }
                    
                    .todo-container {
                        background-color: #f0f4f8;
                        border-radius: 8px;
                        padding: 20px;
                        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                        max-width: 500px;
                        margin: 0 auto;
                    }
                    
                    h2 {
                        color: #4361ee;
                        margin-top: 0;
                        text-align: center;
                    }
                    
                    .input-group {
                        display: flex;
                        margin-bottom: 20px;
                    }
                    
                    input[type="text"] {
                        flex: 1;
                        padding: 8px 12px;
                        border: 1px solid #ddd;
                        border-radius: 4px 0 0 4px;
                        font-size: 16px;
                    }
                    
                    /* Estilos específicos para el input para evitar conflictos */
                    input[type="text"]:focus {
                        outline: 2px solid #4361ee;
                        box-shadow: 0 0 4px rgba(67, 97, 238, 0.5);
                        z-index: 10001; /* Alto z-index para asegurar que esté por encima */
                    }
                    
                    .add-btn {
                        background-color: #4361ee;
                        color: white;
                        border: none;
                        border-radius: 0 4px 4px 0;
                        padding: 0 15px;
                        cursor: pointer;
                        font-size: 16px;
                        transition: background-color 0.2s;
                    }
                    
                    .add-btn:hover {
                        background-color: #3a56d4;
                    }
                    
                    ul {
                        list-style-type: none;
                        padding: 0;
                        margin: 0;
                    }
                    
                    li {
                        display: flex;
                        align-items: center;
                        padding: 10px;
                        border-bottom: 1px solid #eee;
                        transition: background-color 0.2s;
                    }
                    
                    li:hover {
                        background-color: #f8f9fa;
                    }
                    
                    .checkbox {
                        margin-right: 10px;
                        height: 18px;
                        width: 18px;
                    }
                    
                    .todo-text {
                        flex: 1;
                        word-break: break-word;
                    }
                    
                    .completed {
                        text-decoration: line-through;
                        color: #888;
                    }
                    
                    .delete-btn {
                        background-color: #ff4d4d;
                        color: white;
                        border: none;
                        border-radius: 4px;
                        padding: 5px 10px;
                        cursor: pointer;
                        margin-left: 10px;
                        transition: background-color 0.2s;
                    }
                    
                    .delete-btn:hover {
                        background-color: #e53e3e;
                    }
                    
                    .empty-state {
                        text-align: center;
                        color: #888;
                        padding: 20px 0;
                    }

                    .actions-bar {
                        display: flex;
                        justify-content: space-between;
                        margin-top: 15px;
                        border-top: 1px solid #eee;
                        padding-top: 15px;
                    }

                    .clear-btn {
                        background-color: transparent;
                        color: #666;
                        border: 1px solid #ddd;
                        border-radius: 4px;
                        padding: 5px 10px;
                        cursor: pointer;
                        transition: all 0.2s;
                    }

                    .clear-btn:hover {
                        background-color: #f2f2f2;
                        color: #333;
                    }

                    .counter {
                        color: #666;
                        font-size: 14px;
                    }
                </style>
            `;
    
            // Crear la estructura HTML
            let todoItems = '';
            if (this.todos.length === 0) {
                todoItems = '<div class="empty-state">No hay tareas pendientes</div>';
            } else {
                todoItems = '<ul>';
                this.todos.forEach((todo, index) => {
                    todoItems += `
                        <li>
                            <input type="checkbox" class="checkbox" data-index="${index}" ${todo.completed ? 'checked' : ''}>
                            <span class="todo-text ${todo.completed ? 'completed' : ''}">${todo.text}</span>
                            <button class="delete-btn" data-index="${index}">Eliminar</button>
                        </li>
                    `;
                });
                todoItems += '</ul>';
            }

            const activeCount = this.todos.filter(todo => !todo.completed).length;
            const completedCount = this.todos.length - activeCount;
    
            this.shadowRoot.innerHTML = `
                ${style}
                <div class="todo-container">
                    <h2>Lista de Tareas</h2>
                    <div class="input-group">
                        <input type="text" placeholder="Nueva tarea..." id="new-todo">
                        <button class="add-btn">Añadir</button>
                    </div>
                    ${todoItems}
                    ${this.todos.length > 0 ? `
                        <div class="actions-bar">
                            <span class="counter">${activeCount} pendientes, ${completedCount} completadas</span>
                            <button class="clear-btn" id="clear-completed" ${completedCount === 0 ? 'disabled' : ''}>Limpiar completadas</button>
                        </div>
                    ` : ''}
                </div>
            `;
        }
    
        setupEventListeners() {
            // Añadir tarea
            const inputEl = this.shadowRoot.querySelector('#new-todo');
            const addBtn = this.shadowRoot.querySelector('.add-btn');
            
            const addTodo = () => {
                const text = inputEl.value.trim();
                if (text) {
                    this.todos.push({ text, completed: false });
                    this.saveToLocalStorage();
                    this.render();
                    this.setupEventListeners();
                    
                    // Recuperar el foco en el input después de renderizar
                    setTimeout(() => {
                        const newInput = this.shadowRoot.querySelector('#new-todo');
                        if (newInput) {
                            newInput.focus();
                            newInput.value = '';
                        }
                    }, 10);
                }
            };
            
            if (addBtn) {
                addBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    addTodo();
                });
            }
            
            if (inputEl) {
                // Mejorar el manejo del input para evitar interferencias
                inputEl.addEventListener('focus', (e) => {
                    // Evitar que el evento se propague fuera del shadow DOM
                    e.stopPropagation();
                });
                
                inputEl.addEventListener('click', (e) => {
                    // Evitar que el evento se propague fuera del shadow DOM
                    e.stopPropagation();
                    // Asegurar que el input mantiene el foco
                    e.target.focus();
                });
                
                inputEl.addEventListener('keydown', (e) => {
                    // Detener la propagación para que Claude no capture estos eventos
                    e.stopPropagation();
                    
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        addTodo();
                    }
                });
            }
            
            // Marcar como completada con prevención de propagación
            const checkboxes = this.shadowRoot.querySelectorAll('.checkbox');
            checkboxes.forEach(checkbox => {
                checkbox.addEventListener('change', (e) => {
                    e.stopPropagation();
                    const index = e.target.dataset.index;
                    this.todos[index].completed = e.target.checked;
                    this.saveToLocalStorage();
                    this.render();
                    this.setupEventListeners();
                });
                
                checkbox.addEventListener('click', (e) => {
                    e.stopPropagation();
                });
            });
            
            // Eliminar tarea con prevención de propagación
            const deleteButtons = this.shadowRoot.querySelectorAll('.delete-btn');
            deleteButtons.forEach(button => {
                button.addEventListener('click', (e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    const index = e.target.dataset.index;
                    this.todos.splice(index, 1);
                    this.saveToLocalStorage();
                    this.render();
                    this.setupEventListeners();
                });
            });

            // Limpiar tareas completadas con prevención de propagación
            const clearButton = this.shadowRoot.querySelector('#clear-completed');
            if (clearButton) {
                clearButton.addEventListener('click', (e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    this.todos = this.todos.filter(todo => !todo.completed);
                    this.saveToLocalStorage();
                    this.render();
                    this.setupEventListeners();
                });
            }

            // Evitar que los clics en el contenedor se propaguen a la página
            const container = this.shadowRoot.querySelector('.todo-container');
            if (container) {
                container.addEventListener('click', (e) => {
                    e.stopPropagation();
                });
                
                container.addEventListener('mousedown', (e) => {
                    e.stopPropagation();
                });
            }
        }
    
        saveToLocalStorage() {
            localStorage.setItem('todos', JSON.stringify(this.todos));
        }

        // Añadir métodos para el ciclo de vida
        disconnectedCallback() {
            // Limpiar cualquier recurso cuando el componente se elimina
            console.log('ToDo List desconectado del DOM');
        }
    }
    
    // Registrar el componente personalizado
    try {
        customElements.define('todo-list', TodoList);
        console.log('Componente ToDo List registrado correctamente');
    } catch (error) {
        console.error('Error al registrar componente ToDo List:', error);
    }
    
})();