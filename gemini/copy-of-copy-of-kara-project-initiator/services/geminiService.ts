import { GoogleGenAI, Type } from "@google/genai";
import { ProjectDetails, Workflow, LivePreviewLayout, GeneratedCode } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const serializeProjectDetails = (details: ProjectDetails): string => {
    // Create a simplified string representation for the prompt
    return `
        Project Name: ${details.overview.projectName}
        Project Type: ${details.overview.projectType}
        Description: ${details.overview.description}
        Duration: ${details.overview.duration}
        Team Size: ${details.overview.teamSize}
        Methodology: ${details.user.methodology}
        Goals: ${details.user.goals}
        Budget: ${details.user.budget}
        Tech Stack: ${details.user.techStack.join(', ')}
        Security Emphasis: ${details.user.securityEmphasis}/10
        UX Focus: ${details.user.uxFocus}
        Output Detail Level: ${details.user.outputDetailLevel}
        AI Formality: ${details.ai.formality}/10
        AI Conciseness: ${details.ai.conciseness}/10
        Risk Aversion: ${details.ai.riskAversion}/10
        Industry Focus: ${details.ai.industryFocus}
        Innovation vs Stability: ${details.ai.innovationVsStability}/10
        Propose Tooling: ${details.ai.proposeTooling}
    `;
};

export const generateWorkflow = async (projectDetails: ProjectDetails): Promise<Workflow> => {
    const serializedDetails = serializeProjectDetails(projectDetails);

    const systemInstruction = `You are KARA, an expert project manager AI. Your task is to generate a detailed, phase-by-phase workflow for a software project based on the user's provided details. The workflow should be logical, realistic, and tailored to the project's specific needs. Each phase should include a name, a concise description, and a list of key activities. If applicable, suggest relevant tools for each phase. Structure the output as a JSON object that adheres to the provided schema.`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Generate a project workflow for the following project:\n\n${serializedDetails}`,
        config: {
            systemInstruction,
            responseMimeType: 'application/json',
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    projectName: { type: Type.STRING },
                    workflow: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                phaseName: { type: Type.STRING },
                                description: { type: Type.STRING },
                                activities: { type: Type.ARRAY, items: { type: Type.STRING } },
                                suggestedTools: { type: Type.ARRAY, items: { type: Type.STRING } },
                            },
                            required: ['phaseName', 'description', 'activities'],
                        },
                    },
                },
                required: ['projectName', 'workflow'],
            },
        },
    });

    return JSON.parse(response.text);
};


export const generateLivePreviewLayout = async (projectDetails: ProjectDetails): Promise<LivePreviewLayout> => {
    const serializedDetails = serializeProjectDetails(projectDetails);

    const systemInstruction = `You are KARA, an expert UI/UX designer AI. Your task is to generate a conceptual UI wireframe layout for an application based on the user's project details. Do not generate HTML or CSS. Instead, describe the layout conceptually. Define a layout type (e.g., 'Dashboard', 'Single-Column Feed', 'Wizard'), a theme (light/dark mode, a primary hex color, and a Google Font name like 'Inter' or 'Roboto Slab'), and a list of key UI components. For each component, provide a name, a short description, and a list of its key elements (e.g., 'Search Bar', 'User Profile Avatar', 'Data Table'). Structure the output as a JSON object that adheres to the provided schema. Be creative with the primary color and font to match the project's tone.`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Generate a conceptual UI wireframe layout for the following project:\n\n${serializedDetails}`,
        config: {
            systemInstruction,
            responseMimeType: 'application/json',
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    layoutType: { type: Type.STRING },
                    theme: {
                        type: Type.OBJECT,
                        properties: {
                            mode: { type: Type.STRING, enum: ['light', 'dark'] },
                            primaryColor: { type: Type.STRING },
                            font: { type: Type.STRING }
                        },
                        required: ['mode', 'primaryColor', 'font']
                    },
                    components: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                name: { type: Type.STRING },
                                description: { type: Type.STRING },
                                elements: { type: Type.ARRAY, items: { type: Type.STRING } }
                            },
                            required: ['name', 'description', 'elements']
                        }
                    }
                },
                required: ['layoutType', 'theme', 'components']
            }
        }
    });

    return JSON.parse(response.text);
};

export const generateCodeFromPreview = async (layout: LivePreviewLayout, projectName: string): Promise<GeneratedCode> => {
    const systemInstruction = `You are KARA, an expert frontend developer AI. Your task is to generate HTML, CSS, and JavaScript code based on a conceptual UI layout. The code should be simple, clean, and represent a functional wireframe. Use Tailwind CSS classes directly in the HTML for styling. The CSS should be minimal, primarily for layout and colors not covered by basic Tailwind. The JavaScript should be vanilla JS and add minor interactivity (e.g., button click alerts, toggling a class). Generate a complete, runnable set of code. The output must be a JSON object adhering to the schema.`;
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Project Name: ${projectName}\n\nUI Layout: ${JSON.stringify(layout, null, 2)}\n\nGenerate the code.`,
        config: {
            systemInstruction,
            responseMimeType: 'application/json',
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    html: { type: Type.STRING },
                    css: { type: Type.STRING },
                    js: { type: Type.STRING }
                },
                required: ['html', 'css', 'js']
            }
        }
    });

    return JSON.parse(response.text);
};


export const generateSuggestions = async (projectDetails: ProjectDetails): Promise<{ projectName: string; description: string; goals: string; }> => {
    const serializedDetails = serializeProjectDetails(projectDetails);

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Based on the following project details, suggest a creative project name, a concise and appealing description (2-3 sentences), and a summary of key goals.
        
        Project Details:
        ${serializedDetails}
        `,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    projectName: {
                        type: Type.STRING,
                        description: "A creative and fitting name for the project."
                    },
                    description: {
                        type: Type.STRING,
                        description: "A concise, 2-3 sentence description of the project."
                    },
                    goals: {
                        type: Type.STRING,
                        description: "A bulleted or numbered list of the primary goals for the project."
                    }
                },
                required: ["projectName", "description", "goals"]
            },
        },
    });
    
    const json = JSON.parse(response.text);
    return json;
};

export const generateHint = async (fieldId: string, projectDetails: ProjectDetails): Promise<string> => {
    const serializedDetails = serializeProjectDetails(projectDetails);

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `I'm filling out a project planning form. Provide a brief, helpful hint (1-2 sentences) for the form field with the ID "${fieldId}". The hint should suggest what kind of information to provide or give a good example, based on the other project details I've already filled out.
        
        Current Project Details:
        ${serializedDetails}

        Give me a hint for the "${fieldId}" field.
        `,
    });

    return response.text;
};