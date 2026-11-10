/**
 * ============================================================================
 * ChatConnect - Real-Time Chat Application (WhatsApp-Inspired UI)
 * Module: app.js (Main Application Orchestrator, Theme & Global Listeners)
 * ============================================================================
 */

class AppController {
  constructor() {
    this.currentTheme = localStorage.getItem(API_CONFIG.STORAGE_KEYS.THEME) || 'light';
  }

  /**
   * Initializes the application UI and services
   */
  init() {
    this.applyTheme(this.currentTheme);
    this.initCurrentUserHeader();
    this.setupDropdowns();
    this.setupModals();
    this.setupCallSimulator();
    this.setupMobileNavigation();
    this.setupThemeToggle();

    // Connect real-time socket (or simulation bus)
    if (window.socketService) {
      window.socketService.connect();
    }

    // Auto-select first conversation on desktop for seamless preview
    if (window.innerWidth >= 768 && window.chatService && window.chatService.conversations.length > 0) {
      const firstConv = window.chatService.conversations[0];
      window.chatService.selectConversation(firstConv.id);
    }
  }

  /**
   * Update sidebar header with current user details
   */
  initCurrentUserHeader() {
    const user = window.authService ? window.authService.getCurrentUser() : null;
    if (!user) return;

    const userAvatar = document.getElementById('sidebarUserAvatar');
    if (userAvatar) {
      userAvatar.src = user.avatar;
      userAvatar.alt = user.name;
    }
  }

  /**
   * Apply Theme (Light / Dark)
   */
  applyTheme(theme) {
    this.currentTheme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(API_CONFIG.STORAGE_KEYS.THEME, theme);

    // Update theme toggle icons
    const themeIcons = document.querySelectorAll('.theme-toggle-icon');
    themeIcons.forEach(icon => {
      if (theme === 'dark') {
        icon.className = 'fa-solid fa-sun theme-toggle-icon';
      } else {
        icon.className = 'fa-solid fa-moon theme-toggle-icon';
      }
    });
  }

  /**
   * Toggle between Light and Dark mode
   */
  toggleTheme() {
    const newTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
    this.applyTheme(newTheme);
    this.showToast(`Switched to ${newTheme} theme`);
  }

