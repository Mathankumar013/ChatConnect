/**
 * ============================================================================
 * ChatConnect - Real-Time Chat Application (WhatsApp-Inspired UI)
 * Module: chat.js (Conversations List, Filters, Mobile View Switcher)
 * ============================================================================
 */

// Initial Mock Conversations
const INITIAL_CONVERSATIONS = [
  {
    id: 'conv_1',
    type: 'direct',
    name: 'Sarah Connor',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    userId: 'usr_sarah_02',
    lastMessage: 'Hey! Did you check the new wireframes?',
    lastMessageTime: '10:45 AM',
    lastMessageStatus: 'read',
    unreadCount: 2,
    isOnline: true,
    lastSeen: 'online',
    isFavorite: true,
    isPinned: true
  },
  {
    id: 'conv_2',
    type: 'direct',
    name: 'Alex Morgan',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    userId: 'usr_alex_03',
    lastMessage: 'The API endpoint is ready on port 5000 🚀',
    lastMessageTime: '09:30 AM',
    lastMessageStatus: 'read',
    unreadCount: 0,
    isOnline: true,
    lastSeen: 'online',
    isFavorite: false,
    isPinned: true
  },
  {
    id: 'conv_3',
    type: 'group',
    name: 'Tech Innovators Group',
    avatar: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=150&auto=format&fit=crop&q=80',
    userId: null,
    lastMessage: 'Elena: Released v2.0 update! Check it out.',
    lastMessageTime: 'Yesterday',
    lastMessageStatus: 'delivered',
    unreadCount: 5,
    isOnline: true,
    lastSeen: '5 members online',
    isFavorite: true,
    isPinned: false
  },
  {
    id: 'conv_4',
    type: 'direct',
    name: 'Priya Sharma',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    userId: 'usr_priya_04',
    lastMessage: 'Let me know when you are free for a call.',
    lastMessageTime: 'Yesterday',
    lastMessageStatus: 'read',
    unreadCount: 0,
    isOnline: false,
    lastSeen: 'yesterday at 5:45 PM',
    isFavorite: true,
    isPinned: false
  },
  {
    id: 'conv_5',
    type: 'direct',
    name: 'David Miller',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    userId: 'usr_david_05',
    lastMessage: 'Sounds good, see you tomorrow!',
    lastMessageTime: 'Monday',
    lastMessageStatus: 'read',
    unreadCount: 0,
    isOnline: true,
    lastSeen: 'online',
    isFavorite: false,
    isPinned: false
  },
  {
    id: 'conv_6',
    type: 'direct',
    name: 'Elena Rostova',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    userId: 'usr_elena_06',
    lastMessage: 'Can you review the color palette?',
    lastMessageTime: '24/10/2026',
    lastMessageStatus: 'sent',
    unreadCount: 0,
    isOnline: false,
    lastSeen: '24/10/2026',
    isFavorite: false,
    isPinned: false
  }
];

class ChatService {
  constructor() {
    this.conversations = this.loadConversations();
    this.activeConversationId = null;
    this.currentFilter = 'all'; // 'all' | 'unread' | 'favorites' | 'groups'
    this.searchQuery = '';
  }

