export function initChatbot() {
    // Injetar HTML do Chatbot
    const widgetHTML = `
        <div class="chatbot-widget">
            <div class="chatbot-window" id="chatbotWindow">
                <div class="chatbot-header">
                    <span>Chatbot IA</span>
                    <button class="chatbot-close" id="chatbotClose">✖</button>
                </div>
                <div class="chatbot-messages" id="chatbotMessages">
                    <!-- Mensagens aparecerão aqui -->
                    <div class="bot-typing" id="botTyping">O modelo está digitando...</div>
                </div>
                <form class="chatbot-input-area" id="chatbotForm">
                    <input type="text" id="chatbotInput" placeholder="Digite sua mensagem..." autocomplete="off">
                    <button type="submit" id="chatbotSend">
                        <i data-lucide="send" width="18" height="18"></i>
                    </button>
                </form>
            </div>
            <button class="chatbot-btn" id="chatbotBtn" title="Abrir Chat">
                <i data-lucide="bot" width="30" height="30"></i>
            </button>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', widgetHTML);
    
    // Atualizar os ícones do Lucide caso existam (precisa rodar lucide.createIcons global)
    if(typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    const btn = document.getElementById('chatbotBtn');
    const windowEl = document.getElementById('chatbotWindow');
    const closeBtn = document.getElementById('chatbotClose');
    const form = document.getElementById('chatbotForm');
    const input = document.getElementById('chatbotInput');
    const messagesContainer = document.getElementById('chatbotMessages');
    const sendBtn = document.getElementById('chatbotSend');
    const typingIndicator = document.getElementById('botTyping');

    let chatHistory = [];
    const OLLAMA_URL = 'http://10.136.43.122:11434/api/chat';
    const MODEL_NAME = 'gemma4';

    // Carregar histórico
    function loadHistory() {
        const saved = localStorage.getItem('chatbot_history');
        if (saved) {
            chatHistory = JSON.parse(saved);
            chatHistory.forEach(msg => {
                if(msg.role !== 'system') { // ignorar mensagens de sistema no render se houver
                    renderMessage(msg.content, msg.role);
                }
            });
        } else {
            renderMessage("Olá! Sou o assistente de IA local. Como posso ajudar?", "assistant");
        }
    }

    function saveHistory() {
        localStorage.setItem('chatbot_history', JSON.stringify(chatHistory));
    }

    function renderMessage(content, role) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `chat-message ${role === 'user' ? 'user' : 'bot'}`;
        msgDiv.textContent = content;
        messagesContainer.insertBefore(msgDiv, typingIndicator);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        return msgDiv;
    }

    // Handlers de UI
    btn.addEventListener('click', () => {
        windowEl.classList.toggle('is-active');
        if(windowEl.classList.contains('is-active')) {
            input.focus();
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
    });

    closeBtn.addEventListener('click', () => {
        windowEl.classList.remove('is-active');
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const text = input.value.trim();
        if (!text) return;

        // Limpar input
        input.value = '';
        input.disabled = true;
        sendBtn.disabled = true;

        // Render e Adicionar usuário ao histórico
        renderMessage(text, 'user');
        chatHistory.push({ role: 'user', content: text });
        saveHistory();

        typingIndicator.style.display = 'block';
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        try {
            const response = await fetch(OLLAMA_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: MODEL_NAME,
                    messages: chatHistory,
                    stream: true
                })
            });

            if (!response.ok) {
                throw new Error('Erro na requisição: ' + response.status);
            }

            // Criar a bolha de mensagem do bot vazia para o streaming
            const botMsgDiv = renderMessage('', 'assistant');
            typingIndicator.style.display = 'none';

            let fullBotResponse = "";
            const reader = response.body.getReader();
            const decoder = new TextDecoder("utf-8");

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                const lines = chunk.split('\n').filter(l => l.trim().length > 0);
                
                for (let line of lines) {
                    try {
                        const json = JSON.parse(line);
                        if (json.message && json.message.content) {
                            fullBotResponse += json.message.content;
                            botMsgDiv.textContent = fullBotResponse;
                            messagesContainer.scrollTop = messagesContainer.scrollHeight;
                        }
                    } catch (e) {
                        console.error('Erro ao fazer parse do chunk JSON:', e, line);
                    }
                }
            }

            // Ao final do stream, salvar no histórico
            chatHistory.push({ role: 'assistant', content: fullBotResponse });
            saveHistory();

        } catch (error) {
            console.error('Erro de conexão com Ollama:', error);
            typingIndicator.style.display = 'none';
            renderMessage(`[Erro] Não foi possível conectar ao Ollama. Detalhes: ${error.message}`, 'bot');
        } finally {
            input.disabled = false;
            sendBtn.disabled = false;
            input.focus();
        }
    });

    loadHistory();
}
