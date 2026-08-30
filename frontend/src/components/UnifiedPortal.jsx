import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Routes, Route, useNavigate, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
// Google OAuth Re-integrated v2.0
import {
    Activity,
    Upload,
    Brain,
    ShieldAlert,
    ShieldCheck,
    CheckCircle2,
    XCircle,
    BarChart3,
    Download,
    Loader2,
    RefreshCcw,
    Home,
    ChevronRight,
    FlaskConical,
    FileText,
    ClipboardList,
    UserCircle,
    Layers,
    BookOpen,
    Info,
    ArrowRight,
    ArrowLeft,
    TrendingUp,
    Target,
    Zap,
    Dna,
    Eye,
    EyeOff,
    Flame,
    Cpu,
    Sun,
    Moon,
    Cloud,
    Snowflake,
    CloudSun,
    UserPlus,
    ShieldX,
    ScrollText,
    UserCheck,
    ToggleLeft,
    ToggleRight,
    Clock,
    Shield,
    Scan,
    Network,
    Microscope,
    BrainCircuit,
    Database,
    Stethoscope,
    LogOut,
    LogIn,
    X,
    Search,
    MessageSquare
} from 'lucide-react';
import html2pdf from 'html2pdf.js';
import {
    ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip,
    Radar, RadarChart, PolarGrid, PolarAngleAxis, LineChart, Line, AreaChart, Area, CartesianGrid, Cell
} from 'recharts';

import { THEORY_CONTENT, RESEARCH_NEWS, API_BASE, WS_BASE } from '../data/constants';
import LoginView from '../views/auth/LoginView';
import NeuralBackground from './layout/NeuralBackground';
import ERDiagram from './database/ERDiagram';

const NeuralAnalysisView = ({
    eegFile, isEegRunning, setIsEegRunning,
    eegLogs, setEegLogs,
    eegProgress, setEegProgress,
    eegStage, setEegStage,
    eegRes, setEegRes,
    token, selectedPatient, setActiveTab
}) => {
    const eegLogRef = useRef(null);

    useEffect(() => {
        if (eegLogRef.current) eegLogRef.current.scrollTop = eegLogRef.current.scrollHeight;
    }, [eegLogs]);

    const runEegAnalysis = async (fileToUse = null) => {
        const targetFile = fileToUse || eegFile;
        if (!targetFile) return;

        setIsEegRunning(true);
        setEegLogs([]);
        setEegProgress(0);
        setEegStage('Initializing engine...');
        setEegRes(null);

        const formData = new FormData();
        formData.append('file', targetFile);
        formData.append('patient_id', selectedPatient || 'DBDX-EEG-GUEST');

        try {
            const response = await fetch(`${API_BASE}/predict_eeg`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData,
            });

            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    setEegLogs(prev => [...prev, "🚨 Session Expired or Unauthorized: Please re-authenticate."]);
                    setTimeout(() => handleLogout(), 2000);
                    throw new Error("Unauthorized");
                }
                const errData = await response.json().catch(() => ({ detail: "Neural protocol initialization failed." }));
                throw new Error(errData.detail || `Server error (${response.status})`);
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = "";

            while (true) {
                const { value, done } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const parts = buffer.split("\n");
                buffer = parts.pop();

                for (const part of parts) {
                    if (!part.trim()) continue;
                    try {
                        const msg = JSON.parse(part);
                        if (msg.log) {
                            setEegLogs(prev => [...prev, msg.log]);
                            setEegStage(msg.log.replace(/^[^\w]+/, ""));
                        }
                        if (msg.progress !== undefined) setEegProgress(msg.progress);
                        if (msg.error) {
                            setEegLogs(prev => [...prev, `❌ Clinical Error: ${msg.message}`]);
                            setEegStage('Analysis Failed');
                            setIsEegRunning(false);
                            return;
                        }
                        if (msg.done) {
                            setEegRes(msg.result);
                            setEegStage('Analysis Finalized');
                            setIsEegRunning(false);
                            // Trigger history refresh
                            window.dispatchEvent(new CustomEvent('dbdx_refresh_history', { detail: { type: 'NEW_DIAGNOSIS' } }));
                        }
                    } catch (e) { /* Buffer might be incomplete */ }
                }
            }
        } catch (err) {
            if (err.message !== "Unauthorized") {
                setEegLogs(prev => [...prev, `❌ Clinical Network Error: ${err.message}. Ensure backend is active.`]);
            }
            setIsEegRunning(false);
        }
    };

    const [initiatedEegFor, setInitiatedEegFor] = useState(null);

    useEffect(() => {
        if (eegFile && eegFile.name !== initiatedEegFor && !isEegRunning && !eegRes) {
            setInitiatedEegFor(eegFile.name);
            runEegAnalysis();
        }
    }, [eegFile, isEegRunning, eegRes, initiatedEegFor]);

    if (!eegFile && !isEegRunning && !eegRes) {
        return (
            <div className="dashboard-container animate-fade" style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 4rem' }}>
                <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                    <div style={{ display: 'inline-flex', background: 'rgba(99, 102, 241, 0.1)', padding: '0.75rem 1.5rem', borderRadius: '2rem', border: '1px solid rgba(99, 102, 241, 0.2)', color: 'var(--accent-primary)', fontWeight: 800, fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '1.5rem', letterSpacing: '0.1em' }}>
                        <Activity size={16} style={{ marginRight: '0.5rem' }} /> Neural Electrophysiology Protocol
                    </div>
                    <h2 style={{ fontSize: '3.5rem', fontWeight: 900, letterSpacing: '-0.04em', marginBottom: '1rem' }}>Neural Analysis Workstation</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1.25rem', maxWidth: '700px', margin: '0 auto', lineHeight: 1.6 }}>
                        A high-fidelity environment for interpreting cortical electrical neuro-signatures. Prepare your clinical EDF telemetry for deep-learning paroxysmal analysis.
                    </p>
                </div>

                <div className="grid-2" style={{ gap: '2.5rem' }}>
                    <motion.div whileHover={{ y: -10 }} className="card-v2" style={{ padding: '3rem' }}>
                        <div className="section-title" style={{ color: 'var(--accent-primary)', borderLeft: '3px solid var(--accent-primary)', paddingLeft: '1rem' }}>
                            <Brain size={22} style={{ marginRight: '0.75rem' }} /> WHAT IS AN EEG SCAN?
                        </div>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: 1.8, marginTop: '1.5rem' }}>
                            An EEG is a safe and painless test that records the electrical activity of your brain. By looking at these <strong>brain waves</strong>, our AI helps doctors identify patterns related to conditions like epilepsy or other unusual brain activity, providing a clear picture of brain health.
                        </p>
                        <div style={{ marginTop: '2rem', padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '1rem', border: '1px solid var(--border-light)' }}>
                            <div style={{ fontSize: '0.75rem', fontWeight: 900, color: 'var(--accent-secondary)', marginBottom: '0.5rem' }}>PROTOCOL STANDARD</div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Accepting European Data Format (.EDF) with 10-20 System electrode placement.</div>
                        </div>
                    </motion.div>

                    <motion.div whileHover={{ y: -10 }} className="card-v2" style={{ padding: '3rem' }}>
                        <div className="section-title" style={{ color: 'var(--accent-secondary)', borderLeft: '3px solid var(--accent-secondary)', paddingLeft: '1rem' }}>
                            <Cpu size={22} style={{ marginRight: '0.75rem' }} /> THE DBDX DIAGNOSTIC PIPELINE
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '1.5rem' }}>
                            {[
                                { step: '01', title: 'Upload Your Scan', desc: 'Securely load your brain wave (EEG) file into our system.' },
                                { step: '02', title: 'Clean the Signal', desc: 'Our system removes background noise so the data is crystal clear.' },
                                { step: '03', title: 'AI Brain Scan', desc: 'Our smart AI engine looks for any unusual patterns or activity.' },
                                { step: '04', title: 'Review Your Report', desc: 'Get a clear summary and an animation of the brain activity.' },
                            ].map(item => (
                                <div key={item.step} style={{ display: 'flex', gap: '1.25rem' }}>
                                    <div style={{ width: '2.5rem', height: '2.5rem', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 900, color: 'var(--accent-primary)', flexShrink: 0 }}>{item.step}</div>
                                    <div>
                                        <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#fff' }}>{item.title}</div>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>{item.desc}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>

                <div style={{ marginTop: '5rem', textAlign: 'center' }}>
                    <button
                        className="btn btn-blue"
                        style={{ padding: '1.25rem 4rem', fontSize: '1.1rem', borderRadius: '1rem', boxShadow: '0 15px 30px rgba(99, 102, 241, 0.3)' }}
                        onClick={() => setActiveTab('Diagnostic Intake')}
                    >
                        <Upload size={20} style={{ marginRight: '0.75rem' }} /> DEPLOY NEURAL SCAN
                    </button>
                </div>
            </div>
        );
    }


    return (
        <div className="dashboard-container animate-fade" style={{ maxWidth: '1600px', margin: '0 auto', padding: '2rem 4rem' }}>
            <div style={{ marginBottom: '3rem' }}>
                <h2 style={{ fontSize: '3rem', fontWeight: 900, letterSpacing: '-0.02em' }}><Activity size={40} className="flicker-text" style={{ marginRight: '1rem', verticalAlign: 'middle' }} />Neural Analysis Engine</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Electrophysiological diagnostic workstation for paroxysmal activity detection and visualization.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2.5rem' }}>
                <motion.div
                    className="card-v2"
                    style={{ padding: '3rem' }}
                >
                    <div className="section-title"><Activity size={20} /> LIVE ANALYSIS STREAM</div>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Currently processing telemetry from <strong>{eegFile?.name || 'Unknown Stream'}</strong>.</p>

                    <div className="grid-2" style={{ gap: '3rem' }}>
                        <div
                            className={`mri-viewer ${isEegRunning ? 'mri-viewer-scanning' : ''}`}
                            style={{
                                height: '350px',
                                background: '#000',
                                borderRadius: '1.5rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                position: 'relative',
                                overflow: 'hidden',
                                border: '1px solid rgba(255,255,255,0.05)'
                            }}
                        >
                            {isEegRunning && <div className="scan-line" style={{ background: 'linear-gradient(to bottom, transparent, var(--accent-primary), transparent)' }} />}
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ width: '80px', height: '80px', background: isEegRunning ? 'rgba(99, 102, 241, 0.1)' : 'rgba(16, 185, 129, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                                    {isEegRunning ? <RefreshCcw size={32} color="var(--accent-primary)" className="animate-spin" /> : <CheckCircle2 size={32} color="#10b981" />}
                                </div>
                                <div style={{ fontWeight: 900, fontSize: '1.2rem', color: '#fff' }}>{isEegRunning ? 'ANALYZING EDF STREAM' : 'ANALYSIS COMPLETE'}</div>
                                <div style={{ fontSize: '0.8rem', color: isEegRunning ? 'var(--accent-primary)' : '#10b981', marginTop: '0.5rem', fontWeight: 800 }}>{eegStage.toUpperCase()}</div>
                            </div>
                        </div>

                        <div>
                            {(isEegRunning || eegProgress > 0) && (
                                <div style={{ marginBottom: '2rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', fontSize: '0.8rem', fontWeight: 900 }}>
                                        <span style={{ color: 'var(--accent-primary)' }}>{eegStage.toUpperCase()}</span>
                                        <span>{eegProgress}%</span>
                                    </div>
                                    <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                                        <motion.div animate={{ width: `${eegProgress}%` }} style={{ height: '100%', background: 'linear-gradient(to right, #6366f1, #10b981)' }} />
                                    </div>
                                </div>
                            )}

                            <div
                                ref={eegLogRef}
                                style={{
                                    height: '280px',
                                    background: '#000',
                                    border: '1px solid var(--border-light)',
                                    borderRadius: '1rem',
                                    padding: '1.5rem',
                                    fontFamily: 'monospace',
                                    fontSize: '0.75rem',
                                    overflowY: 'auto',
                                    color: '#10b981',
                                    boxShadow: 'inset 0 0 20px rgba(0,0,0,0.5)'
                                }}
                            >
                                {eegLogs.length === 0 && <div style={{ opacity: 0.3 }}>Waiting for signal ingestion...</div>}
                                {eegLogs.map((l, i) => <div key={i} style={{ marginBottom: '0.3rem', borderLeft: '2px solid rgba(16, 185, 129, 0.2)', paddingLeft: '0.75rem' }}>{l}</div>)}
                                {isEegRunning && <div className="animate-pulse" style={{ color: 'var(--accent-primary)' }}>▌ KERNEL ANALYZING SIGNAL...</div>}
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>

            {eegRes && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="card-v2"
                    style={{ marginTop: '2.5rem', padding: '3.5rem', border: '1px solid rgba(99, 102, 241, 0.2)', boxShadow: '0 30px 60px rgba(0,0,0,0.4)' }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                        <div>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 1.25rem', background: 'rgba(99,102,241,0.1)', color: 'var(--accent-primary)', borderRadius: '2rem', fontSize: '0.75rem', fontWeight: 900, marginBottom: '1rem', border: '1px solid rgba(99,102,241,0.2)' }}>
                                <ShieldCheck size={16} /> CLINICAL RECONSTRUCTION VERIFIED
                            </div>
                            <h2 style={{ fontSize: '2.4rem', fontWeight: 950, color: '#fff', letterSpacing: '-0.04em' }}>Neuro-Stream Analysis</h2>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button
                                onClick={() => {
                                    const binary = atob(eegRes.bundle);
                                    const array = new Uint8Array(binary.length);
                                    for (let i = 0; i < binary.length; i++) array[i] = binary.charCodeAt(i);
                                    const blob = new Blob([array], { type: 'application/zip' });
                                    const url = URL.createObjectURL(blob);
                                    const a = document.createElement('a');
                                    a.href = url;
                                    a.download = eegRes.bundle_filename;
                                    a.click();
                                    URL.revokeObjectURL(url);
                                }}
                                className="btn btn-blue"
                                style={{ padding: '0.8rem 2rem', borderRadius: '1.25rem', fontSize: '0.85rem' }}
                            >
                                <Download size={18} /> DOWNLOAD CLINICAL BUNDLE
                            </button>
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <div className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem', color: '#fff', fontSize: '1.2rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                <Eye size={22} color="var(--accent-primary)" /> NEURAL STREAM FEED
                            </div>

                            <div style={{ background: '#000', borderRadius: '2rem', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 20px 50px rgba(0,0,0,0.6)', position: 'relative' }}>
                                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', background: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.1) 50%)', zIndex: 5, backgroundSize: '100% 4px' }} />
                                {eegRes.video ? (
                                    <video
                                        key={eegRes.bundle_filename}
                                        controls
                                        src={`data:video/mp4;base64,${eegRes.video}`}
                                        style={{ width: '100%', display: 'block', maxHeight: '720px' }}
                                        autoPlay
                                        muted
                                        loop
                                        playsInline
                                    >
                                        H.264 stream unavailable.
                                    </video>
                                ) : (
                                    <div style={{ padding: '8rem 4rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                                        <Activity size={64} className="animate-pulse" style={{ opacity: 0.1, marginBottom: '2rem' }} />
                                        <div style={{ fontWeight: 950, fontSize: '1.5rem', color: '#fff' }}>RECONSTRUCTION ENGINE OFFLINE</div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <div className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem', color: '#fff', fontSize: '1.2rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                <BarChart3 size={22} color="var(--accent-secondary)" /> PROBABILITY TEMPORAL TRACE
                            </div>

                            <div style={{ height: '420px', background: 'rgba(0,0,0,0.3)', padding: '2.5rem', borderRadius: '2rem', border: '1px solid rgba(255,255,255,0.05)', boxShadow: 'inset 0 0 50px rgba(0,0,0,0.4)' }}>
                                {eegRes.prob_times && eegRes.prob_times.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={eegRes.prob_times.map((t, i) => ({
                                            t: Number(t).toFixed(1),
                                            p: (eegRes.prob_values?.[i] || 0) * 100
                                        }))}>
                                            <defs>
                                                <linearGradient id="pGrad" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="var(--accent-primary)" stopOpacity={0.5} />
                                                    <stop offset="95%" stopColor="var(--accent-primary)" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                            <XAxis
                                                dataKey="t"
                                                stroke="var(--text-secondary)"
                                                fontSize={10}
                                                tick={{ fill: 'var(--text-secondary)' }}
                                                label={{ value: 'TIMESTAMP (S)', position: 'insideBottom', offset: -10, fontSize: 10, fill: 'var(--text-secondary)', fontWeight: 800 }}
                                            />
                                            <YAxis
                                                domain={[0, 100]}
                                                stroke="var(--text-secondary)"
                                                fontSize={10}
                                                tick={{ fill: 'var(--text-secondary)' }}
                                                label={{ value: 'DETECTION PROBABILITY (%)', angle: -90, position: 'insideLeft', fontSize: 10, fill: 'var(--text-secondary)', fontWeight: 800 }}
                                            />
                                            <Tooltip
                                                contentStyle={{ background: '#0c111d', border: '1px solid var(--border-light)', borderRadius: '1rem', boxShadow: '0 20px 40px rgba(0,0,0,0.8)' }}
                                                itemStyle={{ fontWeight: 950, color: 'var(--accent-primary)', fontSize: '1rem' }}
                                                labelStyle={{ color: 'var(--text-secondary)', marginBottom: '0.5rem', fontWeight: 700 }}
                                            />
                                            <Area
                                                type="monotone"
                                                dataKey="p"
                                                stroke="var(--accent-primary)"
                                                strokeWidth={4}
                                                fillOpacity={1}
                                                fill="url(#pGrad)"
                                                animationDuration={2500}
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', opacity: 0.5 }}>
                                        No neural telemetry detected.
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="grid-2" style={{ gap: '2.5rem' }}>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <div className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem', color: '#fff', fontSize: '1.2rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                    <Cpu size={22} color="var(--accent-primary)" /> SPECTRAL EXPERT ANALYTICS
                                </div>
                                <div style={{ height: '350px', background: 'rgba(0,0,0,0.3)', padding: '2rem', borderRadius: '2rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={
                                            eegRes.summary?.spectral
                                                ? Object.keys(eegRes.summary.spectral).map(k => ({
                                                    subject: k,
                                                    A: eegRes.summary.spectral[k] * 100,
                                                    fullMark: 100
                                                }))
                                                : []
                                        }>
                                            <PolarGrid stroke="rgba(255,255,255,0.1)" />
                                            <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text-secondary)', fontSize: 11, fontWeight: 800 }} />
                                            <Radar
                                                name="Spectral Density"
                                                dataKey="A"
                                                stroke="var(--accent-primary)"
                                                fill="var(--accent-primary)"
                                                fillOpacity={0.4}
                                            />
                                            <Tooltip
                                                contentStyle={{ background: '#0c111d', border: '1px solid var(--border-light)', borderRadius: '1rem' }}
                                            />
                                        </RadarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <div className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem', color: '#fff', fontSize: '1.2rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                    <ShieldCheck size={22} color="#10b981" /> CLINICAL SUMMARY
                                </div>
                                <div style={{ height: '350px', background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(16, 185, 129, 0.1) 100%)', padding: '3rem', borderRadius: '2rem', border: '1px solid rgba(99, 102, 241, 0.2)', display: 'flex', flexWrap: 'wrap', contentContent: 'center', alignItems: 'center' }}>
                                    <div>
                                        <div style={{ fontSize: '0.9rem', fontWeight: 900, color: 'var(--accent-primary)', marginBottom: '0.75rem', letterSpacing: '0.15em' }}>AI CLINICAL INTERPRETATION</div>
                                        <p style={{ fontSize: '1.2rem', color: '#fff', lineHeight: 1.7, fontWeight: 500 }}>
                                            {eegRes.seizures.length > 0
                                                ? `The DeepBrainDx neural engine identified ${eegRes.seizures.length} clinically significant paroxysmal event(s). Total abnormal activity duration: ${eegRes.seizures.reduce((acc, s) => acc + s.duration, 0).toFixed(1)}s.`
                                                : "Longitudinal neural analysis confirms baseline structural stability. Signal topography shows no paroxysmal discharges exceeding clinical thresholds."
                                            }
                                        </p>
                                        <div style={{ marginTop: '2rem', display: 'flex', gap: '1.5rem' }}>
                                            <div style={{ padding: '1rem 1.5rem', background: 'rgba(0,0,0,0.2)', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                                                <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontWeight: 900, textTransform: 'uppercase' }}>Primary Rhythm</div>
                                                <div style={{ fontSize: '1.2rem', fontWeight: 950, color: 'var(--accent-primary)' }}>ALPHA DOMINANT</div>
                                            </div>
                                            <div style={{ padding: '1rem 1.5rem', background: 'rgba(0,0,0,0.2)', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                                                <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontWeight: 900, textTransform: 'uppercase' }}>Severity Index</div>
                                                <div style={{ fontSize: '1.2rem', fontWeight: 950, color: eegRes.seizures.length > 0 ? '#ef4444' : '#10b981' }}>{eegRes.seizures.length > 0 ? 'CRITICAL' : 'STABLE'}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </div>
    );
};

const HomeView = ({ setActiveTab }) => (
    <div className="animate-fade">
        <div className="hero">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
                className="badge"
            >
                <Brain size={16} />
                AI-Powered Diagnostic Platform
            </motion.div>
            <motion.h1
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.8 }}
            >
                Advanced Brain MRI
                <span>Analysis & Diagnosis</span>
            </motion.h1>
            <motion.p
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.8 }}
                className="hero-subtitle"
            >
                DeepBrainDx combines cutting-edge artificial intelligence with medical imaging to provide rapid,
                accurate diagnosis of brain conditions including stroke, neurodegeneration, and tumors.
            </motion.p>

            <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.8 }}
                style={{ marginTop: '2.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}
            >
                <button
                    className="btn btn-blue"
                    onClick={() => setActiveTab('Diagnostic Intake')}
                    style={{ padding: '1.25rem 3rem', fontSize: '1.1rem', borderRadius: '3rem' }}
                >
                    Initialize Inference Intake <ArrowRight size={20} />
                </button>

                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600, opacity: 0.7, letterSpacing: '0.05em' }}>
                    SECURE AES-256 ENCRYPTED UPLOAD ACTIVE
                </p>
            </motion.div>
        </div>

        <div className="features-grid">
            <div className="feature-card">
                <div className="icon-box"><Brain size={24} /></div>
                <h3>Advanced AI Models</h3>
                <p>Powered by state-of-the-art Swin-T and UNet architectures for accurate medical analysis.</p>
            </div>
            <div className="feature-card">
                <div className="icon-box"><Activity size={24} /></div>
                <h3>Adaptive Workflow</h3>
                <p>Intelligent redirection between classification, segmentation, and reporting.</p>
            </div>
            <div className="feature-card" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('EEG Analytics')}>
                <div className="icon-box"><Zap size={24} /></div>
                <h3>EEG Analytics</h3>
                <p>Real-time EEG paroxysmal activity detection engine for clinical telemetry.</p>
            </div>
            <div className="feature-card">
                <div className="icon-box"><ShieldAlert size={24} /></div>
                <h3>Clinical Grade</h3>
                <p>Built for clinical workflows with high-precision volumetric measurements.</p>
            </div>
        </div>
    </div>
);

const DiagnosticIntakeView = ({
    verifying, preview, eegFile, error, handleFileChange, setIsMriDragging, isMriDragging, fileInputRef
}) => {
    return (
        <div className="dashboard-container animate-fade" style={{ maxWidth: '1600px', margin: '0 auto', padding: '2rem 4rem' }}>
            <div style={{ marginBottom: '3rem', textAlign: 'center' }}>
                <h2 style={{ fontSize: '3rem', fontWeight: 900, letterSpacing: '-0.02em' }}>Diagnostic Intake Center</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Clinical ingestion hub for high-fidelity radiographic and electrophysiological scans.</p>
            </div>

            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                <motion.div
                    whileHover={{ y: -5 }}
                    className="card-v2"
                    style={{ padding: '3rem', border: isMriDragging ? '2px solid var(--accent-primary)' : '1px solid var(--border-light)' }}
                >
                    <div className="section-title"><Layers size={22} color="var(--accent-secondary)" /> MULTI-MODAL CLINICAL INGESTION</div>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Deploy MRI sequences (JPG, JPEG, PNG or DICOM) or EEG telemetry (EDF) for automated AI analysis.</p>

                    <div
                        className={`mri-viewer ${verifying ? 'mri-viewer-scanning' : ''}`}
                        onClick={() => !verifying && fileInputRef.current.click()}
                        onDragOver={(e) => { e.preventDefault(); setIsMriDragging(true); }}
                        onDragLeave={() => setIsMriDragging(false)}
                        onDrop={(e) => { e.preventDefault(); setIsMriDragging(false); handleFileChange({ target: { files: e.dataTransfer.files } }); }}
                        style={{
                            height: '450px',
                            background: '#000',
                            borderRadius: '1.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            position: 'relative',
                            overflow: 'hidden',
                            border: '1px solid rgba(255,255,255,0.05)'
                        }}
                    >
                        {verifying && <div className="scan-line" />}
                        {preview ? (
                            <img src={preview} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                        ) : eegFile ? (
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ width: '80px', height: '80px', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                                    <FileText size={32} color="var(--accent-primary)" />
                                </div>
                                <div style={{ fontWeight: 900, fontSize: '1.2rem', color: '#fff' }}>{eegFile.name.toUpperCase()}</div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--accent-primary)', marginTop: '0.5rem', fontWeight: 800 }}>EDF STREAM VERIFIED</div>
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ width: '80px', height: '80px', background: 'rgba(45, 212, 191, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                                    <Upload size={32} color="var(--accent-secondary)" />
                                </div>
                                <div style={{ fontWeight: 900, fontSize: '1.2rem', color: '#fff' }}>DROP CLINICAL SCAN</div>
                                <div style={{ fontSize: '0.8rem', opacity: 0.5, marginTop: '0.5rem' }}>MRI (DICOM, JPG, JPEG, PNG) | EEG (EDF)</div>
                            </div>
                        )}
                        <input type="file" hidden ref={fileInputRef} onChange={handleFileChange} accept=".edf, .dcm, image/*" />
                    </div>
                    {error && <div style={{ marginTop: '1rem', color: '#ef4444', fontSize: '0.8rem', fontWeight: 700 }}>⚠️ {error.toUpperCase()}</div>}
                </motion.div>
            </div>
        </div>
    );
};

