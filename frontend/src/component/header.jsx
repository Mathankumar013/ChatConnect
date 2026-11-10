import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { toggleTheme } from "../slice/slice";

export default function Header() {
    const [menu,setMenu]= useState(false);

    const theme = useSelector((state)=>state.chat.theme);
    const dispatch = useDispatch();

    function toggleThemes() {
        dispatch(toggleTheme(false));

        document.documentElement.setAttribute("data-theme", !theme ? "dark" : "light");
    }
    return (
        <>
            {/* 1. Sidebar Header */}
            <header className="sidebar-header">
                {/* Logo & Branding */}
                <div className="brand-title">
                    <i className="fa-solid fa-comment-dots"></i>
                    <span>ChatConnect</span>
                </div>

                {/* Header Actions */}
                <div className="sidebar-header-actions">
                    {/* Theme Switcher */}
                    <button className="icon-btn theme-toggle-btn" title="Toggle Theme" aria-label="Toggle Theme" onClick={toggleThemes}>
                        <i className={`fa-solid ${theme ? 'fa-moon' : 'fa-sun'} theme-toggle-icon`}></i>
                   
                    </button>

                    {/* Three-Dot Menu with Dropdown */}
                    <div className="dropdown">
                        <button className="icon-btn" id="sidebarMenuBtn" title="Menu" aria-label="Menu" onClick={()=> setMenu(!menu)}>
                            <i className="fa-solid fa-ellipsis-vertical"></i>
                        </button>
                        <div className={`dropdown-menu ${menu === true? `show`: ''}`} id="sidebarDropdown">
                            <button className="dropdown-item" id="menuProfileBtn">
                                <i className="fa-solid fa-user"></i> Profile & Status
                            </button>
                            <button className="dropdown-item" id="menuThemeToggleBtn" onClick={toggleThemes}>
                                <i className="fa-solid fa-circle-half-stroke"></i> Switch Theme
                            </button>
                            <div className="dropdown-divider"></div>
                            <button className="dropdown-item dropdown-item-danger" id="menuLogoutBtn">
                                <i className="fa-solid fa-arrow-right-from-bracket"></i> Log Out
                            </button>
                        </div>
                    </div>

                    {/* Current User Avatar Profile Trigger */}
                    <Link to="/profile" className="user-profile-btn" title="View Profile">
                        <div className="user-avatar-wrap">
                            <img id="sidebarUserAvatar" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150" alt="My Profile" className="user-avatar" />
                            {/* <span className="avatar-badge-online"></span> */}
                        </div>
                    </Link>
                </div>
            </header>
        </>
    )
}