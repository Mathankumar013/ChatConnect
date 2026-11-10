/**
 * ============================================================================
 * ChatConnect - Real-Time Chat Application (WhatsApp-Inspired UI)
 * Module: messages.js (Chat Messages, Input Area, Emojis, Audio Simulator)
 * ============================================================================
 */

// Initial Mock Messages per Conversation
const INITIAL_MESSAGES = {
  conv_1: [
    {
      id: 'm1_1',
      senderId: 'usr_sarah_02',
      isOutgoing: false,
      text: 'Hi Mathan! Welcome to the new ChatConnect design project 👋',
      timestamp: '10:30 AM',
      date: 'TODAY',
      status: 'read'
    },
    {
      id: 'm1_2',
      senderId: 'usr_mathan_01',
      isOutgoing: true,
      text: 'Hey Sarah! Thanks. The WhatsApp-inspired styling is looking super clean and modern!',
      timestamp: '10:34 AM',
      date: 'TODAY',
      status: 'read'
    },
    {
      id: 'm1_3',
      senderId: 'usr_sarah_02',
      isOutgoing: false,
      text: 'Agreed! Did you check the new wireframes?',
      timestamp: '10:45 AM',
      date: 'TODAY',
      status: 'read'
    }
  ],
  conv_2: [
    {
      id: 'm2_1',
      senderId: 'usr_mathan_01',
      isOutgoing: true,
      text: 'Hey Alex, how is the backend preparation going?',
      timestamp: '09:15 AM',
      date: 'TODAY',
      status: 'read'
    },
    {
      id: 'm2_2',
      senderId: 'usr_alex_03',
      isOutgoing: false,
      text: 'All controllers and models are set up for Express, MongoDB, and Socket.IO!',
      timestamp: '09:25 AM',
      date: 'TODAY',
      status: 'read'
    },
    {
      id: 'm2_3',
      senderId: 'usr_alex_03',
      isOutgoing: false,
      text: 'The API endpoint is ready on port 5000 🚀',
      timestamp: '09:30 AM',
      date: 'TODAY',
      status: 'read'
    }
  ],
  conv_3: [
    {
      id: 'm3_1',
      senderId: 'usr_priya_04',
      senderName: 'Priya Sharma',
      isOutgoing: false,
      text: 'Team, please test the responsive layouts on tablet and mobile.',
      timestamp: '03:15 PM',
      date: 'YESTERDAY',
      status: 'read'
    },
    {
      id: 'm3_2',
      senderId: 'usr_elena_06',
      senderName: 'Elena Rostova',
      isOutgoing: false,
      text: 'Elena: Released v2.0 update! Check it out.',
      timestamp: '04:10 PM',
      date: 'YESTERDAY',
      status: 'delivered'
    }
  ],
  conv_4: [
    {
      id: 'm4_1',
      senderId: 'usr_priya_04',
      isOutgoing: false,
      text: 'Hi Mathan, let me know when you are free for a call.',
      timestamp: '05:40 PM',
      date: 'YESTERDAY',
      status: 'read'
    }
  ]
};

class MessagesService {
  constructor() {
    this.messages = this.loadStoredMessages();
    this.isRecording = false;
    this.recordTimer = null;
    this.recordSeconds = 0;
  }

