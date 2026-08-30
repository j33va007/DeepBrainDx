import React from 'react';
import {
    CheckCircle2,
    Zap,
    Dna,
    Layers,
    FlaskConical,
    Info,
    BarChart3
} from 'lucide-react';

const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
export const API_BASE = import.meta.env.VITE_API_URL || (isLocal ? `http://localhost:8000` : window.location.origin);
export const WS_BASE = import.meta.env.VITE_WS_URL || (isLocal ? `ws://localhost:8000` : (window.location.protocol === 'https:' ? 'wss://' : 'ws://') + window.location.host);
export const GOOGLE_CLIENT_ID = "76259674658-guiavr2l0g7rduhtn5fiac8solurt15a.apps.googleusercontent.com";

export const THEORY_CONTENT = {
    'Upload & Preprocessing': {
        title: 'Data Acquisition & Clinical Preprocessing',
        description: 'The foundation of AI-driven neuro-radiology lies in high-fidelity data acquisition. This stage involves converting RAW DICOM slices into processed tensors, applying clinical-grade normalization, and ensuring spatial alignment for downstream expert analysis.',
        highlights: [
            'Spatial Normalization: Standardizing voxel dimensions for consistent inference.',
            'Adaptive Intensity Scaling: Standardizing pixel intensities for neural ingestion.',
            'Artifact Reduction: Removing noise and signal artifacts for cleaner neural mapping.'
        ]
    },
    'Classification': {
        title: 'Multi-Expert Ensemble Classification',
        description: 'DeepBrainDx analytics provides a high-level overview of diagnostic trends, case distribution, and system performance. Our proprietary ensemble architecture routes MRI scans through a hierarchy of Swin Transformer models specialized in Aneurysm, Cancer, Stroke, or Normal pathologies.',
        highlights: [
            'Ensemble Consensus: Aggregating predictions from 4 independent specialist models.',
            'Diagnostic Distribution: Monitoring the prevalence of different neuro-pathologies.',
            'Confidence Scoring: Real-time calculation of prediction certainty for medical oversight.'
        ]
    },
    'Segmentation': {
        title: 'Volumetric Tumor & Lesion Segmentation',
        description: 'Segmentation provides precise voxel-level mapping of affected neural regions. Utilizing Modified U-Net architectures with skip-connections, the system delineates healthy tissue from pathological masses with millimeter precision.',
        highlights: [
            'Volumetric Analysis: Calculating precise tumor volume (mm³) and Total Brain Pixel Count.',
            'Affected Region Mapping: Identifying primary anatomical structures involved.',
            'Border Delineation: Clear separation of edema vs core tumor mass.'
        ]
    },
    'Clinical Analysis': {
        title: 'High-Fidelity Clinical Report & Telemetry',
        description: 'The final stage of the DeepBrainDx cycle. This comprehensive dashboard consolidates multi-expert distributions, volumetric segmentation masks, and AI explainability heuristics into a unified medical report for radiologist adjudication.',
        highlights: [
            'Differential Diagnosis: 6-axis consensus across pathology domains.',
            'Volumetric Evidence: Side-by-side segmentation and Brain-to-Tumor area analysis.',
            'System Telemetry: Audit-ready metadata including processing latency and device ID.'
        ]
    },
    'Unauthorized Access': {
        title: 'Restricted Systems Layer',
        description: 'You have attempted to access a secure administrative terminal. Access to forensic logs, user registration, and system surveillance is restricted to board-authorized personnel only.',
        highlights: [
            'Forensic Sovereignty: Protecting patient and system audit trails.',
            'Role-Based Security: Ensuring strictly hierarchical data access.',
            'Alert Protocol: Unauthorized attempts are logged for security review.'
        ]
    }
};

export const RESEARCH_NEWS = [
    {
        year: 'JAN 2026',
        title: 'FDA Clears Industry-First AI Triage for Abdomen CT',
        category: 'Regulatory Breakthrough',
        content: 'Aidoc secures FDA clearance for a comprehensive AI triage solution powered by the CARE foundation model. The system identifies 11 critical indications in a single workflow, significantly reducing ER imaging backlogs.',
        icon: <CheckCircle2 size={24} />
    },
    {
        year: 'JAN 2026',
        title: 'Google Releases MedGemma 1.5',
        category: 'Foundation Model',
        content: 'Google launches an updated medical generative AI model with advanced support for high-dimensional CT, MRI, and longitudinal histopathology analysis, marking a shift toward multimodal clinical intelligence.',
        icon: <Zap size={24} />
    },
    {
        year: 'JAN 2026',
        title: 'EMA & FDA Establish Joint AI Principles',
        category: 'Global Policy',
        content: 'The European Medicines Agency and U.S. FDA establish ten common principles for good AI practice in medicine development, fostering international standard-setting for safety and manufacturing.',
        icon: <CheckCircle2 size={24} />
    },
    {
        year: 'JAN 2026',
        title: 'Gates Foundation Grants Multi-Million to Qure.ai',
        category: 'Global Health',
        content: 'New funding accelerated for AI-enabled point-of-care ultrasound (POCUS) tools. The initiative aims to expand advanced lung health diagnostics to low-resource settings globally.',
        icon: <Dna size={24} />
    },
    {
        year: 'JAN 2026',
        title: 'Vista AI Scales Automated MRI Platform',
        category: 'Infrastructural AI',
        content: 'Securing $29.5M in scale-up funding, Vista AI announces the expansion of its FDA-cleared automated MRI technology to brain, spine, and prostate imaging, targeting remote scanning services.',
        icon: <Layers size={24} />
    },
    {
        year: 'JAN 2026',
        title: 'Brainomix e-Lung in Phase 3 Clinical Trials',
        category: 'Clinical Research',
        content: 'Boehringer Ingelheim selects AI-powered e-Lung biomarkers as co-primary endpoints in a Phase 3 pulmonary fibrosis study, signaling deep trust in quantitative AI imaging.',
        icon: <FlaskConical size={24} />
    },
    {
        year: 'JAN 2026',
        title: 'Yale Pioneers AI-Guided Lung POCUS',
        category: 'Research Breakthrough',
        content: 'New studies from Yale demonstrate that AI-guided ultrasounds allow non-expert clinicians to make faster and more confident diagnostic decisions at the bedside, particularly for pulmonary edema.',
        icon: <Info size={24} />
    },
    {
        year: 'JAN 2026',
        title: 'Deep Learning Accuracy for Carotid Plaques',
        category: 'Academic Research',
        content: 'Recent publications in JMIR highlight the promising diagnostic potential of radiomics and deep learning for extracranial carotid plaques, moving toward standardized detection frameworks.',
        icon: <BarChart3 size={24} />
    }
];























