import { FileType } from '../types';
import type { FileNode, GithubRepo, GithubFile } from '../types';

// IMPORTANT: In a real production app, this token MUST be handled securely on a server-side proxy.
// Exposing it on the client-side is a major security risk.
// This is for demonstration purposes only within this sandboxed environment.
const GITHUB_PAT = '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';
const GITHUB_API_BASE_URL = 'https://api.github.com';
const GITHUB_OWNER = 'C0dexai';

const apiCall = async (endpoint: string, options: RequestInit = {}) => {
    const response = await fetch(`${GITHUB_API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
            'Authorization': `Bearer ${GITHUB_PAT}`,
            'Accept': 'application/vnd.github.v3+json',
            'X-GitHub-Api-Version': '2022-11-28',
            'Content-Type': 'application/json',
            ...options.headers,
        },
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `GitHub API request failed with status ${response.status}` }));
        throw new Error(errorData.message || `GitHub API request failed`);
    }

    if (response.status === 204) return null; // No Content
    return response.json();
};

async function getRepositories(): Promise<GithubRepo[]> {
    return apiCall('/user/repos?type=owner&sort=updated&per_page=20');
}

async function getRepoContents(repoName: string, path: string = ''): Promise<GithubFile[]> {
    return apiCall(`/repos/${GITHUB_OWNER}/${repoName}/contents/${path}`);
}

async function getRepoFileContent(sha: string, repoName: string): Promise<string> {
    const blob = await apiCall(`/repos/${GITHUB_OWNER}/${repoName}/git/blobs/${sha}`);
    if (blob.encoding !== 'base64') {
        throw new Error(`Unsupported blob encoding '${blob.encoding}' from GitHub.`);
    }
    // `atob` is deprecated in Node but fine in browsers for this use case.
    return atob(blob.content);
}

// This function is complex. It involves several API calls to replicate `git commit` and `git push`.
async function commitFilesToRepo(repo: string, commitMessage: string, fileTree: FileNode): Promise<string> {
    // 1. Get the latest commit SHA of the main branch
    const branch = await apiCall(`/repos/${GITHUB_OWNER}/${repo}/branches/main`);
    const latestCommitSha = branch.commit.sha;

    // 2. Get the tree SHA from the latest commit
    const latestCommit = await apiCall(`/repos/${GITHUB_OWNER}/${repo}/git/commits/${latestCommitSha}`);
    const baseTreeSha = latestCommit.tree.sha;

    // 3. Create file blobs for new/updated content
    const flattenFiles = (node: FileNode): { path: string; content: string }[] => {
        let files: { path: string; content: string }[] = [];
        const traverse = (currentNode: FileNode, currentPath: string) => {
            const newPath = currentPath ? `${currentPath}/${currentNode.name}` : currentNode.name;
            if (currentNode.type === FileType.File) {
                files.push({ path: newPath, content: currentNode.content || '' });
            }
            if (currentNode.children) {
                currentNode.children.forEach(child => traverse(child, newPath));
            }
        };
        // Start traversal from the root's children to build relative paths
        if (fileTree.children) {
            fileTree.children.forEach(child => traverse(child, ''));
        }
        return files.filter(f => f.path);
    };

    const filesToCommit = flattenFiles(fileTree);
    if (filesToCommit.length === 0) {
        return "No files to commit.";
    }

    const tree = filesToCommit.map(file => ({
        path: file.path,
        mode: '100644', // file
        type: 'blob',
        content: file.content,
    }));

    // 4. Create a new tree with the new files
    const newTree = await apiCall(`/repos/${GITHUB_OWNER}/${repo}/git/trees`, {
        method: 'POST',
        body: JSON.stringify({
            base_tree: baseTreeSha,
            tree,
        }),
    });

    // 5. Create a new commit pointing to the new tree
    const newCommit = await apiCall(`/repos/${GITHUB_OWNER}/${repo}/git/commits`, {
        method: 'POST',
        body: JSON.stringify({
            message: commitMessage,
            tree: newTree.sha,
            parents: [latestCommitSha],
        }),
    });

    // 6. Update the main branch to point to the new commit
    await apiCall(`/repos/${GITHUB_OWNER}/${repo}/git/refs/heads/main`, {
        method: 'PATCH',
        body: JSON.stringify({
            sha: newCommit.sha,
        }),
    });
    
    return `Success! Committed ${filesToCommit.length} files.\nView commit:\n${newCommit.html_url}`;
}

export const githubService = {
    getRepositories,
    commitFilesToRepo,
    getRepoContents,
    getRepoFileContent,
};