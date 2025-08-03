const GITHUB_API_BASE = 'https://api.github.com';

async function githubFetch(endpoint: string, options: RequestInit = {}) {
    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
    const GITHUB_REPO = process.env.GITHUB_REPO;

    if (!GITHUB_TOKEN || !GITHUB_REPO) {
        throw new Error('GitHub token or repo not configured in environment variables.');
    }

    const url = `${GITHUB_API_BASE}/repos/${GITHUB_REPO}${endpoint}`;
    const headers = {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        ...options.headers,
    };

    const response = await fetch(url, { ...options, headers });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`GitHub API Error: ${errorData.message || response.statusText}`);
    }

    return response.json();
}

export async function getRepoDetails() {
    return githubFetch('');
}

export async function getRepoTree(branch: string) {
    const { tree } = await githubFetch(`/git/trees/${branch}?recursive=1`);
    return tree;
}

export async function getFileContent(path: string): Promise<{ content: string; sha: string } | null> {
    try {
        const data = await githubFetch(`/contents/${path}`);
        if (data.type !== 'file') {
            return null;
        }
        // content is base64 encoded
        const content = atob(data.content);
        return { content, sha: data.sha };
    } catch (error) {
        console.error(`Failed to fetch content for ${path}:`, error);
        return null;
    }
}

export async function createOrUpdateFile(path: string, content: string, message: string, sha?: string) {
    const encodedContent = btoa(content);
    const body = {
        message,
        content: encodedContent,
        sha, // Include SHA for updates, omit for creations
    };
    return githubFetch(`/contents/${path}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });
}

export async function deleteFile(path: string, message: string, sha: string) {
    const body = { message, sha };
    return githubFetch(`/contents/${path}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });
}