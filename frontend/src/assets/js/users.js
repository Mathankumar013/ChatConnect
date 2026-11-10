/**
 * ============================================================================
 * ChatConnect - Real-Time Chat Application (WhatsApp-Inspired UI)
 * Module: users.js (User Directory API & Profile Controller)
 * ============================================================================
 */

// Initial Mock Users Catalog
const INITIAL_USERS = [
  {
    id: 'usr_sarah_02',
    name: 'Sarah Connor',
    username: 'sarah_c',
    email: 'sarah@example.com',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    about: 'Design is intelligence made visible ✨',
    phone: '+1 (555) 234-5678',
    isOnline: true,
    lastSeen: 'online'
  },
  {
    id: 'usr_alex_03',
    name: 'Alex Morgan',
    username: 'alex_dev',
    email: 'alex@example.com',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    about: 'Busy coding real-time chat engines 💻',
    phone: '+1 (555) 345-6789',
    isOnline: true,
    lastSeen: 'online'
  },
  {
    id: 'usr_priya_04',
    name: 'Priya Sharma',
    username: 'priya_s',
    email: 'priya@example.com',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    about: 'In a meeting | Urgent calls only 📞',
    phone: '+91 98111 22334',
    isOnline: false,
    lastSeen: 'today at 5:45 PM'
  },
  {
    id: 'usr_david_05',
    name: 'David Miller',
    username: 'david_m',
    email: 'david@example.com',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    about: 'Battery about to die 🪫',
    phone: '+44 20 7946 0912',
    isOnline: true,
    lastSeen: 'online'
  },
  {
    id: 'usr_elena_06',
    name: 'Elena Rostova',
    username: 'elena_art',
    email: 'elena@example.com',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    about: 'Can’t talk, ChatConnect only 🎨',
    phone: '+33 1 42 68 55 00',
    isOnline: false,
    lastSeen: 'yesterday at 11:20 PM'
  },
  {
    id: 'usr_marcus_07',
    name: 'Marcus Johnson',
    username: 'marcus_j',
    email: 'marcus@example.com',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    about: 'Available | Building the future 🚀',
    phone: '+1 (555) 789-0123',
    isOnline: true,
    lastSeen: 'online'
  }
];

class UserService {
  constructor() {
    this.users = this.loadUsers();
  }

  /**
   * Load users from localStorage or initialize defaults
   */
  loadUsers() {
    const stored = localStorage.getItem('chatconnect_all_users');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error('Failed to load users:', e);
      }
    }
    localStorage.setItem('chatconnect_all_users', JSON.stringify(INITIAL_USERS));
    return INITIAL_USERS;
  }

  /**
   * Search users by name, username, or about text
   */
  async searchUsers(query = '') {
    // 1. Try real backend API
    const response = await window.apiClient.get('/users/search', { q: query });
    if (response.success && response.data) {
      return response.data;
    }

    // 2. Local Fallback
    const term = query.toLowerCase().trim();
    if (!term) return this.users;

    return this.users.filter(u =>
      u.name.toLowerCase().includes(term) ||
      u.username.toLowerCase().includes(term) ||
      u.about.toLowerCase().includes(term)
    );
  }

  /**
   * Fetch single user by ID
   */
  async getUserById(id) {
    const response = await window.apiClient.get(`/users/${id}`);
    if (response.success && response.data) {
      return response.data;
    }
    return this.users.find(u => u.id === id) || null;
  }

  /**
   * Update user profile via API or local storage
   */
  async updateUserProfile(userData) {
    const response = await window.apiClient.put('/users/profile', userData);
    if (response.success && response.data) {
      window.authService.updateCurrentUser(response.data);
      return { success: true, user: response.data };
    }

    // Local Fallback
    const updated = window.authService.updateCurrentUser(userData);
    return { success: true, user: updated };
  }
}

// Export singleton
window.userService = new UserService();

