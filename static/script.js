// ============================
// DOM Elements
// ============================
const chatArea = document.getElementById('chatArea');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');

let isWaiting = false;

// ============================
// Auto-resize textarea
// ============================
userInput.addEventListener('input', () => {
    userInput.style.height = 'auto';
    userInput.style.height = Math.min(userInput.scrollHeight, 120) + 'px';
});

// ============================
// Send on Enter (Shift+Enter for newline)
// ============================
userInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

// ============================
// Suggestion chips
// ============================
function useSuggestion(text) {
    userInput.value = text;
    userInput.dispatchEvent(new Event('input'));
    sendMessage();
}

// ============================
// Clear welcome screen
// ============================
function clearWelcome() {
    const welcome = chatArea.querySelector('.welcome-message');
    if (welcome) {
        welcome.style.animation = 'fadeOut 0.2s ease-out forwards';
        setTimeout(() => welcome.remove(), 200);
    }
}

// ============================
// Create message bubble
// ============================
function createMessage(text, type) {
    const msg = document.createElement('div');
    msg.className = `message ${type}`;

    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.textContent = type === 'user' ? '👤' : '✦';

    const content = document.createElement('div');
    content.className = 'message-content';
    content.textContent = text;

    msg.appendChild(avatar);
    msg.appendChild(content);
    chatArea.appendChild(msg);
    scrollToBottom();
}

// ============================
// Typing indicator
// ============================
function showTyping() {
    const typing = document.createElement('div');
    typing.className = 'typing-indicator';
    typing.id = 'typingIndicator';

    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.style.background = 'var(--bg-card)';
    avatar.style.border = '1px solid var(--border)';
    avatar.textContent = '✦';

    const dots = document.createElement('div');
    dots.className = 'typing-dots';
    dots.innerHTML = '<span></span><span></span><span></span>';

    typing.appendChild(avatar);
    typing.appendChild(dots);
    chatArea.appendChild(typing);
    scrollToBottom();
}

function hideTyping() {
    const typing = document.getElementById('typingIndicator');
    if (typing) typing.remove();
}

// ============================
// Scroll to bottom
// ============================
function scrollToBottom() {
    requestAnimationFrame(() => {
        chatArea.scrollTop = chatArea.scrollHeight;
    });
}

// ============================
// Send message
// ============================
async function sendMessage() {
    const text = userInput.value.trim();
    if (!text || isWaiting) return;

    // Clear welcome & add user message
    clearWelcome();
    createMessage(text, 'user');

    // Reset input
    userInput.value = '';
    userInput.style.height = 'auto';

    // Disable input while waiting
    isWaiting = true;
    sendBtn.disabled = true;
    userInput.disabled = true;
    showTyping();

    try {
        const response = await fetch(`/user_input?user_input=${encodeURIComponent(text)}`, {
            method: 'POST',
        });

        hideTyping();

        if (!response.ok) {
            throw new Error(`Server error (${response.status})`);
        }

        const data = await response.json();
        
        // Handle different response types
        if (typeof data === 'string') {
            createMessage(data, 'assistant');
        } else if (data && typeof data === 'object') {
            // If the response is an object (e.g. AIMessage), extract content
            const content = data.content || data.text || JSON.stringify(data, null, 2);
            createMessage(content, 'assistant');
        } else {
            createMessage(String(data), 'assistant');
        }
    } catch (err) {
        hideTyping();
        createMessage(`⚠ Something went wrong: ${err.message}`, 'error');
    } finally {
        isWaiting = false;
        sendBtn.disabled = false;
        userInput.disabled = false;
        userInput.focus();
    }
}

// ============================
// Focus input on load
// ============================
window.addEventListener('DOMContentLoaded', () => {
    userInput.focus();
});

// Fade-out helper keyframe (injected for welcome removal)
const style = document.createElement('style');
style.textContent = `@keyframes fadeOut { to { opacity: 0; transform: translateY(-10px); } }`;
document.head.appendChild(style);