  /**
   * Load stored messages from localStorage
   */
  loadStoredMessages() {
    const raw = localStorage.getItem(API_CONFIG.STORAGE_KEYS.MESSAGES);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch (e) {
        console.error('Failed to parse messages:', e);
      }
    }
    localStorage.setItem(API_CONFIG.STORAGE_KEYS.MESSAGES, JSON.stringify(INITIAL_MESSAGES));
    return INITIAL_MESSAGES;
  }

  /**
   * Save messages to localStorage
   */
  saveMessages() {
    localStorage.setItem(API_CONFIG.STORAGE_KEYS.MESSAGES, JSON.stringify(this.messages));
  }

  /**
   * Get messages for specific conversation
   */
  getConversationMessages(conversationId) {
    if (!this.messages[conversationId]) {
      this.messages[conversationId] = [];
    }
    return this.messages[conversationId];
  }

  /**
   * Load and render messages for active conversation
   */
  loadConversationMessages(conversationId) {
    const activeConv = window.chatService.getConversationById(conversationId);
    if (!activeConv) return;

    // 1. Populate Chat Header
    const avatar = document.getElementById('chatHeaderAvatar');
    const name = document.getElementById('chatHeaderName');
    const status = document.getElementById('chatHeaderStatus');

    if (avatar) avatar.src = activeConv.avatar;
    if (name) name.textContent = activeConv.name;
    if (status) {
      status.textContent = activeConv.isOnline ? 'online' : activeConv.lastSeen;
      status.className = 'chat-header-status' + (activeConv.isOnline ? ' online' : '');
    }

    // 2. Render Messages in Container
    this.renderMessages(conversationId);

    // 3. Clear message textarea and focus
    const textarea = document.getElementById('chatMessageInput');
    if (textarea) {
      textarea.value = '';
      this.updateInputButtonState();
    }
  }

  /**
   * Render message list grouped with date separators & encryption pill
   */
  renderMessages(conversationId) {
    const container = document.getElementById('chatMessagesContainer');
    if (!container) return;

    const msgList = this.getConversationMessages(conversationId);

    let html = `
      <div class="system-encryption-pill">
        <i class="fa-solid fa-lock"></i>
        Messages are end-to-end encrypted. No one outside of this chat, not even ChatConnect, can read or listen to them.
      </div>
    `;

    let lastDate = null;

    msgList.forEach(m => {
      // Date Separator Pill
      if (m.date && m.date !== lastDate) {
        html += `<div class="system-date-separator">${m.date}</div>`;
        lastDate = m.date;
      }

      const tickIcon = m.status === 'read'
        ? '<i class="fa-solid fa-check-double status-tick read"></i>'
        : m.status === 'delivered'
        ? '<i class="fa-solid fa-check-double status-tick delivered"></i>'
        : '<i class="fa-solid fa-check status-tick sent"></i>';

      const mediaHtml = m.mediaUrl ? `
        <div class="message-media-wrap">
          <img src="${m.mediaUrl}" alt="Media attachment" class="message-media-img"/>
        </div>
      ` : '';

      const senderNameHtml = m.senderName ? `
        <div class="message-sender">${m.senderName}</div>
      ` : '';

      const reactionsHtml = m.reaction ? `
        <div class="message-reactions">${m.reaction}</div>
      ` : '';

      html += `
        <div class="message-row ${m.isOutgoing ? 'outgoing' : 'incoming'}" id="${m.id}">
          <div class="message-bubble">
            ${senderNameHtml}
            ${mediaHtml}
            <span class="message-text">${this.escapeHtml(m.text || '')}</span>
            <span class="message-meta">
              <span>${m.timestamp}</span>
              ${m.isOutgoing ? tickIcon : ''}
            </span>
            ${reactionsHtml}
            <button class="message-actions-btn" title="React" data-msg-id="${m.id}">
              <i class="fa-regular fa-face-smile"></i>
            </button>
          </div>
        </div>
      `;
    });

    container.innerHTML = html;
    this.scrollToBottom();

    // Attach reaction buttons click
    container.querySelectorAll('.message-actions-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const msgId = btn.getAttribute('data-msg-id');
        this.addQuickReaction(conversationId, msgId, '❤️');
      });
    });
  }

  /**
   * Escape HTML to prevent XSS
   */
  escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  /**
   * Smoothly scrolls chat to latest message
   */
  scrollToBottom() {
    const container = document.getElementById('chatMessagesContainer');
    if (container) {
      setTimeout(() => {
        container.scrollTop = container.scrollHeight;
      }, 50);
    }
  }

  /**
   * Send text message
   */
  sendMessage(text, mediaUrl = null) {
    const conversationId = window.chatService.activeConversationId;
    if (!conversationId) return;

    const trimmedText = text.trim();
    if (!trimmedText && !mediaUrl) return;

    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newMsg = {
      id: 'msg_' + Date.now(),
      conversationId: conversationId,
      senderId: window.authService.getCurrentUser() ? window.authService.getCurrentUser().id : 'usr_mathan_01',
      isOutgoing: true,
      text: trimmedText,
      mediaUrl: mediaUrl,
      timestamp: timeString,
      date: 'TODAY',
      status: 'sent'
    };

    // Save message locally
    if (!this.messages[conversationId]) {
      this.messages[conversationId] = [];
    }
    this.messages[conversationId].push(newMsg);
    this.saveMessages();

    // Update conversation snippet in sidebar
    window.chatService.updateLastMessage(conversationId, trimmedText || '📷 Photo', timeString, 'sent');

    // Re-render and scroll
    this.renderMessages(conversationId);

    // Emit event to socket / server (with real-time simulation)
    window.socketService.emit('message:send', newMsg);
  }

  /**
   * Add reaction to a message
   */
  addQuickReaction(conversationId, messageId, emoji) {
    const msgs = this.getConversationMessages(conversationId);
    const msg = msgs.find(m => m.id === messageId);
    if (msg) {
      msg.reaction = msg.reaction === emoji ? null : emoji;
      this.saveMessages();
      this.renderMessages(conversationId);
    }
  }

  /**
   * Update message status tick dynamically (delivered, read)
   */
  updateMessageStatus(conversationId, messageId, status) {
    const msgs = this.getConversationMessages(conversationId);
    const msg = msgs.find(m => m.id === messageId);
    if (msg) {
      msg.status = status;
      this.saveMessages();
      if (window.chatService.activeConversationId === conversationId) {
        this.renderMessages(conversationId);
      }
    }
  }

  /**
   * Switch between Microphone and Send icon based on input content
   */
  updateInputButtonState() {
    const textarea = document.getElementById('chatMessageInput');
    const sendBtn = document.getElementById('sendOrMicBtn');
    if (!textarea || !sendBtn) return;

    if (textarea.value.trim().length > 0) {
      sendBtn.innerHTML = '<i class="fa-solid fa-paper-plane"></i>';
      sendBtn.title = 'Send message';
      sendBtn.setAttribute('data-mode', 'send');
    } else {
      sendBtn.innerHTML = '<i class="fa-solid fa-microphone"></i>';
      sendBtn.title = 'Hold to record voice message';
      sendBtn.setAttribute('data-mode', 'mic');
    }
  }

  /**
   * Start Simulated Audio Recording
   */
  startRecording() {
    this.isRecording = true;
    this.recordSeconds = 0;

    const inputWrap = document.querySelector('.chat-input-wrapper');
    const recordingBar = document.getElementById('recordingBar');
    const timerEl = document.getElementById('recordTimer');

    if (inputWrap) inputWrap.style.display = 'none';
    if (recordingBar) recordingBar.classList.add('active');

    this.recordTimer = setInterval(() => {
      this.recordSeconds++;
      const mins = Math.floor(this.recordSeconds / 60);
      const secs = this.recordSeconds % 60;
      if (timerEl) {
        timerEl.textContent = `${mins}:${secs < 10 ? '0' : ''}${secs}`;
      }
    }, 1000);
  }

  /**
   * Stop & Send Simulated Voice Message
   */
  stopRecording(send = true) {
    this.isRecording = false;
    clearInterval(this.recordTimer);

    const inputWrap = document.querySelector('.chat-input-wrapper');
    const recordingBar = document.getElementById('recordingBar');

    if (inputWrap) inputWrap.style.display = 'flex';
    if (recordingBar) recordingBar.classList.remove('active');

    if (send && this.recordSeconds > 0) {
      const duration = `${Math.floor(this.recordSeconds / 60)}:${this.recordSeconds % 60 < 10 ? '0' : ''}${this.recordSeconds % 60}`;
      this.sendMessage(`🎤 Voice message (${duration})`);
    }

    this.recordSeconds = 0;
  }
}

