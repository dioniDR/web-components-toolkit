(function() {
  if (customElements.get('openai-chat')) {
    console.log('El componente OpenAI ya está registrado');
    return;
  }

  class OpenAIChat extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
      this.render();
      this.setupListeners();
    }

    render() {
      const style = `
        <style>
          .chat-container {
            font-family: sans-serif;
            background: #fff;
            border: 1px solid #ccc;
            border-radius: 8px;
            padding: 16px;
            max-width: 400px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          }
          textarea {
            width: 100%;
            height: 80px;
            padding: 8px;
            margin-bottom: 10px;
            resize: vertical;
            font-size: 1rem;
          }
          button {
            padding: 8px 12px;
            background-color: #2ecc71;
            border: none;
            border-radius: 4px;
            color: white;
            font-size: 1rem;
            cursor: pointer;
          }
          .response {
            margin-top: 12px;
            white-space: pre-wrap;
            font-size: 0.95rem;
            color: #2c3e50;
          }
        </style>
      `;

      this.shadowRoot.innerHTML = `
        ${style}
        <div class="chat-container">
          <textarea placeholder="Escribe tu pregunta..."></textarea>
          <button>Enviar</button>
          <div class="response">Esperando mensaje...</div>
        </div>
      `;
    }

    setupListeners() {
      const textarea = this.shadowRoot.querySelector('textarea');
      const button = this.shadowRoot.querySelector('button');
      const responseDiv = this.shadowRoot.querySelector('.response');

      button.addEventListener('click', () => {
        const userMessage = textarea.value.trim();
        if (!userMessage) return;

        responseDiv.textContent = "🧠 Pensando...";

        fetch("http://localhost:8002/chat-completion", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: [
              { role: "system", content: "Eres un asistente útil." },
              { role: "user", content: userMessage }
            ]
          })
        })
        .then(res => res.json())
        .then(data => {
          console.log("📦 Respuesta completa:", data);

          if (data.choices && data.choices.length > 0) {
            const msg = data.choices[0].message.content;
            responseDiv.textContent = msg;
          } else if (data.error) {
            responseDiv.textContent = `⚠️ Error: ${data.error.message}`;
          } else {
            responseDiv.textContent = "⚠️ Respuesta vacía o inesperada.";
          }
        })
        .catch(err => {
          responseDiv.textContent = "❌ Error al contactar el servidor.";
          console.error("❌ Error:", err);
        });
      });
    }
  }

  customElements.define('openai-chat', OpenAIChat);
})();