  /**
   * Load stored conversations from localStorage or initialize defaults
   */
  loadConversations() {
    const raw = localStorage.getItem(API_CONFIG.STORAGE_KEYS.CHATS);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch (e) {
        console.error('Failed to parse stored conversations:', e);
      }
    }
    localStorage.setItem(API_CONFIG.STORAGE_KEYS.CHATS, JSON.stringify(INITIAL_CONVERSATIONS));
    return INITIAL_CONVERSATIONS;
  }

  /**
   * Persist conversations to localStorage
   */
  saveConversations() {
    localStorage.setItem(API_CONFIG.STORAGE_KEYS.CHATS, JSON.stringify(this.conversations));
  }

  /**
   * Filter and search conversations
   */
  getFilteredConversations() {
    return this.conversations.filter(c => {
      // 1. Tab Filter check
      if (this.currentFilter === 'unread' && c.unreadCount <= 0) return false;
      if (this.currentFilter === 'favorites' && !c.isFavorite) return false;
      if (this.currentFilter === 'groups' && c.type !== 'group') return false;

      // 2. Search query check
      if (this.searchQuery.trim()) {
        const query = this.searchQuery.toLowerCase().trim();
        const matchesName = c.name.toLowerCase().includes(query);
        const matchesMsg = c.lastMessage.toLowerCase().includes(query);
        return matchesName || matchesMsg;
      }

      return true;
    });
  }

  /**
   * Get conversation by ID
   */
  getConversationById(id) {
    return this.conversations.find(c => c.id === id) || null;
  }

  /**
   * Mark conversation as read (clears unread badge)
   */
  markAsRead(conversationId) {
    const conv = this.getConversationById(conversationId);
    if (conv && conv.unreadCount > 0) {
      conv.unreadCount = 0;
      this.saveConversations();
      this.renderConversationList();
    }
  }

  /**
   * Toggle favorite state of conversation
   */
  toggleFavorite(conversationId) {
    const conv = this.getConversationById(conversationId);
    if (conv) {
      conv.isFavorite = !conv.isFavorite;
      this.saveConversations();
      this.renderConversationList();
    }
  }

  /**
   * Start a new chat or open existing one with a selected user
   */
  startChatWithUser(userId) {
    // Check if conversation already exists
    let existing = this.conversations.find(c => c.userId === userId);
    if (existing) {
      this.selectConversation(existing.id);
      return;
    }

    // Lookup user info
    const user = (window.userService ? window.userService.users : []).find(u => u.id === userId);
    if (!user) return;

    const newConv = {
      id: 'conv_' + Date.now(),
      type: 'direct',
      name: user.name,
      avatar: user.avatar,
      userId: user.id,
      lastMessage: 'Conversation started',
      lastMessageTime: 'Just now',
      lastMessageStatus: 'read',
      unreadCount: 0,
      isOnline: user.isOnline,
      lastSeen: user.lastSeen || 'online',
      isFavorite: false,
      isPinned: false
    };

    this.conversations.unshift(newConv);
    this.saveConversations();
    this.renderConversationList();
    this.selectConversation(newConv.id);
  }

  /**
   * Updates last message snippet for a conversation
   */
  updateLastMessage(conversationId, text, time, status = 'sent') {
    const conv = this.getConversationById(conversationId);
    if (conv) {
      conv.lastMessage = text;
      conv.lastMessageTime = time;
      conv.lastMessageStatus = status;

      // Bring active conversation to top of list
      this.conversations = [
        conv,
        ...this.conversations.filter(c => c.id !== conversationId)
      ];

      this.saveConversations();
      this.renderConversationList();
    }
  }

  /**
   * Select a conversation and activate chat view
   */
  selectConversation(conversationId) {
    this.activeConversationId = conversationId;
    this.markAsRead(conversationId);

    // Update active highlight in sidebar
    const items = document.querySelectorAll('.conversation-item');
    items.forEach(el => {
      if (el.getAttribute('data-id') === conversationId) {
        el.classList.add('active');
      } else {
        el.classList.remove('active');
      }
    });

    // Notify Messages Service to load message history
    if (window.messagesService) {
      window.messagesService.loadConversationMessages(conversationId);
    }

    // Hide welcome placeholder & show active chat wrapper
    const welcome = document.getElementById('welcomeScreen');
    const activeChat = document.getElementById('activeChatWrapper');
    if (welcome) welcome.style.display = 'none';
    if (activeChat) activeChat.style.display = 'flex';

    // MOBILE RESPONSIVENESS:
    // On mobile screens, activate full-screen chat screen
    const appWindow = document.getElementById('appWindow');
    if (appWindow) {
      appWindow.classList.add('mobile-chat-active');
    }
  }

  /**
   * Close conversation (Used by Mobile Back Button)
   */
  closeActiveConversation() {
    const appWindow = document.getElementById('appWindow');
    if (appWindow) {
      appWindow.classList.remove('mobile-chat-active');
    }
  }

  /**
   * Render conversations list in sidebar
   */
  renderConversationList() {
    const container = document.getElementById('conversationListContainer');
    if (!container) return;

    const list = this.getFilteredConversations();

    if (list.length === 0) {
      container.innerHTML = `
        <div class="empty-list-state">
          <i class="fa-solid fa-comments"></i>
          <p>No conversations found</p>
        </div>
      `;
      return;
    }

    container.innerHTML = list.map(c => {
      const isActive = c.id === this.activeConversationId;
      const tickIcon = c.lastMessageStatus === 'read' 
        ? '<i class="fa-solid fa-check-double status-tick read"></i>' 
        : c.lastMessageStatus === 'delivered'
        ? '<i class="fa-solid fa-check-double status-tick delivered"></i>'
        : '<i class="fa-solid fa-check status-tick sent"></i>';

      return `
        <div class="conversation-item ${isActive ? 'active' : ''}" data-id="${c.id}">
          <div class="conversation-avatar-wrap">
            <img src="${c.avatar}" alt="${c.name}" class="conversation-avatar" onerror="this.src='https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'"/>
            ${c.isOnline ? '<span class="online-indicator"></span>' : ''}
          </div>
          <div class="conversation-info">
            <div class="conversation-top-row">
              <span class="conversation-name">${c.name}</span>
              <span class="conversation-time">${c.lastMessageTime}</span>
            </div>
            <div class="conversation-bottom-row">
              <span class="conversation-last-msg">
                ${c.lastMessageStatus ? tickIcon : ''}
                <span>${c.lastMessage}</span>
              </span>
              <div class="conversation-badges">
                ${c.isFavorite ? '<i class="fa-solid fa-star favorite-star-icon"></i>' : ''}
                ${c.isPinned ? '<i class="fa-solid fa-thumbtack pinned-icon"></i>' : ''}
                ${c.unreadCount > 0 ? `<span class="unread-count-badge">${c.unreadCount}</span>` : ''}
              </div>
            </div>
          </div>
        </div>
      `;
    }).join('');

    // Attach click handlers to each conversation item
    container.querySelectorAll('.conversation-item').forEach(item => {
      item.addEventListener('click', () => {
        const id = item.getAttribute('data-id');
        this.selectConversation(id);
      });
    });
  }
}