  /**
   * Setup Theme Toggle Buttons
   */
  setupThemeToggle() {
    const toggleBtns = document.querySelectorAll('.theme-toggle-btn');
    toggleBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        this.toggleTheme();
      });
    });
  }

  /**
   * Setup 3-dot Menu Dropdowns
   */
  setupDropdowns() {
    // Sidebar Header Dropdown
    const sidebarMenuBtn = document.getElementById('sidebarMenuBtn');
    const sidebarDropdown = document.getElementById('sidebarDropdown');

    if (sidebarMenuBtn && sidebarDropdown) {
      sidebarMenuBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        sidebarDropdown.classList.toggle('show');
        const chatDropdown = document.getElementById('chatDropdown');
        if (chatDropdown) chatDropdown.classList.remove('show');
      });
    }

    // Chat Header Dropdown
    const chatMenuBtn = document.getElementById('chatMenuBtn');
    const chatDropdown = document.getElementById('chatDropdown');

    if (chatMenuBtn && chatDropdown) {
      chatMenuBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        chatDropdown.classList.toggle('show');
        if (sidebarDropdown) sidebarDropdown.classList.remove('show');
      });
    }

    // Close dropdowns on outside click
    document.addEventListener('click', () => {
      if (sidebarDropdown) sidebarDropdown.classList.remove('show');
      if (chatDropdown) chatDropdown.classList.remove('show');
    });

    // Sidebar Menu Item Actions
    const menuProfileBtn = document.getElementById('menuProfileBtn');
    if (menuProfileBtn) {
      menuProfileBtn.addEventListener('click', () => {
        window.location.href = 'profile.html';
      });
    }

    const menuLogoutBtn = document.getElementById('menuLogoutBtn');
    if (menuLogoutBtn) {
      menuLogoutBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to log out?')) {
          window.authService.logout();
        }
      });
    }

    const menuThemeToggleBtn = document.getElementById('menuThemeToggleBtn');
    if (menuThemeToggleBtn) {
      menuThemeToggleBtn.addEventListener('click', () => {
        this.toggleTheme();
      });
    }

    const menuStarredBtn = document.getElementById('menuStarredBtn');
    if (menuStarredBtn) {
      menuStarredBtn.addEventListener('click', () => {
        this.showToast('Starred messages feature is active!');
      });
    }

    // Chat Header Menu Item Actions
    const clearChatBtn = document.getElementById('menuClearChatBtn');
    if (clearChatBtn) {
      clearChatBtn.addEventListener('click', () => {
        const convId = window.chatService.activeConversationId;
        if (convId && confirm('Clear all messages in this conversation?')) {
          window.messagesService.messages[convId] = [];
          window.messagesService.saveMessages();
          window.messagesService.renderMessages(convId);
          this.showToast('Chat cleared');
        }
      });
    }

    const contactInfoBtn = document.getElementById('menuContactInfoBtn');
    if (contactInfoBtn) {
      contactInfoBtn.addEventListener('click', () => {
        this.openContactInfoModal();
      });
    }
  }

  /**
   * Setup Modals (User Search & New Chat)
   */
  setupModals() {
    const userSearchModal = document.getElementById('userSearchModal');
    const openSearchBtns = [
      document.getElementById('newChatBtn'),
      document.getElementById('mobileFabNewChat')
    ];
    const closeModalBtn = document.getElementById('closeUserSearchModal');

    openSearchBtns.forEach(btn => {
      if (btn && userSearchModal) {
        btn.addEventListener('click', () => {
          userSearchModal.classList.add('show');
          const input = document.getElementById('userSearchModalInput');
          if (input) {
            input.value = '';
            input.focus();
            input.dispatchEvent(new Event('input'));
          }
        });
      }
    });

    if (closeModalBtn && userSearchModal) {
      closeModalBtn.addEventListener('click', () => {
        userSearchModal.classList.remove('show');
      });
    }

    // Close on overlay click or ESC
    if (userSearchModal) {
      userSearchModal.addEventListener('click', (e) => {
        if (e.target === userSearchModal) {
          userSearchModal.classList.remove('show');
        }
      });
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const modals = document.querySelectorAll('.modal-overlay');
        modals.forEach(m => m.classList.remove('show'));
      }
    });
  }

  /**
   * Setup Audio / Video Call Simulation Modal
   */
  setupCallSimulator() {
    const voiceCallBtn = document.getElementById('voiceCallBtn');
    const videoCallBtn = document.getElementById('videoCallBtn');
    const callModal = document.getElementById('callSimulatorModal');
    const endCallBtn = document.getElementById('endCallBtn');
    const callUserName = document.getElementById('callUserName');
    const callAvatar = document.getElementById('callAvatar');
    const callStatus = document.getElementById('callStatusText');

    let callTimerInterval = null;

    const launchCall = (isVideo = false) => {
      const conv = window.chatService.getConversationById(window.chatService.activeConversationId);
      if (!conv) return;

      if (callUserName) callUserName.textContent = conv.name;
      if (callAvatar) callAvatar.src = conv.avatar;
      if (callStatus) callStatus.textContent = isVideo ? 'Starting video call...' : 'Calling...';

      if (callModal) callModal.classList.add('show');

      // Simulate ringing and answer
      setTimeout(() => {
        if (callStatus) callStatus.textContent = 'Ringing...';
      }, 1200);

      setTimeout(() => {
        let sec = 0;
        if (callStatus) callStatus.textContent = '00:00';
        callTimerInterval = setInterval(() => {
          sec++;
          const mins = String(Math.floor(sec / 60)).padStart(2, '0');
          const secs = String(sec % 60).padStart(2, '0');
          if (callStatus) callStatus.textContent = `${mins}:${secs}`;
        }, 1000);
      }, 3000);
    };

    if (voiceCallBtn) {
      voiceCallBtn.addEventListener('click', () => launchCall(false));
    }

    if (videoCallBtn) {
      videoCallBtn.addEventListener('click', () => launchCall(true));
    }

    if (endCallBtn && callModal) {
      endCallBtn.addEventListener('click', () => {
        clearInterval(callTimerInterval);
        if (callStatus) callStatus.textContent = 'Call Ended';
        setTimeout(() => {
          callModal.classList.remove('show');
        }, 600);
      });
    }
  }

  /**
   * Open Contact Info Drawer / Modal
   */
  openContactInfoModal() {
    const conv = window.chatService.getConversationById(window.chatService.activeConversationId);
    if (!conv) return;

    alert(`Contact Info:\nName: ${conv.name}\nStatus: ${conv.lastSeen}\nEnd-to-End Encrypted`);
  }

  /**
   * Setup Mobile Bottom Navigation Tabs (Chats, Updates, Communities, Calls, Profile)
   */
  setupMobileNavigation() {
    const navItems = document.querySelectorAll('.nav-tab-item');
    navItems.forEach(tab => {
      tab.addEventListener('click', () => {
        navItems.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        const tabType = tab.getAttribute('data-tab');
        if (tabType === 'profile') {
          window.location.href = 'profile.html';
        } else if (tabType === 'chats') {
          window.chatService.closeActiveConversation();
        } else {
          this.showToast(`${tab.innerText.trim()} section ready for backend sync.`);
        }
      });
    });
  }

  /**
   * Reusable Toast Notification Message
   */
  showToast(message, type = 'info') {
    let container = document.getElementById('toastContainer');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toastContainer';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast ${type === 'error' ? 'toast-error' : 'toast-success'}`;
    toast.innerHTML = `
      <i class="fa-solid ${type === 'error' ? 'fa-circle-exclamation' : 'fa-circle-check'}"></i>
      <span>${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.25s ease';
      setTimeout(() => toast.remove(), 250);
    }, 3200);
  }
}

// Global App Instance
window.appController = new AppController();

// Boot application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.appController.init();
});

