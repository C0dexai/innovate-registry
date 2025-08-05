
import { GitHubNode } from '../types';

const GITHUB_API_BASE = 'https://api.github.com';

async function githubApiFetch(url: string, token: string, options: RequestInit = {}) {
    const response = await fetch(url, {
        ...options,
        headers: {
            ...options.headers,
            'Authorization': `token ${token}`,
            'Accept': 'application/vnd.github.v3+json',
        },
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`GitHub API Error: ${errorData.message || response.statusText}`);
    }
    return response.json();
}

export const getRepoTree = async (token: string, owner: string, repo: string): Promise<GitHubNode[]> => {
    const repoData = await githubApiFetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}`, token);
    const mainBranch = repoData.default_branch;

    const branchData = await githubApiFetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}/branches/${mainBranch}`, token);
    const treeSha = branchData.commit.sha;

    const treeData = await githubApiFetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}/git/trees/${treeSha}?recursive=1`, token);
    
    // Build a nested structure from the flat tree
    const buildTree = (paths: { path: string, type: 'tree' | 'blob' }[]): GitHubNode[] => {
        const root: { [key: string]: GitHubNode } = {};

        paths.forEach(item => {
            const pathParts = item.path.split('/');
            let currentLevel = root;
            
            pathParts.forEach((part, index) => {
                if (index === pathParts.length - 1) { // It's the file or last folder part
                    if (item.type === 'blob') {
                         currentLevel[part] = {
                            path: item.path,
                            type: item.type,
                            name: part,
                         };
                    } else { // It's a directory
                         if (!currentLevel[part]) {
                            currentLevel[part] = { path: item.path, type: 'tree', name: part, children: [] };
                         }
                    }
                } else { // It's a path segment (directory)
                    if (!currentLevel[part]) {
                        // Create the directory if it doesn't exist
                        const parentPath = pathParts.slice(0, index + 1).join('/');
                        currentLevel[part] = { path: parentPath, type: 'tree', name: part, children: [] };
                    }
                    currentLevel = (currentLevel[part] as any).children.reduce((acc: any, curr: any) => ({...acc, [curr.name]: curr }), {});
                }
            });
        });
        
        // This is a simplified transformation. A more robust solution would be needed for complex repos.
        // For now, let's create a basic nested structure.
        const fileMap: { [key: string]: GitHubNode } = {};
        for (const item of treeData.tree) {
            const node: GitHubNode = {
                path: item.path,
                type: item.type,
                name: item.path.split('/').pop()!,
                ...(item.type === 'tree' && { children: [] })
            };
            fileMap[item.path] = node;
        }

        const nestedTree: GitHubNode[] = [];
        for (const item of treeData.tree) {
            if (item.path.includes('/')) {
                const parentPath = item.path.substring(0, item.path.lastIndexOf('/'));
                const parent = fileMap[parentPath] as GitHubNode | undefined;
                if (parent && parent.type === 'tree') {
                    parent.children!.push(fileMap[item.path]);
                }
            } else {
                nestedTree.push(fileMap[item.path]);
            }
        }
        return nestedTree;
    };

    return buildTree(treeData.tree);
};


export const getFileContent = async (token: string, owner: string, repo: string, path: string): Promise<{content: string, sha: string}> => {
    const data = await githubApiFetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}/contents/${path}`, token);
    if (data.encoding !== 'base64') {
        throw new Error('Unsupported file encoding received from GitHub.');
    }
    // Decode base64 content
    const content = atob(data.content);
    return { content, sha: data.sha };
};

export const updateFile = async (
    token: string,
    owner: string,
    repo: string,
    path: string,
    message: string,
    content: string,
    sha: string
) => {
    const encodedContent = btoa(content); // Encode content to base64
    const body = JSON.stringify({
        message,
        content: encodedContent,
        sha,
    });

    return githubApiFetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}/contents/${path}`, token, {
        method: 'PUT',
        body,
    });
};
