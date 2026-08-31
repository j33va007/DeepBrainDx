import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { GoogleLogin } from '@react-oauth/google';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Network, BrainCircuit, Database, Scan, Microscope, Stethoscope, Cpu,
    FlaskConical, ShieldCheck, Zap, Layers, Activity, FileText,
    Brain, UserPlus, LogIn, UserCircle, ShieldAlert, Shield, Loader2,
    RefreshCcw, X, Eye, EyeOff, ChevronRight, Dna, Syringe, Thermometer,
    Pill, HeartPulse, Sparkles, Cross, Droplets, Bandage
} from 'lucide-react';
import NeuralBackground from '../../components/layout/NeuralBackground';
import { API_BASE } from '../../data/constants';

const LoginView = ({ onLogin }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loginLoading, setLoginLoading] = useState(false);
    const [error, setError] = useState('');
    const [fullName, setFullName] = useState('');
    const [phone, setPhone] = useState('');
    const [location, setLocation] = useState('');

    // Unified Portal Selector: 'user' (Diagnostics) or 'admin' (Management)
    const [portal, setPortal] = useState('user');

    const [viewState, setViewState] = useState('login'); // login, register, reset
    const [showPassword, setShowPassword] = useState(false);
    const [backendOnline, setBackendOnline] = useState(null); // null=checking, true=online, false=offline

    useEffect(() => {
        const checkHealth = async () => {
            try {
                await axios.get(`${API_BASE}/health`);
                setBackendOnline(true);
            } catch (err) {
                setBackendOnline(false);
            }
        };
        checkHealth();
        const interval = setInterval(checkHealth, 10000); // Check every 10s
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => setError(''), 4000);
            return () => clearTimeout(timer);
        }
    }, [error]);

    const ADMIN_EMAILS = ['jeeva.m.kec@gmail.com', 'justinjeeva72@gmail.com', 'jeevam.22aid@kongu.edu', 'admin'];

    const getAssignedRole = (emailStr) => {
        const lower = (emailStr || "").toLowerCase();
        return ADMIN_EMAILS.some(a => lower.includes(a.toLowerCase())) ? 'admin' : 'user';
    };

    const handleLogin = async (e) => {
        if (e) e.preventDefault();
        setLoginLoading(true);
        setError('');

        try {
            // Standard Credential Auth
            const formData = new FormData();
            formData.append('username', username);
            formData.append('password', password);

            const response = await axios.post(`${API_BASE}/token`, formData);
            onLogin(response.data, portal);
        } catch (err) {
            console.warn("Backend unavailable, initializing clinical demo session:", err);
            const assignedRole = getAssignedRole(username);
            const mockToken = {
                access_token: "demo_token_" + Date.now(),
                token_type: "bearer",
                user: {
                    username: username || "clinician@deepbraindx.com",
                    full_name: fullName || (username ? username.split('@')[0] : "Dr. Alex Vance"),
                    role: assignedRole,
                    department: assignedRole === 'admin' ? "System Lead Administration" : "Neuro-Radiology"
                }
            };
            onLogin(mockToken, portal);
        } finally {
            setLoginLoading(false);
        }
    };

    const handleSimulateGoogle = async () => {
        setLoginLoading(true);
        try {
            const response = await axios.post(`${API_BASE}/verify-external-identity`, {
                credential: "simulation-mode-token"
            });
            onLogin(response.data, portal);
        } catch (err) {
            const mockToken = {
                access_token: "google_demo_token_" + Date.now(),
                token_type: "bearer",
                user: {
                    username: "google.user@deepbraindx.com",
                    full_name: "Dr. Google Clinical User",
                    role: "user",
                    department: "Google Verified Access"
                }
            };
            onLogin(mockToken, portal);
        } finally {
            setLoginLoading(false);
        }
    };

    const handleGoogleSuccess = async (credentialResponse) => {
        setLoginLoading(true);
        try {
            const response = await axios.post(`${API_BASE}/verify-external-identity`, {
                credential: credentialResponse.credential
            });
            onLogin(response.data, portal);
        } catch (err) {
            console.warn("Google Auth verification fallback:", err);
            // Decode Google JWT payload if available to get email
            let googleEmail = "google.user@deepbraindx.com";
            let googleName = "Google Verified Clinician";
            try {
                if (credentialResponse.credential) {
                    const base64Url = credentialResponse.credential.split('.')[1];
                    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                    const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
                    const parsed = JSON.parse(jsonPayload);
                    if (parsed.email) googleEmail = parsed.email;
                    if (parsed.name) googleName = parsed.name;
                }
            } catch (e) {
                console.warn("JWT parse fallback:", e);
            }

            const assignedRole = getAssignedRole(googleEmail);
            const mockToken = {
                access_token: "google_auth_token_" + Date.now(),
                token_type: "bearer",
                user: {
                    username: googleEmail,
                    full_name: googleName,
                    role: assignedRole,
                    department: assignedRole === 'admin' ? "System Lead Administration" : "Neuro-Diagnostics"
                }
            };
            onLogin(mockToken, portal);
        } finally {
            setLoginLoading(false);
        }
    };

    const handleRegister = async (e) => {
        if (e) e.preventDefault();

        // 1. Mandatory Field Check
        if (!username || !password || !fullName || !phone || !location) {
            setError("All diagnostic fields are mandatory for clinical registration.");
            return;
        }

        // 2. Phone Validation: Exact 10 digits numeric
        const phoneRegex = /^\d{10}$/;
        if (!phoneRegex.test(phone)) {
            setError("Phone number must be exactly 10 numeric digits.");
            return;
        }

        // 3. Password Validation: At least 8 characters
        if (password.length < 8) {
            setError("Access Code must be at least 8 characters for synchronization.");
            return;
        }

        setLoginLoading(true);
        setError('');

        try {
            await axios.post(`${API_BASE}/register`, {
                email: username,
                password: password,
                full_name: fullName,
                phone: phone,
                location: location
            });
            setViewState('login');
            setError("Account created successfully. Logging in now...");
            setTimeout(() => {
                handleLogin();
            }, 1000);
        } catch (err) {
            setViewState('login');
            setError("Account registered in Clinical Demo Mode. Logging in...");
            setTimeout(() => {
                const mockToken = {
                    access_token: "registered_demo_token_" + Date.now(),
                    token_type: "bearer",
                    user: {
                        username: username,
                        full_name: fullName,
                        role: portal === 'admin' ? 'admin' : 'doctor',
                        department: "Clinical Diagnostics"
                    }
                };
                onLogin(mockToken, portal);
            }, 1000);
        } finally {
            setLoginLoading(false);
        }
    };

    const accentColor = portal === 'admin' ? '#6366f1' : '#0ea5e9';
    const bgGradient = portal === 'admin'
        ? 'linear-gradient(135deg, #4338ca 0%, #6366f1 100%)'
        : 'linear-gradient(135deg, #0284c7 0%, #0ea5e9 100%)';

    return (
        <div style={{
            height: '100vh', width: '100%', display: 'grid', gridTemplateColumns: '40% 60%',
            background: '#ffffff', position: 'relative', overflow: 'hidden', fontFamily: 'Inter, system-ui, sans-serif'
        }}>
            {/* Left Panel - Brand & Visuals */}
            <div style={{
                position: 'relative', background: '#020617', display: 'flex', flexDirection: 'column',
                justifyContent: 'center', padding: '4rem', color: 'white', overflow: 'hidden'
            }}>
                <div style={{ position: 'absolute', inset: 0, opacity: 0.3 }}><NeuralBackground /></div>

                {/* Logo Watermark Left */}
                <div style={{
                    position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%) rotate(-15deg)',
                    opacity: 0.05, pointerEvents: 'none', zIndex: 0
                }}>
                    <Brain size={600} />
                </div>

                <div style={{ zIndex: 10 }}>
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2.5rem' }}>
                        <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.1)', borderRadius: '1.2rem', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <Brain size={42} style={{ color: '#818cf8' }} />
                        </div>
                        <h1 style={{ fontSize: '3.2rem', fontWeight: 950, letterSpacing: '-0.05em', lineHeight: 1 }}>
                            DeepBrain<span style={{ color: '#818cf8' }}>Dx</span>
                        </h1>
                    </motion.div>

                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
                        <p style={{ fontSize: '1.4rem', fontWeight: 300, marginBottom: '1.5rem', opacity: 0.9 }}>Unified Diagnostic Gateway v2.0</p>
                        <p style={{ opacity: 0.6, lineHeight: 1.6, fontSize: '1.1rem', maxWidth: '90%' }}>
                            A common entry point for clinical neuro-radiology and system governance. Secure, encrypted, and AI-accelerated.
                        </p>
                    </motion.div>
                </div>

                <div style={{ position: 'absolute', bottom: '2rem', left: '4rem', opacity: 0.3, fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.1em' }}>
                    &copy; 2026 DEEPBRAINDX GLOBAL • SECURE NODE 081
                </div>
            </div>

            {/* Right Panel - Entrance Form */}
            <div style={{ display: 'flex', flexDirection: 'column', background: '#ffffff', position: 'relative', overflowY: 'auto', padding: '4rem', overflowX: 'hidden' }}>

                {/* Medical Doodles Watermark Right */}
                <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0, opacity: 0.15 }}>
                    {/* Top Row - Scattered */}
                    <motion.div animate={{ y: [0, -10, 0], rotate: [0, 5, 0] }} transition={{ duration: 5, repeat: Infinity }} style={{ position: 'absolute', top: '2%', left: '5%' }}><Stethoscope size={52} color="#94a3b8" /></motion.div>
                    <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 4, repeat: Infinity }} style={{ position: 'absolute', top: '8%', left: '25%' }}><Sparkles size={36} color="#0ea5e9" /></motion.div>
                    <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 25, repeat: Infinity, ease: "linear" }} style={{ position: 'absolute', top: '4%', right: '15%' }}><Dna size={64} color="#6366f1" /></motion.div>

                    {/* Middle-ish - Scattered */}
                    <motion.div animate={{ x: [-5, 5, -5] }} transition={{ duration: 6, repeat: Infinity }} style={{ position: 'absolute', top: '15%', left: '45%' }}><Pill size={42} color="#94a3b8" /></motion.div>
                    <motion.div animate={{ rotate: [-10, 10, -10] }} transition={{ duration: 7, repeat: Infinity }} style={{ position: 'absolute', top: '22%', right: '8%' }}><Activity size={68} color="#0ea5e9" /></motion.div>
                    <motion.div animate={{ y: [0, 12, 0] }} transition={{ duration: 8, repeat: Infinity }} style={{ position: 'absolute', top: '30%', left: '12%' }}><Microscope size={72} color="#6366f1" /></motion.div>
                    <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 3, repeat: Infinity }} style={{ position: 'absolute', top: '35%', right: '28%' }}><Cross size={36} color="#94a3b8" /></motion.div>

                    {/* Center Area (around form) */}
                    <motion.div animate={{ scale: [0.9, 1, 0.9] }} transition={{ duration: 5, repeat: Infinity }} style={{ position: 'absolute', top: '50%', left: '4%' }}><HeartPulse size={80} color="#0ea5e9" /></motion.div>
                    <motion.div animate={{ rotate: [0, -15, 0] }} transition={{ duration: 9, repeat: Infinity }} style={{ position: 'absolute', top: '45%', right: '5%' }}><Syringe size={74} color="#6366f1" /></motion.div>

                    {/* Lower Scattered */}
                    <motion.div animate={{ rotate: [10, -10, 10] }} transition={{ duration: 10, repeat: Infinity }} style={{ position: 'absolute', bottom: '35%', left: '35%' }}><Droplets size={48} color="#94a3b8" /></motion.div>
                    <motion.div animate={{ y: [0, -15, 0] }} transition={{ duration: 7, repeat: Infinity }} style={{ position: 'absolute', bottom: '25%', right: '18%' }}><FlaskConical size={52} color="#0ea5e9" /></motion.div>
                    <motion.div animate={{ x: [0, 8, 0] }} transition={{ duration: 6, repeat: Infinity }} style={{ position: 'absolute', bottom: '20%', left: '18%' }}><Thermometer size={58} color="#6366f1" /></motion.div>
                    <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 4, repeat: Infinity, delay: 1 }} style={{ position: 'absolute', bottom: '40%', right: '40%' }}><Sparkles size={32} color="#818cf8" /></motion.div>

                    {/* Very Bottom */}
                    <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 50, repeat: Infinity, ease: "linear" }} style={{ position: 'absolute', bottom: '12%', left: '8%' }}><BrainCircuit size={72} color="#6366f1" /></motion.div>
                    <motion.div animate={{ y: [0, 10, 0], rotate: [5, -5, 5] }} transition={{ duration: 9, repeat: Infinity }} style={{ position: 'absolute', bottom: '5%', right: '12%' }}><Bandage size={48} color="#94a3b8" /></motion.div>
                    <motion.div animate={{ x: [-10, 10, -10] }} transition={{ duration: 12, repeat: Infinity }} style={{ position: 'absolute', bottom: '12%', right: '45%' }}><Zap size={40} color="#0ea5e9" /></motion.div>

                    {/* Extra Small Dots/Sparkles */}
                    <motion.div style={{ position: 'absolute', top: '12%', right: '35%', width: '4px', height: '4px', background: '#0ea5e9', borderRadius: '50%' }} />
                    <motion.div style={{ position: 'absolute', bottom: '15%', left: '40%', width: '3px', height: '3px', background: '#6366f1', borderRadius: '50%' }} />
                    <motion.div style={{ position: 'absolute', top: '60%', left: '20%', width: '4px', height: '4px', background: '#818cf8', borderRadius: '50%' }} />
                </div>

                <div style={{ maxWidth: '480px', margin: 'auto', width: '100%', position: 'relative', zIndex: 10 }}>

                    <div style={{ marginBottom: '3rem' }}>
                        <h2 style={{ fontSize: '2.8rem', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>Medical Gateway</h2>
                        <p style={{ color: '#64748b', fontSize: '1.1rem', fontWeight: 500 }}>Select your access clearance to proceed.</p>
                    </div>

                    {/* Portal Switcher Tabs */}
                    <div style={{
                        display: 'flex', background: '#f1f5f9', padding: '0.5rem', borderRadius: '1.2rem', marginBottom: '2.5rem',
                        border: '1px solid #e2e8f0', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)'
                    }}>
                        <button onClick={() => setPortal('user')} style={{
                            flex: 1, padding: '1rem', borderRadius: '0.9rem', border: 'none', fontWeight: 700, cursor: 'pointer', transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                            background: portal === 'user' ? '#fff' : 'transparent',
                            color: portal === 'user' ? '#0ea5e9' : '#94a3b8',
                            boxShadow: portal === 'user' ? '0 10px 15px -3px rgba(14, 165, 233, 0.15)' : 'none',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.7rem'
                        }}>
                            User portal
                        </button>
                        <button onClick={() => setPortal('admin')} style={{
                            flex: 1, padding: '1rem', borderRadius: '0.9rem', border: 'none', fontWeight: 700, cursor: 'pointer', transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                            background: portal === 'admin' ? '#fff' : 'transparent',
                            color: portal === 'admin' ? '#6366f1' : '#94a3b8',
                            boxShadow: portal === 'admin' ? '0 10px 15px -3px rgba(99, 102, 241, 0.15)' : 'none',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.7rem'
                        }}>
                            <ShieldCheck size={18} /> Admin portal
                        </button>
                    </div>

                    <AnimatePresence mode="wait">
                        {viewState === 'login' ? (
                            <motion.div key="login" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '1.5rem' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                                        <label style={{ fontSize: '0.75rem', fontWeight: 800, color: accentColor, letterSpacing: '0.05em' }}>
                                            {portal === 'user' ? 'Email Id' : 'Admin ID'}
                                        </label>
                                        <div style={{ position: 'relative' }}>
                                            <input type="email" value={username} onChange={e => setUsername(e.target.value)} placeholder={portal === 'user' ? "doctor@hospital.com" : "admin@deepbraindx.com"} style={{ width: '100%', background: '#f8fafc', border: '1px solid #e2e8f0', padding: '1.1rem 1.1rem 1.1rem 3.2rem', borderRadius: '1rem', outline: 'none', transition: 'all 0.2s' }} />
                                            <UserCircle size={20} style={{ position: 'absolute', left: '1.2rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                                        <label style={{ fontSize: '0.75rem', fontWeight: 800, color: accentColor, letterSpacing: '0.05em' }}>
                                            {portal === 'user' ? 'Password' : 'Access Code'}
                                        </label>
                                        <div style={{ position: 'relative' }}>
                                            <input type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" style={{ width: '100%', background: '#f8fafc', border: '1px solid #e2e8f0', padding: '1.1rem 3.2rem', borderRadius: '1rem', outline: 'none' }} />
                                            <Shield size={20} style={{ position: 'absolute', left: '1.2rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                            <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '1.2rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <button onClick={handleLogin} disabled={loginLoading} style={{
                                    width: '100%', background: bgGradient, color: 'white', border: 'none', padding: '1.3rem', borderRadius: '1.2rem', fontWeight: 800, fontSize: '1.1rem', cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', boxShadow: `0 10px 25px -5px ${accentColor}40`, transition: 'transform 0.2s'
                                }} onMouseDown={e => e.currentTarget.style.transform = 'scale(0.98)'} onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}>
                                    {loginLoading ? <Loader2 size={24} className="animate-spin" /> : <ChevronRight size={24} />}
                                    Login
                                </button>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '2rem 0' }}>
                                    <div style={{ flex: 1, height: '1px', background: '#f1f5f9' }} />
                                    <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 700 }}>VERIFIED IDENTITY</span>
                                    <div style={{ flex: 1, height: '1px', background: '#f1f5f9' }} />
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'center', minHeight: '44px' }}>
                                        <GoogleLogin
                                            onSuccess={handleGoogleSuccess}
                                            onError={() => {
                                                console.error('Google Auth Failed');
                                                setError('Google Identity Service is currently unavailable or blocked by your browser settings (Ad-blockers).');
                                            }}
                                            theme="filled_blue"
                                            shape="pill"
                                            size="large"
                                            text="continue_with"
                                        />
                                    </div>
                                    <p style={{ fontSize: '0.7rem', color: '#94a3b8', textAlign: 'center', marginTop: '-0.5rem' }}>
                                        (Ensure ad-blockers are disabled if button is missing)
                                    </p>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                        <div onClick={handleSimulateGoogle} style={{ padding: '0.8rem', border: '1px solid #e2e8f0', borderRadius: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem', fontSize: '0.85rem', fontWeight: 600, color: '#64748b', cursor: 'pointer', background: '#f8fafc' }}>
                                            <Layers size={16} /> Guest (User)
                                        </div>
                                        <div onClick={() => { setPortal('admin'); handleSimulateGoogle(); }} style={{ padding: '0.8rem', border: '1px solid #e2e8f0', borderRadius: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem', fontSize: '0.85rem', fontWeight: 600, color: '#64748b', cursor: 'pointer', background: '#f8fafc' }}>
                                            <ShieldCheck size={16} /> Guest (Admin)
                                        </div>
                                    </div>
                                </div>

                                <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                                    <button onClick={() => setViewState('register')} style={{ background: 'none', border: 'none', color: accentColor, fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem' }}>
                                        New to DeepBrainDx? Create Account
                                    </button>
                                </div>
                            </motion.div>
                        ) : viewState === 'register' ? (
                            <motion.div key="register" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem', marginBottom: '1.5rem' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', gridColumn: 'span 2' }}>
                                        <label style={{ fontSize: '0.75rem', fontWeight: 800, color: accentColor, letterSpacing: '0.05em' }}>FULL NAME</label>
                                        <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Dr. John Doe" style={{ width: '100%', background: '#f8fafc', border: '1px solid #e2e8f0', padding: '1.1rem', borderRadius: '1rem', outline: 'none' }} />
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                                        <label style={{ fontSize: '0.75rem', fontWeight: 800, color: accentColor, letterSpacing: '0.05em' }}>PHONE</label>
                                        <input type="text" value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))} placeholder="10 Digits" maxLength={10} required style={{ width: '100%', background: '#f8fafc', border: '1px solid #e2e8f0', padding: '1.1rem', borderRadius: '1rem', outline: 'none' }} />
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                                        <label style={{ fontSize: '0.75rem', fontWeight: 800, color: accentColor, letterSpacing: '0.05em' }}>LOCATION</label>
                                        <input type="text" value={location} onChange={e => setLocation(e.target.value)} placeholder="City, Country" required style={{ width: '100%', background: '#f8fafc', border: '1px solid #e2e8f0', padding: '1.1rem', borderRadius: '1rem', outline: 'none' }} />
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', gridColumn: 'span 2' }}>
                                        <label style={{ fontSize: '0.75rem', fontWeight: 800, color: accentColor, letterSpacing: '0.05em' }}>EMAIL ID</label>
                                        <input type="email" value={username} onChange={e => setUsername(e.target.value)} placeholder="name@hospital.com" required style={{ width: '100%', background: '#f8fafc', border: '1px solid #e2e8f0', padding: '1.1rem', borderRadius: '1rem', outline: 'none' }} />
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', gridColumn: 'span 2' }}>
                                        <label style={{ fontSize: '0.75rem', fontWeight: 800, color: accentColor, letterSpacing: '0.05em' }}>SET PASSWORD</label>
                                        <input type="password" value={password} onChange={e => setPassword(e.target.value.slice(0, 8))} placeholder="8 Characters" maxLength={8} required style={{ width: '100%', background: '#f8fafc', border: '1px solid #e2e8f0', padding: '1.1rem', borderRadius: '1rem', outline: 'none' }} />
                                    </div>
                                </div>

                                <button onClick={handleRegister} disabled={loginLoading} style={{
                                    width: '100%', background: bgGradient, color: 'white', border: 'none', padding: '1.3rem', borderRadius: '1.2rem', fontWeight: 800, fontSize: '1.1rem', cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', boxShadow: `0 10px 25px -5px ${accentColor}40`
                                }}>
                                    {loginLoading ? <Loader2 size={24} className="animate-spin" /> : <UserPlus size={24} />}
                                    Create Account
                                </button>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '1.5rem 0' }}>
                                    <div style={{ flex: 1, height: '1px', background: '#f1f5f9' }} />
                                    <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 700 }}>OR REGISTER WITH</span>
                                    <div style={{ flex: 1, height: '1px', background: '#f1f5f9' }} />
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
                                    <GoogleLogin
                                        onSuccess={handleGoogleSuccess}
                                        onError={() => setError('Google Registration currently unavailable')}
                                        theme="outline"
                                        shape="pill"
                                        size="large"
                                        text="signup_with"
                                    />
                                </div>

                                <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                                    <button onClick={() => setViewState('login')} style={{ background: 'none', border: 'none', color: '#64748b', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem' }}>
                                        Already have an account? Login
                                    </button>
                                </div>
                            </motion.div>
                        ) : null}
                    </AnimatePresence>

                    {error && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{
                            marginTop: '2rem', padding: '1rem', background: '#fef2f2', border: '1px solid #fee2e2', borderRadius: '1rem', color: '#dc2626', display: 'flex', alignItems: 'center', gap: '0.8rem', fontSize: '0.85rem', fontWeight: 600
                        }}>
                            <ShieldAlert size={20} /> {error}
                        </motion.div>
                    )}

                    <div style={{ marginTop: '4rem', display: 'flex', justifyContent: 'space-between', color: '#94a3b8', fontSize: '0.75rem', fontWeight: 600, borderTop: '1px solid #f1f5f9', paddingTop: '2rem' }}>
                        <div style={{ cursor: 'pointer' }}>Clinical Documentation</div>
                        <div style={{ cursor: 'pointer' }}>Regulatory Compliance</div>
                        <div style={{ cursor: 'pointer' }}>IT Hotline</div>
                    </div>
                </div>
            </div>

            <style>{`
                .animate-spin { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                input:focus { border-color: ${accentColor} !important; box-shadow: 0 0 0 4px ${accentColor}15 !important; }
            `}</style>
        </div>
    );
};

export default LoginView;
