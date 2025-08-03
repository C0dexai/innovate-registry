import { Octokit } from 'octokit';
import type { FileSystemState, GithubRepo, GithubBranch, GithubUser, FileChange } from '../types';

let octokit: Octokit | null = null;

export const connectToGithub = async (token: string): Promise<GithubUser> => {
    octokit = new Octokit({ auth: token });
    try {
        const { data: user } = await octokit.rest.users.getAuthenticated();
        return user;
    } catch (error) {
        octokit = null;
        console.error("GitHub connection failed:", error);
        throw new Error("Failed to connect to GitHub. Please check your token and permissions.");
    }
};

export const disconnectFromGithub = () => {
    octokit = null;
};

export const listRepos = async (): Promise<GithubRepo[]> => {
    if (!octokit) throw new Error("Not connected to GitHub.");
    const { data: repos } = await octokit.rest.repos.listForAuthenticatedUser({
        type: 'owner',
        sort: 'pushed',
        per_page: 100,
    });
    return repos as GithubRepo[];
};

export const listBranches = async (owner: string, repo: string): Promise<GithubBranch[]> => {
    if (!octokit) throw new Error("Not connected to GitHub.");
    const { data: branches } = await octokit.rest.repos.listBranches({
        owner,
        repo,
        per_page: 100,
    });
    return branches;
};


export const getRepoContents = async (owner: string, repo: string, ref: string): Promise<FileSystemState> => {
    if (!octokit) throw new Error("Not connected to GitHub.");
    
    const { data: tree } = await octokit.rest.git.getTree({
        owner,
        repo,
        tree_sha: ref,
        recursive: '1',
    });

    const fileSystem: FileSystemState = {};
    const textFilePromises = tree.tree
        .filter(item => item.type === 'blob' && item.path)
        .map(async (file) => {
            try {
                const { data: blob } = await octokit!.rest.git.getBlob({
                    owner,
                    repo,
                    file_sha: file.sha!,
                });

                // Check if content is base64 and decode if so
                if (blob.encoding === 'base64') {
                    const content = atob(blob.content);
                    // A simple check to see if the content is likely text
                    // This avoids trying to display binary files like images
                    if (/^[\x00-\x7F]*$/.test(content)) {
                       fileSystem[`/${file.path!}`] = content;
                    } else {
                       console.warn(`Skipping binary file: /${file.path!}`)
                    }
                } else {
                     fileSystem[`/${file.path!}`] = blob.content;
                }
                
            } catch (err) {
                console.error(`Failed to fetch blob for ${file.path}:`, err);
            }
        });

    await Promise.all(textFilePromises);
    return fileSystem;
};

interface CommitDetails {
    owner: string;
    repo: string;
    branch: string;
    message: string;
    changes: FileChange[];
    currentFileSystem: FileSystemState;
    initialFileSystem: FileSystemState;
}

export const commitAndPush = async ({ owner, repo, branch, message, changes, currentFileSystem, initialFileSystem }: CommitDetails): Promise<string> => {
    if (!octokit) throw new Error("Not connected to GitHub.");

    // 1. Get the latest commit SHA of the branch
    const { data: branchData } = await octokit.rest.repos.getBranch({
        owner,
        repo,
        branch,
    });
    const latestCommitSha = branchData.commit.sha;
    const baseTreeSha = branchData.commit.commit.tree.sha;

    // 2. Create blobs for new/modified files
    const fileBlobs = await Promise.all(
        changes
            .filter(c => c.status === 'added' || c.status === 'modified')
            .map(async (change) => {
                const content = currentFileSystem[change.path];
                const { data: blob } = await octokit!.rest.git.createBlob({
                    owner,
                    repo,
                    content,
                    encoding: 'utf-8',
                });
                return {
                    path: change.path.substring(1), // remove leading slash
                    sha: blob.sha,
                    mode: '100644' as const,
                    type: 'blob' as const,
                };
            })
    );
    
    const treeItems = [
        ...fileBlobs,
        ...changes
            .filter(c => c.status === 'deleted')
            .map(change => ({
                path: change.path.substring(1), // remove leading slash
                sha: null, // Deleting file
                mode: '100644' as const,
                type: 'blob' as const,
            }))
    ];

    // 3. Create a new tree with these changes
    const { data: newTree } = await octokit.rest.git.createTree({
        owner,
        repo,
        base_tree: baseTreeSha,
        tree: treeItems,
    });

    // 4. Create a new commit pointing to the new tree
    const { data: newCommit } = await octokit.rest.git.createCommit({
        owner,
        repo,
        message,
        tree: newTree.sha,
        parents: [latestCommitSha],
    });

    // 5. Update the branch reference to point to the new commit
    await octokit.rest.git.updateRef({
        owner,
        repo,
        ref: `heads/${branch}`,
        sha: newCommit.sha,
    });

    return newCommit.html_url || '';
};
