import React from 'react';
import { motion } from 'framer-motion';
import { Brain, Shield, Zap, Globe, ArrowRight, Github, ChevronDown, CheckCircle2, Activity, Layers } from 'lucide-react';

const LandingPage = ({ onEnterApp }) => {
    return (
        <div style={{ background: '#020617', color: '#f8fafc', minHeight: '100vh', fontFamily: "'Outfit', sans-serif", overflowX: 'hidden' }}>
            {/* Navigation */}
            <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem 4rem', position: 'fixed', width: '100%', top: 0, zIndex: 100, backdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ background: '#6366f1', padding: '0.6rem', borderRadius: '0.75rem' }}>
                        <Brain size={24} color="white" />
                    </div>
                    <span style={{ fontSize: '1.5rem', fontWeight: 900, letterSpacing: '-0.02em' }}>DeepBrain<span style={{ color: '#6366f1' }}>Dx</span></span>
                </div>
                <div style={{ display: 'flex', gap: '2.5rem', fontSize: '0.9rem', fontWeight: 600 }}>
                    <a href="#features" style={{ color: '#94a3b8', textDecoration: 'none' }}>Solutions</a>
                    <a href="#technology" style={{ color: '#94a3b8', textDecoration: 'none' }}>Technology</a>
                    <a href="#security" style={{ color: '#94a3b8', textDecoration: 'none' }}>Security</a>
                    <a href="#research" style={{ color: '#94a3b8', textDecoration: 'none' }}>Research</a>
                </div>
                <button
                    onClick={onEnterApp}
                    style={{
                        background: '#6366f1',
                        color: 'white',
                        border: 'none',
                        padding: '0.75rem 1.5rem',
                        borderRadius: '0.75rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        boxShadow: '0 0 20px rgba(99, 102, 241, 0.4)'
                    }}
                >
                    Launch Terminal
                </button>
            </nav>

            {/* Hero Section */}
            <section style={{ height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', position: 'relative', padding: '0 2rem' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'radial-gradient(circle at 50% 50%, rgba(99, 102, 241, 0.15) 0%, transparent 50%)', pointerEvents: 'none' }}></div>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(99, 102, 241, 0.1)', padding: '0.5rem 1.25rem', borderRadius: '2rem', border: '1px solid rgba(99, 102, 241, 0.3)', color: '#818cf8', fontWeight: 800, fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '2rem', letterSpacing: '0.1em' }}>
                        <Zap size={14} /> Next-Generation Medical AI
                    </div>
                    <h1 style={{ fontSize: 'clamp(3rem, 8vw, 6rem)', fontWeight: 900, lineHeight: 0.9, letterSpacing: '-0.04em', marginBottom: '2rem' }}>
                        Neuro-Diagnostic <br />
                        <span style={{ background: 'linear-gradient(to right, #6366f1, #a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Unified Engine</span>
                    </h1>
                    <p style={{ fontSize: '1.25rem', color: '#94a3b8', maxWidth: '800px', margin: '0 auto 3rem auto', lineHeight: 1.6 }}>
                        Harnessing the power of Swin-Transformer ensembles and U-Net segmentation to provide board-certified accuracy in neuro-pathological detection.
                    </p>
                    <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center' }}>
                        <button
                            onClick={onEnterApp}
                            style={{
                                background: '#6366f1',
                                color: 'white',
                                border: 'none',
                                padding: '1.25rem 2.5rem',
                                borderRadius: '1rem',
                                fontWeight: 800,
                                fontSize: '1.1rem',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem'
                            }}
                        >
                            Get Started <ArrowRight size={20} />
                        </button>
                        <button
                            style={{
                                background: 'transparent',
                                color: 'white',
                                border: '1px solid rgba(255,255,255,0.1)',
                                padding: '1.25rem 2.5rem',
                                borderRadius: '1rem',
                                fontWeight: 800,
                                fontSize: '1.1rem',
                                cursor: 'pointer',
                                backdropFilter: 'blur(10px)'
                            }}
                        >
                            View Protocols
                        </button>
                    </div>
                </motion.div>

                <motion.div
                    animate={{ y: [0, 10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    style={{ position: 'absolute', bottom: '3rem', color: '#64748b' }}
                >
                    <ChevronDown size={32} />
                </motion.div>
            </section>

            {/* Stats Bar */}
            <div style={{ background: 'rgba(255,255,255,0.02)', borderY: '1px solid rgba(255,255,255,0.05)', padding: '4rem 0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-around', maxWidth: '1200px', margin: '0 auto' }}>
                    {[
                        { val: '98.4%', label: 'Prediction Accuracy' },
                        { val: '420ms', label: 'Average Latency' },
                        { val: '10k+', label: 'Clinical Scans' },
                        { val: '24/7', label: 'Network Uptime' }
                    ].map((s, i) => (
                        <div key={i}>
                            <div style={{ fontSize: '3rem', fontWeight: 900, color: '#f1f5f9' }}>{s.val}</div>
                            <div style={{ fontSize: '0.9rem', color: '#6366f1', fontWeight: 800, textTransform: 'uppercase' }}>{s.label}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Features Section */}
            <section id="features" style={{ padding: '10rem 4rem' }}>
                <div style={{ textAlign: 'center', marginBottom: '6rem' }}>
                    <h2 style={{ fontSize: '3rem', fontWeight: 900, marginBottom: '1.5rem' }}>Autonomous Clinical Support</h2>
                    <p style={{ color: '#94a3b8', fontSize: '1.2rem' }}>DeepBrainDx streamlines the entire diagnostic workflow from ingestion to reporting.</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '3rem', maxWidth: '1400px', margin: '0 auto' }}>
                    {[
                        { icon: <Activity />, title: 'Multi-Expert Consensus', desc: 'Ensemble models cross-validate findings to eliminate false positives in aneurysm and stroke detection.' },
                        { icon: <Layers />, title: 'Volumetric Segmentation', desc: 'Precise U-Net architecture calculates exact tumor volume and affected brain regions in cubic millimeters.' },
                        { icon: <Shield />, title: 'HIPAA Compliant Layer', desc: 'Enterprise-grade encryption and clinician-only access shields patient data throughout the diagnostic cycle.' },
                        { icon: <Zap />, title: 'Real-Time Inference', desc: 'Sub-second processing of high-resolution MRI sequences using CUDA-accelerated neural tunnels.' },
                        { icon: <Globe />, title: 'Remote Consultation', desc: 'Generate pixel-perfect clinical reports (PDF) instantly shareable with board-certified specialists.' },
                        { icon: <Brain />, title: 'Neural Heatmaps', desc: 'Visualize the model focus areas using Grad-CAM++ to understand exactly why a diagnosis was made.' }
                    ].map((f, i) => (
                        <div key={i} style={{ background: 'rgba(255,255,255,0.03)', padding: '3rem', borderRadius: '2rem', border: '1px solid rgba(255,255,255,0.05)', transition: 'all 0.3s' }}>
                            <div style={{ background: '#6366f1', display: 'inline-flex', padding: '1rem', borderRadius: '1rem', marginBottom: '2rem' }}>{f.icon}</div>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1rem' }}>{f.title}</h3>
                            <p style={{ color: '#94a3b8', lineHeight: 1.6 }}>{f.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Footer */}
            <footer style={{ padding: '6rem 4rem', borderTop: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginBottom: '2.5rem' }}>
                    <Brain size={32} color="#6366f1" />
                    <span style={{ fontSize: '1.8rem', fontWeight: 900 }}>DeepBrainDx</span>
                </div>
                <p style={{ color: '#64748b', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto 2.5rem auto' }}>
                    Empowering neurologists with artificial intelligence to redefine the standard of care in brain pathology.
                </p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', color: '#94a3b8' }}>
                    <span>Privacy Policy</span>
                    <span>Terms of Service</span>
                    <span>Security Whitepaper</span>
                    <span>API Documentation</span>
                </div>
                <div style={{ marginTop: '4rem', color: '#334155', fontSize: '0.8rem', fontWeight: 700 }}>
                    © 2026 DEEPBRAINDX QUANTUM CORE. FOR RESEARCH & CLINICAL SUPPORT ONLY.
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
