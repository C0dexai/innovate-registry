// services/githubService.ts

const GITHUB_API_BASE = "https://api.github.com";

const getHeaders = (token: string) => ({
    'Authorization': `Bearer ${token}`,
    'Accept': 'application/vnd.github.v3+json',
    'X-GitHub-Api-Version': '2022-11-28'
});

export interface GitHubFile {
    type: 'file' | 'dir';
    size: number;
    name: string;
    path: string;
    sha: string;
    url: string;
}

export const getRepoContents = async (token: string, repo: string, path: string = ''): Promise<GitHubFile[]> => {
    if (!token || !repo) {
        throw new Error("GitHub token and repository are required.");
    }
    const response = await fetch(`${GITHUB_API_BASE}/repos/${repo}/contents/${path}`, {
        headers: getHeaders(token),
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`GitHub API Error: ${errorData.message || response.statusText}`);
    }
    return response.json();
};

export const getFileContent = async (token: string, repo: string, path: string): Promise<{ content: string, sha: string }> => {
    if (!token || !repo || !path) {
        throw new Error("GitHub token, repository, and file path are required.");
    }
    const response = await fetch(`${GITHUB_API_BASE}/repos/${repo}/contents/${path}`, {
        headers: getHeaders(token),
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`GitHub API Error: ${errorData.message || response.statusText}`);
    }
    const data = await response.json();
    // Content is base64 encoded
    const content = window.atob(data.content);
    return { content, sha: data.sha };
};

export const saveFile = async (
    token: string, 
    repo: string, 
    path: string, 
    content: string, 
    sha: string | null, 
    commitMessage: string
): Promise<any> => {
     if (!token || !repo || !path) {
        throw new Error("GitHub token, repository, and file path are required.");
    }
    const encodedContent = window.btoa(content);

    const body: { message: string, content: string, sha?: string } = {
        message: commitMessage,
        content: encodedContent,
    };
    if (sha) {
        body.sha = sha;
    }

    const response = await fetch(`${GITHUB_API_BASE}/repos/${repo}/contents/${path}`, {
        method: 'PUT',
        headers: {
            ...getHeaders(token),
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`GitHub API Error: ${errorData.message || response.statusText}`);
    }
    return response.json();
};