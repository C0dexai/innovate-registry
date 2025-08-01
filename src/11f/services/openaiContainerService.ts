// NOTE: This service has been upgraded to use the OpenAI Assistants API.
// A "Container" in the UI now maps to a combination of an OpenAI Vector Store and an Assistant.

import { OpenAI } from 'openai';
import type { Container, ContainerFile } from '../types';

let openai: OpenAI;

const initializeClient = (apiKey: string) => {
    if (!openai || openai.apiKey !== apiKey) {
        openai = new OpenAI({ apiKey, dangerouslyAllowBrowser: true });
    }
};

const ASSISTANT_INSTRUCTIONS = "You are a helpful assistant. When asked a question, use the file_search tool to look for information in the files provided to you.";

// This is the persistent, shared assistant with admin rights.
const ADMIN_ASSISTANT_ID = 'asst_Vbu2kYicNYrmVxjRb3bCZ0ak';

export const openaiContainerService = {
    // This function now creates a Vector Store and links it to the persistent ADMIN_ASSISTANT.
    createContainer: async (apiKey: string, name: string): Promise<{ vectorStore: Container, assistantId: string }> => {
        initializeClient(apiKey);
        
        // 1. Create the Vector Store, storing the admin assistant's ID in its metadata for reference.
        const vectorStore = await (openai.beta as any).vectorStores.create({ 
            name,
            metadata: {
                assistant_id: ADMIN_ASSISTANT_ID, // Link to the admin assistant
            }
        });
        
        // 2. Retrieve the admin assistant to get its current list of vector stores.
        const adminAssistant = await openai.beta.assistants.retrieve(ADMIN_ASSISTANT_ID);
        const existingVectorStoreIds = adminAssistant.tool_resources?.file_search?.vector_store_ids || [];

        // 3. Update the assistant to link it to the newly created vector store, preserving existing links.
        await openai.beta.assistants.update(ADMIN_ASSISTANT_ID, {
            tool_resources: {
                file_search: {
                    // Add the new vector store ID to the list
                    vector_store_ids: [...existingVectorStoreIds, vectorStore.id]
                }
            }
        });

        const container: Container = {
            id: vectorStore.id,
            object: 'vector_store',
            created_at: vectorStore.created_at,
            name: vectorStore.name,
            status: vectorStore.status,
            bytes: vectorStore.bytes || 0,
            assistantId: ADMIN_ASSISTANT_ID, // All containers now use the admin assistant
        };
        
        return { vectorStore: container, assistantId: ADMIN_ASSISTANT_ID };
    },

    listContainers: async (apiKey: string): Promise<Container[]> => {
        initializeClient(apiKey);
        const vectorStores = await (openai.beta as any).vectorStores.list({ limit: 50 });
    
        const activeContainers: Container[] = [];
    
        for (const vs of vectorStores.data) {
            if (vs.status === 'expired') {
                console.log(`Found expired container, scheduling for deletion and unlinking: ${vs.name} (${vs.id})`);
                // Asynchronously delete the expired vector store and unlink it from the admin assistant.
                (async () => {
                    try {
                        // Unlink first
                        const adminAssistant = await openai.beta.assistants.retrieve(ADMIN_ASSISTANT_ID);
                        const existingVectorStoreIds = adminAssistant.tool_resources?.file_search?.vector_store_ids || [];
                        const updatedIds = existingVectorStoreIds.filter(id => id !== vs.id);
                        
                        await openai.beta.assistants.update(ADMIN_ASSISTANT_ID, {
                            tool_resources: { file_search: { vector_store_ids: updatedIds } }
                        });

                        // Then delete the store
                        await (openai.beta as any).vectorStores.delete(vs.id);
                        console.log(`Successfully auto-deleted and unlinked expired container ${vs.name}`);
                    } catch (error) {
                        console.warn(`Failed to auto-delete expired container ${vs.id}:`, error);
                    }
                })();
            } else {
                activeContainers.push({
                    id: vs.id,
                    object: 'vector_store',
                    created_at: vs.created_at,
                    name: vs.name,
                    status: vs.status,
                    bytes: vs.bytes || 0,
                    files: [],
                    // All containers should be associated with the admin assistant.
                    assistantId: (vs.metadata as any)?.assistant_id || ADMIN_ASSISTANT_ID,
                });
            }
        }
        
        return activeContainers;
    },

    deleteContainer: async (apiKey: string, container: Container): Promise<void> => {
        initializeClient(apiKey);
        
        // 1. Unlink the vector store from the shared admin assistant.
        try {
            const adminAssistant = await openai.beta.assistants.retrieve(ADMIN_ASSISTANT_ID);
            const existingVectorStoreIds = adminAssistant.tool_resources?.file_search?.vector_store_ids || [];
            
            if (existingVectorStoreIds.includes(container.id)) {
                const updatedIds = existingVectorStoreIds.filter(id => id !== container.id);
                await openai.beta.assistants.update(ADMIN_ASSISTANT_ID, {
                    tool_resources: { file_search: { vector_store_ids: updatedIds } }
                });
                 console.log(`Unlinked vector store ${container.id} from admin assistant.`);
            }
        } catch(e) {
            console.warn(`Could not unlink vector store ${container.id} from assistant:`, e);
        }

        // 2. Delete the vector store itself.
        try {
           await (openai.beta as any).vectorStores.delete(container.id);
        } catch(e) {
            console.warn(`Could not delete vector store ${container.id}, it might have been already deleted.`, e);
        }
        
        // IMPORTANT: We no longer delete the assistant as it is shared.
    },
    
    listContainerFiles: async (apiKey: string, containerId: string): Promise<ContainerFile[]> => {
        initializeClient(apiKey);
        const vsFiles = await (openai.beta as any).vectorStores.files.list(containerId);

        const fileDetailsPromises = vsFiles.data.map(async (vsFile) => {
            const file = await openai.files.retrieve(vsFile.id);
            return {
                id: vsFile.id,
                name: file.filename,
                created_at: vsFile.created_at,
                bytes: file.bytes,
                status: vsFile.status,
            };
        });

        return Promise.all(fileDetailsPromises);
    },

    uploadFileToContainer: async (apiKey: string, containerId: string, file: File): Promise<void> => {
        initializeClient(apiKey);
        await (openai.beta as any).vectorStores.files.uploadAndPoll(containerId, file);
    },

    uploadFileBatchToContainer: async (apiKey: string, containerId: string, files: File[]): Promise<void> => {
        initializeClient(apiKey);
        // 1. Upload all files to get their IDs. `assistants` is a valid purpose.
        const uploadPromises = files.map(file => openai.files.create({ file, purpose: 'assistants' }));
        const fileObjects = await Promise.all(uploadPromises);
        const fileIds = fileObjects.map(fileObject => fileObject.id);

        if (fileIds.length === 0) return;

        // 2. Create and poll the file batch in the vector store.
        await (openai.beta as any).vectorStores.fileBatches.createAndPoll(containerId, {
            file_ids: fileIds,
        });
    },
    
    getContainerFileContent: async (apiKey: string, fileId: string): Promise<string> => {
        initializeClient(apiKey);
        const fileContent = await openai.files.content(fileId);
        const text = await fileContent.text();
        return text;
    },

    runAgent: async (apiKey: string, assistantId: string, threadId: string | null, prompt: string): Promise<{threadId: string, response: string}> => {
        initializeClient(apiKey);
        // Ensure we're using the admin assistant for any run.
        const targetAssistantId = ADMIN_ASSISTANT_ID;

        const currentThreadId = threadId || (await openai.beta.threads.create()).id;

        await openai.beta.threads.messages.create(currentThreadId, {
            role: 'user',
            content: prompt,
        });
        
        const run = await openai.beta.threads.runs.createAndPoll(currentThreadId, {
            assistant_id: targetAssistantId,
        });

        if (run.status === 'completed') {
            const messages = await openai.beta.threads.messages.list(run.thread_id);
            const responseMessage = messages.data.find(m => m.role === 'assistant' && m.run_id === run.id);
            if (responseMessage) {
                const content = responseMessage.content[0];
                if (content.type === 'text') {
                    return { threadId: currentThreadId, response: content.text.value };
                }
            }
            return { threadId: currentThreadId, response: "Assistant finished but returned no text response."};
        } else {
            const errMessage = `Assistant run failed with status: ${run.status}. Last error: ${run.last_error?.message}`;
            return { threadId: currentThreadId, response: errMessage };
        }
    },
};