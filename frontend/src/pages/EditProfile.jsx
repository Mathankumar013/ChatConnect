import { Link } from "react-router-dom";

export default function EditProfile() {
    return (
        <>
            {/* Top Decorative Header Strip */}
            <div className="profile-header-strip"></div>

            {/* Top Navigation Bar */}
            <nav className="profile-nav-bar">
                <Link to="/dashboard" className="back-to-chat-btn">
                    <i className="fa-solid fa-arrow-left"></i>
                    <span>Back to Chats</span>
                </Link>
            </nav>

            {/* Main Profile Container */}
            <main className="profile-container">
                <div className="profile-card">

                    {/* Avatar Section */}
                    <div className="profile-avatar-section">
                        <label for="avatarUploadInput" className="profile-avatar-wrapper" title="Click to change profile picture">
                            <img id="profileAvatarImg" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200" alt="Profile Avatar" className="profile-large-avatar" />
                            <div className="profile-avatar-overlay">
                                <i className="fa-solid fa-camera"></i>
                                <span>Change Photo</span>
                            </div>
                        </label>
                        <input type="file" id="avatarUploadInput" className="hidden-file-input" accept="image/*" />
                        <span className="avatar-change-hint">Click the image to change your profile picture</span>
                    </div>

                    {/* Profile Form */}
                    <form id="profileForm" novalidate>

                        <h3 className="profile-section-title">Personal Information</h3>
                        <div className="profile-details-grid">

                            {/* Name Field */}
                            <div className="profile-field-row">
                                <label for="profileNameInput" className="field-label">Your Name</label>
                                <div className="field-input-box">
                                    <input type="text" id="profileNameInput" className="field-input" placeholder="Your Name" required />
                                </div>
                            </div>

                            {/* Username Field */}
                            <div className="profile-field-row">
                                <label for="profileUsernameInput" className="field-label">Username</label>
                                <div className="field-input-box">
                                    <input type="text" id="profileUsernameInput" className="field-input" placeholder="username" required />
                                </div>
                            </div>

                            {/* Email Field (Read Only) */}
                            <div className="profile-field-row">
                                <label for="profileEmailInput" className="field-label">Email Address</label>
                                <div className="field-input-box">
                                    <input type="email" id="profileEmailInput" className="field-input" placeholder="email@example.com" disabled />
                                </div>
                            </div>

                            {/* About / Status Field */}
                            <div className="profile-field-row">
                                <label for="profileAboutInput" className="field-label">About / Status</label>
                                <div className="field-input-box">
                                    <input type="text" id="profileAboutInput" className="field-input" placeholder="Available" required />
                                </div>

                                {/* Preset Status Chips */}
                                <div className="status-presets-wrap">
                                    <p className="presets-label">Quick select preset status:</p>
                                    <div className="preset-chips-list">
                                        <span className="preset-chip">Available</span>
                                        <span className="preset-chip">Busy</span>
                                        <span className="preset-chip">At work</span>
                                        <span className="preset-chip">In a meeting</span>
                                        <span className="preset-chip">Battery about to die</span>
                                        <span className="preset-chip">Urgent calls only</span>
                                        <span className="preset-chip">Can't talk, ChatConnect only</span>
                                    </div>
                                </div>
                            </div>

                        </div>

                        {/* Chat Preferences Section */}
                        <h3 className="profile-section-title spaced">Chat Preferences</h3>
                        <div className="settings-list">

                            <div className="setting-item">
                                <div className="setting-info">
                                    <span className="setting-title">Read receipts</span>
                                    <span className="setting-desc">If turned off, you won't send or receive read receipts (blue ticks).</span>
                                </div>
                                <label className="switch">
                                    <input type="checkbox" id="prefReadReceipts" checked />
                                    <span className="slider"></span>
                                </label>
                            </div>

                            <div className="setting-item">
                                <div className="setting-info">
                                    <span className="setting-title">Enter is send</span>
                                    <span className="setting-desc">Pressing Enter key will immediately send your chat message.</span>
                                </div>
                                <label className="switch">
                                    <input type="checkbox" id="prefEnterIsSend" checked />
                                    <span className="slider"></span>
                                </label>
                            </div>

                            <div className="setting-item">
                                <div className="setting-info">
                                    <span className="setting-title">Sound notifications</span>
                                    <span className="setting-desc">Play incoming message audio notification tones.</span>
                                </div>
                                <label className="switch">
                                    <input type="checkbox" id="prefSounds" checked />
                                    <span className="slider"></span>
                                </label>
                            </div>

                        </div>

                        {/* Action Buttons */}
                        <div className="profile-actions-bar">
                            <button type="button" className="logout-action-btn" id="profileLogoutBtn">
                                <i className="fa-solid fa-arrow-right-from-bracket"></i> Log Out
                            </button>
                            <button type="submit" className="save-profile-btn" id="saveProfileBtn">
                                <i className="fa-solid fa-floppy-disk"></i> Save Changes
                            </button>
                        </div>

                    </form>

                </div>
            </main>
        </>
    )
}