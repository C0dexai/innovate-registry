import { ProjectDetails, Workflow, Agent } from './types';

const INITIAL_PROJECT_DETAILS: Omit<ProjectDetails, 'templateId'> = {
  overview: {
    projectName: 'New KARA Project',
    projectType: 'Web App',
    description: 'A modern single-page application to solve a business need.',
    duration: '3-6 months',
    teamSize: 5,
  },
  user: {
    methodology: 'Agile Scrum',
    goals: 'Launch an MVP with core features, gather user feedback, and iterate.',
    hasStrictDeadlines: false,
    budget: 'Medium',
    techStack: ['React', 'Node.js'],
    securityEmphasis: 5,
    uxFocus: 'High Fidelity UI',
    outputDetailLevel: 'Detailed Points',
    excludePhases: [],
  },
  ai: {
    formality: 5,
    conciseness: 5,
    riskAversion: 5,
    industryFocus: 'General Tech',
    innovationVsStability: 5,
    proposeTooling: true,
  },
  system: {
    jiraIntegration: { enabled: false, apiKey: '', projectId: '' },
    githubIntegration: { enabled: false, apiKey: '', orgName: '' },
    slackNotifications: { enabled: false, webhookUrl: '' },
    defaultCloudProvider: 'AWS',
    dataRetentionPolicy: '90 days',
    logLevel: 'Info',
  },
};

const MARKETING_VIDEO_AGENTS: Agent[] = [
    { name: 'Lyra', role: 'Data & Systems Specialist' },
    { name: 'Kara', role: 'Model Dev Lead' },
    { name: 'Sophia', role: 'Multimedia Wizard' },
    { name: 'Cecilia', role: 'Cloud & Infra Engineer' },
    { name: 'Stan', role: 'Code Surgeon' },
    { name: 'Dude', role: 'Biz Strategist' },
    { name: 'GUAC', role: 'Compliance & Moderation' },
    { name: 'ANDIE', role: 'Executive Signoff' }
];

const MARKETING_VIDEO_WORKFLOW: Workflow = {
    projectName: 'AI Family Marketing Video',
    workflow: [
        { agentName: 'Lyra', phaseName: '1. Ingest Brand Assets', description: 'Agent Lyra sources and normalizes brand assets for the project.', activities: ['Verb: TASKSOURCE', 'Input: assets/latest.zip', 'Output: normalized_data.json', 'Handoff to: Kara'] },
        { agentName: 'Kara', phaseName: '2. Fine-tune Script Writer', description: 'Agent Kara fine-tunes a model to write the promotional script.', activities: ['Verb: TASKJOB', 'Input: normalized_data.json', 'Output: promo_script.md', 'Handoff to: Sophia'] },
        { agentName: 'Sophia', phaseName: '3. Storyboard and Render', description: 'Agent Sophia creates storyboards and draft video renders from the script.', activities: ['Verb: TASKVIEW', 'Input: promo_script.md', 'Output: video_drafts/', 'Handoff to: Cecilia'] },
        { agentName: 'Cecilia', phaseName: '4. Queue Render Farm', description: 'Agent Cecilia manages the render farm to produce the final, high-quality video.', activities: ['Verb: TASKSCHEDULE', 'Input: video_drafts/', 'Output: final_video.mp4', 'Handoff to: Stan'] },
        { agentName: 'Stan', phaseName: '5. Package and Tag', description: 'Agent Stan packages the final video and tags the release for distribution.', activities: ['Verb: TASKJOB', 'Input: final_video.mp4', 'Output: release_build.zip', 'Handoff to: Dude'] },
        { agentName: 'Dude', phaseName: '6. Craft Launch Copy', description: 'Agent Dude creates compelling marketing copy and an ROI deck for the launch.', activities: ['Verb: TASKVIEW', 'Input: release_build.zip', 'Output: launch_assets/', 'Handoff to: ANDIE'] },
        { agentName: 'ANDIE', phaseName: '7. Executive Approval', description: 'Agent ANDIE provides the final sign-off for publishing the video and materials.', activities: ['Verb: SIGNOFF', 'Input: launch_assets/', 'Output: published ✅'] },
    ]
};

const MARKETING_VIDEO_DETAILS: ProjectDetails = {
    templateId: 'marketing-video',
    overview: {
        projectName: 'AI Family Marketing Video',
        projectType: 'Marketing Video',
        description: 'End-to-end pipeline that ingests brand assets and metrics, writes a script, renders an animated promo video, packages it, and ships copy + ROI deck.',
        duration: '1-3 months',
        teamSize: 8,
    },
    user: {
        ...INITIAL_PROJECT_DETAILS.user, 
        methodology: 'Waterfall',
        goals: 'Produce and launch a new animated promo video with accompanying marketing assets and ROI analysis.',
    },
    ai: { ...INITIAL_PROJECT_DETAILS.ai },
    system: { ...INITIAL_PROJECT_DETAILS.system },
    agents: MARKETING_VIDEO_AGENTS,
};

const ECOMMERCE_WEBAPP_DETAILS: ProjectDetails = {
    templateId: 'ecommerce-webapp',
    overview: {
        projectName: "New E-commerce Platform",
        projectType: "Web App",
        description: "A feature-rich e-commerce website with product listings, a shopping cart, and a secure checkout process.",
        duration: "6-12 months",
        teamSize: 8,
    },
    user: {
        ...INITIAL_PROJECT_DETAILS.user,
        goals: "Develop a scalable platform to handle 10,000+ SKUs. Integrate with Stripe for payments. Achieve a 3% conversion rate.",
        techStack: ['React', 'Node.js', 'PostgreSQL', 'AWS'],
        securityEmphasis: 9,
        uxFocus: 'High Fidelity UI',
    },
    ai: {
        ...INITIAL_PROJECT_DETAILS.ai,
        industryFocus: 'E-commerce',
    },
    system: {
        ...INITIAL_PROJECT_DETAILS.system,
        defaultCloudProvider: 'AWS',
    },
};

