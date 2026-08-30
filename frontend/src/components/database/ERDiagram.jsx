import React from 'react';
import { motion } from 'framer-motion';
import { Key, Database, User, ClipboardList, Activity, MessageSquare, Cpu, Settings, ScrollText } from 'lucide-react';

const ERDiagram = () => {
    const TableBox = ({ title, icon, columns, x, y }) => (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
                position: 'absolute',
                left: x,
                top: y,
                width: '220px',
                background: '#fff',
                borderRadius: '12px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
                border: '1px solid #e2e8f0',
                overflow: 'hidden',
                zIndex: 5
            }}
        >
            <div style={{
                background: '#f6ad55',
                padding: '8px 12px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: '#1a202c',
                fontWeight: 900,
                fontSize: '0.75rem',
                borderBottom: '1px solid #ed8936'
            }}>
                {icon}
                {title.toUpperCase()}
            </div>
            <div style={{ padding: '8px 0' }}>
                {columns.map((col, idx) => (
                    <div key={idx} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        padding: '4px 12px',
                        fontSize: '0.65rem',
                        borderBottom: idx === columns.length - 1 ? 'none' : '1px solid #f7fafc'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            {col.pk ? <Key size={10} color="#ed8936" /> : <div style={{ width: '10px' }} />}
                            <span style={{ fontWeight: col.pk ? 800 : 500, color: '#2d3748' }}>{col.name}</span>
                        </div>
                        <span style={{ color: '#718096', fontStyle: 'italic' }}>{col.type}</span>
                    </div>
                ))}
            </div>
        </motion.div>
    );

    return (
        <div style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            background: 'rgba(15, 23, 42, 0.4)',
            borderRadius: '1.5rem',
            overflow: 'auto',
            padding: '2rem',
            border: '1px solid rgba(255,255,255,0.05)',
            boxShadow: 'inset 0 0 40px rgba(0,0,0,0.2)'
        }}>
            {/* SVG Connectors */}
            <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 1 }}>
                <defs>
                    <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="0" refY="3.5" orient="auto">
                        <polygon points="0 0, 10 3.5, 0 7" fill="rgba(255,255,255,0.2)" />
                    </marker>
                    <marker id="circle" markerWidth="8" markerHeight="8" refX="4" refY="4">
                        <circle cx="4" cy="4" r="3" stroke="rgba(255,255,255,0.2)" fill="none" />
                    </marker>
                </defs>

                {/* User to Diagnosis */}
                <path d="M 270 120 L 350 120 L 350 250 L 400 250" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" strokeDasharray="4 2" markerEnd="url(#circle)" />

                {/* Patient to Diagnosis */}
                <path d="M 270 380 L 330 380 L 330 280 L 400 280" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" strokeDasharray="4 2" markerEnd="url(#circle)" />

                {/* Diagnosis to Feedback */}
                <path d="M 620 280 L 680 280 L 680 350 L 730 350" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" strokeDasharray="4 2" markerEnd="url(#circle)" />

                {/* User to Feedback */}
                <path d="M 270 150 L 700 150 L 700 380 L 730 380" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" strokeDasharray="4 2" markerEnd="url(#circle)" />
            </svg>

            <div style={{ position: 'relative', minWidth: '1000px', minHeight: '600px' }}>
                <TableBox
                    title="User"
                    icon={<User size={14} />}
                    x={50} y={50}
                    columns={[
                        { name: 'username', type: 'string', pk: true },
                        { name: 'hashed_pw', type: 'string' },
                        { name: 'full_name', type: 'string' },
                        { name: 'role', type: 'string' },
                        { name: 'is_active', type: 'bool' }
                    ]}
                />

                <TableBox
                    title="Patient"
                    icon={<ClipboardList size={14} />}
                    x={50} y={300}
                    columns={[
                        { name: 'id', type: 'string', pk: true },
                        { name: 'name', type: 'string' },
                        { name: 'age', type: 'int' },
                        { name: 'gender', type: 'string' },
                        { name: 'physician', type: 'string' }
                    ]}
                />

                <TableBox
                    title="Diagnosis"
                    icon={<Activity size={14} />}
                    x={400} y={200}
                    columns={[
                        { name: 'id', type: 'int', pk: true },
                        { name: 'patient_id', type: 'string', fk: true },
                        { name: 'user_id', type: 'string', fk: true },
                        { name: 'prediction', type: 'string' },
                        { name: 'confidence', type: 'float' },
                        { name: 'volume_mm3', type: 'float' }
                    ]}
                />

                <TableBox
                    title="Feedback"
                    icon={<MessageSquare size={14} />}
                    x={730} y={320}
                    columns={[
                        { name: 'id', type: 'int', pk: true },
                        { name: 'diag_id', type: 'int', fk: true },
                        { name: 'user_id', type: 'string', fk: true },
                        { name: 'verdict', type: 'string' },
                        { name: 'comments', type: 'text' }
                    ]}
                />

                <TableBox
                    title="AI Models"
                    icon={<Cpu size={14} />}
                    x={400} y={10}
                    columns={[
                        { name: 'id', type: 'int', pk: true },
                        { name: 'name', type: 'string' },
                        { name: 'version', type: 'string' },
                        { name: 'accuracy', type: 'float' }
                    ]}
                />

                <TableBox
                    title="Settings"
                    icon={<Settings size={14} />}
                    x={730} y={50}
                    columns={[
                        { name: 'key', type: 'string', pk: true },
                        { name: 'value', type: 'string' },
                        { name: 'description', type: 'string' }
                    ]}
                />

                <TableBox
                    title="Audit Logs"
                    icon={<ScrollText size={14} />}
                    x={50} y={500}
                    columns={[
                        { name: 'id', type: 'int', pk: true },
                        { name: 'timestamp', type: 'datetime' },
                        { name: 'actor', type: 'string' },
                        { name: 'action', type: 'string' }
                    ]}
                />
            </div>

            {/* Legend */}
            <div style={{
                position: 'fixed',
                bottom: '2rem',
                right: '2rem',
                background: 'rgba(15, 23, 42, 0.8)',
                padding: '1rem',
                borderRadius: '12px',
                border: '1px solid rgba(255,255,255,0.1)',
                backdropFilter: 'blur(10px)',
                zIndex: 10
            }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8', marginBottom: '8px', textTransform: 'uppercase' }}>Schema Legend</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.65rem', color: '#cbd5e1' }}>
                        <Key size={10} color="#ed8936" /> Primary Key (PK)
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.65rem', color: '#cbd5e1' }}>
                        <div style={{ width: '10px', height: '1.5px', background: 'rgba(255,255,255,0.2)', borderStyle: 'dashed' }} /> Relationship Connector
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ERDiagram;