// Export singleton
window.chatService = new ChatService();

/* --------------------------------------------------------------------------
   Sidebar Filter Tabs & Search Event Listeners
   -------------------------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {
  // Initial render of conversations
  window.chatService.renderConversationList();

  // Filter Buttons / Pills (All, Unread, Favorites, Groups)
  const filterPills = document.querySelectorAll('.filter-pill');
  filterPills.forEach(pill => {
    pill.addEventListener('click', () => {
      filterPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');

      const filterType = pill.getAttribute('data-filter');
      window.chatService.currentFilter = filterType;
      window.chatService.renderConversationList();
    });
  });

  // Sidebar Conversation Search Bar
  const searchInput = document.getElementById('sidebarSearchInput');
  const clearBtn = document.getElementById('searchClearBtn');

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const val = e.target.value;
      window.chatService.searchQuery = val;
      window.chatService.renderConversationList();

      if (clearBtn) {
        if (val.trim()) {
          clearBtn.classList.add('visible');
        } else {
          clearBtn.classList.remove('visible');
        }
      }
    });
  }

  if (clearBtn && searchInput) {
    clearBtn.addEventListener('click', () => {
      searchInput.value = '';
      window.chatService.searchQuery = '';
      clearBtn.classList.remove('visible');
      window.chatService.renderConversationList();
      searchInput.focus();
    });
  }

  // Mobile Back Button (Returns from full-screen chat to conversation list)
  const backBtn = document.getElementById('chatBackBtn');
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      window.chatService.closeActiveConversation();
    });
  }
});
