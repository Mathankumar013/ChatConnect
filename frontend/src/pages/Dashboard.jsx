import { useEffect, useRef, useState } from "react";
import Header from "../component/header";
import api from '../assets/js/api';
import socket from '../assets/js/socket';
import { toast } from "react-toastify";
import noUser from '../assets/images/noUser.png';
import Message from "../component/Message";
import { userData } from "../slice/slice";
import { useDispatch, useSelector } from "react-redux";

export default function Dashboard() {
    const [searchUserName, setSearchUserName] = useState('');
    const [allUsers, setAllUsers] = useState([]);
    const [messages, setMessages] = useState([]);
    const [conversations, setConversations] = useState([]);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [activeClass, setActiveClass] = useState(null);

    const selectedUser = useSelector((state) => state.chat.user);

    const dispatch = useDispatch()

    const bottomRef = useRef(null);

    useEffect(() => {
        const token = localStorage.getItem('token');

        if (!token) return;

        socket.auth = { token };

        socket.connect();

        socket.on('onlineUsers', (users) => {
            setOnlineUsers(users);
        });

        return () => {
            socket.off('onlineUsers');
            socket.disconnect();
        };
    }, [])


    async function handleSearch(event) {
        setSearchUserName(event);

        try {
            const response = await api.get(`/api/search?username=${event}`);
            setConversations(response.data);
        } catch (err) {
            toast.error(err.response?.data?.message)
        }
    }

    function formatLastSeen(date) {
        if (!date) return 'offline';

        const lastSeenDate = new Date(date);
        const now = new Date();

        const isToday =
            lastSeenDate.getDate() === now.getDate() &&
            lastSeenDate.getMonth() === now.getMonth() &&
            lastSeenDate.getFullYear() === now.getFullYear();

        const yesterday = new Date();
        yesterday.setDate(now.getDate() - 1);

        const isYesterday =
            lastSeenDate.getDate() === yesterday.getDate() &&
            lastSeenDate.getMonth() === yesterday.getMonth() &&
            lastSeenDate.getFullYear() === yesterday.getFullYear();

        if (isToday) {
            return lastSeenDate.toLocaleTimeString('en-IN', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            });
        }

        if (isYesterday) {
            return 'Yesterday';
        }

        return lastSeenDate.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    }

    useEffect(() => {
        async function loadSidebar() {
            try {
                const [usersResponse, conversationsResponse] = await Promise.all([
                    api.get("/api/search?username="),
                    api.get("/api/conversations")
                ]);

                const users = Array.isArray(usersResponse.data)
                    ? usersResponse.data
                    : usersResponse.data?.data || [];

                const chats = Array.isArray(conversationsResponse.data)
                    ? conversationsResponse.data
                    : conversationsResponse.data?.data || [];

                setAllUsers(users);
                setConversations(chats);

            } catch (err) {
                console.log("Sidebar error:", err.response?.data || err);
                toast.error("Failed to load sidebar users");
            }
        }

        loadSidebar();
    }, []);

    // Load selected user's conversation
    useEffect(() => {
    if (!selectedUser?._id) {
        setMessages([]);
        return;
    }

    let isActive = true;

    // Clear previous user's messages immediately
    setMessages([]);

    async function loadMessages() {
        try {
            const response = await api.get(
                `/api/messages/${selectedUser._id}`
            );

            if (!isActive) return;

            const fetchedMessages = Array.isArray(response.data)
                ? response.data
                : response.data?.data || [];

            // Load only the selected user's messages
            setMessages(
                fetchedMessages.sort(
                    (a, b) =>
                        new Date(a.createdAt) - new Date(b.createdAt)
                )
            );

        } catch (err) {
            if (isActive) {
                toast.error(
                    err.response?.data?.message || "Failed to load messages"
                );
            }
        }
    }

    loadMessages();

    return () => {
        isActive = false;
    };

}, [selectedUser?._id]);

    // Receive real-time messages
    useEffect(() => {
        function receiveMessage(newMessage) {

            const senderId =
                typeof newMessage.sender === "object"
                    ? newMessage.sender?._id
                    : newMessage.sender;

            // This event is sent to the receiver.
            // So the sender is the conversation partner.
            if (String(selectedUser?._id) === String(senderId)) {
                setMessages((prev) => {
                    const exists = prev.some(
                        (msg) => String(msg._id) === String(newMessage._id)
                    );

                    if (exists) return prev;

                    return [
                        ...prev,
                        { ...newMessage, isMine: false }
                    ];
                });
            }

            // Update sidebar, even if this is a new conversation
            setConversations((prev) => {
                const existingChat = prev.find(
                    (chat) => String(chat._id) === String(senderId)
                );

                const userInfo = allUsers.find(
                    (person) => String(person._id) === String(senderId)
                );

                const updatedChat = {
                    ...(existingChat || userInfo || { _id: senderId }),
                    lastMessage: newMessage.message,
                    lastMessageAt: newMessage.createdAt
                };

                const otherChats = prev.filter(
                    (chat) => String(chat._id) !== String(senderId)
                );

                return [updatedChat, ...otherChats];
            });
        }

        socket.on("newMessage", receiveMessage);

        return () => {
            socket.off("newMessage", receiveMessage);
        };
    }, [selectedUser?._id, allUsers]);

    // Automatically scroll to latest message
    useEffect(() => {
        bottomRef.current?.scrollIntoView({
            behavior: "smooth"
        });
    }, [messages]);

    // Format message time
    function formatTime(date) {
        return new Date(date).toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true
        });
    }

    const sidebarUsers = searchUserName.trim()
    ? allUsers.filter((person) =>
        person.userName?.toLowerCase().includes(searchUserName.toLowerCase())
    )
    : conversations;
    return (
        <>
            {/* Main Application Wrapper */}
            <div className="app-container">
                {/* Top Green Decorative Strip (Desktop WhatsApp Web Style) */}
                <div className="app-header-strip"></div>

                {/* Floating Desktop Window Frame / Full Screen on Mobile */}
                <div className="app-window" id="appWindow">

                    {/* ==================================================================
                    LEFT SIDEBAR (Width: ~380px)
           ================================================================== */}
                    <aside className="sidebar" id="sidebar">
                        <Header />
                        {/* 2. Search Bar */}
                        <div className="sidebar-search-box">
                            <div className="search-input-wrapper">
                                <i className="fa-solid fa-magnifying-glass"></i>
                                <input type="text" id="sidebarSearchInput" className="search-input"
                                    placeholder="Search or start new chat" autoComplete="off"
                                    value={searchUserName} onChange={(e) => handleSearch(e.target.value)} />
                                <button className="search-clear-btn" id="searchClearBtn" title="Clear Search">
                                    <i className="fa-solid fa-xmark"></i>
                                </button>
                            </div>
                        </div>
                        {/* 3. Filter Buttons / Pills */}
                        {/* <div className="sidebar-filters">
                            <button className="filter-pill active" data-filter="all">All</button>
                            <button className="filter-pill" data-filter="unread">Unread</button>
                            <button className="filter-pill" data-filter="favorites">Favorites</button>
                            <button className="filter-pill" data-filter="groups">Groups</button>
                        </div> */}

                        {/* 4. Conversations List */}
                        <div className="conversation-list-container" id="conversationListContainer">
                            {/* Dynamically populated by js/chat.js */}
                            {sidebarUsers.map((list) => {
                                const conversation = conversations.find(
                                    (chat) => String(chat._id) === String(list._id)
                                );

                                const isOnline = onlineUsers.includes(String(list._id));

                                return (
                                    <div
                                        className={`conversation-item ${activeClass === list._id ? "active" : ""
                                            }`}
                                        key={list._id}
                                        onClick={() => {
                                            setActiveClass(list._id);
                                            dispatch(userData(list));
                                        }}
                                    >
                                        <div className="conversation-avatar-wrap">
                                            <img
                                                src={list.profileImage || noUser}
                                                alt={list.userName}
                                                className="conversation-avatar"
                                            />

                                            {isOnline && (
                                                <span className="online-indicator"></span>
                                            )}
                                        </div>

                                        <div className="conversation-info">
                                            <div className="conversation-top-row">
                                                <span className="conversation-name">
                                                    {list.userName}
                                                </span>

                                                <span>
                                                    {isOnline
                                                        ? "online"
                                                        : list.lastSeen
                                                            ? `last seen ${formatLastSeen(list.lastSeen)}`
                                                            : "offline"}
                                                </span>
                                            </div>

                                            <div className="conversation-bottom-row">
                                                <span className="conversation-last-msg">
                                                    {conversation?.lastMessage || "Start a conversation"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Mobile Floating Action Button (FAB) for New Chat */}
                        <button className="mobile-fab-new-chat" id="mobileFabNewChat" title="New Chat" aria-label="New Chat">
                            <i className="fa-solid fa-message"></i>
                        </button>

                        {/* 5. Mobile Bottom Navigation Bar (WhatsApp Mobile) */}
                        <nav className="mobile-bottom-nav">
                            <div className="nav-tab-item active" data-tab="chats">
                                <i className="fa-solid fa-comments"></i>
                                <span>Chats</span>
                                <span className="nav-tab-badge">2</span>
                            </div>
                            <div className="nav-tab-item" data-tab="updates">
                                <i className="fa-regular fa-circle-dot"></i>
                                <span>Updates</span>
                            </div>
                            <div className="nav-tab-item" data-tab="communities">
                                <i className="fa-solid fa-people-group"></i>
                                <span>Communities</span>
                            </div>
                            <div className="nav-tab-item" data-tab="calls">
                                <i className="fa-solid fa-phone"></i>
                                <span>Calls</span>
                            </div>
                            <div className="nav-tab-item" data-tab="profile">
                                <i className="fa-regular fa-user"></i>
                                <span>Profile</span>
                            </div>
                        </nav>
                    </aside>

                    {/* ==================================================================
                    RIGHT CHAT AREA
           ================================================================== */}
                    <main className="chat-area" id="chatArea">
                        {!selectedUser && (
                            //  1. Welcome / Empty Placeholder Screen (WhatsApp Web style)
                            <div className="welcome-screen" id="welcomeScreen"
                                style={{ display: selectedUser ? 'none' : 'flex' }}>
                                <svg className="welcome-illustration" viewBox="0 0 320 220" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <circle cx="160" cy="110" r="85" fill="#E7FCE3" />
                                    <path d="M120 75H200C211.046 75 220 83.9543 220 95V135C220 146.046 211.046 155 200 155H150L125 175V155H120C108.954 155 100 146.046 100 135V95C100 83.9543 108.954 75 120 75Z" fill="#128C7E" />
                                    <circle cx="138" cy="115" r="7" fill="#FFFFFF" />
                                    <circle cx="160" cy="115" r="7" fill="#FFFFFF" />
                                    <circle cx="182" cy="115" r="7" fill="#FFFFFF" />
                                </svg>
                                <h2 className="welcome-title">ChatConnect for Web</h2>
                                <p className="welcome-subtitle">
                                    Send and receive real-time messages with friends and colleagues seamlessly across Desktop, Tablet, and Mobile.
                                </p>
                                <div className="welcome-encrypted">
                                    <i className="fa-solid fa-lock"></i>
                                    <span>End-to-end encrypted</span>
                                </div>
                            </div>
                        )}
                        {selectedUser && (
                            //  2. Active Chat Wrapper (Hidden by default until conversation selected) 
                            <div className="active-chat-wrapper" id="activeChatWrapper"
                                style={{ display: selectedUser ? 'flex' : 'none' }}>
                                {/* 2.1 Chat Header */}
                                <header className="chat-header">
                                    <div className="chat-header-left">
                                        {/* Mobile Back Button */}
                                        <button className="chat-back-btn" id="chatBackBtn" title="Back to conversations" aria-label="Back">
                                            <i className="fa-solid fa-arrow-left"></i>
                                        </button>

                                        {/* Contact Avatar */}
                                        <div className="chat-header-avatar-wrap">
                                            <img id="chatHeaderAvatar" src={selectedUser?.profileImage || noUser} alt="Contact Avatar" className="chat-header-avatar" />
                                        </div>

                                        {/* Contact Details */}
                                        <div className="chat-header-details">
                                            <span className="chat-header-name" id="chatHeaderName">{selectedUser.userName}</span>
                                            <span
                                                className={`chat-header-status ${onlineUsers.includes(selectedUser?._id)
                                                    ? 'online'
                                                    : 'offline'
                                                    }`}

                                            >
                                                {onlineUsers.includes(selectedUser?._id)
                                                    ? 'online'
                                                    : selectedUser?.lastSeen
                                                        ? `last seen ${formatLastSeen(selectedUser.lastSeen)}`
                                                        : 'offline'
                                                }
                                            </span>
                                        </div>
                                    </div>

                                    {/* Chat Action Buttons */}
                                    <div className="chat-header-actions">
                                        {/* Video Call */}
                                        <button className="icon-btn" id="videoCallBtn" title="Video Call" aria-label="Video Call">
                                            <i className="fa-solid fa-video"></i>
                                        </button>

                                        {/* Voice Call */}
                                        <button className="icon-btn" id="voiceCallBtn" title="Voice Call" aria-label="Voice Call">
                                            <i className="fa-solid fa-phone"></i>
                                        </button>


                                        {/* More Options Menu */}
                                        <div className="dropdown">
                                            <button className="icon-btn" id="chatMenuBtn" title="More options" aria-label="More options">
                                                <i className="fa-solid fa-ellipsis-vertical"></i>
                                            </button>
                                            <div className="dropdown-menu" id="chatDropdown">
                                                <button className="dropdown-item" id="menuContactInfoBtn">
                                                    <i className="fa-solid fa-circle-info"></i> Contact Info
                                                </button>
                                                <button className="dropdown-item" id="menuMuteBtn">
                                                    <i className="fa-solid fa-bell-slash"></i> Mute Notifications
                                                </button>
                                                <button className="dropdown-item" id="menuClearChatBtn">
                                                    <i className="fa-solid fa-trash-can"></i> Clear Chat
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </header>

                                {/* 2.2 Chat Messages Container */}
                                <div className="chat-messages-container" id="chatMessagesContainer">
                                    {/* Messages rendered dynamically by js/messages.js */}
                                    <div className="system-encryption-pill">
                                        <i className="fa-solid fa-lock"></i>
                                        Messages are end-to-end encrypted. No one outside of this chat, not even ChatConnect, can read or listen to them.
                                    </div>
                                    {messages.map((msg) => (
                                        <div
                                            key={msg._id}
                                            className={`message-row ${msg.isMine ? "outgoing" : "incoming"}`}
                                        >
                                            <div className="message-bubble">
                                                <span className="message-text">{msg.message}</span>

                                                <span className="message-meta">
                                                    <span>{formatTime(msg.createdAt)}</span>
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                    <div ref={bottomRef}></div>
                                </div>

                                {/* 2.3 Emoji Picker Popover */}
                                {/* <div className="emoji-picker-container" id="emojiPickerContainer">
                                    <div className="emoji-tabs">
                                        <span className="emoji-tab-btn active">😀</span>
                                        <span className="emoji-tab-btn">👋</span>
                                        <span className="emoji-tab-btn">❤️</span>
                                        <span className="emoji-tab-btn">🎉</span>
                                        <span className="emoji-tab-btn">💡</span>
                                    </div>
                                    <div className="emoji-grid">
                                        <span className="emoji-item">😀</span>
                                        <span className="emoji-item">😃</span>
                                        <span className="emoji-item">😄</span>
                                        <span className="emoji-item">😁</span>
                                        <span className="emoji-item">😆</span>
                                        <span className="emoji-item">😅</span>
                                        <span className="emoji-item">😂</span>
                                        <span className="emoji-item">🤣</span>
                                        <span className="emoji-item">😊</span>
                                        <span className="emoji-item">😇</span>
                                        <span className="emoji-item">🙂</span>
                                        <span className="emoji-item">🙃</span>
                                        <span className="emoji-item">😉</span>
                                        <span className="emoji-item">😌</span>
                                        <span className="emoji-item">😍</span>
                                        <span className="emoji-item">🥰</span>
                                        <span className="emoji-item">😘</span>
                                        <span className="emoji-item">😋</span>
                                        <span className="emoji-item">😛</span>
                                        <span className="emoji-item">😜</span>
                                        <span className="emoji-item">🤪</span>
                                        <span className="emoji-item">😎</span>
                                        <span className="emoji-item">🤩</span>
                                        <span className="emoji-item">🥳</span>
                                        <span className="emoji-item">😏</span>
                                        <span className="emoji-item">👍</span>
                                        <span className="emoji-item">👎</span>
                                        <span className="emoji-item">👌</span>
                                        <span className="emoji-item">✌️</span>
                                        <span className="emoji-item">🤞</span>
                                        <span className="emoji-item">🤟</span>
                                        <span className="emoji-item">🤝</span>
                                        <span className="emoji-item">👏</span>
                                        <span className="emoji-item">🙌</span>
                                        <span className="emoji-item">❤️</span>
                                        <span className="emoji-item">🧡</span>
                                        <span className="emoji-item">💛</span>
                                        <span className="emoji-item">💚</span>
                                        <span className="emoji-item">💙</span>
                                        <span className="emoji-item">💜</span>
                                        <span className="emoji-item">🔥</span>
                                        <span className="emoji-item">✨</span>
                                    </div>
                                </div> */}

                                {/* 2.4 Attachment Popover Menu */}
                                {/* <div className="attachment-menu" id="attachmentMenu">
                                    <div className="attachment-btn-option" id="attachPhotosBtn">
                                        <div className="attachment-icon-circle attach-photos">
                                            <i className="fa-solid fa-image"></i>
                                        </div>
                                        <span>Photos</span>
                                    </div>
                                    <div className="attachment-btn-option" id="attachCameraBtn">
                                        <div className="attachment-icon-circle attach-camera">
                                            <i className="fa-solid fa-camera"></i>
                                        </div>
                                        <span>Camera</span>
                                    </div>
                                    <div className="attachment-btn-option" id="attachDocumentBtn">
                                        <div className="attachment-icon-circle attach-document">
                                            <i className="fa-solid fa-file-lines"></i>
                                        </div>
                                        <span>Document</span>
                                    </div>
                                    <div className="attachment-btn-option" id="attachContactBtn">
                                        <div className="attachment-icon-circle attach-contact">
                                            <i className="fa-solid fa-user"></i>
                                        </div>
                                        <span>Contact</span>
                                    </div>
                                    <div className="attachment-btn-option" id="attachPollBtn">
                                        <div className="attachment-icon-circle attach-poll">
                                            <i className="fa-solid fa-chart-simple"></i>
                                        </div>
                                        <span>Poll</span>
                                    </div>
                                </div> */}

                                {/* 2.5 Message Input Bar */}
                                <Message
                                    onMessageSent={(newMessage) => {
                                        // Show message immediately in sender's chat
                                        setMessages((prev) => {
                                            const exists = prev.some(
                                                (msg) => String(msg._id) === String(newMessage._id)
                                            );

                                            if (exists) return prev;

                                            return [
                                                ...prev,
                                                { ...newMessage, isMine: true }
                                            ];
                                        });

                                        // Update sender's sidebar conversation
                                        const receiverId =
                                            typeof newMessage.receiver === "object"
                                                ? newMessage.receiver?._id
                                                : newMessage.receiver;

                                        setConversations((prev) => {
                                            const existingChat = prev.find(
                                                (chat) => String(chat._id) === String(receiverId)
                                            );

                                            const userInfo = allUsers.find(
                                                (person) => String(person._id) === String(receiverId)
                                            );

                                            const updatedChat = {
                                                ...(existingChat || userInfo || { _id: receiverId }),
                                                lastMessage: newMessage.message,
                                                lastMessageAt: newMessage.createdAt
                                            };

                                            return [
                                                updatedChat,
                                                ...prev.filter(
                                                    (chat) => String(chat._id) !== String(receiverId)
                                                )
                                            ];
                                        });
                                    }}
                                />
                            </div>
                        )}
                    </main>

                </div>
            </div>

            {/* ====================================================================
            MODALS
       ==================================================================== */}

            {/* 1. User Search & New Chat Modal */}
            <div className="modal-overlay" id="userSearchModal">
                <div className="modal-card">
                    <div className="modal-header">
                        <span className="modal-title">New Chat & User Search</span>
                        <button className="modal-close-btn" id="closeUserSearchModal">
                            <i className="fa-solid fa-xmark"></i>
                        </button>
                    </div>
                    <div className="modal-body">
                        <div className="search-input-wrapper modal-search-wrapper">
                            <i className="fa-solid fa-magnifying-glass"></i>
                            <input type="text" id="userSearchModalInput" className="search-input" placeholder="Search users by name or username" />
                        </div>
                        <div className="user-search-results" id="userSearchResults">
                            {/* Populated by js/users.js */}
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. Voice & Video Call Simulator Modal */}
            <div className="modal-overlay" id="callSimulatorModal">
                <div className="call-modal-card">
                    <img id="callAvatar" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150" alt="Call Avatar" className="call-avatar" />
                    <h3 className="call-user-name" id="callUserName">Sarah Connor</h3>
                    <p className="call-status-text" id="callStatusText">Calling...</p>
                    <div className="call-controls">
                        <button className="call-btn" title="Mute Microphone">
                            <i className="fa-solid fa-microphone-slash"></i>
                        </button>
                        <button className="call-btn" title="Toggle Speaker">
                            <i className="fa-solid fa-volume-high"></i>
                        </button>
                        <button className="call-btn" title="Toggle Video">
                            <i className="fa-solid fa-video"></i>
                        </button>
                        <button className="call-btn end-call" id="endCallBtn" title="End Call">
                            <i className="fa-solid fa-phone-slash"></i>
                        </button>
                    </div>
                </div>
            </div>
        </>
    )
}