import { Link, useNavigate } from "react-router-dom";
import presonImage from '../assets/images/person-chatting.svg';
import { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import api from "../assets/js/api";



export default function Login() {
    const [input, setInput] = useState({
        email: '',
        password: '',
    })
    const [ShowPassword, setShowPassword] = useState(false);
    const [error, setError] = useState({})

    const navigate = useNavigate();

    async function handleSunmit(e) {
        e.preventDefault();

        const newError = {};
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (input.email === '') {
            newError.email = 'Please Enter your Email';
        } else if (!emailRegex.test(input.email)) {
            newError.email = 'Please enter a valid email address'
        }

        if (input.password === '') {
            newError.password = 'Please Enter a password'
        } else if (input.password.length < 8) {
            newError.password = 'Password must be at least 8 characters.'
        }
        setError(newError);

        try {
            const response = await api.post("api/login", input)
            toast.success(response.data.message);
            localStorage.setItem('token', response.data.token)
            localStorage.setItem('useerId', response.data.userId)

            setTimeout(() => {
                navigate('/dashboard')
            }, 3000)

            setInput({
                email: '',
                password: '',
            })
        } catch (error) {
            toast.error(error.response?.data?.message || "login Failed")
        }
    }
    return (
        <>
            <ToastContainer position="top-right" autoClose={2000} theme="colored" />

            {/* Top Decorative Header Strip (WhatsApp Web Header) */}
            <div className="auth-header-strip">
                <div className="auth-brand">
                    <i className="fa-solid fa-comment-dots"></i>
                    <span>CHATCONNECT</span>
                </div>
            </div>

            {/* Authentication Main Container */}
            <div className="auth-container">
                <div className="auth-card">
                    <div className="auth-split-wrapper">

                        {/* Left Column: Login Form */}
                        <div className="auth-form-column">
                            <h1 className="auth-title">Welcome to ChatConnect</h1>
                            <p className="auth-subtitle">Sign in to your account to connect and chat</p>

                            <form id="loginForm" className="auth-form" onSubmit={handleSunmit}>
                                {/* Email Field */}
                                <div className="form-group">
                                    <label htmlFor="loginEmail" className="form-label">Email address</label>
                                    <div className="input-with-icon">
                                        <i className="fa-regular fa-envelope input-icon-left"></i>
                                        <input
                                            type="email"
                                            className="auth-input"
                                            placeholder="name@example.com"
                                            value={input.email}
                                            onChange={(e) => setInput({ ...input, email: e.target.value })}
                                        />
                                    </div>
                                    <span className="error-message" id="emailError">{error.email}</span>
                                </div>

                                {/* Password Field */}
                                <div className="form-group">
                                    <label htmlFor="loginPassword" className="form-label">Password</label>
                                    <div className="input-with-icon">
                                        <i className="fa-solid fa-lock input-icon-left"></i>
                                        <input
                                            type={ShowPassword ? 'text' : 'password'}
                                            id="loginPassword"
                                            className="auth-input"
                                            placeholder="Enter your password"
                                            value={input.password}
                                            onChange={(e) => setInput({ ...input, password: e.target.value })}
                                        />
                                        <button type="button" className="password-toggle-btn" aria-label="Toggle password visibility" onClick={() => setShowPassword(!ShowPassword)}>
                                            <i className={`fa-regular ${ShowPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
                                        </button>
                                    </div>
                                    <span className="error-message" id="passwordError">{error.password}</span>
                                </div>

                                {/* Remember & Forgot Password */}
                                <div className="auth-options-row">
                                    <label className="remember-label">
                                        <input type="checkbox" id="rememberMe" />
                                        <span>Remember me</span>
                                    </label>
                                    {/* <a href="#" className="forgot-link">Forgot password?</a> */}
                                </div>

                                {/* Submit Button */}
                                <button type="submit" className="auth-submit-btn" id="loginSubmitBtn">
                                    Sign In
                                </button>
                            </form>

                            {/* Register Link */}
                            <p className="auth-switch-text">
                                Don't have an account? <Link to='/register'>Create an account</Link>
                            </p>
                        </div>

                        {/* Right Column: Person Chatting Showcase (Desktop only) */}
                        <div className="auth-visual-column">
                            <div className="chat-showcase-box">
                                <img src={presonImage} alt="Person Chatting on ChatConnect" className="chat-showcase-image" />
                            </div>
                            <h2 className="chat-showcase-title">Connect with Anyone, Anywhere</h2>
                            <p className="chat-showcase-subtitle">Fast, simple, and end-to-end encrypted real-time messaging across all your devices.</p>
                        </div>

                    </div>
                </div>
            </div>
        </>
    )
}