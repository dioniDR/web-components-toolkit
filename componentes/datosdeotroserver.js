/**
 * Componente VentasTabla que muestra datos de ventas desde la API
 */
(function() {
    // Verificar si ya existe el componente
    if (customElements.get('ventas-tabla')) {
        console.log('El componente VentasTabla ya está registrado');
        return;
    }
    
    class VentasTabla extends HTMLElement {
        constructor() {
            super();
            this.attachShadow({ mode: 'open' });
            this.datos = [];
            this.isLoading = true;
            this.error = null;
        }
    
        connectedCallback() {
            this.render();
            this.fetchData();
        }
        
        async fetchData() {
            try {
                const response = await fetch('http://localhost:8000/api/ventas');
                if (!response.ok) throw new Error('Error al obtener datos');
                this.datos = await response.json();
                this.isLoading = false;
                this.error = null;
            } catch (err) {
                this.isLoading = false;
                this.error = err.message;
                console.error('Error:', err);
            }
            this.render();
        }
    
        render() {
            const style = `
                <style>
                    :host { display: block; font-family: Arial, sans-serif; }
                    .container { max-width: 900px; margin: 20px auto; }
                    .loader { text-align: center; padding: 20px; color: #666; }
                    .error { background: #ffebee; color: #c62828; padding: 10px; border-radius: 4px; }
                    table { width: 100%; border-collapse: collapse; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
                    th { background: #1976d2; color: white; text-align: left; padding: 12px; }
                    td { padding: 10px 12px; border-bottom: 1px solid #eee; }
                    tr:nth-child(even) { background-color: #f5f5f5; }
                    tr:hover { background-color: #e3f2fd; }
                    .precio { text-align: right; font-weight: bold; }
                    .completada { color: #43a047; }
                    .pendiente { color: #fb8c00; }
                    .cancelada { color: #e53935; }
                </style>
            `;
            
            let content = '';
            
            if (this.isLoading) {
                content = '<div class="loader">Cargando datos...</div>';
            } else if (this.error) {
                content = `<div class="error">Error: ${this.error}</div>`;
            } else if (this.datos.length === 0) {
                content = '<div class="loader">No hay datos disponibles</div>';
            } else {
                // Obtener columnas
                const columnas = Object.keys(this.datos[0]);
                
                content = `
                    <div class="container">
                        <table>
                            <thead>
                                <tr>
                                    ${columnas.map(col => `<th>${this.formatColumn(col)}</th>`).join('')}
                                </tr>
                            </thead>
                            <tbody>
                `;
                
                this.datos.forEach(item => {
                    let estadoClass = '';
                    if (item.estado === 'Completada') estadoClass = 'completada';
                    else if (item.estado === 'Pendiente') estadoClass = 'pendiente';
                    else if (item.estado === 'Cancelada') estadoClass = 'cancelada';
                    
                    content += '<tr>';
                    columnas.forEach(col => {
                        if (col === 'estado') {
                            content += `<td class="${estadoClass}">${item[col]}</td>`;
                        } else if (col.includes('precio') || col.includes('total')) {
                            content += `<td class="precio">$${parseFloat(item[col]).toFixed(2)}</td>`;
                        } else {
                            content += `<td>${item[col] || '-'}</td>`;
                        }
                    });
                    content += '</tr>';
                });
                
                content += `
                            </tbody>
                        </table>
                    </div>
                `;
            }
            
            this.shadowRoot.innerHTML = style + content;
        }
        
        formatColumn(colName) {
            return colName
                .split('_')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ');
        }
    }
    
    customElements.define('ventas-tabla', VentasTabla);
    console.log('Componente VentasTabla registrado correctamente');
})();