// Export singleton
window.messagesService = new MessagesService();

/* --------------------------------------------------------------------------
   Message Input & Real-Time Event Handlers
   -------------------------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {
  const textarea = document.getElementById('chatMessageInput');
  const sendOrMicBtn = document.getElementById('sendOrMicBtn');
  const emojiToggleBtn = document.getElementById('emojiToggleBtn');
  const emojiPicker = document.getElementById('emojiPickerContainer');
  const attachToggleBtn = document.getElementById('attachmentToggleBtn');
  const attachmentMenu = document.getElementById('attachmentMenu');
  const cancelRecordBtn = document.getElementById('cancelRecordBtn');

  // 1. Textarea Auto-Growing & Input Changes
  if (textarea) {
    textarea.addEventListener('input', () => {
      // Auto resize height up to 100px
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 100) + 'px';
      window.messagesService.updateInputButtonState();
    });

    // Enter sends message; Shift+Enter adds newline
    textarea.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        const text = textarea.value;
        if (text.trim()) {
          window.messagesService.sendMessage(text);
          textarea.value = '';
          textarea.style.height = 'auto';
          window.messagesService.updateInputButtonState();
          // Hide emoji/attachment popups
          if (emojiPicker) emojiPicker.classList.remove('show');
          if (attachmentMenu) attachmentMenu.classList.remove('show');
        }
      }
    });
  }

  // 2. Send or Microphone Button Click
  if (sendOrMicBtn) {
    sendOrMicBtn.addEventListener('click', () => {
      const mode = sendOrMicBtn.getAttribute('data-mode');
      if (mode === 'send') {
        if (textarea && textarea.value.trim()) {
          window.messagesService.sendMessage(textarea.value);
          textarea.value = '';
          textarea.style.height = 'auto';
          window.messagesService.updateInputButtonState();
          if (emojiPicker) emojiPicker.classList.remove('show');
          if (attachmentMenu) attachmentMenu.classList.remove('show');
        }
      } else {
        // Toggle Audio Recording simulation
        if (!window.messagesService.isRecording) {
          window.messagesService.startRecording();
        } else {
          window.messagesService.stopRecording(true);
        }
      }
    });
  }

  // Cancel Recording button
  if (cancelRecordBtn) {
    cancelRecordBtn.addEventListener('click', () => {
      window.messagesService.stopRecording(false);
    });
  }

  // 3. Emoji Picker Toggle & Emoji Insertion
  if (emojiToggleBtn && emojiPicker) {
    emojiToggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      emojiPicker.classList.toggle('show');
      if (attachmentMenu) attachmentMenu.classList.remove('show');
    });

    // Emojis click
    emojiPicker.querySelectorAll('.emoji-item').forEach(item => {
      item.addEventListener('click', () => {
        const emoji = item.textContent.trim();
        if (textarea) {
          textarea.value += emoji;
          textarea.focus();
          window.messagesService.updateInputButtonState();
        }
      });
    });
  }

  // 4. Attachment Menu Toggle & Action Items
  if (attachToggleBtn && attachmentMenu) {
    attachToggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      attachmentMenu.classList.toggle('show');
      if (emojiPicker) emojiPicker.classList.remove('show');
    });

    // Photos & Videos sample trigger
    const attachPhotosBtn = document.getElementById('attachPhotosBtn');
    if (attachPhotosBtn) {
      attachPhotosBtn.addEventListener('click', () => {
        attachmentMenu.classList.remove('show');
        // Sample photo send demo
        const samplePhotoUrl = 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=600&auto=format&fit=crop&q=80';
        window.messagesService.sendMessage('Sharing recent project artwork 🎨', samplePhotoUrl);
      });
    }

    // Document trigger
    const attachDocBtn = document.getElementById('attachDocumentBtn');
    if (attachDocBtn) {
      attachDocBtn.addEventListener('click', () => {
        attachmentMenu.classList.remove('show');
        window.messagesService.sendMessage('📄 Project_Specification_v2.pdf (1.4 MB)');
      });
    }
  }

  // Close popups on outside click
  document.addEventListener('click', (e) => {
    if (emojiPicker && !emojiPicker.contains(e.target) && e.target !== emojiToggleBtn) {
      emojiPicker.classList.remove('show');
    }
    if (attachmentMenu && !attachmentMenu.contains(e.target) && e.target !== attachToggleBtn) {
      attachmentMenu.classList.remove('show');
    }
  });

  // 5. Real-Time Socket Event Subscribers
  window.socketService.on('message:delivered', (data) => {
    window.messagesService.updateMessageStatus(data.conversationId, data.messageId, 'delivered');
  });

  window.socketService.on('message:read', (data) => {
    window.messagesService.updateMessageStatus(data.conversationId, data.messageId, 'read');
  });

  window.socketService.on('user:typing', (data) => {
    if (window.chatService.activeConversationId === data.conversationId) {
      const statusEl = document.getElementById('chatHeaderStatus');
      if (statusEl) {
        statusEl.textContent = 'typing...';
        statusEl.className = 'chat-header-status typing';
      }

      // Add typing indicator bubble to chat container
      const container = document.getElementById('chatMessagesContainer');
      if (container && !document.getElementById('typingIndicatorBubble')) {
        const typingEl = document.createElement('div');
        typingEl.id = 'typingIndicatorBubble';
        typingEl.className = 'message-row incoming typing-indicator-row';
        typingEl.innerHTML = `
          <div class="typing-bubble">
            <span class="typing-dot"></span>
            <span class="typing-dot"></span>
            <span class="typing-dot"></span>
          </div>
        `;
        container.appendChild(typingEl);
        window.messagesService.scrollToBottom();
      }
    }
  });

  window.socketService.on('user:stop_typing', (data) => {
    if (window.chatService.activeConversationId === data.conversationId) {
      const statusEl = document.getElementById('chatHeaderStatus');
      const conv = window.chatService.getConversationById(data.conversationId);
      if (statusEl && conv) {
        statusEl.textContent = conv.isOnline ? 'online' : conv.lastSeen;
        statusEl.className = 'chat-header-status' + (conv.isOnline ? ' online' : '');
      }

      const bubble = document.getElementById('typingIndicatorBubble');
      if (bubble) bubble.remove();
    }
  });

  window.socketService.on('message:received', (newMsg) => {
    const convId = newMsg.conversationId;
    if (!window.messagesService.messages[convId]) {
      window.messagesService.messages[convId] = [];
    }
    window.messagesService.messages[convId].push(newMsg);
    window.messagesService.saveMessages();

    // Update conversation snippet in sidebar
    window.chatService.updateLastMessage(convId, newMsg.text, newMsg.timestamp, 'read');

    // If chat is currently open, render immediately
    if (window.chatService.activeConversationId === convId) {
      window.messagesService.renderMessages(convId);
    }
  });
});

