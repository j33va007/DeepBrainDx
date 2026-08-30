import React from 'react';
import { motion } from 'framer-motion';
import {
    Brain,
    Activity,
    Layers,
    Dna
} from 'lucide-react';

const NeuralBackground = () => (
    <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: -1,
        overflow: 'hidden',
        opacity: 0.6
    }}>
        {/* Background Grid - Drifting Layer */}
        <motion.div
            animate={{
                x: [-20, 20, -20],
                y: [-20, 20, -20],
            }}
            transition={{
                duration: 25,
                repeat: Infinity,
                ease: "linear"
            }}
            style={{
                position: 'absolute',
                width: '110%',
                height: '110%',
                top: '-5%',
                left: '-5%',
            }}
        >
            <svg width="100%" height="100%">
                <pattern id="neural-grid-2d" width="100" height="100" patternUnits="userSpaceOnUse">
                    <circle cx="2" cy="2" r="1.5" fill="var(--accent-primary)" opacity="0.15" />
                    <path d="M 100 0 L 0 0 0 100" fill="none" stroke="var(--accent-primary)" strokeWidth="0.5" opacity="0.1" />
                </pattern>
                <rect width="100%" height="100%" fill="url(#neural-grid-2d)" />
            </svg>
        </motion.div>

        {/* Pulsing Synaptic Nodes */}
        <svg width="100%" height="100%" style={{ position: 'absolute' }}>
            {[...Array(12)].map((_, i) => (
                <motion.circle
                    key={`node-${i}`}
                    cx={`${20 + Math.random() * 60}%`}
                    cy={`${20 + Math.random() * 60}%`}
                    r={Math.random() * 3 + 1}
                    fill="var(--accent-primary)"
                    initial={{ opacity: 0 }}
                    animate={{
                        opacity: [0, 0.2, 0],
                        scale: [1, 1.5, 1],
                    }}
                    transition={{
                        duration: 10 + Math.random() * 5,
                        repeat: Infinity,
                        delay: Math.random() * 10
                    }}
                />
            ))}
        </svg>

        {/* Floating Icons Layer */}
        <div style={{ position: 'absolute', width: '100%', height: '100%', pointerEvents: 'none' }}>
            {[Brain, Activity, Layers, Dna].map((Icon, idx) => (
                <motion.div
                    key={`icon-${idx}`}
                    style={{ position: 'absolute', color: 'var(--accent-primary)', opacity: 0.08 }}
                    animate={{
                        x: [
                            `${Math.random() * 80}vw`,
                            `${Math.random() * 80}vw`,
                            `${Math.random() * 80}vw`
                        ],
                        y: [
                            `${Math.random() * 80}vh`,
                            `${Math.random() * 80}vh`,
                            `${Math.random() * 80}vh`
                        ],
                        rotate: [0, 180, 360],
                    }}
                    transition={{
                        duration: 40 + idx * 10,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                >
                    <Icon size={180 + idx * 40} strokeWidth={0.3} />
                </motion.div>
            ))}
        </div>
    </div>
);

export default NeuralBackground;
