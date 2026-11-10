import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from '../assets/js/api';
import { toast, ToastContainer } from "react-toastify";

export default function Register() {
    const [input, setInput] = useState({
        userName: '',
        email: '',
        password: '',
        policy: false
    })
    const [ShowPassword, setShowPassword] = useState(false);
    const [error, setError] = useState({})

    const navigate = useNavigate();

    async function handleSunmit(e) {
        e.preventDefault();
        const newError = {}
        if (input.userName.trim() === '') {
            newError.userName = 'Please enter a userName';
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (input.email === '') {
            newError.email = 'Please Enter your Email';
        } else if (!emailRegex.test(input.email)) {
            newError.email = 'Please enter a valid email address';
        }
        if (input.password === '') {
            newError.password = 'Please Enter a password'
        } else if (input.password.length < 8) {
            newError.password = 'Password must be at least 8 characters.'
        }
        setError(newError);

        try {
            const response = await api.post("api/register", input)
            toast.success(response.data.message);
            setTimeout(() => {
                navigate('/')
            }, 3000)
            setInput({
                userName: '',
                email: '',
                password: '',
                policy: false
            })
        } catch (error) {
            toast.error(error.response?.data?.message || "Register Failed")
        }
    }
    return (
        <>
            <ToastContainer position="top-right" autoClose={2000} theme="colored" />

            {/* Top Decorative Header Strip */}
            <div className="auth-header-strip">
                <div className="auth-brand">
                    <i className="fa-solid fa-comment-dots"></i>
                    <span>CHATCONNECT</span>
                </div>
            </div>

            {/* Registration Main Container */}
            <div className="auth-container auth-container-narrow">
                <div className="auth-card">
                    <div className="auth-form-column auth-form-column-padded">
                        <h1 className="auth-title">Create Account</h1>
                        <p className="auth-subtitle">Join ChatConnect to start real-time messaging</p>

                        <form id="registerForm" className="auth-form" onSubmit={handleSunmit}>

                            {/* Username Field */}
                            <div className="form-group">
                                <label htmlFor="regUsername" className="form-label">Username</label>
                                <div className="input-with-icon">
                                    <i className="fa-regular fa-user input-icon-left"></i>
                                    <input
                                        type="text"
                                        id="regUsername"
                                        className="auth-input"
                                        placeholder="Enter a UserName"
                                        value={input.userName}
                                        onChange={(e) => setInput({ ...input, userName: e.target.value })}
                                    />
                                </div>
                                <span className="error-message">{error.userName}</span>
                            </div>

                            {/* Email Field */}
                            <div className="form-group">
                                <label htmlFor="regEmail" className="form-label">Email address</label>
                                <div className="input-with-icon">
                                    <i className="fa-regular fa-envelope input-icon-left"></i>
                                    <input
                                        type="email"
                                        id="regEmail"
                                        className="auth-input"
                                        placeholder="name@example.com"
                                        value={input.email}
                                        onChange={(e) => setInput({ ...input, email: e.target.value })}
                                    />
                                </div>
                                <span className="error-message">{error.email}</span>
                            </div>

                            {/* Password Field */}
                            <div className="form-group">
                                <label htmlFor="regPassword" className="form-label">Password</label>
                                <div className="input-with-icon">
                                    <i className="fa-solid fa-lock input-icon-left"></i>
                                    <input
                                        type={ShowPassword ? 'text' : 'password'}
                                        id="regPassword"
                                        className="auth-input"
                                        placeholder="At least 8 characters"
                                        value={input.password}
                                        onChange={(e) => setInput({ ...input, password: e.target.value })}
                                    />
                                    <button type="button" className="password-toggle-btn" aria-label="Toggle password visibility" onClick={() => setShowPassword(!ShowPassword)}>
                                        <i className={`fa-regular ${ShowPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
                                    </button>
                                </div>
                                <span className="error-message">{error.password}</span>
                            </div>

                            {/* Terms agreement */}
                            <label className="remember-label terms-label">
                                <input type="checkbox" id="termsCheck" onChange={(e) => setInput({ ...input, policy: e.target.checked })} />
                                <span>I agree to the ChatConnect Terms & Privacy Policy</span>
                            </label>

                            {/* Submit Button */}
                            <button type="submit" className="auth-submit-btn" id="registerSubmitBtn">
                                Create Account
                            </button>
                        </form>

                        {/* Login Link  */}
                        <p className="auth-switch-text">
                            Already have an account? <Link to="/">Sign in here</Link>
                        </p>

                    </div>
                </div>
            </div>
        </>
    )
}