/* --------------------------------------------------------------------------
   UI Controllers for User Search Modal & Profile Page
   -------------------------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {
  // 1. User Search Modal UI Controller
  const userSearchInput = document.getElementById('userSearchModalInput');
  const userResultsContainer = document.getElementById('userSearchResults');

  if (userSearchInput && userResultsContainer) {
    const renderResults = async (query = '') => {
      const results = await window.userService.searchUsers(query);
      if (results.length === 0) {
        userResultsContainer.innerHTML = `
          <div class="no-users-found">
            <i class="fa-solid fa-user-slash no-users-icon"></i>
            <p>No matching users found.</p>
          </div>
        `;
        return;
      }

      userResultsContainer.innerHTML = results.map(u => `
        <div class="user-result-item">
          <div class="user-result-left">
            <div class="user-avatar-container">
              <img src="${u.avatar}" alt="${u.name}" class="user-result-avatar" onerror="this.src='https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'"/>
              ${u.isOnline ? '<span class="avatar-badge-online"></span>' : ''}
            </div>
            <div>
              <div class="user-result-name">${u.name} <span class="user-handle">@${u.username}</span></div>
              <div class="user-result-status">${u.about}</div>
            </div>
          </div>
          <button class="start-chat-btn" data-user-id="${u.id}" data-user-name="${u.name}">
            <i class="fa-solid fa-comment"></i> Start Chat
          </button>
        </div>
      `).join('');

      // Attach "Start Chat" Click Handlers
      userResultsContainer.querySelectorAll('.start-chat-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const userId = btn.getAttribute('data-user-id');
          if (window.chatService) {
            window.chatService.startChatWithUser(userId);
          }
          // Close modal
          const modal = document.getElementById('userSearchModal');
          if (modal) modal.classList.remove('show');
        });
      });
    };

    // Initial render
    renderResults('');

    // Search on keyup
    userSearchInput.addEventListener('input', (e) => {
      renderResults(e.target.value);
    });
  }

  // 2. Profile Page (profile.html) Controller
  const profileForm = document.getElementById('profileForm');
  if (profileForm) {
    const user = window.authService.getCurrentUser();
    const avatarImg = document.getElementById('profileAvatarImg');
    const nameInput = document.getElementById('profileNameInput');
    const usernameInput = document.getElementById('profileUsernameInput');
    const emailInput = document.getElementById('profileEmailInput');
    const aboutInput = document.getElementById('profileAboutInput');
    const avatarUploadInput = document.getElementById('avatarUploadInput');

    // Populate current data
    if (user) {
      if (avatarImg) avatarImg.src = user.avatar;
      if (nameInput) nameInput.value = user.name || '';
      if (usernameInput) usernameInput.value = user.username || '';
      if (emailInput) emailInput.value = user.email || '';
      if (aboutInput) aboutInput.value = user.about || 'Available';
    }

    // Avatar upload / change demo
    if (avatarUploadInput && avatarImg) {
      avatarUploadInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            avatarImg.src = event.target.result;
          };
          reader.readAsDataURL(file);
        }
      });
    }

    // Preset About Status Chips
    const presetChips = document.querySelectorAll('.preset-chip');
    presetChips.forEach(chip => {
      chip.addEventListener('click', () => {
        if (aboutInput) {
          aboutInput.value = chip.textContent.trim();
        }
      });
    });

    // Save Profile Form Submission
    profileForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const saveBtn = document.getElementById('saveProfileBtn');
      if (saveBtn) {
        saveBtn.disabled = true;
        saveBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving...';
      }

      await window.userService.updateUserProfile({
        name: nameInput.value.trim(),
        username: usernameInput.value.trim(),
        about: aboutInput.value.trim(),
        avatar: avatarImg ? avatarImg.src : user.avatar
      });

      if (saveBtn) {
        saveBtn.disabled = false;
        saveBtn.innerHTML = '<i class="fa-solid fa-check"></i> Changes Saved!';
        setTimeout(() => {
          saveBtn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Save Changes';
        }, 2000);
      }

      alert('Profile updated successfully!');
    });

    // Profile Logout Button
    const logoutBtn = document.getElementById('profileLogoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to log out of ChatConnect?')) {
          window.authService.logout();
        }
      });
    }

    // Profile Page Theme Toggle
    const profileThemeToggle = document.getElementById('profileThemeToggleBtn');
    const savedTheme = localStorage.getItem('chatconnect_theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);

    if (profileThemeToggle) {
      profileThemeToggle.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('chatconnect_theme', next);
        const icon = profileThemeToggle.querySelector('i');
        if (icon) {
          icon.className = next === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
        }
      });
    }
  }
});