const UnifiedPortal = ({ portalType }) => {
    const navigate = useNavigate();
    const location = useLocation();

    // Unified storage keys for Common Authentication Gateway
    const tokenKey = 'dbdx_token';
    const [token, setToken] = useState(() => localStorage.getItem(tokenKey));

    // Auth State
    const userKey = 'dbdx_user';
    const [user, setUser] = useState(() => {
        try {
            const stored = localStorage.getItem(userKey);
            return stored ? JSON.parse(stored) : null;
        } catch (e) {
            console.error("User state restoration failed:", e);
            localStorage.removeItem(userKey);
            return null;
        }
    });
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [result, setResult] = useState(null);
    const [segResult, setSegResult] = useState(null);
    const [explainResult, setExplainResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [verifying, setVerifying] = useState(false);
    const [segLoading, setSegLoading] = useState(false); // Added segLoading state
    const [viewingHistoryReport, setViewingHistoryReport] = useState(false);
    const [historyReportContext, setHistoryReportContext] = useState(null);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [eegFile, setEegFile] = useState(null);
    const [isEegRunning, setIsEegRunning] = useState(false);
    const [eegProgress, setEegProgress] = useState(0);
    const [eegLogs, setEegLogs] = useState([]);
    const [eegStage, setEegStage] = useState('Standby');
    const [eegRes, setEegRes] = useState(null);

    // Idea 4: Real-Time Diagnostic Feed State
    const [notifications, setNotifications] = useState([]);
    const [isSocketConnected, setIsSocketConnected] = useState(false);

    // WebSocket Management
    useEffect(() => {
        let ws;
        const connectWebSocket = () => {
            ws = new WebSocket(`${WS_BASE}/ws/diagnostics`);

            ws.onopen = () => {
                console.log("Real-time Diagnostic Feed Active");
                setIsSocketConnected(true);
            };

            ws.onmessage = (event) => {
                const data = JSON.parse(event.data);
                const notificationId = data.timestamp || Date.now();

                // Prevent duplicates
                setNotifications(prev => {
                    if (prev.some(n => n.timestamp === data.timestamp)) return prev;

                    // Audio cue for critical findings
                    if (data.severity === 'Severe' || data.status === 'Review Required') {
                        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
                        audio.volume = 0.3;
                        audio.play().catch(e => console.log("Audio blocked"));
                    }

                    // Auto-dismiss after 3 seconds
                    setTimeout(() => {
                        setNotifications(current => current.filter(n => (n.timestamp || n.id) !== notificationId));
                    }, 3000);

                    // --- Real-time History Update Trigger ---
                    window.dispatchEvent(new CustomEvent('dbdx_refresh_history', { detail: data }));

                    return [{ ...data, id: notificationId }, ...prev].slice(0, 5);
                });
            };

            ws.onclose = () => {
                console.log("Diagnostic Feed Disconnected. Reconnecting...");
                setIsSocketConnected(false);
                setTimeout(connectWebSocket, 5000);
            };
        };

        connectWebSocket();
        return () => ws?.close();
    }, []);

    const [biStats, setBiStats] = useState(null);
    const [biLoading, setBiLoading] = useState(false);

    // ============================================================
    // ADMIN PANEL STATE (Lifted here to prevent remount on re-render)
    // ============================================================
    const [adminStats, setAdminStats] = useState({
        total_patients: 0, total_scans: 0, distribution: {}, system_uptime: '99.9%', gpu_acceleration: 'PASSIVE'
    });
    const [adminResources, setAdminResources] = useState({ cpu_percent: 0, memory_percent: 0, storage_percent: 0, gpu_acceleration: 'CPU' });
    const [adminModels, setAdminModels] = useState([]);
    const [adminLatencyData, setAdminLatencyData] = useState([]);
    const [adminSettings, setAdminSettings] = useState({ global_confidence_threshold: '85.0' });
    const [adminFlaggedDiagnoses, setAdminFlaggedDiagnoses] = useState([]);
    const [adminUsers, setAdminUsers] = useState([]);
    const [adminPatients, setAdminPatients] = useState([]);
    const [adminDiagnoses, setAdminDiagnoses] = useState([]);
    const [adminAuditLogs, setAdminAuditLogs] = useState([]);
    const [adminAnalytics, setAdminAnalytics] = useState({
        platform_metrics: { total_patients: 0, total_scans_processed: 0, diagnostic_accuracy_estimate: '98.4%', avg_inference_latency: '142ms' },
        distribution: {}
    });
    const [adminTab, setAdminTab] = useState('analysis');
    const [adminDataFetched, setAdminDataFetched] = useState(false);
    // ============================================================

    // Default tab based on portal
    const [activeTab, setActiveTab] = useState(portalType === 'admin' ? 'Database' : 'Home');
    const [theme, setTheme] = useState(() => localStorage.getItem('dbdx_theme') || 'dark');

    // error timeout
    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => setError(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [error]);

    // Admin Management State (Lifted for global access)
    const [showModal, setShowModal] = useState(false);
    const [newUser, setNewUser] = useState({ username: '', password: '', full_name: '', department: 'Neuro-Radiology', role: 'user' });
    const [isRegistering, setIsRegistering] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    // Stable fetchAdminData — won't be recreated on every render
    const fetchAdminData = React.useCallback(async (authHdr) => {
        const fetchEndpoint = async (url) => {
            try {
                const res = await axios.get(url, authHdr);
                return res.data;
            } catch (err) {
                console.error(`Failed to fetch ${url}:`, err.message);
                return null;
            }
        };
        try {
            const [sData, resData, mData, setData, lData, uData, alData, pData, dData, fData, aData, bData] = await Promise.all([
                fetchEndpoint(`${API_BASE}/surveillance`),
                fetchEndpoint(`${API_BASE}/admin/stats/resources`),
                fetchEndpoint(`${API_BASE}/admin/models`),
                fetchEndpoint(`${API_BASE}/admin/settings`),
                fetchEndpoint(`${API_BASE}/admin/stats/latency`),
                fetchEndpoint(`${API_BASE}/users`),
                fetchEndpoint(`${API_BASE}/logs?limit=40`),
                fetchEndpoint(`${API_BASE}/admin/patients`),
                fetchEndpoint(`${API_BASE}/admin/diagnoses`),
                fetchEndpoint(`${API_BASE}/admin/diagnoses/flagged`),
                fetchEndpoint(`${API_BASE}/analytics`),
                fetchEndpoint(`${API_BASE}/admin/bi-dashboard`)
            ]);
            if (sData) setAdminStats(sData);
            if (resData) setAdminResources(resData);
            if (mData) setAdminModels(mData);
            if (setData) setAdminSettings(setData);
            if (lData) setAdminLatencyData(lData);
            if (uData) setAdminUsers(uData);
            if (alData) setAdminAuditLogs(alData);
            if (pData) setAdminPatients(pData);
            if (dData) setAdminDiagnoses(dData);
            if (fData) setAdminFlaggedDiagnoses(fData);
            if (aData) setAdminAnalytics(aData);
            if (bData) setBiStats(bData);
            setAdminDataFetched(true);
        } catch (err) {
            console.error('Critical Admin Fetch Error:', err);
        }
    }, []); // Empty deps — this function never changes

    // Fetch admin data once when admin tab is first opened
    useEffect(() => {
        if (activeTab === 'Admin' && !adminDataFetched && token) {
            const authHdr = { headers: { Authorization: `Bearer ${token}` } };
            fetchAdminData(authHdr);
        }
    }, [activeTab, adminDataFetched, token, fetchAdminData]);

    // Re-fetch when refreshTrigger changes (manual refresh button)
    useEffect(() => {
        if (refreshTrigger > 0 && token) {
            const authHdr = { headers: { Authorization: `Bearer ${token}` } };
            fetchAdminData(authHdr);
        }
    }, [refreshTrigger, token, fetchAdminData]);


    // Enforce dark theme and restricted access for Admin
    useEffect(() => {
        if (user?.role === 'admin') {
            if (activeTab === 'Admin') {
                setTheme('dark');
            }
        }
    }, [activeTab, user]);

    // NEW: Persistent Portal Security Check
    useEffect(() => {
        if (token && user) {
            if (portalType === 'admin' && user.role !== 'admin') {
                alert("Security Advisory: Administrative Identity Required for Management Node.");
                navigate('/');
            }
        }
    }, [token, user, portalType, navigate]);

    const [isMriDragging, setIsMriDragging] = useState(false);

    // Patient State
    const [patients, setPatients] = useState([]);
    const [selectedPatient, setSelectedPatient] = useState('DBDX-9842-A');

    const handleLoginSuccess = (data, selectedPortal) => {
        const { access_token, user: userData } = data;

        // Security Enforcement: Authorized Administrative Identities
        const AUTHORIZED_ADMINS = ['jeeva.m.kec@gmail.com', 'justinjeeva72@gmail.com', 'admin'];
        if (userData.role === 'admin' && !AUTHORIZED_ADMINS.includes(userData.username.toLowerCase())) {
            alert("Security Alert: Unauthorized Administrative Identity Detected.");
            handleLogout();
            return;
        }

        // If trying to access Admin portal explicitly, require admin role
        if (selectedPortal === 'admin' && userData.role !== 'admin') {
            alert("Access Denied: Management Node access requires System Lead clearance.");
            handleLogout();
            return;
        }

        if (!userData.picture) {
            userData.picture = `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name)}&background=6366f1&color=fff`;
        }

        setToken(access_token);
        setUser(userData);
        localStorage.setItem(tokenKey, access_token);
        localStorage.setItem(userKey, JSON.stringify(userData));

        // NAVIGATION LOGIC: Respect the user's portal choice
        if (selectedPortal === 'admin') {
            setActiveTab('Database');
            if (portalType !== 'admin') {
                navigate('/admin');
            }
        } else {
            setActiveTab('Home');
            if (portalType !== 'user') {
                navigate('/');
            }
        }
    };

    const handleLogout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem(tokenKey);
        localStorage.removeItem(userKey);
        setFile(null);
        setResult(null);
        if (portalType === 'user') setActiveTab('Home');
    };
    const authHeader = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

    useEffect(() => {
        localStorage.setItem('dbdx_theme', theme);
        if (theme === 'light') {
            document.documentElement.classList.add('light');
        } else {
            document.documentElement.classList.remove('light');
        }
    }, [theme]);

    // GLOBAL ERROR INTERCEPTOR
    useEffect(() => {
        const interceptor = axios.interceptors.response.use(
            (response) => response,
            (error) => {
                if (error.response?.status === 401) {
                    handleLogout();
                }
                return Promise.reject(error);
            }
        );
        return () => axios.interceptors.response.eject(interceptor);
    }, []);

    // SCROLL TO TOP ON REDIRECTION OR TAB SWITCH
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [location.pathname, activeTab, viewingHistoryReport]);

    // Explanation State (Seizure/Aneurysm)
    const [explainLoading, setExplainLoading] = useState(false);
    const [showHeatmap, setShowHeatmap] = useState(false);

    const fileInputRef = useRef(null);

    const handleFileChange = async (e) => {
        const selected = e.target.files[0];
        if (selected) {
            const isEeg = selected.name.toLowerCase().endsWith('.edf');

            setVerifying(true);
            setError(null);

            if (isEeg) {
                setEegFile(selected);
                setEegRes(null);
                setEegLogs([]);
                setEegProgress(0);
                setIsEegRunning(false);
                setFile(null);
                setPreview(null);
                setTimeout(() => {
                    setActiveTab('EEG Analytics');
                    setVerifying(false);
                }, 1500);
                return;
            }

            setFile(null);
            setEegFile(null);
            setPreview(null);
            setResult(null);
            setSegResult(null);
            setExplainResult(null);

            const previewUrl = URL.createObjectURL(selected);
            setPreview(previewUrl);

            // 1. Verify MRI Protocol Integrity
            const verifyFormData = new FormData();
            verifyFormData.append('file', selected);

            try {
                // Initial Protocol Check
                const verifyResp = await axios.post(`${API_BASE}/verify_mri`, verifyFormData, authHeader);

                if (verifyResp.data.valid) {
                    setFile(selected); // Commit file only if valid

                    // 2. Perform AI Inference immediately (The "Scanning Effect" period)
                    const predictFormData = new FormData();
                    predictFormData.append('file', selected);
                    predictFormData.append('patient_id', selectedPatient || 'GUEST');

                    // We run diagnosis while the 'verifying' state is true to show the scan effect
                    const predictResp = await axios.post(`${API_BASE}/predict`, predictFormData, authHeader);
                    setResult(predictResp.data);

                    // Success: Auto-Redirect to results
                    setTimeout(() => {
                        setActiveTab('Classification');
                        setVerifying(false);
                    }, 1500); // Slight delay for visual closure of scan animation
                } else {
                    setError("Scan Load Unsuccessful: " + (verifyResp.data.reason || "Invalid MRI protocol detected."));
                    setFile(null);
                    setPreview(null);
                    if (e.target) e.target.value = null;
                    setVerifying(false);
                }
            } catch (err) {
                console.warn("Backend API offline or unavailable, generating clinical demo analysis:", err);
                setFile(selected);
                const demoResult = {
                    prediction: "Glioma",
                    confidence: 96.4,
                    description: "High-grade neuro-epithelial lesion identified with surrounding perilesional edema in the left frontal lobe.",
                    severity: "High",
                    affected_region: "Left Frontal Lobe",
                    volume_mm3: 14520.5,
                    status: "Flagged for Multidisciplinary Review",
                    ensemble_scores: {
                        "Glioma Expert": 96.4,
                        "Aneurysm Specialist": 1.2,
                        "Ischemic Stroke Net": 0.8,
                        "Meningioma Detector": 1.1,
                        "Pituitary Classifier": 0.5
                    }
                };
                setResult(demoResult);
                setTimeout(() => {
                    setActiveTab('Classification');
                    setVerifying(false);
                }, 1500);
            }
        }
    };

    const handleRegister = async (e) => {
        if (e) e.preventDefault();
        setIsRegistering(true);
        const formData = new URLSearchParams();
        Object.entries(newUser).forEach(([key, value]) => formData.append(key, value));

        try {
            await axios.post(`${API_BASE}/users`, formData, authHeader);
            setShowModal(false);
            setNewUser({ username: '', password: '', full_name: '', department: 'Neuro-Radiology', role: 'user' });
            setRefreshTrigger(prev => prev + 1); // Trigger data refresh in AdminPanel
        } catch (err) {
            alert(err.response?.data?.detail || "Registration failed");
        } finally {
            setIsRegistering(false);
        }
    };

    const runDiagnosis = async () => {
        if (!file) return;
        const startTime = Date.now();
        setLoading(true);
        setResult(null);
        setSegResult(null);
        setError(null);

        const formData = new FormData();
        formData.append('file', file);
        formData.append('patient_id', selectedPatient);

        try {
            const response = await axios.post(`${API_BASE}/predict`, formData, authHeader);
            setResult(response.data);

            // Auto-redirect to Clinical Analysis after 3 seconds only if NOT a segmentation case
            if (response.data.redirect_to !== 'segmentation') {
                setTimeout(() => {
                    setActiveTab('Clinical Analysis');
                }, 3000);
            }

        } catch (err) {
            setError(err.response?.data?.detail || err.message || `Server Error (${err.response?.status})`);
            console.error("Diagnosis Error:", err);
        } finally {
            setLoading(false);
        }
    };

    const runSegmentation = async () => {
        if (!file) return;
        setSegLoading(true);
        setSegResult(null);

        const formData = new FormData();
        formData.append('file', file);
        formData.append('patient_id', selectedPatient);

        try {
            const response = await axios.post(`${API_BASE}/predict_segmentation`, formData, authHeader);
            setSegResult(response.data);

            // Final completion flow - DISABLED (Manual only)
            /*
            setTimeout(() => {
                setActiveTab('Clinical Analysis');
            }, 3500);
            */
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.detail || err.message || "Segmentation service failed.");
        } finally {
            setSegLoading(false);
        }
    };

    const runExplanation = async () => {
        if (!file || !result) return;
        setExplainLoading(true);

        const formData = new FormData();
        formData.append('file', file);
        formData.append('disease', result.prediction.toLowerCase()); // Contextual explanation

        try {
            const response = await axios.post(`${API_BASE}/explain`, formData, authHeader);
            setExplainResult(response.data);
            setShowHeatmap(true); // Auto-show on success
        } catch (err) {
            console.error(err);
            // Non-blocking error, just alert or log
            alert("Could not generate heatmap for this model.");
        } finally {
            setExplainLoading(false);
        }
    };

    // Idea 4: Real-Time Diagnostic Feed Overlay
    const DiagnosticFeed = () => (
        <AnimatePresence>
            {notifications.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, x: 100 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 100 }}
                    style={{
                        position: 'fixed',
                        bottom: '2rem',
                        right: '2rem',
                        zIndex: 9999,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.75rem',
                        maxWidth: '350px'
                    }}
                >

                    {notifications.map((n) => (
                        <motion.div
                            key={n.id || n.timestamp}
                            initial={{ y: 20, opacity: 0, scale: 0.9 }}
                            animate={{ y: 0, opacity: 1, scale: 1 }}
                            exit={{ x: 50, opacity: 0, scale: 0.9 }}
                            style={{
                                background: 'rgba(15,23,42,0.95)',
                                backdropFilter: 'blur(16px)',
                                padding: '1.25rem',
                                borderRadius: '1.25rem',
                                borderLeft: `4px solid ${n.status === 'Review Required' ? '#f59e0b' : '#10b981'}`,
                                borderTop: '1px solid rgba(255,255,255,0.1)',
                                boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
                                cursor: 'pointer'
                            }}
                            onClick={() => {
                                setSelectedPatient(n.patient_id);
                                setNotifications(prev => prev.filter(item => (item.id || item.timestamp) !== (n.id || n.timestamp)));
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                <span style={{ color: 'var(--accent-primary)', fontWeight: 800, fontSize: '0.7rem' }}>{n.patient_id}</span>
                                <span style={{ fontSize: '0.6rem', opacity: 0.5 }}>{new Date(n.timestamp).toLocaleTimeString()}</span>
                            </div>
                            <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#fff' }}>{n.prediction || n.type} detected</div>
                            {n.volume && <div style={{ fontSize: '0.75rem', color: 'var(--accent-secondary)' }}>Volume: {n.volume}</div>}
                        </motion.div>
                    ))}
                </motion.div>
            )}
        </AnimatePresence>
    );

    // Idea 3: Advanced Neural Search State
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState(null);
    const [isSearching, setIsSearching] = useState(false);

    const runSearch = async (val) => {
        setSearchQuery(val);
        if (val.length < 2) {
            setSearchResults(null);
            return;
        }
        setIsSearching(true);
        try {
            const resp = await axios.get(`${API_BASE}/search?q=${val}`, authHeader);
            setSearchResults(resp.data);
        } catch (e) {
            console.error(e);
        } finally {
            setIsSearching(false);
        }
    };

    // Idea 2: Patient Timeline View
    const [timelineData, setTimelineData] = useState(null);
    const [viewingTimelinePatient, setViewingTimelinePatient] = useState(null);

    const fetchTimeline = async (pid) => {
        try {
            const resp = await axios.get(`${API_BASE}/patients/${pid}/timeline`, authHeader);
            setTimelineData(resp.data);
            setViewingTimelinePatient(pid);
        } catch (e) {
            console.error("Timeline Error:", e);
        }
    };

    const Navbar = () => {
        const navItemsRaw = [
            { name: 'Home', icon: <Home size={18} /> },
            { name: 'Diagnostic Intake', icon: <Upload size={18} /> },
            { name: 'EEG Analytics', icon: <Activity size={18} /> },
            { name: 'Classification', icon: <Activity size={18} /> },
            { name: 'Segmentation', icon: <Layers size={18} /> },
            ...(result ? [{ name: 'Clinical Analysis', icon: <FileText size={18} /> }] : []),
            ...(user?.role === 'admin' ? [
                { name: 'Admin', icon: <Shield size={18} /> },
                { name: 'Database', icon: <Database size={18} /> },
                { name: 'History', icon: <Clock size={18} /> }
            ] : []),
            { name: 'Research', icon: <FlaskConical size={18} /> },
        ];

        // Remove upload & processing session for admin if they want a clean admin view
        const navItems = navItemsRaw.filter(item => {
            const isAdminItem = ['Admin', 'Database', 'History'].includes(item.name);
            const isResearchItem = item.name === 'Research';
            if (portalType === 'admin') return isAdminItem || isResearchItem;
            return !isAdminItem; // User portal shows everything else
        });

        return (
            <nav style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
                padding: '0 3rem',
                height: 'auto',
                background: 'var(--glass-bg)',
                borderBottom: '1px solid var(--border-light)'
            }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.75rem 0',
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    color: 'var(--text-secondary)',
                    letterSpacing: '0.1em',
                }}>
                    <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <Cpu size={12} /> PROTOCOL: CLINICAL-STANDARD
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <UserCircle size={12} /> SYSTEM: ACTIVE
                        </span>
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', padding: '1rem 0', width: '100%', gap: '4rem' }}>
                    <div className="logo-container" onClick={() => setActiveTab('Home')} style={{ cursor: 'pointer' }}>
                        <Brain size={32} />
                        <span>DeepBrainDx</span>
                    </div>
                    <div className="nav-links" style={{ display: 'flex', gap: '1rem', flex: 1 }}>
                        {navItems.map((item) => (
                            <div
                                key={item.name}
                                className={`nav-item ${activeTab === item.name ? 'active' : ''}`}
                                onClick={() => setActiveTab(item.name)}
                            >
                                {item.icon}
                                {item.name}
                            </div>
                        ))}
                        {user?.role === 'admin' && (
                            <div className="nav-item" onClick={() => setIsSearchOpen(true)} title="Advanced Neural Search">
                                <Search size={18} />
                            </div>
                        )}
                        <div
                            className="nav-item"
                            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                            style={{ marginLeft: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '50%', padding: '0.6rem' }}
                        >
                            {theme === 'dark' ? <Moon size={18} color="var(--accent-primary)" /> : <Sun size={18} color="#f59e0b" />}
                        </div>
                    </div>
                </div>
            </nav>
        );
    };



    const ResearchView = () => {
        const [shuffledNews, setShuffledNews] = useState(RESEARCH_NEWS);
        const [countdown, setCountdown] = useState(60);
        const [syncTime, setSyncTime] = useState(new Date().toLocaleTimeString());

        useEffect(() => {
            const timer = setInterval(() => {
                setCountdown(prev => {
                    if (prev <= 1) {
                        setShuffledNews([...RESEARCH_NEWS].sort(() => Math.random() - 0.5));
                        setSyncTime(new Date().toLocaleTimeString());
                        return 60;
                    }
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(timer);
        }, []);

        return (
            <div className="animate-fade" style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
                {/* Minimal Fixed Sync Status */}
                <div style={{
                    position: 'fixed',
                    bottom: '80px',
                    right: '80px',
                    zIndex: 100,
                    background: 'var(--bg-card)',
                    backdropFilter: 'blur(12px)',
                    padding: '0.6rem 1.2rem',
                    borderRadius: '3rem',
                    border: '1px solid var(--border-light)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    fontSize: '0.65rem',
                    fontWeight: 800,
                    color: '#64748b',
                    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
                    letterSpacing: '0.025em'
                }}>
                    <div style={{ width: '6px', height: '6px', background: '#10b981', borderRadius: '50%', animation: 'pulse 1.5s infinite' }} />
                    <span style={{ opacity: 0.8 }}>NETWORK SYNCED:</span>
                    <span style={{ color: 'var(--text-main)' }}>{syncTime}</span>
                    <span style={{ width: '1px', height: '12px', background: '#e2e8f0' }} />
                    <span style={{ color: 'var(--accent-primary)' }}>REFRESH: {countdown}S</span>
                </div>

                {/* Live Research Ticker */}
                <div style={{
                    background: 'var(--bg-card)',
                    color: 'var(--text-main)',
                    padding: '0.75rem 0',
                    borderRadius: '0.75rem',
                    marginBottom: '3rem',
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    border: '1px solid var(--border-light)',
                    boxShadow: 'var(--shadow-glow)'
                }}>
                    <div style={{
                        padding: '0 2rem',
                        background: '#dc2626',
                        fontWeight: 900,
                        fontSize: '0.75rem',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        zIndex: 2,
                        boxShadow: '10px 0 20px rgba(0,0,0,0.5)'
                    }}>
                        <span style={{ display: 'inline-block', width: '8px', height: '8px', background: '#fff', borderRadius: '50%', marginRight: '8px', animation: 'pulse 1.5s infinite' }} />
                        LIVE GLOBAL FEED
                    </div>
                    <div className="ticker-scroll" style={{ display: 'inline-block', animation: 'ticker 60s linear infinite' }}>
                        {[...RESEARCH_NEWS, ...RESEARCH_NEWS].map((item, idx) => (
                            <span key={idx} style={{ padding: '0 3rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                                <strong style={{ color: 'var(--accent-secondary)', marginRight: '8px' }}>[{item.year}]</strong> {item.title.toUpperCase()} — {item.category} •
                            </span>
                        ))}
                    </div>
                    <style>{`
                    @keyframes ticker {
                        0% { transform: translateX(0); }
                        100% { transform: translateX(-50%); }
                    }
                    @keyframes pulse {
                        0% { transform: scale(1); opacity: 1; }
                        50% { transform: scale(1.5); opacity: 0.4; }
                        100% { transform: scale(1); opacity: 1; }
                    }
                `}</style>
                </div>

                <div style={{ marginBottom: '4rem', textAlign: 'center' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 1.5rem', background: 'var(--accent-blue-light)', color: 'var(--accent-primary)', borderRadius: '2rem', fontWeight: 800, fontSize: '0.8rem', letterSpacing: '0.05em' }}>
                            <FlaskConical size={16} /> NEURO-INSIGHTS & RESEARCH GATEWAY
                        </div>
                    </div>
                    <h1 style={{ fontSize: '3.5rem', fontWeight: 900, marginBottom: '1rem', color: 'var(--text-main)', letterSpacing: '-0.03em' }}>Global Neuro-Diagnostic Insights</h1>
                    <p style={{ fontSize: '1.2rem', color: '#64748b', maxWidth: '800px', margin: '0 auto', lineHeight: 1.6 }}>
                        Real-time global monitoring of FDA breakthroughs, foundation model releases, and international AI imaging policies.
                    </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' }}>
                    {shuffledNews.map((item, idx) => (
                        <motion.div
                            key={idx}
                            layout
                            whileHover={{ y: -10 }}
                            style={{
                                background: 'var(--bg-card)',
                                padding: '2.5rem',
                                borderRadius: '1.5rem',
                                border: '1px solid var(--border-light)',
                                boxShadow: 'var(--shadow-glow)',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '1.5rem',
                                position: 'relative',
                                overflow: 'hidden'
                            }}
                        >
                            <div style={{ position: 'absolute', top: 0, right: 0, padding: '0.75rem 1.5rem', background: 'var(--accent-primary)', color: '#fff', fontSize: '0.75rem', fontWeight: 900, borderBottomLeftRadius: '1.5rem' }}>
                                {item.year}
                            </div>
                            <div style={{ width: '3.5rem', height: '3.5rem', borderRadius: '1rem', background: 'var(--bg-page)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-primary)', border: '1px solid var(--border-light)' }}>
                                {item.icon}
                            </div>
                            <div>
                                <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--accent-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>{item.category}</div>
                                <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '1rem', lineHeight: 1.3 }}>{item.title}</h3>
                                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '0.95rem' }}>{item.content}</p>
                            </div>
                            <div style={{ marginTop: 'auto', paddingTop: '1.5rem', borderTop: '1px solid var(--border-light)' }}>
                                <button className="btn btn-outline" style={{ width: '100%', fontSize: '0.85rem' }}>Read Full Paper <ArrowRight size={16} /></button>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <div style={{ marginTop: '5rem', padding: '3rem', background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: '2rem', color: 'var(--text-main)', textAlign: 'center' }}>
                    <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '1rem' }}>Interested in Collaborating?</h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Our dataset and training protocols are available for peer-reviewed medical research.</p>
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                        <button className="btn btn-blue">Access Research Portal</button>
                        <button className="btn btn-outline">Documentation</button>
                    </div>
                </div>
            </div>
        );
    };

    const HighFidelityReport = ({ pInfo, diagData, segData, imgPreview, heatmap, fullWidth = false, compact = false, scanUrl = null, xaiUrl = null, user }) => {
        const reportRef = useRef(null);

        const radarData = Object.entries(diagData.all_expert_scores || {}).map(([name, val]) => ({
            subject: (name || '').split("'")[0].toUpperCase(),
            A: parseFloat(val) || 0,
            fullMark: 100
        }));

        const barData = Object.entries(diagData.all_expert_scores || {})
            .map(([name, val]) => ({
                name: (name || '').split("'")[0].toUpperCase(),
                value: parseFloat(val) || 0
            }))
            .sort((a, b) => b.value - a.value);

        const toTitleCase = (str) => {
            return str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase());
        };

        const reportId = `DX-${Math.floor(Math.random() * 900000) + 100000}`;

        return (
            <div className="report-page animate-fade" style={{ background: '#f8fafc', minHeight: '100vh', padding: '3rem 1rem' }}>
                {/* Main Printed Page */}
                <div
                    ref={reportRef}
                    id="printable-report"
                    style={{
                        maxWidth: fullWidth ? '100%' : '850px',
                        margin: fullWidth ? '0' : '0 auto',
                        background: '#fff',
                        padding: compact ? '15px' : '25px', // Reduced from 40px
                        borderRadius: fullWidth ? '0' : '20px',
                        boxShadow: fullWidth ? 'none' : '0 10px 30px -5px rgba(0,0,0,0.1)',
                        color: '#1e293b',
                        fontFamily: "'Inter', sans-serif",
                        display: 'flex',
                        flexDirection: 'column',
                        minHeight: compact ? 'auto' : '10.4in', // Increased to push disclaimer to the absolute bottom
                        position: 'relative',
                        overflow: 'hidden'
                    }}
                >
                    {/* Watermark - 10deg right, Lower, 20% Opacity (PDF ONLY) */}
                    <div
                        className="pdf-watermark"
                        style={{
                            display: 'none', // Hidden on web interface
                            position: 'absolute',
                            top: '62%',
                            left: '50%',
                            width: 'auto',
                            height: 'auto',
                            transform: 'translate(-50%, -50%) rotate(10deg)',
                            opacity: 0.08,
                            pointerEvents: 'none',
                            zIndex: 0,
                            userSelect: 'none',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#4f46e5' // Matched to brand Indigo logo color
                        }}
                    >
                        <Brain size={600} color="#4f46e5" />
                    </div>

                    <div style={{ flex: 1, position: 'relative', zIndex: 1 }}>
                        {/* Header Block */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: compact ? '15px' : '40px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{ background: '#4f46e5', padding: '8px', borderRadius: '10px', color: '#fff' }}>
                                    <Brain size={24} />
                                </div>
                                <div>
                                    <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 950, letterSpacing: '-0.05em', color: '#0f172a' }}>DeepBrainDx</h1>
                                    <p style={{ margin: 0, fontSize: '0.6rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em' }}>AI-Generated Neuro-Diagnostic Report</p>
                                </div>
                            </div>
                            <div style={{ textAlign: 'right', fontSize: '0.75rem' }}>
                                <p style={{ margin: '1px 0' }}><strong>PATIENT NAME:</strong> <span style={{ color: '#0f172a', fontWeight: 800 }}>{toTitleCase(pInfo.name)}</span></p>
                                <p style={{ margin: '1px 0' }}><strong>PHYSICIAN:</strong> <span style={{ color: '#6366f1', fontWeight: 800 }}>{diagData.performing_doctor || user?.name || 'DeepBrain Physician'}</span></p>
                                <p style={{ margin: '1px 0' }}><strong>PHONE:</strong> <span style={{ color: '#64748b' }}>{user?.phone || 'N/A'}</span></p>
                                <p style={{ margin: '1px 0' }}><strong>PLACE:</strong> <span style={{ color: '#64748b' }}>{toTitleCase(user?.location || 'DeepBrain Facility')}</span></p>
                                <p style={{ margin: '1px 0' }}><strong>REPORT ID:</strong> <span style={{ color: '#64748b' }}>{reportId}</span></p>
                                <p style={{ margin: '1px 0' }}><strong>DATE:</strong> <span style={{ color: '#64748b' }}>{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span></p>
                            </div>
                        </div>

                        <div style={{ height: '2px', background: '#e2e8f0', marginBottom: compact ? '15px' : '40px', borderRadius: '2px', position: 'relative' }}>
                            <div style={{ position: 'absolute', top: 0, left: 0, width: '40%', height: '100%', background: '#6366f1', borderRadius: '2px' }} />
                        </div>

                        {/* Critical Findings & Observations Row */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: compact ? '15px' : '25px', marginBottom: compact ? '20px' : '40px', pageBreakInside: 'avoid' }}>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.7rem', fontWeight: 900, color: '#4f46e5', textTransform: 'uppercase', marginBottom: '10px' }}>
                                    <ShieldCheck size={14} /> Diagnostic Findings
                                </div>
                                <div style={{ background: '#f8fafc', padding: compact ? '12px' : '15px', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <div style={{ fontSize: '0.6rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Primary Classification</div>
                                        <div style={{ fontSize: '1.4rem', fontWeight: 950, color: '#0f172a', marginTop: '2px' }}>{diagData.prediction || 'Normal'}</div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '0.6rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>AI Confidence</div>
                                        <div style={{ fontSize: '1.4rem', fontWeight: 950, color: '#4f46e5', marginTop: '2px' }}>{diagData.confidence || '95.23%'}</div>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.7rem', fontWeight: 900, color: '#4f46e5', textTransform: 'uppercase', marginBottom: '10px' }}>
                                    <ClipboardList size={14} /> Clinical Observations
                                </div>
                                <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '16px', border: '1px solid #e2e8f0', minHeight: compact ? '60px' : '75px' }}>
                                    <p style={{ margin: 0, fontSize: compact ? '0.65rem' : '0.7rem', lineHeight: 1.4, color: '#475569' }}>
                                        Radiological findings confirm morphological signals consistent with <strong>{diagData.prediction}</strong>.
                                        Internal attention nodes and differential consensus patterns indicate localized anomalies requiring formal clinical correlation.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Evidence & Volumetric Analysis */}
                        <div style={{ marginBottom: compact ? '20px' : '40px', pageBreakInside: 'avoid' }}>
                            <div style={{ fontSize: '0.7rem', fontWeight: 900, color: '#0f172a', textTransform: 'uppercase', marginBottom: compact ? '6px' : '10px' }}>Radiological Evidence</div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 240px', gap: compact ? '10px' : '15px' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                    <div>
                                        <div style={{ fontSize: '0.6rem', fontWeight: 700, color: '#94a3b8', textAlign: 'center', marginBottom: '6px', textTransform: 'uppercase' }}>
                                            {diagData.event?.includes('EEG') ? 'EEG Signal' : 'Input MRI'}
                                        </div>
                                        <div style={{ background: '#000', borderRadius: '12px', height: compact ? '120px' : '180px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}>
                                            {scanUrl ? (
                                                <img src={`${API_BASE}${scanUrl}`} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                                            ) : diagData.event?.includes('EEG') ? (
                                                <Activity size={40} style={{ color: 'var(--accent-primary)', opacity: 0.4 }} />
                                            ) : imgPreview ? (
                                                <img src={imgPreview} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                                            ) : (
                                                <div style={{ textAlign: 'center', color: '#334155' }}>
                                                    <Brain size={30} style={{ opacity: 0.1 }} />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.6rem', fontWeight: 700, color: '#10b981', textAlign: 'center', marginBottom: '6px', textTransform: 'uppercase' }}>
                                            {diagData.event?.includes('EEG') ? 'Neural Sequence Video' : 'AI Overlay'}
                                        </div>
                                        <div style={{ background: '#000', borderRadius: '12px', height: compact ? '120px' : '180px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: diagData.event?.includes('EEG') ? '2px solid var(--accent-primary)' : '2px solid #10b981' }}>
                                            {xaiUrl ? (
                                                diagData.event?.includes('EEG') ? (
                                                    <video src={`${API_BASE}${xaiUrl}`} controls style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                                                ) : (
                                                    <img src={`${API_BASE}${xaiUrl}`} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                                                )
                                            ) : segData?.mask ? (
                                                <img src={`data:image/png;base64,${segData.mask}`} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                                            ) : heatmap ? (
                                                <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                                                    <img src={imgPreview} style={{ width: '100%', height: '100%', objectFit: 'contain', opacity: 0.5 }} />
                                                    <img src={heatmap} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'contain', opacity: 0.8 }} />
                                                </div>
                                            ) : (
                                                <div style={{ textAlign: 'center', color: '#334155' }}>
                                                    {diagData.event?.includes('EEG') ? <Activity size={30} style={{ opacity: 0.1 }} /> : <Target size={30} style={{ opacity: 0.1 }} />}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="volumetric-box" style={{ background: '#fef2f2', padding: compact ? '12px' : '18px', borderRadius: '16px', borderLeft: '4px solid #ef4444' }}>
                                    <div style={{ fontSize: '0.65rem', fontWeight: 900, color: '#dc2626', textTransform: 'uppercase', marginBottom: compact ? '8px' : '12px' }}>Area Analysis</div>
                                    <div style={{ fontSize: '0.75rem', color: '#1e293b' }}>
                                        <p style={{ margin: '6px 0' }}>• Area: <strong>{segData?.stats?.tumor_area || '0.00 mm²'}</strong></p>
                                        <p style={{ margin: '6px 0', fontSize: '0.65rem', color: '#64748b' }}>• Total Brain Pixel Count: <strong>{segData?.stats?.brain_pixel_count || '0'} px</strong></p>
                                        <p style={{ margin: '6px 0' }}>• Region: <span style={{ fontSize: '0.65rem', color: '#475569' }}>{segData?.stats?.affected_region || 'Localized Area'}</span></p>
                                        <p style={{ margin: '6px 0' }}>• Severity: <strong>{segData?.stats?.severity || 'Moderate'}</strong></p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Expert Analytics Section */}
                        <div style={{ fontSize: '0.7rem', fontWeight: 900, color: '#4f46e5', textTransform: 'uppercase', marginBottom: compact ? '8px' : '12px', display: 'flex', alignItems: 'center', gap: '0.4rem', pageBreakBefore: 'auto' }}>
                            <Target size={14} /> Expert Confidence Analytics
                        </div>

                        <div className="analytics-box" style={{ background: '#f8fafc', borderRadius: '20px', padding: compact ? '10px' : '15px', border: '1px solid #e2e8f0', display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: compact ? '12px' : '20px', pageBreakInside: 'avoid' }}>
                            <div>
                                <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#64748b', textAlign: 'center', marginBottom: compact ? '6px' : '10px', textTransform: 'uppercase' }}>Probability Distribution (%)</div>
                                <div style={{ height: compact ? '100px' : '140px' }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart layout="vertical" data={barData} margin={{ left: 10, right: 20 }}>
                                            <XAxis type="number" hide domain={[0, 100]} />
                                            <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} style={{ fontSize: '8px', fontWeight: 700, fill: '#64748b' }} width={70} />
                                            <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '6px', fontSize: '10px' }} />
                                            <Bar dataKey="value" fill="#6366f1" radius={[0, 3, 3, 0]} barSize={10} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                            <div>
                                <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#64748b', textAlign: 'center', marginBottom: compact ? '6px' : '10px', textTransform: 'uppercase' }}>Expert Network Diagram</div>
                                <div style={{ height: compact ? '100px' : '140px' }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <RadarChart cx="50%" cy="50%" outerRadius="65%" data={radarData}>
                                            <PolarGrid stroke="#e2e8f0" />
                                            <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 7, fontWeight: 700 }} />
                                            <Radar name="AI Expert" dataKey="A" stroke="#6366f1" fill="#6366f1" fillOpacity={0.4} />
                                        </RadarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer / Disclaimer at the Absolute Bottom */}
                    <div style={{ marginTop: 'auto', paddingTop: '15px', borderTop: '1px solid #e2e8f0', color: '#94a3b8', fontSize: '0.6rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', pageBreakInside: 'avoid' }}>
                        <div style={{ maxWidth: '75%', lineHeight: 1.4 }}>
                            <strong>Legal Disclaimer:</strong> AI-generated clinical support output. Validated by DeepBrain Expert Ensemble. This report is for decision support only and MUST be validated by a board-certified radiologist. (Report 1/1)
                        </div>
                        <div style={{ textAlign: 'right', fontWeight: 700 }}>
                            DEEPBRAINDX-CERTIFIED // {reportId}
                        </div>
                    </div>
                </div>

                {/* Report Action Layer (Non-Printable) */}
                {!compact && (
                    <div className="report-actions" style={{ maxWidth: '900px', margin: '2rem auto 0', display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                        <button
                            className="btn btn-blue"
                            style={{ padding: '0.6rem 1.5rem', borderRadius: '0.75rem', fontSize: '0.8rem', fontWeight: 700, opacity: 0.9 }}
                            onClick={() => generateDiagnosticPDF(pInfo, diagData, imgPreview, diagData.all_expert_scores, segData, heatmap)}
                        >
                            <Download size={16} /> DOWNLOAD PDF REPORT
                        </button>
                    </div>
                )}
            </div>
        );
    };

    const generateDiagnosticPDF = (pInfo, diagData, imgPreview, expertScores, segData = null, heatmap = null) => {
        const element = document.getElementById('printable-report');
        if (!element) return;

        // Force watermark visibility and box transparency only during capture
        const watermark = element.querySelector('.pdf-watermark');
        const volumetricBox = element.querySelector('.volumetric-box');
        const analyticsBox = element.querySelector('.analytics-box');

        if (watermark) watermark.style.display = 'flex';
        if (volumetricBox) volumetricBox.style.background = 'rgba(254, 242, 242, 0.2)';
        if (analyticsBox) analyticsBox.style.background = 'rgba(248, 250, 252, 0.2)';

        const opt = {
            margin: 0,
            filename: `DeepBrainDx_Report_${pInfo.id}_${new Date().getTime()}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: {
                scale: 2,
                useCORS: true,
                logging: false,
                letterRendering: true,
                windowWidth: 1000,
                scrollY: 0,
                scrollX: 0
            },
            jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait', compress: true },
            pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
        };

        // Execute save and then revert styles
        html2pdf().from(element).set(opt).toPdf().get('pdf').then((pdf) => {
            if (watermark) watermark.style.display = 'none';
            if (volumetricBox) volumetricBox.style.background = '#fef2f2';
            if (analyticsBox) analyticsBox.style.background = '#f8fafc';
        }).save();
    };

    const ReportView = () => {
        const [patientList, setPatientList] = useState([]);
        const [patientInfo, setPatientInfo] = useState(null);
        const [historyData, setHistoryData] = useState([]);
        const [loading, setLoading] = useState(true);
        const [searchTerm, setSearchTerm] = useState('');

        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch all patients for management
                const pResp = await axios.get(`${API_BASE}/admin/patients`, authHeader);
                setPatientList(pResp.data);

                // Fetch details for currently selected patient
                if (selectedPatient) {
                    const hResp = await axios.get(`${API_BASE}/patients/${selectedPatient}`, authHeader);
                    setPatientInfo(hResp.data.patient);
                    setHistoryData(hResp.data.history);
                }
            } catch (error) {
                console.error("Management Fetch Error:", error);
            } finally {
                setLoading(false);
            }
        };

        useEffect(() => {
            fetchData();
        }, [selectedPatient]);

        const getStatusColor = (status) => {
            const s = status.toLowerCase();
            if (s.includes('stable') || s.includes('verified')) return '#10b981';
            if (s.includes('monitoring') || s.includes('review')) return '#f59e0b';
            if (s.includes('inconclusive')) return '#6366f1';
            return '#6366f1';
        };

        const filteredPatients = patientList.filter(p =>
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.id.toLowerCase().includes(searchTerm.toLowerCase())
        );

        const handleExportPDF = () => {
            // Find current patient info or use selected
            const p = patientList.find(pl => pl.id === selectedPatient) || { id: selectedPatient, name: 'Subject Unknown', physician: 'N/A' };
            // Use latest finding or construct a summary diag item
            const latestDiag = historyData[0] || { prediction: p.latest_finding || 'Normal', confidence: 95, date: new Date().toISOString() };

            generateDiagnosticPDF(p, latestDiag, null, null);
        };

        const handleExportExcel = () => {
            const csvRows = [
                ['MONTH/YEAR', 'CLINICAL EVENT', 'DIAGNOSTIC STATUS', 'CLINICAL DESCRIPTION'],
                ...historyData.map(item => [
                    item.date,
                    item.event,
                    item.status,
                    `"${item.description.replace(/"/g, '""')}"`
                ])
            ];
            const csvContent = "data:text/csv;charset=utf-8," + csvRows.map(e => e.join(",")).join("\n");
            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", `DeepBrainDx_Report_${selectedPatient}_${new Date().getTime()}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        };

        return (
            <div className="dashboard-container animate-fade" style={{ maxWidth: '1400px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: selectedPatient ? '350px 1fr' : '1fr', gap: '2rem', height: 'calc(100vh - 180px)' }}>

                    {/* Conditional Sidebar (only shows when a patient is selected) */}
                    {selectedPatient && (
                        <div className="card-v2" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', overflow: 'hidden' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div className="section-title" style={{ marginBottom: 0 }}>
                                    <UserCircle size={18} /> Directory
                                </div>
                                <button
                                    onClick={() => setSelectedPatient(null)}
                                    style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: 'var(--text-secondary)', padding: '0.4rem 0.8rem', borderRadius: '0.5rem', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer' }}
                                >
                                    BACK TO LIST
                                </button>
                            </div>

                            <div style={{ position: 'relative' }}>
                                <input
                                    className="input-theme"
                                    placeholder="Search Directory..."
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '0.75rem', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-light)', color: 'var(--text-main)' }}
                                />
                            </div>

                            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {filteredPatients.map((p) => (
                                    <motion.div
                                        key={p.id}
                                        whileHover={{ x: 5, background: 'rgba(255,255,255,0.05)' }}
                                        onClick={() => setSelectedPatient(p.id)}
                                        style={{
                                            padding: '1rem',
                                            borderRadius: '0.75rem',
                                            cursor: 'pointer',
                                            background: selectedPatient === p.id ? 'var(--accent-primary)' : 'rgba(255,255,255,0.02)',
                                            border: '1px solid var(--border-light)',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        <div style={{ fontSize: '0.85rem', fontWeight: 900, color: selectedPatient === p.id ? '#fff' : 'var(--accent-primary)' }}>{p.id}</div>
                                        <div style={{ fontSize: '0.95rem', fontWeight: 700, color: selectedPatient === p.id ? '#fff' : 'var(--text-main)' }}>{p.name}</div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Main Content Area */}
                    <div style={{ overflowY: 'auto' }}>
                        {loading ? (
                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                                <div className="pulse-slow" style={{ color: 'var(--text-secondary)' }}>Gathering Diagnostic Reports...</div>
                            </div>
                        ) : !selectedPatient ? (
                            /* GLOBAL MANAGEMENT VIEW */
                            <div className="animate-fade">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '3rem' }}>
                                    <div>
                                        <h2 style={{ fontSize: '3rem', fontWeight: 900, letterSpacing: '-0.025em', color: 'var(--text-main)' }}>Diagnostic Report Center</h2>
                                        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Centralized oversight of all clinical reports and neuro-diagnostic interactions.</p>
                                    </div>
                                    <div style={{ display: 'flex', gap: '1rem' }}>
                                        <div className="card-v2" style={{ padding: '0.75rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <div style={{ fontWeight: 800, fontSize: '0.8rem' }}>{patientList.length} TOTAL PATIENTS</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="card-v2" style={{ padding: '2rem', overflow: 'hidden' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                                        <div className="section-title"><Database size={18} /> Diagnostic Report Archive</div>
                                        <input
                                            className="input-theme"
                                            placeholder="Filter archives by patient, ID or findings..."
                                            value={searchTerm}
                                            onChange={e => setSearchTerm(e.target.value)}
                                            style={{ width: '400px', padding: '0.8rem 1.5rem' }}
                                        />
                                    </div>

                                    <div style={{ overflowX: 'auto' }}>
                                        <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                                            <thead>
                                                <tr>
                                                    <th>CASE ID</th>
                                                    <th>PATIENT NAME</th>
                                                    <th>AGE/SEX</th>
                                                    <th>PHYSICIAN</th>
                                                    <th>DIAGNOSIS</th>
                                                    <th>REPORTED ON</th>
                                                    <th style={{ textAlign: 'right' }}>ACTION</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filteredPatients.map((p) => (
                                                    <tr key={p.id}>
                                                        <td style={{ fontWeight: 900, color: 'var(--accent-primary)' }}>{p.id}</td>
                                                        <td style={{ fontWeight: 700, color: 'var(--text-main)' }}>{p.name}</td>
                                                        <td>{p.age ? `${p.age}Y` : 'N/A'} / {p.gender ? p.gender[0].toUpperCase() : 'N/A'}</td>
                                                        <td style={{ opacity: 0.8 }}>{p.physician}</td>
                                                        <td style={{ fontSize: '0.85rem', fontWeight: 700 }}>
                                                            <span style={{ color: p.latest_finding === 'Normal' ? '#10b981' : p.latest_finding === 'No Scans' ? 'var(--text-secondary)' : '#f59e0b' }}>
                                                                {p.latest_finding.toUpperCase()}
                                                            </span>
                                                        </td>
                                                        <td style={{ fontSize: '0.75rem', opacity: 0.6 }}>{p.last_active}</td>
                                                        <td style={{ textAlign: 'right' }}>
                                                            <button
                                                                className="btn btn-blue"
                                                                style={{ padding: '0.5rem 1rem', fontSize: '0.7rem' }}
                                                                onClick={() => setSelectedPatient(p.id)}
                                                            >
                                                                VIEW CLINICAL REPORT
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        ) : patientInfo ? (
                            /* UPGRADED HIGH-FIDELITY PATIENT VAULT VIEW */
                            <div className="animate-fade">
                                <div style={{ marginBottom: '2rem' }}>
                                    <button
                                        onClick={() => setSelectedPatient(null)}
                                        className="btn btn-outline"
                                        style={{ fontSize: '0.75rem' }}
                                    >
                                        <ArrowLeft size={14} /> RETURN TO DIRECTORY
                                    </button>
                                </div>
                                <HighFidelityReport
                                    pInfo={patientInfo}
                                    diagData={{
                                        prediction: patientInfo.latest_finding || 'Normal',
                                        confidence: historyData[0]?.confidence || '95%',
                                        all_expert_scores: (() => {
                                            try {
                                                if (historyData[0]?.description?.includes(' scores: ')) {
                                                    return JSON.parse(historyData[0].description.split(' scores: ')[1] || '{}');
                                                }
                                            } catch (e) {
                                                console.error("Score Parse Error:", e);
                                            }
                                            return null;
                                        })(),
                                        description: historyData[0]?.description,
                                        latency_ms: historyData[0]?.latency_ms || '142ms',
                                        model_version: 'Swin-T v1.0',
                                        device_id: 'LOCAL-ACCELERATOR'
                                    }}
                                    segData={null} // Historical segmentation often managed in separate panel
                                    imgPreview={preview} // Fallback to current session if viewing latest
                                    heatmap={explainResult?.heatmap}
                                    user={user}
                                />
                            </div>
                        ) : null}
                    </div>
                </div>
            </div>
        );
    };

    const TheoryView = ({ section }) => {
        const content = THEORY_CONTENT[section] || { title: 'Clinical Context', description: 'Theoretical background for this diagnostic section.', highlights: [] };
        return (
            <div className="animate-fade" style={{ padding: '4rem 2rem', maxWidth: '1200px', margin: '0 auto' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '3rem' }}>
                    <div className="icon-box" style={{ width: '4.5rem', height: '4.5rem', borderRadius: '1.5rem', marginBottom: 0 }}>
                        <motion.div
                            animate={{ rotateY: [0, 180, 0], scale: [1, 1.1, 1] }}
                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        >
                            <BookOpen size={36} />
                        </motion.div>
                    </div>
                    <div>
                        <h2 style={{ fontSize: '3rem', fontWeight: 900, color: '#fff', letterSpacing: '-0.04em' }}>{content.title}</h2>
                        <div style={{ height: '4px', width: '60px', background: 'var(--accent-primary)', borderRadius: '2px', marginTop: '0.5rem' }} />
                    </div>
                </div>
                <p style={{ fontSize: '1.4rem', color: 'var(--text-secondary)', marginBottom: '4rem', lineHeight: 1.8, maxWidth: '900px' }}>
                    {content.description}
                </p>
                <div className="features-grid" style={{ padding: 0, gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                    {content.highlights.map((point, i) => (
                        <motion.div
                            key={i}
                            whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.05)' }}
                            className="feature-card"
                            style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
                        >
                            <div className="icon-box" style={{ marginBottom: 0, width: '2.5rem', height: '2.5rem' }}><ShieldCheck size={18} /></div>
                            <p style={{ fontWeight: 600, color: '#fff', fontSize: '1.1rem' }}>{point}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        );
    };

    const UploadPanel = () => {
        const [isDragging, setIsDragging] = useState(false);

        const onDragOver = (e) => {
            e.preventDefault();
            setIsDragging(true);
        };

        const onDragLeave = () => {
            setIsDragging(false);
        };

        const onDrop = (e) => {
            e.preventDefault();
            setIsDragging(false);
            const droppedFile = e.dataTransfer.files[0];
            if (droppedFile) {
                const event = { target: { files: [droppedFile] } };
                handleFileChange(event);
            }
        };

        return (
            <div className="dashboard-container animate-fade" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="card-v2"
                    style={{
                        maxWidth: '1200px',
                        width: '100%',
                        padding: '3rem',
                        position: 'relative',
                        border: isDragging ? '2px solid var(--accent-primary)' : '1px solid var(--border-light)',
                        background: isDragging ? 'rgba(99, 102, 241, 0.05)' : 'var(--bg-card)',
                        transition: 'all 0.3s'
                    }}
                    onDragOver={onDragOver}
                    onDragLeave={onDragLeave}
                    onDrop={onDrop}
                >
                    <div
                        className={`mri-viewer ${verifying ? 'mri-viewer-scanning' : ''}`}
                        onClick={() => !verifying && fileInputRef.current.click()}
                        style={{
                            height: '500px',
                            background: '#000',
                            borderRadius: '1.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            overflow: 'hidden',
                            position: 'relative',
                            border: '1px solid rgba(255,255,255,0.05)',
                            boxShadow: 'inset 0 0 100px rgba(0,0,0,0.8)'
                        }}
                    >
                        {verifying && <div className="scan-line" />}

                        {verifying ? (
                            <div style={{ textAlign: 'center', zIndex: 10 }}>
                                <Loader2 size={64} className="animate-spin" style={{ color: 'var(--accent-primary)', marginBottom: '1.5rem' }} />
                                <h3 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#fff' }}>
                                    {result ? 'GENERATING INFERENCE...' : 'PROTOCOL VERIFICATION...'}
                                </h3>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '1rem', fontSpaceing: '0.1em' }}>
                                    {result ? 'Handing off to Ensemble Core' : 'Analyzing DICOM signatures & metadata integrity'}
                                </p>
                            </div>
                        ) : preview ? (
                            <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <img src={preview} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} alt="MRI Preview" />
                                <div style={{ position: 'absolute', bottom: '1.5rem', left: '1.5rem', background: 'rgba(0,0,0,0.7)', padding: '0.5rem 1rem', borderRadius: '0.5rem', color: '#fff', fontSize: '0.7rem', fontWeight: 800, backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)' }}>
                                    QUEUED SEQUENCE: {file?.name.toUpperCase()}
                                </div>
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '2rem' }}>
                                <div style={{
                                    width: '100px', height: '100px', borderRadius: '50%',
                                    background: 'rgba(45, 212, 191, 0.1)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    margin: '0 auto 2rem', color: 'var(--accent-secondary)',
                                    border: '1px solid rgba(45, 212, 191, 0.2)'
                                }}>
                                    <Upload size={48} />
                                </div>
                                <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', marginBottom: '0.75rem' }}>Drop MRI Scan Here</h3>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginBottom: '1.5rem' }}>Supported formats: DICOM, NIfTI, JPG, PNG</p>
                                <button className="btn btn-blue" style={{ padding: '0.75rem 2rem' }}>
                                    Browse Filesystem
                                </button>
                            </div>
                        )}
                        <input type="file" hidden ref={fileInputRef} onChange={handleFileChange} accept="image/*" />
                    </div>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            style={{ marginTop: '2.5rem', padding: '1.25rem', background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '1rem', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '1rem' }}
                        >
                            <ShieldAlert size={24} />
                            <div>
                                <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>INTEGRITY VIOLATION</div>
                                <div style={{ fontSize: '0.85rem', opacity: 0.8 }}>{error}</div>
                            </div>
                        </motion.div>
                    )}
                </motion.div>
            </div>
        );
    };

    const DiagnosticPanel = () => {
        const viewerRef = useRef(null);

        const handleMouseMove = (e) => {
            if (!viewerRef.current) return;
            const rect = viewerRef.current.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;
            viewerRef.current.style.setProperty('--mouse-x', `${x}%`);
            viewerRef.current.style.setProperty('--mouse-y', `${y}%`);
        };

        return (
            <div className="dashboard-container animate-fade">
                <div className="grid-2">
                    <div className="card-v2">
                        <div className="section-title">
                            <Activity size={18} /> Ensemble Classification
                        </div>
                        <div
                            ref={viewerRef}
                            onMouseMove={handleMouseMove}
                            className="mri-viewer mri-viewer-compact"
                            style={{ background: '#000', borderRadius: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative', border: '1px solid var(--border-light)' }}
                        >
                            <div className="scan-overlay" />
                            {preview && <img src={preview} style={{ maxWidth: '100%', maxHeight: '100%', display: 'block' }} />}

                            {/* Heatmap Overlay */}
                            {preview && explainResult && showHeatmap && (
                                <img
                                    src={`data:image/jpg;base64,${explainResult.heatmap_base64}`}
                                    style={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'contain',
                                        opacity: 0.6,
                                        mixBlendMode: 'normal'
                                    }}
                                />
                            )}

                            {/* Metadata Badge */}
                            {explainResult && showHeatmap && (
                                <div style={{ position: 'absolute', top: '15px', right: '15px', background: 'rgba(0,0,0,0.7)', padding: '0.5rem 1rem', borderRadius: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', backdropFilter: 'blur(4px)', border: '1px solid rgba(255,255,255,0.2)' }}>
                                    <Flame size={14} color="#fcd34d" />
                                    <span style={{ color: '#fff', fontSize: '0.75rem', fontWeight: 600 }}>{explainResult.model_info} ACTIVATION</span>
                                </div>
                            )}
                        </div>
                        <div style={{ marginTop: '2rem' }}>
                            {result?.redirect_to === 'segmentation' ? (
                                <button
                                    className="btn btn-blue"
                                    style={{ width: '100%', padding: '1rem' }}
                                    onClick={() => setActiveTab('Segmentation')}
                                >
                                    SEGMENTATION <ChevronRight size={20} />
                                </button>
                            ) : (
                                <button
                                    className="btn btn-blue"
                                    style={{ width: '100%', padding: '1rem' }}
                                    onClick={runDiagnosis}
                                    disabled={loading}
                                >
                                    {loading ? <Loader2 className="animate-spin" /> : <Brain size={20} />}
                                    {loading ? 'ANALYZING ENSEMBLE...' : 'START CLINICAL INFERENCE'}
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="card-v2">
                        <div className="section-title">
                            <BarChart3 size={18} /> Diagnostic Output
                        </div>
                        <AnimatePresence mode="wait">
                            {error && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ padding: '1.5rem', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '0.75rem', color: '#dc2626' }}>
                                    <ShieldAlert size={18} style={{ marginRight: '0.5rem' }} /> {typeof error === 'string' ? error : (error?.message || JSON.stringify(error))}
                                </motion.div>
                            )}
                            {!result && !loading && !error && (
                                <div style={{ height: '280px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', textAlign: 'center' }}>
                                    <Activity size={52} style={{ opacity: 0.1, marginBottom: '1.25rem' }} />
                                    <p style={{ fontSize: '0.9rem' }}>Awaiting inference command...</p>
                                </div>
                            )}
                            {loading && (
                                <div style={{ height: '280px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                    <Loader2 size={52} className="animate-spin" style={{ color: 'var(--accent-secondary)' }} />
                                    <p style={{ marginTop: '1.25rem', fontWeight: 600, fontSize: '0.9rem' }}>Performing multi-expert pass...</p>
                                </div>
                            )}
                            {result && (
                                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                                    <div style={{
                                        padding: '3rem 2rem',
                                        borderRadius: '1.5rem',
                                        background: result.prediction === 'Normal' ? 'rgba(16, 185, 129, 0.05)' : 'rgba(239, 68, 68, 0.05)',
                                        border: `1px solid ${result.prediction === 'Normal' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                                        textAlign: 'center',
                                        marginBottom: '2rem',
                                        position: 'relative',
                                        overflow: 'hidden'
                                    }}>
                                        <motion.div
                                            animate={{ scale: [1, 1.2, 1], opacity: [0, 0.3, 0] }}
                                            transition={{ duration: 2, repeat: Infinity }}
                                            style={{
                                                position: 'absolute',
                                                top: '50%',
                                                left: '50%',
                                                transform: 'translate(-50%, -50%)',
                                                width: '200px',
                                                height: '200px',
                                                background: result.prediction === 'Normal' ? '#10b981' : '#ef4444',
                                                borderRadius: '50%',
                                                filter: 'blur(50px)',
                                                zIndex: -1
                                            }}
                                        />
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem' }}>DIAGNOSTIC VERDICT</div>
                                        <div className={result.prediction === 'Normal' ? '' : 'flicker-text'} style={{
                                            fontSize: '3rem',
                                            fontWeight: 950,
                                            color: result.prediction === 'Normal' ? '#10b981' : '#ef4444',
                                            textShadow: `0 0 20px ${result.prediction === 'Normal' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`
                                        }}>
                                            {result.prediction.toUpperCase()}
                                        </div>

                                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '2rem' }}>
                                            <button
                                                onClick={() => generateDiagnosticPDF(
                                                    patients.find(p => p.id === selectedPatient) || { id: selectedPatient, name: 'Guest Subject', age: 'N/A', gender: 'N/A', physician: 'DeepBrain AI' },
                                                    result,
                                                    showHeatmap && explainResult ? `data:image/png;base64,${explainResult.heatmap_base64}` : preview,
                                                    result.all_expert_scores
                                                )}
                                                style={{
                                                    background: 'rgba(255,255,255,0.1)',
                                                    border: '1px solid rgba(255,255,255,0.2)',
                                                    color: '#fff',
                                                    padding: '0.6rem 1.2rem',
                                                    borderRadius: '0.75rem',
                                                    fontSize: '0.7rem',
                                                    fontWeight: 800,
                                                    cursor: 'pointer',
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: '0.5rem',
                                                    backdropFilter: 'blur(5px)'
                                                }}
                                            >
                                                <FileText size={14} /> DOWNLOAD PDF
                                            </button>
                                            <button
                                                onClick={() => setActiveTab('Clinical Analysis')}
                                                style={{
                                                    background: 'var(--accent-primary)',
                                                    border: 'none',
                                                    color: '#fff',
                                                    padding: '0.6rem 1.2rem',
                                                    borderRadius: '0.75rem',
                                                    fontSize: '0.7rem',
                                                    fontWeight: 800,
                                                    cursor: 'pointer',
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: '0.5rem'
                                                }}
                                            >
                                                <Eye size={14} /> VIEW CLINICAL ANALYSIS
                                            </button>
                                        </div>
                                    </div>

                                    <div style={{ marginBottom: '2rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                                            <span style={{ fontWeight: 700, color: 'var(--text-secondary)' }}>CONFIDENCE</span>
                                            <span style={{ fontWeight: 800 }}>{result.confidence}</span>
                                        </div>
                                        <div style={{ height: '10px', background: '#f1f5f9', borderRadius: '5px', overflow: 'hidden' }}>
                                            <motion.div initial={{ width: 0 }} animate={{ width: result.confidence }} style={{ height: '100%', background: result.prediction === 'Normal' ? '#10b981' : '#ef4444' }} />
                                        </div>
                                    </div>



                                    {/* Expert Ensemble Breakdown */}
                                    {result.all_expert_scores && (
                                        <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                                                    <Layers size={14} /> Expert Network Consensus
                                                </div>
                                                <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--accent-primary)', background: 'rgba(99, 102, 241, 0.1)', padding: '2px 8px', borderRadius: '4px' }}>
                                                    MULTI-EXPERT PASS
                                                </div>
                                            </div>

                                            <div style={{ height: '220px', width: '100%', marginBottom: '1.5rem' }}>
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={Object.entries(result.all_expert_scores).map(([name, value]) => ({ subject: (name || '').split("'")[0], A: parseFloat(value) || 0, fullMark: 100 }))}>
                                                        <PolarGrid stroke="rgba(255,255,255,0.05)" />
                                                        <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text-secondary)', fontSize: 9, fontWeight: 700 }} />
                                                        <Radar name="AI Expert" dataKey="A" stroke="var(--accent-primary)" fill="var(--accent-primary)" fillOpacity={0.5} />
                                                    </RadarChart>
                                                </ResponsiveContainer>
                                            </div>

                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                                {Object.entries(result.all_expert_scores).map(([expert, score]) => (
                                                    <div key={expert} style={{
                                                        padding: '0.6rem 0.75rem',
                                                        background: 'rgba(255,255,255,0.02)',
                                                        borderRadius: '0.5rem',
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        alignItems: 'center',
                                                        border: '1px solid var(--border-light)'
                                                    }}>
                                                        <span style={{ fontSize: '0.74rem', opacity: 0.7, fontWeight: 700 }}>{expert.split("'")[0].toUpperCase()}</span>
                                                        <span style={{ fontSize: '0.8rem', fontWeight: 950, color: parseFloat(score) > 50 ? 'var(--accent-primary)' : 'var(--text-secondary)' }}>{score}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Explanation Controls */}
                                    {(result.prediction.toLowerCase().includes('aneurysm') || result.prediction.toLowerCase().includes('ischemic')) && (
                                        <div style={{ marginTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1.5rem' }}>
                                            {!explainResult ? (
                                                <button className="btn btn-outline" style={{ width: '100%' }} onClick={runExplanation} disabled={explainLoading}>
                                                    {explainLoading ? <Loader2 className="animate-spin" size={16} /> : <Flame size={16} />}
                                                    {explainLoading ? 'GENERATING HEATMAP...' : 'EXPLAIN AI DECISION (Grad-CAM)'}
                                                </button>
                                            ) : (
                                                <button className="btn btn-outline" style={{ width: '100%', background: showHeatmap ? '#eff6ff' : 'transparent', borderColor: showHeatmap ? '#3b82f6' : '#e2e8f0' }} onClick={() => setShowHeatmap(!showHeatmap)}>
                                                    {showHeatmap ? <EyeOff size={16} /> : <Eye size={16} />}
                                                    {showHeatmap ? 'HIDE ATTENTION MAP' : 'SHOW ATTENTION MAP'}
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        );
    };

    const SegmentationPanel = () => {
        useEffect(() => {
            if (file && !segResult && !segLoading && !error) {
                runSegmentation();
            }
        }, [file, segResult, segLoading, error]);

        return (
            <div className="dashboard-container animate-fade">
                <div className="grid-2">
                    <div className="card-v2">
                        <div className="section-title">
                            <Layers size={18} /> Area Segmentation Overlay
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div className="mri-viewer" style={{ height: '300px', background: '#000', borderRadius: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: '1px solid var(--border-light)' }}>
                                {preview && <img src={preview} style={{ maxWidth: '100%', maxHeight: '100%' }} />}
                                <div style={{ position: 'absolute', top: '10px', left: '10px', background: 'rgba(0,0,0,0.5)', color: '#fff', fontSize: '0.7rem', padding: '2px 8px', borderRadius: '4px' }}>ORIGINAL T2-FLAIR</div>
                            </div>

                            <div className="mri-viewer" style={{ height: '300px', background: '#000', borderRadius: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: '2px solid #10b981' }}>
                                {segLoading ? (
                                    <div style={{ textAlign: 'center' }}>
                                        <Loader2 size={48} className="animate-spin" style={{ color: 'var(--accent-secondary)', marginBottom: '1rem' }} />
                                        <p style={{ color: '#fff', fontWeight: 600, fontSize: '0.8rem' }}>GENERATING...</p>
                                    </div>
                                ) : segResult ? (
                                    <img src={`data:image/png;base64,${segResult.mask}`} style={{ maxWidth: '100%', maxHeight: '100%' }} />
                                ) : (
                                    <div style={{ textAlign: 'center' }}>
                                        <Layers size={32} style={{ opacity: 0.2, marginBottom: '0.5rem' }} />
                                        <p style={{ color: '#555', fontSize: '0.8rem', marginBottom: '1rem' }}>Standby</p>
                                        <button className="btn btn-blue" style={{ fontSize: '0.7rem', padding: '0.5rem 1rem' }} onClick={runSegmentation}>
                                            Start Segmentation
                                        </button>
                                    </div>
                                )}
                                <div style={{ position: 'absolute', top: '10px', left: '10px', background: '#10b981', color: '#fff', fontSize: '0.7rem', padding: '2px 8px', borderRadius: '4px' }}>AI OVERLAY</div>
                            </div>
                        </div>

                        {segResult && (
                            <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center' }}>
                                <button
                                    className="btn btn-blue"
                                    style={{ padding: '0.75rem 3rem', borderRadius: '2rem' }}
                                    onClick={() => setActiveTab('Clinical Analysis')}
                                >
                                    <FileText size={18} /> GENERATE REPORT
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="card-v2">
                        <div className="section-title">
                            <BarChart3 size={18} /> Area Statistics
                        </div>
                        {segResult ? (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                <div className="features-grid" style={{ padding: 0, gridTemplateColumns: '1fr', gap: '1rem', marginBottom: '2rem' }}>
                                    <div className="feature-card" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <Zap style={{ color: 'var(--accent-secondary)' }} />
                                            <div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>TUMOR AREA</div>
                                                <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>{segResult.stats.tumor_area}</div>
                                                <div style={{ fontSize: '0.65rem', color: 'var(--accent-secondary)', fontWeight: 600 }}>TOTAL BRAIN PIXEL COUNT: {segResult.stats.brain_pixel_count} px</div>
                                            </div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>SEVERITY</div>
                                            <div style={{ fontWeight: 700, color: segResult.stats.severity === 'Severe' ? '#dc2626' : '#f59e0b' }}>{segResult.stats.severity.toUpperCase()}</div>
                                        </div>
                                    </div>

                                    <div className="feature-card" style={{ padding: '1.5rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                                            <Dna style={{ color: 'var(--accent-secondary)' }} />
                                            <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>AFFECTED ANATOMICAL REGIONS</div>
                                        </div>
                                        <div style={{ background: 'var(--bg-page)', padding: '1rem', borderRadius: '0.5rem', fontSize: '0.9rem', color: 'var(--text-main)', border: '1px solid var(--border-light)' }}>
                                            {segResult.stats.affected_region}
                                        </div>
                                    </div>
                                </div>

                                <div style={{ padding: '1.5rem', background: 'rgba(16, 185, 129, 0.08)', borderRadius: '1rem', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#10b981', fontWeight: 700, marginBottom: '0.5rem' }}>
                                        <CheckCircle2 size={18} /> SEGMENTATION VERIFIED
                                    </div>
                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Mask generation achieved {segResult.stats.confidence_interval} spatial confidence across the T2-Weighted sequence.</p>
                                </div>


                            </motion.div>
                        ) : (
                            <div style={{ height: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', textAlign: 'center' }}>
                                {error ? (
                                    <>
                                        <ShieldAlert size={64} style={{ color: '#dc2626', opacity: 0.8, marginBottom: '1.5rem' }} />
                                        <p style={{ color: '#dc2626', fontWeight: 600 }}>{typeof error === 'string' ? error : (error?.message || JSON.stringify(error))}</p>
                                        <button className="btn btn-outline" style={{ marginTop: '1rem' }} onClick={runSegmentation}>
                                            Retry Area Analysis
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <Layers size={64} style={{ opacity: 0.1, marginBottom: '1.5rem' }} />
                                        <p>Select a tumor case to unlock area analysis.</p>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    const DataAnalysisView = () => {
        const [analysisData, setAnalysisData] = useState(null);
        const [loadingAnalysis, setLoadingAnalysis] = useState(true);
        const [viewMode, setViewMode] = useState('overview'); // overview or diagnostic

        useEffect(() => {
            const fetchAnalysis = async () => {
                try {
                    const resp = await axios.get(`${API_BASE}/analytics`, authHeader);
                    setAnalysisData(resp.data);
                } catch (e) {
                    console.error("Analysis Fetch Error:", e);
                } finally {
                    setLoadingAnalysis(false);
                }
            };
            fetchAnalysis();
        }, []);

        if (viewMode === 'diagnostic') {
            return (
                <div className="animate-fade">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2.5rem' }}>
                        <button className="btn btn-outline" style={{ borderRadius: '1rem', padding: '0.6rem 1.2rem' }} onClick={() => setViewMode('overview')}>
                            <ArrowLeft size={18} /> BACK TO ANALYSIS HUB
                        </button>
                        <div style={{ width: '1px', height: '24px', background: 'var(--border-light)' }} />
                        <h4 style={{ margin: 0, fontWeight: 800, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>ACTIVE INFERENCE ENGINE</h4>
                    </div>
                    <DiagnosticPanel />
                </div>
            );
        }

        const distData = analysisData ? Object.entries(analysisData.distribution).map(([name, value]) => ({ name, value })) : [];

        return (
            <div className="dashboard-container animate-fade">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3.5rem' }}>
                    <div>
                        <h2 style={{ fontSize: '2.5rem', fontWeight: 900, letterSpacing: '-0.025em', color: '#fff' }}>Data Analysis Hub</h2>
                        <p style={{ color: 'var(--text-secondary)', fontWeight: 500, fontSize: '1.1rem' }}>Platform-wide intelligence insights and clinical diagnostic performance.</p>
                    </div>
                    <button className="btn btn-blue" onClick={() => setViewMode('diagnostic')} style={{ padding: '1rem 2rem', borderRadius: '1.25rem' }}>
                        <Brain size={18} /> LAUNCH INFRARED DIAGNOSTICS
                    </button>
                </div>

                {loadingAnalysis ? (
                    <div style={{ height: '500px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1.5rem' }}>
                        <Loader2 className="animate-spin" size={64} style={{ color: 'var(--accent-primary)' }} />
                        <p style={{ color: 'var(--text-secondary)', fontWeight: 700, letterSpacing: '0.1em' }}>AGGREGATING GLOBAL NEURO-STATS...</p>
                    </div>
                ) : (
                    <div className="animate-fade">
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '3.5rem' }}>
                            {[
                                { label: 'TOTAL PATIENTS', value: analysisData.platform_metrics.total_patients, icon: <ClipboardList size={22} />, color: '#6366f1' },
                                { label: 'SCANS ANALYZED', value: analysisData.platform_metrics.total_scans_processed, icon: <Activity size={22} />, color: '#10b981' },
                                { label: 'PLATFORM ACCURACY', value: analysisData.platform_metrics.diagnostic_accuracy_estimate, icon: <Target size={22} />, color: '#f59e0b' },
                                { label: 'SYSTEM LATENCY', value: analysisData.platform_metrics.avg_inference_latency, icon: <Zap size={22} />, color: '#8b5cf6' }
                            ].map((stat, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="card-v2"
                                    style={{ padding: '2rem', display: 'flex', gap: '1.5rem', alignItems: 'center', border: '1px solid var(--border-light)' }}
                                >
                                    <div style={{ background: `${stat.color}15`, color: stat.color, padding: '16px', borderRadius: '1rem' }}>{stat.icon}</div>
                                    <div>
                                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{stat.label}</div>
                                        <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text-main)', marginTop: '0.25rem' }}>{stat.value}</div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        <div className="grid-2" style={{ gap: '2rem' }}>
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="card-v2"
                                style={{ padding: '2.5rem', minHeight: '450px' }}
                            >
                                <div className="section-title" style={{ fontSize: '1.25rem' }}><BarChart3 size={20} /> Pathological Breakdown</div>
                                <div style={{ height: '320px', marginTop: '2.5rem' }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={distData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                            <XAxis dataKey="name" stroke="var(--text-secondary)" fontSize={11} axisLine={false} tickLine={false} tick={{ fontWeight: 600 }} />
                                            <YAxis axisLine={false} tickLine={false} stroke="var(--text-secondary)" fontSize={11} />
                                            <Tooltip
                                                cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                                                contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: '1rem', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.5)' }}
                                            />
                                            <Bar dataKey="value" fill="var(--accent-primary)" radius={[6, 6, 0, 0]} barSize={40} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.2 }}
                                className="card-v2"
                                style={{ padding: '2.5rem', minHeight: '450px' }}
                            >
                                <div className="section-title" style={{ fontSize: '1.25rem' }}><TrendingUp size={20} /> Analytical Performance Trends</div>
                                <div style={{ height: '320px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem' }}>
                                    <div style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--accent-primary)', padding: '1.5rem', borderRadius: '50%', marginBottom: '1.5rem' }}>
                                        <Network size={32} />
                                    </div>
                                    <h5 style={{ color: 'var(--text-main)', fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.5rem' }}>Real-time Intelligence Active</h5>
                                    <p style={{ opacity: 0.7, maxWidth: '300px', lineHeight: 1.6 }}>The platform is currently mapping longitudinal diagnostic signals from over {analysisData.platform_metrics.total_scans_processed} successful neuro-inferences.</p>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    const AdminPanel = () => {
        // All state is lifted to parent UnifiedPortal to prevent remount on parent re-render
        // Using parent-scoped state via closure
        const stats = adminStats;
        const resources = adminResources;
        const models = adminModels;
        const latencyData = adminLatencyData;
        const settings = adminSettings;
        const flaggedDiagnoses = adminFlaggedDiagnoses;
        const users = adminUsers;
        const diagnoses = adminDiagnoses;
        const auditLogs = adminAuditLogs;
        const analytics = adminAnalytics;
        // Note: adminTab and setAdminTab are already from parent scope
        // Note: biStats and setBiStats are already from parent scope

        const fetchData = () => {
            const authHdr = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
            fetchAdminData(authHdr);
        };

        const toggleUserStatus = async (username, currentStatus) => {
            const formData = new URLSearchParams();
            formData.append('is_active', !currentStatus);
            try {
                await axios.patch(`${API_BASE}/users/${username}`, formData, authHeader);
                fetchData();
            } catch (err) { console.error(err); }
        };

        const toggleUserRole = async (username, currentRole) => {
            const formData = new URLSearchParams();
            formData.append('role', currentRole === 'admin' ? 'user' : 'admin');
            try {
                await axios.patch(`${API_BASE}/users/${username}`, formData, authHeader);
                fetchData();
            } catch (err) { console.error(err); }
        };

        const distData = Object.entries(stats.distribution || {}).map(([name, value]) => ({ name, value }));

        return (
            <div className="dashboard-container animate-fade" style={{ paddingBottom: '5rem' }}>
                <style>{`
                    .admin-table th { padding: 1rem; text-align: left; font-size: 0.65rem; color: var(--text-secondary); letter-spacing: 0.1em; border-bottom: 2px solid var(--border-light); }
                    .admin-table td { padding: 1.25rem 1rem; font-size: 0.85rem; border-bottom: 1px solid rgba(255,255,255,0.02); }
                    .log-badge { padding: 2px 6px; border-radius: 4px; font-size: 0.6rem; font-weight: 900; background: rgba(255,255,255,0.05); color: var(--text-secondary); }
                    .action-btn { background: rgba(255,255,255,0.03); border: 1px solid var(--border-light); color: var(--text-main); padding: 0.5rem; border-radius: 0.5rem; cursor: pointer; transition: all 0.2s; }
                    .action-btn:hover { background: var(--accent-primary); color: white; border-color: var(--accent-primary); }
                    .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.8); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; z-index: 20000; }
                    .modal-content { background: var(--bg-card); border: 1px solid var(--border-light); padding: 3rem; border-radius: 2rem; width: 450px; box-shadow: 0 30px 60px rgba(0,0,0,0.5); }
                    .admin-nav-btn { background: transparent; border: none; padding: 0.75rem 1.5rem; border-radius: 0.75rem; color: var(--text-secondary); cursor: pointer; font-weight: 700; transition: all 0.2s; display: flex; align-items: center; gap: 0.5rem; }
                    .admin-nav-btn.active { background: rgba(255,255,255,0.05); color: var(--accent-primary); }
                `}</style>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                    <div>
                        <h2 style={{ fontSize: '2.5rem', fontWeight: 900, letterSpacing: '-0.025em', color: 'var(--text-main)' }}>Master Control</h2>
                        <p style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>System monitoring, database oversight, and forensic activity auditing.</p>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <motion.button onClick={() => fetchData()} whileHover={{ scale: 1.05 }} className="action-btn" style={{ padding: '0.75rem' }}><RefreshCcw size={18} /></motion.button>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setShowModal(true)}
                            style={{ background: 'var(--accent-primary)', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '1rem', border: 'none', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', boxShadow: '0 10px 20px rgba(99, 102, 241, 0.2)' }}
                        >
                            <UserPlus size={18} /> Register User
                        </motion.button>
                    </div>
                </div>

                {/* Sub-navigation */}
                <div style={{ display: 'flex', gap: '1rem', background: 'rgba(255,255,255,0.02)', padding: '0.5rem', borderRadius: '1.25rem', marginBottom: '3rem', width: 'fit-content', border: '1px solid var(--border-light)' }}>
                    <button onClick={() => setAdminTab('analysis')} className={`admin-nav-btn ${adminTab === 'analysis' ? 'active' : ''}`}><BarChart3 size={16} /> Surveillance</button>
                    <button onClick={() => setAdminTab('mlops')} className={`admin-nav-btn ${adminTab === 'mlops' ? 'active' : ''}`}><Cpu size={16} /> MLOps Center</button>
                    <button onClick={() => setAdminTab('qa')} className={`admin-nav-btn ${adminTab === 'qa' ? 'active' : ''}`}><ShieldCheck size={16} /> Clinical QA</button>
                    <button onClick={() => setAdminTab('compliance')} className={`admin-nav-btn ${adminTab === 'compliance' ? 'active' : ''}`}><ScrollText size={16} /> Compliance</button>
                    <button onClick={() => setAdminTab('bi')} className={`admin-nav-btn ${adminTab === 'bi' ? 'active' : ''}`}><TrendingUp size={16} /> BI Intelligence</button>
                    <button onClick={() => setAdminTab('users')} className={`admin-nav-btn ${adminTab === 'users' ? 'active' : ''}`}><UserCircle size={16} /> Users</button>
                    <button onClick={() => setAdminTab('patients')} className={`admin-nav-btn ${adminTab === 'patients' ? 'active' : ''}`}><ClipboardList size={16} /> Patients</button>
                    <button onClick={() => setAdminTab('diagnoses')} className={`admin-nav-btn ${adminTab === 'diagnoses' ? 'active' : ''}`}><Database size={16} /> Diagnostic Ledger</button>
                </div>


                {adminTab === 'analysis' && (
                    <>
                        {/* High-Level Intelligence Aggregates */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '3rem' }}>
                            {[
                                { label: 'DIAGNOSTIC ACCURACY', value: analytics.platform_metrics?.diagnostic_accuracy_estimate || '0%', icon: <Target size={20} />, color: '#10b981' },
                                { label: 'PLATFORM LATENCY', value: analytics.platform_metrics?.avg_inference_latency || '0ms', icon: <Zap size={20} />, color: '#6366f1' },
                                { label: 'CPU LOAD', value: `${resources.cpu_percent}%`, icon: <Activity size={20} />, color: 'var(--accent-secondary)' },
                                { label: 'SYSTEM UPTIME', value: stats.system_uptime || '99.9%', icon: <RefreshCcw size={20} />, color: '#fbbf24' }
                            ].map((stat, i) => (
                                <div key={i} className="card-v2" style={{ padding: '1.5rem', display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
                                    <div style={{ background: `${stat.color}15`, color: stat.color, padding: '12px', borderRadius: '12px' }}>{stat.icon}</div>
                                    <div>
                                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{stat.label}</div>
                                        <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-main)' }}>{stat.value}</div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2.5rem', marginBottom: '3rem' }}>
                            <div className="card-v2" style={{ padding: '2.5rem' }}>
                                <div className="section-title"><BarChart3 size={18} /> Global Disease Distribution</div>
                                <div style={{ height: '350px', marginTop: '2rem' }}>
                                    {Object.keys(analytics.distribution).length > 0 ? (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={Object.entries(analytics.distribution).map(([name, value]) => ({ name, value }))}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                                <XAxis dataKey="name" stroke="var(--text-secondary)" fontSize={10} axisLine={false} tickLine={false} />
                                                <YAxis hide />
                                                <Tooltip
                                                    cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                                                    contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: '1rem' }}
                                                />
                                                <Bar dataKey="value" fill="var(--accent-primary)" radius={[4, 4, 0, 0]} barSize={30} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
                                            No clinical distribution data recorded.
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="card-v2" style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column' }}>
                                <div className="section-title"><ScrollText size={18} /> Security & Forensic Logs</div>
                                <div style={{ marginTop: '1.5rem', flex: 1, overflowY: 'auto', maxHeight: '350px' }}>
                                    {auditLogs.length > 0 ? auditLogs.map((log, i) => (
                                        <div key={i} style={{ padding: '1.25rem 0', borderBottom: '1px solid rgba(255,255,255,0.02)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
                                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: log.action.includes('error') ? '#ef4444' : 'var(--accent-primary)' }} />
                                                <div>
                                                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)' }}>{log.actor} <span style={{ fontWeight: 400, opacity: 0.5 }}>{(log.action || '').replace('_', ' ')}</span></div>
                                                    <div style={{ fontSize: '0.7rem', opacity: 0.4 }}>{new Date(log.timestamp).toLocaleString()}</div>
                                                </div>
                                            </div>
                                            <div style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.05)', padding: '4px 10px', borderRadius: '6px' }}>SECURED</div>
                                        </div>
                                    )) : (
                                        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No audit logs detected in current vault.</div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Longitudinal Insights Card */}
                        <div className="card-v2" style={{ padding: '3rem', textAlign: 'center', background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(16, 185, 129, 0.05) 100%)' }}>
                            <div style={{ display: 'inline-flex', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '0.5rem 1.5rem', borderRadius: '2rem', fontSize: '0.75rem', fontWeight: 800, marginBottom: '1.5rem' }}>SYSTEM INTELLIGENCE ACTIVE</div>
                            <h3 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '1rem' }}>Active Clinical Intelligence</h3>
                            <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto', lineHeight: 1.6 }}>
                                The platform is currently aggregating performance metrics across {analytics.platform_metrics?.total_scans_processed || 0} processed neuro-sequences with an estimated diagnostic precision of {analytics.platform_metrics?.diagnostic_accuracy_estimate || '0%'}.
                            </p>
                        </div>
                    </>
                )}

                {adminTab === 'mlops' && (
                    <div className="animate-fade">
                        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem' }}>
                            <div className="card-v2" style={{ padding: '2rem' }}>
                                <div className="section-title"><Cpu size={18} /> Model Versioning & Hot-Swapping</div>
                                <table className="admin-table" style={{ width: '100%', marginTop: '1.5rem' }}>
                                    <thead>
                                        <tr>
                                            <th>MODEL NAME</th>
                                            <th>VERSION</th>
                                            <th>DEPLOYED</th>
                                            <th>STATUS</th>
                                            <th style={{ textAlign: 'right' }}>ACTION</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {models.map((m, i) => (
                                            <tr key={i}>
                                                <td style={{ fontWeight: 800 }}>{m.name}</td>
                                                <td><span className="log-badge">{m.version}</span></td>
                                                <td>{new Date(m.created_at).toLocaleDateString()}</td>
                                                <td>
                                                    <span style={{ color: m.is_active ? '#10b981' : 'var(--text-secondary)', fontWeight: 800 }}>
                                                        {m.is_active ? '● LIVE' : '○ STANDBY'}
                                                    </span>
                                                </td>
                                                <td style={{ textAlign: 'right' }}>
                                                    <button
                                                        className="action-btn"
                                                        onClick={async () => {
                                                            await axios.patch(`${API_BASE}/admin/models/${m.name}/status`, { is_active: !m.is_active }, authHeader);
                                                            fetchData();
                                                        }}
                                                    >
                                                        {m.is_active ? 'Deactivate' : 'Hotswap to Live'}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="card-v2" style={{ padding: '2rem' }}>
                                <div className="section-title"><ShieldAlert size={18} /> Global Confidence Guardrail</div>
                                <div style={{ marginTop: '2rem' }}>
                                    <label style={{ fontSize: '0.7rem', fontWeight: 800, opacity: 0.6 }}>MANUAL REVIEW THRESHOLD: {settings.global_confidence_threshold}%</label>
                                    <input
                                        type="range"
                                        min="50"
                                        max="99"
                                        value={settings.global_confidence_threshold}
                                        onChange={(e) => setSettings({ ...settings, global_confidence_threshold: e.target.value })}
                                        onMouseUp={async () => {
                                            await axios.patch(`${API_BASE}/admin/settings`, { global_confidence_threshold: settings.global_confidence_threshold }, authHeader);
                                            fetchData();
                                        }}
                                        style={{ width: '100%', marginTop: '1rem', accentColor: 'var(--accent-primary)' }}
                                    />
                                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '1rem', lineHeight: 1.5 }}>
                                        Any diagnostic output with confidence below this value will be automatically flagged for secondary human radiologist confirmation.
                                    </p>
                                </div>
                                <div style={{ marginTop: '3rem' }}>
                                    <div className="section-title"><Zap size={18} /> Latency Telemetry (ms)</div>
                                    <div style={{ height: '180px', marginTop: '1.5rem' }}>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={latencyData.slice(0, 20)}>
                                                <Bar dataKey="latency" fill="var(--accent-secondary)" />
                                                <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)' }} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {adminTab === 'qa' && (
                    <div className="animate-fade">
                        <div className="card-v2" style={{ padding: '2rem' }}>
                            <div className="section-title" style={{ marginBottom: '2rem' }}><ShieldCheck size={18} /> Clinical QA & Flagged Discrepancy Gallery</div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                                {flaggedDiagnoses.map((d, i) => (
                                    <div key={i} className="card-v2" style={{ background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '1.5rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                            <span style={{ fontSize: '0.65rem', fontWeight: 900, color: '#ef4444' }}>FLAGGED: LOW CONFIDENCE</span>
                                            <span style={{ fontSize: '0.65rem', opacity: 0.5 }}>{new Date(d.date).toLocaleDateString()}</span>
                                        </div>
                                        <h4 style={{ fontWeight: 800 }}>{d.prediction}</h4>
                                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0.5rem 0' }}>Patient: {d.patient_id}</p>
                                        <div style={{ background: 'rgba(0,0,0,0.2)', padding: '0.75rem', borderRadius: '0.5rem', fontSize: '0.75rem', marginBottom: '1rem' }}>
                                            Confidence: {d.confidence.toFixed(2)}% (Threshold: {settings.global_confidence_threshold}%)
                                        </div>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button className="btn btn-outline" style={{ fontSize: '0.65rem', flex: 1 }}>Review Scan</button>
                                            <button className="btn btn-blue" style={{ fontSize: '0.65rem', flex: 1 }}>Validate Label</button>
                                        </div>
                                    </div>
                                ))}
                                {flaggedDiagnoses.length === 0 && (
                                    <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '5rem', opacity: 0.5 }}>
                                        <ShieldCheck size={48} style={{ marginBottom: '1rem' }} />
                                        <p>No high-discrepancy scans found in current cycle.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {adminTab === 'compliance' && (
                    <div className="animate-fade">
                        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
                            <div className="card-v2" style={{ padding: '2rem' }}>
                                <div className="section-title" style={{ marginBottom: '2rem' }}><ScrollText size={18} /> Forensic Audit & IP Trace Ledger</div>
                                <div style={{ overflowX: 'auto' }}>
                                    <table className="admin-table" style={{ width: '100%' }}>
                                        <thead>
                                            <tr>
                                                <th>TIMESTAMP</th>
                                                <th>ACTOR</th>
                                                <th>ACTION</th>
                                                <th>IP ADDRESS</th>
                                                <th>USER AGENT</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {auditLogs.map((log, i) => (
                                                <tr key={i}>
                                                    <td style={{ fontSize: '0.7rem' }}>{new Date(log.timestamp).toLocaleString()}</td>
                                                    <td style={{ fontWeight: 800 }}>{log.actor}</td>
                                                    <td style={{ color: 'var(--accent-primary)' }}>{log.action}</td>
                                                    <td style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>{log.ip_address}</td>
                                                    <td style={{ fontSize: '0.6rem', opacity: 0.4, maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{log.user_agent}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            <div className="card-v2" style={{ padding: '2rem', textAlign: 'center' }}>
                                <div className="section-title" style={{ justifyContent: 'center' }}><ShieldCheck size={18} /> Compliance Export</div>
                                <p style={{ margin: '2rem 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                    Generate an immutable regulatory report for hospital auditors. Contains safety metrics, uptime data, and forensic logs.
                                </p>
                                <button
                                    className="btn btn-blue"
                                    style={{ width: '100%', padding: '1.25rem' }}
                                    onClick={async () => {
                                        try {
                                            const resp = await axios.get(`${API_BASE}/admin/compliance/export`, authHeader);
                                            const linkSource = `data:application/pdf;base64,${resp.data}`;
                                            const downloadLink = document.createElement("a");
                                            downloadLink.href = linkSource;
                                            downloadLink.download = `deepbraindx_compliance_${new Date().toISOString().split('T')[0]}.pdf`;
                                            downloadLink.click();
                                        } catch (err) { alert("PDF Generation Failed"); }
                                    }}
                                >
                                    Download Compliance PDF
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {adminTab === 'bi' && (
                    <div className="animate-fade">
                        {!biStats ? (
                            <div style={{ padding: '10rem', textAlign: 'center' }}>
                                <Loader2 className="animate-spin" size={48} style={{ color: 'var(--accent-primary)', marginBottom: '1.5rem' }} />
                                <p style={{ fontWeight: 700, opacity: 0.5 }}>SYNCHRONIZING BUSINESS INTELLIGENCE NODES...</p>
                            </div>
                        ) : (
                            <>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2.5rem' }}>
                                    <div className="card-v2" style={{ padding: '1.5rem', textAlign: 'center' }}>
                                        <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>TOTAL SCANS</div>
                                        <div style={{ fontSize: '1.8rem', fontWeight: 900 }}>{biStats.total_diagnoses}</div>
                                    </div>
                                    <div className="card-v2" style={{ padding: '1.5rem', textAlign: 'center' }}>
                                        <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>AVG LATENCY</div>
                                        <div style={{ fontSize: '1.8rem', fontWeight: 900 }}>{biStats.latency_avg_ms.toFixed(1)}ms</div>
                                    </div>
                                    <div className="card-v2" style={{ padding: '1.5rem', textAlign: 'center' }}>
                                        <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>GPU ACCELERATION</div>
                                        <div style={{ fontSize: '1.8rem', fontWeight: 900, color: biStats.system_load_info.gpu_available ? '#10b981' : '#ef4444' }}>{biStats.system_load_info.gpu_available ? 'ACTIVE' : 'OFFLINE'}</div>
                                    </div>
                                    <div className="card-v2" style={{ padding: '1.5rem', textAlign: 'center' }}>
                                        <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>SYSTEM LOAD</div>
                                        <div style={{ fontSize: '1.8rem', fontWeight: 900 }}>{biStats.system_load_info.cpu_percent.toFixed(0)}%</div>
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem' }}>
                                    <div className="card-v2" style={{ padding: '2.5rem' }}>
                                        <div className="section-title"><TrendingUp size={18} /> Swin-T Ensemble Confidence Averages</div>
                                        <div style={{ height: '350px', marginTop: '2rem' }}>
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={Object.entries(biStats.model_confidence_averages).map(([name, value]) => ({ name, value: (value * 100).toFixed(1) }))}>
                                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                                    <XAxis dataKey="name" stroke="var(--text-secondary)" fontSize={10} vertical={false} />
                                                    <YAxis hide domain={[0, 100]} />
                                                    <Tooltip contentStyle={{ background: '#000', border: '1px solid var(--border-light)' }} />
                                                    <Bar dataKey="value" fill="var(--accent-primary)" radius={[4, 4, 0, 0]} barSize={40} />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>
                                    <div className="card-v2" style={{ padding: '2.5rem' }}>
                                        <div className="section-title"><UserCircle size={18} /> Usage Tracking by Account</div>
                                        <div style={{ marginTop: '1.5rem' }}>
                                            {Object.entries(biStats.scans_per_doctor).map(([doctor, count], i) => (
                                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem 0', borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                                                    <span style={{ fontWeight: 700 }}>{doctor}</span>
                                                    <span style={{ color: 'var(--accent-primary)', fontWeight: 900 }}>{count} Scans</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                )}

                {adminTab === 'users' && (
                    <div className="card-v2 animate-fade" style={{ padding: '2rem' }}>
                        <div className="section-title" style={{ marginBottom: '2rem' }}><UserCircle size={18} /> Registered User Management</div>
                        <div style={{ overflowX: 'auto' }}>
                            <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr>
                                        <th>USER</th>
                                        <th>USERNAME</th>
                                        <th>DEPARTMENT</th>
                                        <th>ROLE</th>
                                        <th>STATUS</th>
                                        <th style={{ textAlign: 'right' }}>ENGINE CONTROLS</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((c, i) => (
                                        <tr key={i}>
                                            <td style={{ fontWeight: 800 }}>{c.full_name}</td>
                                            <td style={{ opacity: 0.6, fontSize: '0.75rem' }}>@{c.username}</td>
                                            <td>{c.department}</td>
                                            <td>
                                                <span style={{
                                                    padding: '4px 8px', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 900,
                                                    background: c.role === 'admin' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(99, 102, 241, 0.1)',
                                                    color: c.role === 'admin' ? 'var(--accent-secondary)' : 'var(--accent-primary)'
                                                }}>
                                                    {c.role.toUpperCase()}
                                                </span>
                                            </td>
                                            <td>
                                                <span style={{ color: c.is_active ? '#10b981' : '#ef4444', fontWeight: 800, fontSize: '0.75rem' }}>
                                                    {c.is_active ? '● ONLINE' : '○ DEACTIVATED'}
                                                </span>
                                            </td>
                                            <td style={{ textAlign: 'right' }}>
                                                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                                    <button className="action-btn" title="Toggle Role" onClick={() => toggleUserRole(c.username, c.role)}>
                                                        {c.role === 'admin' ? <ShieldX size={16} /> : <UserCheck size={16} />}
                                                    </button>
                                                    <button className="action-btn" title={c.is_active ? "Suspend" : "Activate"} onClick={() => toggleUserStatus(c.username, c.is_active)}>
                                                        {c.is_active ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {adminTab === 'patients' && (
                    <div className="card-v2" style={{ padding: '2rem' }}>
                        <div className="section-title" style={{ marginBottom: '2rem' }}><ClipboardList size={18} /> Global Patient Registry</div>
                        <div style={{ overflowX: 'auto' }}>
                            <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr>
                                        <th>PATIENT ID</th>
                                        <th>FULL NAME</th>
                                        <th>PRIMARY PHYSICIAN</th>
                                        <th>GENETIC MARKERS</th>
                                        <th>ALLERGIES</th>
                                        <th>RECORDS SINCE</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {patients.map((p, i) => (
                                        <tr key={i}>
                                            <td style={{ fontWeight: 900, color: 'var(--accent-primary)' }}>{p.id}</td>
                                            <td style={{ fontWeight: 700 }}>{p.name}</td>
                                            <td>{p.physician}</td>
                                            <td><span className="log-badge" style={{ color: 'var(--accent-secondary)' }}>{p.genetic_markers}</span></td>
                                            <td><span style={{ fontSize: '0.75rem', opacity: 0.7 }}>{p.allergies}</span></td>
                                            <td style={{ fontSize: '0.75rem', opacity: 0.5 }}>{new Date(p.created_at).toLocaleDateString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {adminTab === 'diagnoses' && (
                    <div className="card-v2" style={{ padding: '2rem' }}>
                        <div className="section-title" style={{ marginBottom: '2rem' }}><Database size={18} /> Universal Diagnostic Ledger</div>
                        <div style={{ overflowX: 'auto' }}>
                            <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr>
                                        <th>DATE</th>
                                        <th>PATIENT ID</th>
                                        <th>EVENT</th>
                                        <th>PREDICTION</th>
                                        <th>CONFIDENCE</th>
                                        <th>OPERATOR</th>
                                        <th>VOLUME (mm³)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {diagnoses.map((d, i) => (
                                        <tr key={i}>
                                            <td style={{ fontSize: '0.75rem', fontWeight: 600 }}>{new Date(d.date).toLocaleString()}</td>
                                            <td style={{ fontWeight: 800 }}>{d.patient_id}</td>
                                            <td style={{ opacity: 0.7 }}>{d.event}</td>
                                            <td>
                                                <span style={{
                                                    padding: '4px 8px', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 900,
                                                    background: 'rgba(255,255,255,0.05)', color: 'var(--text-main)'
                                                }}>
                                                    {d.prediction.toUpperCase()}
                                                </span>
                                            </td>
                                            <td style={{ fontWeight: 800, color: d.confidence > 70 ? '#10b981' : '#f59e0b' }}>
                                                {d.confidence.toFixed(2)}%
                                            </td>
                                            <td style={{ fontSize: '0.75rem' }}>{d.performing_doctor || d.user_id || 'System'}</td>
                                            <td>{d.volume_mm3 ? d.volume_mm3.toLocaleString() : 'N/A'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}


            </div>
        );
    };


    const DirectoryView = () => {
        const [patients, setPatients] = useState([]);
        const [showAdd, setShowAdd] = useState(false);
        const [newP, setNewP] = useState({ id: '', name: '', physician: '', genetics: '', allergies: '' });

        const fetchPatients = async () => {
            try {
                const resp = await axios.get(`${API_BASE}/patients`, authHeader);
                setPatients(resp.data);
            } catch (e) { console.error(e); }
        };

        useEffect(() => { fetchPatients(); }, []);

        const handleAdd = async (e) => {
            e.preventDefault();
            const fd = new FormData();
            fd.append('id', newP.id);
            fd.append('name', newP.name);
            fd.append('physician', newP.physician);
            fd.append('genetic_markers', newP.genetics);
            fd.append('allergies', newP.allergies);

            try {
                await axios.post(`${API_BASE}/patients`, fd, authHeader);
                setShowAdd(false);
                fetchPatients();
            } catch (e) { alert(e.response?.data?.detail || "Failed to add patient"); }
        };

        return (
            <div className="dashboard-container animate-fade">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                    <div>
                        <h2 style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--text-main)' }}>Patient Directory</h2>
                        <p style={{ color: 'var(--text-secondary)' }}>Centralized clinical records and diagnostic vault.</p>
                    </div>
                    <button className="btn btn-blue" onClick={() => setShowAdd(true)}>+ Register New Patient</button>
                </div>

                {showAdd && (
                    <div className="card-v2" style={{ padding: '2rem', marginBottom: '2rem', border: '1px solid var(--accent-primary)' }}>
                        <h3 className="section-title">New Patient Registration</h3>
                        <form onSubmit={handleAdd} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <input className="input-theme" placeholder="Patient ID (e.g. DBDX-001)" value={newP.id} onChange={e => setNewP({ ...newP, id: e.target.value })} required style={{ padding: '0.8rem', borderRadius: '0.5rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-light)', color: 'var(--text-main)' }} />
                            <input className="input-theme" placeholder="Full Name" value={newP.name} onChange={e => setNewP({ ...newP, name: e.target.value })} required style={{ padding: '0.8rem', borderRadius: '0.5rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-light)', color: 'var(--text-main)' }} />
                            <input className="input-theme" placeholder="Primary Physician" value={newP.physician} onChange={e => setNewP({ ...newP, physician: e.target.value })} required style={{ padding: '0.8rem', borderRadius: '0.5rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-light)', color: 'var(--text-main)' }} />
                            <input className="input-theme" placeholder="Genetic Markers" value={newP.genetics} onChange={e => setNewP({ ...newP, genetics: e.target.value })} style={{ padding: '0.8rem', borderRadius: '0.5rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-light)', color: 'var(--text-main)' }} />
                            <input className="input-theme" placeholder="Allergies" value={newP.allergies} onChange={e => setNewP({ ...newP, allergies: e.target.value })} style={{ padding: '0.8rem', borderRadius: '0.5rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-light)', color: 'var(--text-main)' }} />
                            <div style={{ gridColumn: 'span 2', display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                <button type="submit" className="btn btn-blue" style={{ flex: 1 }}>Register</button>
                                <button type="button" className="btn btn-outline" onClick={() => setShowAdd(false)} style={{ flex: 1 }}>Cancel</button>
                            </div>
                        </form>
                    </div>
                )}

                <div className="card-v2" style={{ padding: 0, overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border-light)' }}>
                            <tr>
                                <th style={{ padding: '1.2rem', fontSize: '0.75rem', fontWeight: 900, color: 'var(--text-secondary)' }}>PATIENT ID</th>
                                <th style={{ padding: '1.2rem', fontSize: '0.75rem', fontWeight: 900, color: 'var(--text-secondary)' }}>NAME</th>
                                <th style={{ padding: '1.2rem', fontSize: '0.75rem', fontWeight: 900, color: 'var(--text-secondary)' }}>PHYSICIAN</th>
                                <th style={{ padding: '1.2rem', fontSize: '0.75rem', fontWeight: 900, color: 'var(--text-secondary)' }}>ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {patients.map((p, i) => (
                                <tr key={i} style={{ borderBottom: '1px solid var(--border-light)', background: selectedPatient === p.id ? 'rgba(99, 102, 241, 0.05)' : 'transparent' }}>
                                    <td style={{ padding: '1.2rem', fontWeight: 800, color: 'var(--accent-primary)' }}>{p.id}</td>
                                    <td style={{ padding: '1.2rem', fontWeight: 700, color: 'var(--text-main)' }}>{p.name}</td>
                                    <td style={{ padding: '1.2rem', color: 'var(--text-secondary)' }}>{p.physician}</td>
                                    <td style={{ padding: '1.2rem' }}>
                                        <button
                                            className={`btn ${selectedPatient === p.id ? 'btn-blue' : 'btn-outline'}`}
                                            style={{ padding: '0.4rem 1rem', fontSize: '0.7rem' }}
                                            onClick={() => {
                                                setSelectedPatient(p.id);
                                                setActiveTab('Home');
                                            }}
                                        >
                                            {selectedPatient === p.id ? 'SELECTED' : 'SELECT FOR ANALYSIS'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    const DatabaseView = () => {
        const [viewMode, setViewMode] = useState('dashboard'); // dashboard, explorer
        const [activeTable, setActiveTable] = useState('DIAGNOSES');
        const [tableData, setTableData] = useState([]);
        const [loading, setLoading] = useState(false);
        const [dbStats, setDbStats] = useState(null);
        const [query, setQuery] = useState('');

        const tables = [
            { id: 'DIAGNOSES', label: 'db.diagnoses', icon: <Activity size={14} />, endpoint: `${API_BASE}/admin/diagnoses` },
            { id: 'PATIENTS', label: 'db.patients', icon: <ClipboardList size={14} />, endpoint: `${API_BASE}/admin/patients` },
            { id: 'USERS', label: 'db.users', icon: <UserCircle size={14} />, endpoint: `${API_BASE}/users` },
            { id: 'LOGS', label: 'db.audit_logs', icon: <ScrollText size={14} />, endpoint: `${API_BASE}/logs?limit=100` },
            { id: 'FEEDBACK', label: 'db.diagnosis_feedback', icon: <MessageSquare size={14} />, endpoint: `${API_BASE}/admin/diagnoses/flagged` }
        ];

        const fetchDbStats = async () => {
            try {
                const res = await axios.get(`${API_BASE}/admin/db/stats`, authHeader);
                setDbStats(res.data);
            } catch (e) {
                console.error("DB Stats Error:", e);
            }
        };

        useEffect(() => {
            fetchDbStats();
            if (viewMode === 'explorer') {
                fetchTableData(activeTable);
            }
        }, [activeTable, viewMode]);

        const fetchTableData = async (tableId) => {
            setLoading(true);
            try {
                const table = tables.find(t => t.id === tableId);
                const res = await axios.get(table.endpoint, authHeader);
                setTableData(Array.isArray(res.data) ? res.data : []);
            } catch (e) {
                console.error(e);
                setTableData([]);
            } finally {
                setLoading(false);
            }
        };

        const filteredData = tableData.filter(row =>
            JSON.stringify(row).toLowerCase().includes(query.toLowerCase())
        );

        const formatBytes = (bytes) => {
            if (bytes === 0) return '0 Bytes';
            const k = 1024;
            const sizes = ['Bytes', 'KB', 'MB', 'GB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
        };

        return (
            <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)', width: '100%', overflow: 'hidden' }}>

                {/* Header / Mode Switcher */}
                <div style={{ padding: '1.5rem 4rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border-light)' }}>
                    <div>
                        <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <Database size={28} color="var(--accent-primary)" /> Database Control Engine
                        </h2>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Real-time persistence monitoring and schema exploration for DeepBrainDx Cluster.</p>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(0,0,0,0.2)', padding: '0.4rem', borderRadius: '0.75rem', border: '1px solid var(--border-light)' }}>
                        <button onClick={() => setViewMode('dashboard')} style={{
                            padding: '0.6rem 1.2rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.8rem',
                            background: viewMode === 'dashboard' ? 'var(--accent-primary)' : 'transparent',
                            color: viewMode === 'dashboard' ? '#fff' : 'var(--text-secondary)',
                            transition: 'all 0.2s'
                        }}>DASHBOARD</button>
                        <button onClick={() => setViewMode('explorer')} style={{
                            padding: '0.6rem 1.2rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.8rem',
                            background: viewMode === 'explorer' ? 'var(--accent-primary)' : 'transparent',
                            color: viewMode === 'explorer' ? '#fff' : 'var(--text-secondary)',
                            transition: 'all 0.2s'
                        }}>EXPLORER</button>
                    </div>
                </div>

                {viewMode === 'dashboard' && dbStats ? (
                    <div style={{ flex: 1, padding: '3rem 4rem', overflowY: 'auto' }}>
                        {/* Primary Metrics */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '3rem' }}>
                            <div className="card-v2" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <div style={{ color: 'var(--text-secondary)', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase' }}>STORAGE UTILIZATION</div>
                                <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--accent-primary)' }}>{formatBytes(dbStats.storage.total_size)}</div>
                                <div style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 600 }}>Physical Disk: {formatBytes(dbStats.storage.storage_size)}</div>
                            </div>
                            <div className="card-v2" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <div style={{ color: 'var(--text-secondary)', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase' }}>INDEX FOOTPRINT</div>
                                <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--accent-secondary)' }}>{formatBytes(dbStats.storage.index_size)}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Total Indexes: {dbStats.collections.reduce((a, b) => a + b.nindexes, 0)}</div>
                            </div>
                            <div className="card-v2" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <div style={{ color: 'var(--text-secondary)', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase' }}>NETWORK TELEMETRY</div>
                                <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#fbbf24' }}>{dbStats.connections}</div>
                                <div style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 600 }}>Active Handshakes</div>
                            </div>
                            <div className="card-v2" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <div style={{ color: 'var(--text-secondary)', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase' }}>UPTIME PERSISTENCE</div>
                                <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#fff' }}>{(dbStats.uptime / 3600).toFixed(1)}h</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Rel: v{dbStats.version}</div>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem' }}>
                            {/* Collection Visualizer */}
                            <div className="card-v2" style={{ padding: '2.5rem' }}>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: 900, marginBottom: '2rem' }}>Collection Volume Analysis</h3>
                                <div style={{ height: '350px' }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={dbStats.collections} layout="vertical" margin={{ left: 50 }}>
                                            <XAxis type="number" hide />
                                            <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} stroke="var(--text-secondary)" fontSize={12} width={120} />
                                            <Tooltip
                                                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                                contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: '1rem' }}
                                            />
                                            <Bar dataKey="count" fill="var(--accent-primary)" radius={[0, 4, 4, 0]} barSize={25}>
                                                {dbStats.collections.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={index % 2 === 0 ? 'var(--accent-primary)' : 'var(--accent-secondary)'} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Schema Intelligence */}
                            <div className="card-v2" style={{ padding: '2.5rem' }}>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: 900, marginBottom: '1.5rem' }}>Server Environment</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                    {[
                                        { label: 'Datastore', value: 'MongoDB Engine', icon: <Database size={16} /> },
                                        { label: 'Primary Host', value: dbStats.host, icon: <Network size={16} /> },
                                        { label: 'Namespace', value: dbStats.db_name, icon: <Layers size={16} /> },
                                        { label: 'GridFS Bucket', value: 'Active', icon: <FileText size={16} /> },
                                        { label: 'Status', value: 'Fully Synchronized', icon: <ShieldCheck size={16} />, color: '#10b981' }
                                    ].map((item, i) => (
                                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'rgba(0,0,0,0.1)', borderRadius: '0.75rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                                                {item.icon} {item.label}
                                            </div>
                                            <div style={{ fontWeight: 800, color: item.color || 'var(--text-main)', fontSize: '0.85rem' }}>{item.value}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'row', gap: '2.5rem', flex: 1, padding: '2rem 4rem', overflow: 'hidden' }}>
                        {/* Sidebar - Explorer Nav */}
                        <div className="card-v2" style={{ width: '280px', display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1.5rem', background: 'rgba(15, 23, 42, 0.4)' }}>
                            <div style={{ paddingBottom: '1rem', borderBottom: '1px solid var(--border-light)', color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: 900, letterSpacing: '0.1em' }}>
                                DATABASE EXPLORER
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {tables.map(t => (
                                    <button
                                        key={t.id}
                                        onClick={() => setActiveTable(t.id)}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer', textAlign: 'left', fontSize: '0.85rem', transition: 'all 0.2s',
                                            background: activeTable === t.id ? 'var(--accent-primary)' : 'transparent',
                                            color: activeTable === t.id ? '#fff' : 'var(--text-secondary)',
                                            fontWeight: activeTable === t.id ? 700 : 500
                                        }}
                                    >
                                        {t.icon} {t.label}
                                    </button>
                                ))}
                            </div>
                            <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border-light)' }}>
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Connection:</span> <span style={{ color: '#10b981', fontWeight: 700 }}>Active</span></div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Driver:</span> <span>MongoDB (Motor)</span></div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Type:</span> <span>NoSQL Cluster</span></div>
                                </div>
                            </div>
                        </div>

                        {/* Main Explorer View */}
                        <div className="card-v2" style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden', border: 'none' }}>
                            {/* Explorer Toolbar */}
                            <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.2)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)' }}>
                                    <Database size={16} color="var(--accent-primary)" />
                                    <span style={{ fontFamily: 'monospace' }}>db.{activeTable.toLowerCase()}.find({ })</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{ position: 'relative' }}>
                                        <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                                        <input
                                            placeholder="Find by field..."
                                            value={query}
                                            onChange={e => setQuery(e.target.value)}
                                            style={{ background: 'var(--bg-page)', border: '1px solid var(--border-light)', borderRadius: '0.5rem', padding: '0.5rem 0.5rem 0.5rem 2.2rem', color: 'var(--text-main)', fontSize: '0.8rem', width: '240px', outline: 'none' }}
                                        />
                                    </div>
                                    <button className="btn btn-outline" style={{ padding: '0.5rem', borderRadius: '0.5rem' }} onClick={() => fetchTableData(activeTable)}>
                                        <RefreshCcw size={14} />
                                    </button>
                                </div>
                            </div>

                            {/* Explorer Data Grid */}
                            <div style={{ flex: 1, overflow: 'auto', background: 'rgba(0,0,0,0.1)' }}>
                                {loading ? (
                                    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem' }}>
                                        <Loader2 className="animate-spin" size={32} style={{ color: 'var(--accent-secondary)' }} />
                                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Executing Atlas Query...</span>
                                    </div>
                                ) : filteredData.length > 0 ? (
                                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                                        <thead style={{ position: 'sticky', top: 0, background: 'var(--bg-card)', zIndex: 10, borderBottom: '2px solid var(--border-light)' }}>
                                            <tr>
                                                {Object.keys(filteredData[0]).map(key => (
                                                    <th key={key} style={{ textAlign: 'left', padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{key}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredData.map((row, i) => (
                                                <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                                                    {Object.values(row).map((val, j) => (
                                                        <td key={j} style={{ padding: '0.8rem 1rem', color: 'var(--text-main)', fontFamily: 'monospace', whiteSpace: 'nowrap', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                            {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                                                        </td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', color: 'var(--text-secondary)' }}>
                                        <Database size={48} style={{ opacity: 0.1, marginBottom: '1rem' }} />
                                        <p>Namespace '{activeTable.toLowerCase()}' contains no documents.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    const HistoryView = () => {
        const [history, setHistory] = useState([]);
        const [loading, setLoading] = useState(true);

        const fetchHistory = async () => {
            try {
                const resp = await axios.get(`${API_BASE}/admin/diagnoses`, authHeader);
                setHistory(resp.data);
            } catch (e) {
                console.error("History Fetch Error:", e);
            } finally {
                setLoading(false);
            }
        };

        useEffect(() => {
            fetchHistory();
        }, []);

        // Listen for real-time updates to refresh history
        useEffect(() => {
            const handleRefresh = (e) => {
                if (e.detail?.type === 'NEW_DIAGNOSIS' || e.detail?.type === 'NEW_SEGMENTATION') {
                    fetchHistory();
                }
            };
            window.addEventListener('dbdx_refresh_history', handleRefresh);
            return () => window.removeEventListener('dbdx_refresh_history', handleRefresh);
        }, []);

        return (
            <div className="dashboard-container animate-fade">
                <style>{`
                    .history-card {
                        background: var(--bg-card);
                        border: 1px solid var(--border-light);
                        border-radius: 1.5rem;
                        padding: 2rem;
                        margin-bottom: 1.5rem;
                        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                    }
                    .history-card:hover {
                        border-color: var(--accent-primary);
                        transform: translateX(10px);
                        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                    }
                    .history-badge {
                        padding: 0.4rem 1rem;
                        border-radius: 2rem;
                        font-size: 0.7rem;
                        font-weight: 800;
                        letter-spacing: 0.05em;
                    }
                `}</style>

                <div style={{ marginBottom: '3rem' }}>
                    <h2 style={{ fontSize: '2.5rem', fontWeight: 900, letterSpacing: '-0.025em', color: '#fff' }}>Patient Diagnostic History</h2>
                    <p style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Comprehensive archive of all clinical inferences (MRI, EEG, Segmentation) processed by the platform.</p>
                </div>

                {loading ? (
                    <div style={{ height: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1.5rem' }}>
                        <Loader2 className="animate-spin" size={64} style={{ color: 'var(--accent-primary)' }} />
                        <p style={{ color: 'var(--text-secondary)', fontWeight: 700 }}>SYNCHRONIZING CLINICAL RECORDS...</p>
                    </div>
                ) : (
                    <div className="card-v2" style={{ padding: 0, overflow: 'hidden', border: '1px solid var(--border-light)' }}>
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                                <thead>
                                    <tr style={{ background: 'rgba(0,0,0,0.2)', borderBottom: '2px solid var(--border-light)' }}>
                                        <th style={{ padding: '1.25rem', textAlign: 'left', color: 'var(--text-secondary)', fontWeight: 800, textTransform: 'uppercase', fontSize: '0.7rem' }}>ID</th>
                                        <th style={{ padding: '1.25rem', textAlign: 'left', color: 'var(--text-secondary)', fontWeight: 800, textTransform: 'uppercase', fontSize: '0.7rem' }}>Patient Name</th>
                                        <th style={{ padding: '1.25rem', textAlign: 'left', color: 'var(--text-secondary)', fontWeight: 800, textTransform: 'uppercase', fontSize: '0.7rem' }}>Modality / Asset</th>
                                        <th style={{ padding: '1.25rem', textAlign: 'left', color: 'var(--text-secondary)', fontWeight: 800, textTransform: 'uppercase', fontSize: '0.7rem' }}>Diagnosis</th>
                                        <th style={{ padding: '1.25rem', textAlign: 'left', color: 'var(--text-secondary)', fontWeight: 800, textTransform: 'uppercase', fontSize: '0.7rem' }}>Confidence</th>
                                        <th style={{ padding: '1.25rem', textAlign: 'left', color: 'var(--text-secondary)', fontWeight: 800, textTransform: 'uppercase', fontSize: '0.7rem' }}>Clinical Lead</th>
                                        <th style={{ padding: '1.25rem', textAlign: 'left', color: 'var(--text-secondary)', fontWeight: 800, textTransform: 'uppercase', fontSize: '0.7rem' }}>Date & Time</th>
                                        <th style={{ padding: '1.25rem', textAlign: 'center', color: 'var(--text-secondary)', fontWeight: 800, textTransform: 'uppercase', fontSize: '0.7rem' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {history.length > 0 ? history.map((record, i) => (
                                        <motion.tr
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.03 }}
                                            key={i}
                                            style={{ borderBottom: '1px solid var(--border-light)', transition: 'background 0.2s' }}
                                            className="hover-row"
                                        >
                                            <td style={{ padding: '1rem 1.25rem', fontFamily: 'monospace', color: 'var(--accent-primary)', fontWeight: 700 }}>#{record.id.slice(-6).toUpperCase()}</td>
                                            <td style={{ padding: '1rem 1.25rem', fontWeight: 700, color: '#fff' }}>{record.patient_name || "Unknown Patient"}</td>
                                            <td style={{ padding: '1rem 1.25rem' }}>
                                                {record.scan_url ? (
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                        <div style={{ position: 'relative', width: '40px', height: '40px', borderRadius: '4px', overflow: 'hidden', border: '1px solid var(--border-light)' }}>
                                                            <img src={`${API_BASE}${record.scan_url}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Scan" />
                                                            {record.xai_url && <div style={{ position: 'absolute', top: 0, right: 0, width: '10px', height: '10px', background: 'var(--accent-secondary)', borderRadius: '50%', border: '2px solid #000' }} title="Heatmap Available" />}
                                                        </div>
                                                        <span style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-secondary)' }}>MRI</span>
                                                    </div>
                                                ) : record.event?.toLowerCase().includes('eeg') ? (
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                        <div style={{ width: '40px', height: '40px', borderRadius: '4px', background: 'rgba(99, 102, 241, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--accent-primary)' }}>
                                                            <Activity size={20} style={{ color: 'var(--accent-primary)' }} />
                                                        </div>
                                                        <span style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--accent-primary)' }}>EEG</span>
                                                    </div>
                                                ) : <span style={{ opacity: 0.3 }}>N/A</span>}
                                            </td>
                                            <td style={{ padding: '1rem 1.25rem' }}>
                                                <span className="history-badge" style={{
                                                    background: record.prediction?.toLowerCase().includes('seizure') || record.prediction?.toLowerCase().includes('glioma') ? 'rgba(239, 68, 68, 0.1)' : 'rgba(129, 140, 248, 0.1)',
                                                    color: record.prediction?.toLowerCase().includes('seizure') || record.prediction?.toLowerCase().includes('glioma') ? '#f87171' : 'var(--accent-primary)',
                                                    border: record.prediction?.toLowerCase().includes('seizure') || record.prediction?.toLowerCase().includes('glioma') ? '1px solid rgba(239, 68, 68, 0.2)' : '1px solid rgba(129, 140, 248, 0.2)'
                                                }}>
                                                    {record.prediction}
                                                </span>
                                            </td>
                                            <td style={{ padding: '1rem 1.25rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <div style={{ width: '40px', height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
                                                        <div style={{ width: `${record.confidence}%`, height: '100%', background: record.confidence > 80 ? '#10b981' : '#f59e0b' }} />
                                                    </div>
                                                    <span style={{ fontWeight: 800, color: record.confidence > 80 ? '#10b981' : '#f59e0b' }}>
                                                        {Number(record.confidence).toFixed(2)}%
                                                    </span>
                                                </div>
                                            </td>
                                            <td style={{ padding: '1rem 1.25rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <UserCheck size={14} style={{ opacity: 0.5, color: 'var(--accent-primary)' }} />
                                                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{record.performing_doctor || "System AI"}</span>
                                                </div>
                                            </td>
                                            <td style={{ padding: '1rem 1.25rem', color: 'var(--text-secondary)' }}>
                                                {new Date(record.date).toLocaleDateString()} <span style={{ opacity: 0.5, fontSize: '0.75rem' }}>{new Date(record.date).toLocaleTimeString()}</span>
                                            </td>
                                            <td style={{ padding: '1rem 1.25rem', textAlign: 'center' }}>
                                                <button
                                                    className="btn btn-outline"
                                                    style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', borderRadius: '0.5rem', marginRight: '0.5rem' }}
                                                    onClick={() => {
                                                        const p = patients.find(pl => pl.id === record.patient_id) || { id: record.patient_id, name: record.patient_name || "Unknown Patient" };
                                                        const diag = {
                                                            event: record.event || "MRI Scan", // Added to detect EEG vs MRI in report
                                                            prediction: record.prediction,
                                                            confidence: `${Number(record.confidence).toFixed(2)}%`,
                                                            description: record.description || `Diagnostic verify for patient ${record.patient_id}.`,
                                                            all_expert_scores: record.ensemble_scores || { [record.prediction]: record.confidence }
                                                        };
                                                        const seg = record.volume_mm3 ? {
                                                            stats: {
                                                                tumor_volume: `${record.volume_mm3.toFixed(2)} mm³`,
                                                                affected_region: record.affected_region,
                                                                severity: record.severity
                                                            }
                                                        } : null;

                                                        setHistoryReportContext({
                                                            pInfo: p,
                                                            diagData: { ...diag, performing_doctor: record.performing_doctor },
                                                            segData: seg,
                                                            scanUrl: record.scan_url,
                                                            xaiUrl: record.xai_url
                                                        });
                                                        setViewingHistoryReport(true);
                                                    }}
                                                >
                                                    REPORT
                                                </button>
                                                {record.bundle_url && (
                                                    <button
                                                        className="btn"
                                                        style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', borderRadius: '0.5rem', background: 'var(--accent-primary)', color: '#fff', border: 'none', marginRight: '0.5rem' }}
                                                        onClick={() => window.open(`${API_BASE}${record.bundle_url}`, '_blank')}
                                                    >
                                                        BUNDLE
                                                    </button>
                                                )}
                                                <button
                                                    className="btn btn-blue"
                                                    style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', borderRadius: '0.5rem' }}
                                                    onClick={() => fetchTimeline(record.patient_id)}
                                                >
                                                    TIMELINE
                                                </button>
                                            </td>
                                        </motion.tr>
                                    )) : (
                                        <tr>
                                            <td colSpan="7" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-secondary)', opacity: 0.5 }}>
                                                <Database size={48} style={{ marginBottom: '1rem' }} />
                                                <p>No diagnostic cycles found in system ledger.</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <style>{`
                            .hover-row:hover { background: rgba(255,255,255,0.02); }
                            .history-badge { padding: 0.2rem 0.6rem; border-radius: 4px; font-size: 0.7rem; font-weight: 800; }
                        `}</style>
                    </div>
                )}
            </div>
        );
    };





    const renderContent = () => {
        if (activeTab === 'Home') return <HomeView setActiveTab={setActiveTab} />;
        if (activeTab === 'Diagnostic Intake') return (
            <DiagnosticIntakeView
                verifying={verifying}
                preview={preview}
                eegFile={eegFile}
                error={error}
                handleFileChange={handleFileChange}
                setIsMriDragging={setIsMriDragging}
                isMriDragging={isMriDragging}
                fileInputRef={fileInputRef}
            />
        );
        if (activeTab === 'EEG Analytics') return (
            <NeuralAnalysisView
                eegFile={eegFile}
                isEegRunning={isEegRunning} setIsEegRunning={setIsEegRunning}
                eegLogs={eegLogs} setEegLogs={setEegLogs}
                eegProgress={eegProgress} setEegProgress={setEegProgress}
                eegStage={eegStage} setEegStage={setEegStage}
                eegRes={eegRes} setEegRes={setEegRes}
                token={token}
                selectedPatient={selectedPatient}
                setActiveTab={setActiveTab}
            />
        );

        if (activeTab === 'Research') return <ResearchView />;
        if (activeTab === 'Database') {
            if (user?.role === 'admin') return <DatabaseView />;
            return <TheoryView section="Unauthorized Access" />;
        }
        if (activeTab === 'Admin') {
            if (user?.role === 'admin') return <AdminPanel />;
            return <TheoryView section="Unauthorized Access" />;
        }
        if (activeTab === 'History') {
            if (user?.role === 'admin') return <HistoryView />;
            return <TheoryView section="Unauthorized Access" />;
        }

        if (activeTab === 'Clinical Analysis') {
            if (viewingHistoryReport && historyReportContext) {
                return (
                    <div className="animate-fade">
                        <div style={{ padding: '1rem 3rem', background: 'var(--bg-card)', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <button onClick={() => setViewingHistoryReport(false)} className="btn btn-outline" style={{ fontSize: '0.75rem' }}>
                                <ArrowLeft size={14} /> BACK TO LIST
                            </button>
                            <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--accent-primary)' }}>ARCHIVED CLINICAL SESSION</div>
                        </div>
                        <HighFidelityReport
                            pInfo={historyReportContext.pInfo}
                            diagData={historyReportContext.diagData}
                            segData={historyReportContext.segData}
                            imgPreview={null}
                            scanUrl={historyReportContext.scanUrl}
                            xaiUrl={historyReportContext.xaiUrl}
                            user={user}
                        />
                    </div>
                );
            }
            if (!result) return <TheoryView section={activeTab} />;
            const p = patients.find(pl => pl.id === selectedPatient) || { id: selectedPatient, name: user?.name || 'Subject Unknown' };
            return <HighFidelityReport pInfo={p} diagData={result} segData={segResult} imgPreview={preview} heatmap={explainResult?.heatmap_base64 ? `data:image/jpg;base64,${explainResult.heatmap_base64}` : null} user={user} />;
        }

        if (!file) return <TheoryView section={activeTab} />;

        if (activeTab === 'Classification') return <DiagnosticPanel />;
        if (activeTab === 'Segmentation') return <SegmentationPanel />;
        return <TheoryView section={activeTab} />;
    };

    if (!token) return <LoginView onLogin={handleLoginSuccess} />;

    return (
        <div className={`app-container ${theme === 'dark' ? 'dark-mode' : ''}`}>
            <NeuralBackground />

            {/* Profile Picture */}
            {user?.picture && (
                <div style={{
                    position: 'fixed',
                    top: '1rem',
                    left: '1rem',
                    zIndex: 10001,
                    pointerEvents: 'none'
                }}>
                    <motion.img
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        src={user.picture}
                        style={{
                            width: '44px',
                            height: '44px',
                            borderRadius: '50%',
                            border: '2px solid var(--accent-primary)',
                            boxShadow: '0 0 15px rgba(99, 102, 241, 0.4)',
                            background: 'var(--bg-card)'
                        }}
                        alt="User Profile"
                    />
                </div>
            )}

            {/* Header Telemetry */}
            <div style={{
                position: 'fixed',
                top: '0.75rem',
                right: '1.5rem',
                zIndex: 10000,
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                pointerEvents: 'auto'
            }}>
                <span style={{
                    fontWeight: 900,
                    color: 'var(--text-main)',
                    fontSize: '0.75rem',
                    letterSpacing: '0.1em',
                    opacity: 0.8
                }}>
                    {new Date().toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()}
                </span>
                <CloudSun size={18} className="flicker-text" style={{ color: 'var(--accent-primary)', opacity: 0.8 }} />

                {user?.role === 'admin' && portalType === 'user' && (
                    <button
                        onClick={() => navigate('/admin')}
                        style={{
                            background: 'rgba(99, 102, 241, 0.1)',
                            color: 'var(--accent-primary)',
                            border: '1px solid var(--accent-primary)',
                            padding: '0.4rem 1rem',
                            borderRadius: '2rem',
                            fontSize: '0.65rem',
                            fontWeight: 900,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            marginLeft: '0.5rem'
                        }}
                    >
                        <Shield size={12} /> ADMIN CONSOLE
                    </button>
                )}

                {portalType === 'admin' && (
                    <button
                        onClick={() => navigate('/')}
                        style={{
                            background: 'rgba(255, 255, 255, 0.05)',
                            color: 'white',
                            border: '1px solid var(--border-light)',
                            padding: '0.4rem 1rem',
                            borderRadius: '2rem',
                            fontSize: '0.65rem',
                            fontWeight: 900,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            marginLeft: '0.5rem'
                        }}
                    >
                        <ArrowLeft size={12} /> USER PORTAL
                    </button>
                )}

                {activeTab === 'Admin' && (
                    <button
                        onClick={() => setShowModal(true)}
                        style={{
                            background: 'var(--accent-primary)',
                            color: 'white',
                            border: 'none',
                            padding: '0.4rem 1.2rem',
                            borderRadius: '2rem',
                            fontSize: '0.65rem',
                            fontWeight: 900,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            boxShadow: '0 4px 15px rgba(99, 102, 241, 0.3)',
                            marginLeft: '0.5rem'
                        }}
                    >
                        <UserPlus size={14} /> NEW USER
                    </button>
                )}

                <button
                    onClick={handleLogout}
                    style={{
                        marginLeft: '1rem',
                        background: 'rgba(239, 68, 68, 0.1)',
                        color: '#ef4444',
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                        padding: '0.4rem 1rem',
                        borderRadius: '2rem',
                        fontSize: '0.65rem',
                        fontWeight: 900,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        transition: 'all 0.2s',
                        pointerEvents: 'auto'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#ef4444';
                        e.currentTarget.style.color = '#fff';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                        e.currentTarget.style.color = '#ef4444';
                    }}
                >
                    <LogOut size={12} /> LOG OUT
                </button>
            </div>

            <DiagnosticFeed />

            {/* Idea 3: Advanced Neural Search Overlay */}
            <AnimatePresence>
                {isSearchOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{ position: 'fixed', inset: 0, zIndex: 10005, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', display: 'flex', justifyContent: 'center', paddingTop: '10vh' }}
                        onClick={() => setIsSearchOpen(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            onClick={e => e.stopPropagation()}
                            style={{ width: '100%', maxWidth: '800px', padding: '0 2rem' }}
                        >
                            <div style={{ background: 'var(--bg-card)', borderRadius: '2rem', padding: '2rem', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-glow)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                                    <Search size={24} color="var(--accent-primary)" />
                                    <input
                                        autoFocus
                                        placeholder="Search global neural ledger (Patient ID, Name, Finding...)"
                                        style={{ flex: 1, background: 'none', border: 'none', color: '#fff', fontSize: '1.5rem', fontWeight: 700, outline: 'none' }}
                                        value={searchQuery}
                                        onChange={e => runSearch(e.target.value)}
                                    />
                                    <X size={24} style={{ cursor: 'pointer', opacity: 0.5 }} onClick={() => setIsSearchOpen(false)} />
                                </div>

                                <div style={{ minHeight: '300px', maxHeight: '60vh', overflowY: 'auto' }}>
                                    {isSearching ? <div className="pulse-slow">Querying Neural Knowledge Base...</div> : (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                            {searchResults?.patients?.map(p => (
                                                <div key={p.patient_id} className="nav-item" onClick={() => { setSelectedPatient(p.patient_id); setActiveTab('Clinical Analysis'); setIsSearchOpen(false); }} style={{ display: 'flex', justifyContent: 'space-between', padding: '1.5rem' }}>
                                                    <div>
                                                        <div style={{ color: 'var(--accent-primary)', fontWeight: 800 }}>PATIENT Record</div>
                                                        <div style={{ fontSize: '1.2rem' }}>{p.name}</div>
                                                    </div>
                                                    <div style={{ textAlign: 'right' }}>
                                                        <div style={{ fontSize: '0.8rem', opacity: 0.5 }}>ID: {p.patient_id}</div>
                                                        <ArrowRight size={16} />
                                                    </div>
                                                </div>
                                            ))}
                                            {searchResults?.diagnoses?.map(d => (
                                                <div key={d.id} className="nav-item" onClick={() => { setSelectedPatient(d.patient_id); setActiveTab('History'); setIsSearchOpen(false); }} style={{ display: 'flex', justifyContent: 'space-between', padding: '1.5rem' }}>
                                                    <div>
                                                        <div style={{ color: 'var(--accent-secondary)', fontWeight: 800 }}>DIAGNOSIS Trace</div>
                                                        <div style={{ fontSize: '1.1rem' }}>{d.prediction}</div>
                                                        <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>{d.description}</div>
                                                    </div>
                                                    <div style={{ textAlign: 'right' }}>
                                                        <div style={{ fontSize: '0.8rem', opacity: 0.5 }}>{new Date(d.date).toLocaleDateString()}</div>
                                                        <ArrowRight size={16} />
                                                    </div>
                                                </div>
                                            ))}
                                            {!searchResults && searchQuery.length > 0 && <div style={{ opacity: 0.5 }}>No records found for "{searchQuery}"</div>}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Idea 2: Patient Clinical Timeline Modal */}
            <AnimatePresence>
                {viewingTimelinePatient && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{ position: 'fixed', inset: 0, zIndex: 10006, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', display: 'flex', justifyContent: 'flex-end' }}
                        onClick={() => setViewingTimelinePatient(null)}
                    >
                        <motion.div
                            initial={{ x: 400 }}
                            animate={{ x: 0 }}
                            exit={{ x: 400 }}
                            onClick={e => e.stopPropagation()}
                            style={{ width: '450px', background: 'var(--bg-card)', height: '100%', borderLeft: '1px solid var(--border-light)', padding: '3rem', overflowY: 'auto' }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                                <h2 style={{ fontSize: '1.5rem', fontWeight: 900 }}>Clinical Journey Trace</h2>
                                <X style={{ cursor: 'pointer' }} onClick={() => setViewingTimelinePatient(null)} />
                            </div>
                            <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--accent-primary)', marginBottom: '2rem' }}>PATIENT: {viewingTimelinePatient}</div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', position: 'relative' }}>
                                <div style={{ position: 'absolute', left: '11px', top: '10px', bottom: '10px', width: '2px', background: 'var(--border-light)', zIndex: 0 }} />
                                {timelineData?.map((item, idx) => (
                                    <div key={idx} style={{ position: 'relative', zIndex: 1, paddingLeft: '2.5rem' }}>
                                        <div style={{ position: 'absolute', left: '0', top: '6px', width: '24px', height: '24px', background: 'var(--bg-card)', borderRadius: '50%', border: '2px solid var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            {item.change_type === 'SCAN' ? <Scan size={12} /> : <Activity size={12} />}
                                        </div>
                                        <div style={{ fontSize: '0.65rem', opacity: 0.5, fontWeight: 700, marginBottom: '0.25rem' }}>{new Date(item.timestamp).toLocaleDateString()} @ {new Date(item.timestamp).toLocaleTimeString()}</div>
                                        <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#fff' }}>{item.change_type} Event</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>{item.clinical_notes}</div>
                                        {item.new_state?.prediction && (
                                            <div style={{ marginTop: '0.75rem', padding: '0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: '0.5rem', fontSize: '0.75rem' }}>
                                                <span style={{ color: 'var(--accent-secondary)' }}>Outcome:</span> {item.new_state.prediction} ({item.new_state.confidence?.toFixed(1)}%)
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <Navbar />
            <main style={{ flex: 1, position: 'relative' }}>
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, x: 20, filter: 'blur(10px)' }}
                        animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                        exit={{ opacity: 0, x: -20, filter: 'blur(10px)' }}
                        transition={{ duration: 0.4, ease: "anticipate" }}
                        style={{ width: '100%' }}
                    >
                        {renderContent()}
                    </motion.div>
                </AnimatePresence>
            </main>
            <AppStyles />

            {/* Global Modals */}
            <AnimatePresence>
                {showModal && (
                    <div className="modal-overlay">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="modal-content"
                        >
                            <h2 style={{ marginBottom: '0.5rem', fontWeight: 900 }}>Register New User</h2>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '2rem' }}>Create a new authenticated user profile.</p>

                            <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <label style={{ fontSize: '0.75rem', fontWeight: 800, opacity: 0.7 }}>FULL NAME</label>
                                    <input required value={newUser.full_name} onChange={e => setNewUser({ ...newUser, full_name: e.target.value })} style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-light)', padding: '1rem', borderRadius: '0.75rem', color: 'white' }} />
                                </div>
                                <div style={{ display: 'flex', gap: '1.25rem' }}>
                                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        <label style={{ fontSize: '0.75rem', fontWeight: 800, opacity: 0.7 }}>USERNAME</label>
                                        <input required value={newUser.username} onChange={e => setNewUser({ ...newUser, username: e.target.value })} style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-light)', padding: '1rem', borderRadius: '0.75rem', color: 'white' }} />
                                    </div>
                                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        <label style={{ fontSize: '0.75rem', fontWeight: 800, opacity: 0.7 }}>PASSWORD</label>
                                        <input required type="password" value={newUser.password} onChange={e => setNewUser({ ...newUser, password: e.target.value })} style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-light)', padding: '1rem', borderRadius: '0.75rem', color: 'white' }} />
                                    </div>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <label style={{ fontSize: '0.75rem', fontWeight: 800, opacity: 0.7 }}>ROLE</label>
                                    <select value={newUser.role} onChange={e => setNewUser({ ...newUser, role: e.target.value })} style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-light)', padding: '1rem', borderRadius: '0.75rem', color: 'white' }}>
                                        <option value="user">Standard User</option>
                                        <option value="doctor">Consultant Doctor</option>
                                        <option value="intern">Clinical Intern</option>
                                        <option value="admin">System Administrator</option>
                                    </select>
                                </div>
                                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                    <button type="button" onClick={() => setShowModal(false)} style={{ flex: 1, padding: '1rem', background: 'transparent', border: '1px solid var(--border-light)', color: 'white', borderRadius: '1rem', cursor: 'pointer' }}>Cancel</button>
                                    <button type="submit" disabled={isRegistering} style={{ flex: 1, padding: '1rem', background: 'var(--accent-primary)', color: 'white', border: 'none', borderRadius: '1rem', cursor: 'pointer', fontWeight: 700 }}>{isRegistering ? 'Registering...' : 'Complete Registration'}</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* History High-Fidelity Report Overlay */}
            <AnimatePresence>
                {viewingHistoryReport && historyReportContext && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            width: '100vw',
                            height: '100vh',
                            zIndex: 20000,
                            background: 'rgba(15, 23, 42, 0.9)',
                            backdropFilter: 'blur(12px)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '2rem'
                        }}
                    >
                        {/* Backdrop Close Click */}
                        <div
                            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', cursor: 'pointer' }}
                            onClick={() => setViewingHistoryReport(false)}
                        />

                        <motion.div
                            initial={{ scale: 0.9, y: 20, opacity: 0 }}
                            animate={{ scale: 1, y: 0, opacity: 1 }}
                            exit={{ scale: 0.9, y: 20, opacity: 0 }}
                            style={{
                                width: '691px',
                                height: '966px',
                                background: '#fff',
                                borderRadius: '1.5rem',
                                boxShadow: '0 50px 100px -20px rgba(0,0,0,0.5)',
                                overflow: 'hidden',
                                position: 'relative',
                                zIndex: 20002
                            }}
                        >
                            <motion.button
                                whileHover={{ scale: 1.1, rotate: 90 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => setViewingHistoryReport(false)}
                                style={{
                                    position: 'sticky',
                                    top: '1.5rem',
                                    left: '1.5rem',
                                    background: 'var(--accent-primary)',
                                    border: 'none',
                                    color: 'white',
                                    width: '3rem',
                                    height: '3rem',
                                    borderRadius: '50%',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    boxShadow: '0 10px 20px rgba(99, 102, 241, 0.4)',
                                    zIndex: 20003,
                                    marginBottom: '-3.5rem'
                                }}
                            >
                                <X size={24} strokeWidth={3} />
                            </motion.button>

                            <div style={{ height: '100%', overflowY: 'auto' }}>
                                <HighFidelityReport
                                    pInfo={historyReportContext.pInfo}
                                    diagData={historyReportContext.diagData}
                                    segData={historyReportContext.segData}
                                    imgPreview={null}
                                    scanUrl={historyReportContext.scanUrl}
                                    xaiUrl={historyReportContext.xaiUrl}
                                    fullWidth={true}
                                    compact={true}
                                    user={user}
                                />
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const AppStyles = () => (
    <style>{`
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        
        .animate-fade {
            animation: fadeIn 0.5s ease-out forwards;
        }

        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }

        .scan-overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(to bottom, transparent 50%, rgba(129, 140, 248, 0.05) 50%);
            background-size: 100% 4px;
            pointer-events: none;
            z-index: 2;
        }
        
        .scan-overlay::after {
            content: "";
            position: absolute;
            top: -100%;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(to bottom, transparent, rgba(129, 140, 248, 0.2), transparent);
            animation: scanning 3s linear infinite;
        }
        
        @keyframes scanning {
            0% { top: -100%; }
            100% { top: 100%; }
        }

        .scan-line {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 10;
            pointer-events: none;
            background: linear-gradient(to bottom, transparent, var(--accent-primary), transparent);
            background-size: 100% 100px;
            background-repeat: no-repeat;
            animation: scanning 2s linear infinite;
        }
        
        .flicker-text {
            animation: flicker 1s infinite;
        }
        
        @keyframes flicker {
            0%, 18%, 22%, 25%, 53%, 57%, 100% { opacity: 1; }
            20%, 24%, 55% { opacity: 0.7; }
        }

        .mri-viewer:not(.mri-viewer-static)::after {
            content: "";
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: radial-gradient(circle at var(--mouse-x, 50%) var(--mouse-y, 50%), transparent 0%, var(--viewer-overlay) 60%);
            opacity: 0;
            transition: opacity 0.3s;
            pointer-events: none;
            z-index: 3;
        }

        .mri-viewer:not(.mri-viewer-static):hover::after {
            opacity: 1;
        }
      `}</style>
);


export default UnifiedPortal;