const DESIGN_SYSTEM_DETAILS: ProjectDetails = {
    templateId: 'design-system',
    overview: {
        projectName: "Cortex Design System",
        projectType: "Other",
        description: "Create a comprehensive design system with reusable components, style guidelines, and documentation to ensure brand consistency across all digital products.",
        duration: "3-6 months",
        teamSize: 4,
    },
    user: {
        ...INITIAL_PROJECT_DETAILS.user,
        goals: "Build a library of 50+ React components. Document color palettes, typography, and spacing. Publish the system for internal team consumption.",
        techStack: ['React', 'Storybook'], // Custom tech
        uxFocus: 'High Fidelity UI',
        outputDetailLevel: 'Comprehensive Document Draft',
    },
    ai: { ...INITIAL_PROJECT_DETAILS.ai },
    system: { ...INITIAL_PROJECT_DETAILS.system },
};

const DISCUSSION_BOARD_DETAILS: ProjectDetails = {
    templateId: 'discussion-board',
    overview: {
        projectName: "Community Hub Forum",
        projectType: "Web App",
        description: "A forum for users to create topics, post replies, upvote content, and manage their profiles. Includes moderation tools for administrators.",
        duration: "3-6 months",
        teamSize: 3,
    },
    user: {
        ...INITIAL_PROJECT_DETAILS.user,
        goals: "Allow user registration and profiles. Implement real-time notifications for replies. Build a robust content moderation system.",
        techStack: ['Vue', 'Node.js', 'MongoDB'],
        securityEmphasis: 7,
    },
    ai: {
        ...INITIAL_PROJECT_DETAILS.ai,
        industryFocus: 'SaaS'
    },
    system: { ...INITIAL_PROJECT_DETAILS.system },
};

const BLOG_PLATFORM_DETAILS: ProjectDetails = {
    templateId: 'blog-platform',
    overview: {
        projectName: "Inkwell Blogging CMS",
        projectType: "Web App",
        description: "A headless CMS and front-end application for creating, managing, and publishing blog posts. Includes a Markdown editor and SEO optimization features.",
        duration: "1-3 months",
        teamSize: 2,
    },
    user: {
        ...INITIAL_PROJECT_DETAILS.user,
        goals: "Develop a user-friendly post editor. Implement content tagging and categories. Achieve a Google Lighthouse SEO score of 95+.",
        techStack: ['React', 'Go', 'GCP'],
        uxFocus: 'Core Functionality Only',
    },
    ai: { ...INITIAL_PROJECT_DETAILS.ai },
    system: {
        ...INITIAL_PROJECT_DETAILS.system,
        defaultCloudProvider: 'GCP',
    },
};

const DEVOPS_DASHBOARD_DETAILS: ProjectDetails = {
    templateId: 'devops-dashboard',
    overview: {
        projectName: "OpsView Dashboard",
        projectType: "DevOps Tool",
        description: "An internal dashboard to monitor application health, CI/CD pipeline status, and cloud resource utilization. Provides real-time alerts and historical performance data.",
        duration: "1-3 months",
        teamSize: 3,
    },
    user: {
        ...INITIAL_PROJECT_DETAILS.user,
        goals: "Integrate with Prometheus and Grafana for metrics. Display build/deploy status from Jenkins. Set up PagerDuty alerts for critical failures.",
        techStack: ['Angular', 'Python', 'Azure'],
    },
    ai: {
        ...INITIAL_PROJECT_DETAILS.ai,
        proposeTooling: true,
    },
    system: {
        ...INITIAL_PROJECT_DETAILS.system,
        defaultCloudProvider: 'Azure',
        slackNotifications: { enabled: true, webhookUrl: '' },
    },
};


export const TEMPLATES = {
    custom: {
        id: 'custom',
        name: 'Custom Software Project',
        details: {
            ...INITIAL_PROJECT_DETAILS,
            templateId: 'custom',
        },
        workflow: null,
    },
    'marketing-video': {
        id: 'marketing-video',
        name: 'AI Marketing Video',
        details: MARKETING_VIDEO_DETAILS,
        workflow: MARKETING_VIDEO_WORKFLOW,
    },
    'ecommerce-webapp': {
        id: 'ecommerce-webapp',
        name: 'E-commerce Web App',
        details: ECOMMERCE_WEBAPP_DETAILS,
        workflow: null,
    },
    'design-system': {
        id: 'design-system',
        name: 'UI/UX Design System',
        details: DESIGN_SYSTEM_DETAILS,
        workflow: null,
    },
    'discussion-board': {
        id: 'discussion-board',
        name: 'Community Discussion Board',
        details: DISCUSSION_BOARD_DETAILS,
        workflow: null,
    },
    'blog-platform': {
        id: 'blog-platform',
        name: 'Blog Publishing Platform',
        details: BLOG_PLATFORM_DETAILS,
        workflow: null,
    },
    'devops-dashboard': {
        id: 'devops-dashboard',
        name: 'DevOps Monitoring Console',
        details: DEVOPS_DASHBOARD_DETAILS,
        workflow: null,
    }
};