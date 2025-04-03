/**
 * Componente web para visualizar datos de ventas desde la API NL2SQL
 */
(function() {
    // Verificar si ya existe el componente
    if (customElements.get('ventas-viewer')) {
      console.log('El componente VentasViewer ya está registrado');
      return;
    }
    
    console.log('Registrando componente VentasViewer...');
    
    class VentasViewer extends HTMLElement {
      constructor() {
          super();
          this.attachShadow({ mode: 'open' });
          this.ventas = [];
          this.isLoading = true;
          this.error = null;
          this.apiUrl = 'http://localhost:8001/api';
      }
  
      connectedCallback() {
          console.log('VentasViewer conectado al DOM');
          this.render();
          this.fetchVentas();
      }
      
      async fetchVentas() {
          try {
              this.isLoading = true;
              this.render();
              
              const response = await fetch(`${this.apiUrl}/ventas`);
              if (!response.ok) {
                  throw new Error(`Error de API: ${response.status} ${response.statusText}`);
              }
              
              this.ventas = await response.json();
              this.isLoading = false;
              this.error = null;
          } catch (err) {
              console.error('Error al obtener ventas:', err);
              this.isLoading = false;
              this.error = err.message;
          }
          
          this.render();
      }
  
      render() {
          const style = `
              <style>
                  :host {
                      display: block;
                      font-family: 'Arial', sans-serif;
                      color: #333;
                  }
                  
                  .container {
                      max-width: 900px;
                      margin: 20px auto;
                      padding: 20px;
                      border-radius: 8px;
                      background-color: #f8f9fa;
                      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                  }
                  
                  h2 {
                      color: #2c3e50;
                      text-align: center;
                      margin-top: 0;
                      border-bottom: 2px solid #3498db;
                      padding-bottom: 10px;
                  }
                  
                  .loader {
                      text-align: center;
                      padding: 40px;
                      font-style: italic;
                      color: #666;
                  }
                  
                  .error {
                      background-color: #ffebee;
                      color: #c62828;
                      padding: 15px;
                      border-radius: 4px;
                      margin: 20px 0;
                      border-left: 4px solid #e57373;
                  }
                  
                  table {
                      width: 100%;
                      border-collapse: collapse;
                      margin-top: 20px;
                  }
                  
                  th {
                      background-color: #3498db;
                      color: white;
                      text-align: left;
                      padding: 12px 15px;
                  }
                  
                  td {
                      padding: 10px 15px;
                      border-bottom: 1px solid #ddd;
                  }
                  
                  tr:nth-child(even) {
                      background-color: #f2f2f2;
                  }
                  
                  tr:hover {
                      background-color: #e3f2fd;
                  }
                  
                  .precio {
                      text-align: right;
                      font-weight: bold;
                  }
                  
                  .estado-completada {
                      color: #2ecc71;
                      font-weight: bold;
                  }
                  
                  .estado-pendiente {
                      color: #f39c12;
                      font-weight: bold;
                  }
                  
                  .estado-cancelada {
                      color: #e74c3c;
                      font-weight: bold;
                  }
                  
                  .refresh-btn {
                      background-color: #3498db;
                      color: white;
                      border: none;
                      padding: 8px 15px;
                      border-radius: 4px;
                      cursor: pointer;
                      font-size: 14px;
                      margin-bottom: 15px;
                      transition: background-color 0.2s;
                  }
                  
                  .refresh-btn:hover {
                      background-color: #2980b9;
                  }
              </style>
          `;
          
          let content = '';
          
          if (this.isLoading) {
              content = `
                  <div class="container">
                      <h2>Datos de Ventas</h2>
                      <div class="loader">Cargando datos de ventas...</div>
                  </div>
              `;
          } else if (this.error) {
              content = `
                  <div class="container">
                      <h2>Datos de Ventas</h2>
                      <div class="error">
                          <strong>Error:</strong> ${this.error}
                      </div>
                      <button class="refresh-btn" id="refresh">Reintentar</button>
                  </div>
              `;
          } else if (this.ventas.length === 0) {
              content = `
                  <div class="container">
                      <h2>Datos de Ventas</h2>
                      <div class="loader">No hay datos de ventas disponibles</div>
                      <button class="refresh-btn" id="refresh">Actualizar</button>
                  </div>
              `;
          } else {
              // Visualización más amigable
              content = `
                  <div class="container">
                      <h2>Datos de Ventas</h2>
                      <button class="refresh-btn" id="refresh">Actualizar</button>
                      <table>
                          <thead>
                              <tr>
                                  <th>ID</th>
                                  <th>Cliente</th>
                                  <th>Producto</th>
                                  <th>Fecha</th>
                                  <th>Total</th>
                                  <th>Estado</th>
                                  <th>Método de Pago</th>
                              </tr>
                          </thead>
                          <tbody>
              `;
              
              this.ventas.forEach(venta => {
                  const estadoClass = venta.estado 
                      ? `estado-${venta.estado.toLowerCase()}` 
                      : '';
                  
                  content += `
                      <tr>
                          <td>${venta.id || '-'}</td>
                          <td>Cliente ${venta.cliente_id || '-'}</td>
                          <td>Producto ${venta.producto_id || '-'}</td>
                          <td>${this.formatDate(venta.fecha)}</td>
                          <td class="precio">$${this.formatNumber(venta.total)}</td>
                          <td class="${estadoClass}">${venta.estado || '-'}</td>
                          <td>${venta.metodo_pago || '-'}</td>
                      </tr>
                  `;
              });
              
              content += `
                          </tbody>
                      </table>
                  </div>
              `;
          }
          
          this.shadowRoot.innerHTML = style + content;
          
          // Configurar eventos después de renderizar
          const refreshBtn = this.shadowRoot.querySelector('#refresh');
          if (refreshBtn) {
              refreshBtn.addEventListener('click', () => this.fetchVentas());
          }
      }
      
      formatDate(dateString) {
          if (!dateString) return '-';
          
          const date = new Date(dateString);
          if (isNaN(date.getTime())) return dateString;
          
          return date.toLocaleDateString('es-ES');
      }
      
      formatNumber(num) {
          if (num === null || num === undefined) return '-';
          return parseFloat(num).toFixed(2);
      }
    }
    
    // Registrar el componente personalizado
    try {
        customElements.define('ventas-viewer', VentasViewer);
        console.log('Componente VentasViewer registrado correctamente');
    } catch (error) {
        console.error('Error al registrar componente VentasViewer:', error);
    }
})();