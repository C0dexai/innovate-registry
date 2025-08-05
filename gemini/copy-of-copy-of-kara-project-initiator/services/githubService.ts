import { GithubUser, GithubRepo, GithubTree, GithubFile, GithubCommit } from '../types';

const API_BASE_URL = 'https://api.github.com';

/**
 * A service class to interact with the GitHub REST API.
 */
export class GithubService {
  private token: string;
  private headers: { Authorization: string; Accept: string; };

  constructor(token: string) {
    if (!token) {
      throw new Error('GitHub token is required.');
    }
    this.token = token;
    this.headers = {
      'Authorization': `token ${this.token}`,
      'Accept': 'application/vnd.github.v3+json',
    };
  }

  /**
   * A generic request handler for the GitHub API.
   * @param endpoint The API endpoint to call.
   * @param options The request options (method, body, etc.).
   * @returns The JSON response from the API.
   */
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        ...this.headers,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(`GitHub API Error (${response.status}): ${errorData.message || 'Failed to fetch'}`);
    }

    if (response.status === 204 || response.headers.get('Content-Length') === '0') {
      return {} as T;
    }

    return response.json() as T;
  }

  /**
   * Fetches the authenticated user's profile information.
   */
  public async getUser(): Promise<GithubUser> {
    return this.request<GithubUser>('/user');
  }

  /**
   * Fetches the repositories for the authenticated user.
   */
  public async getRepos(): Promise<GithubRepo[]> {
    return this.request<GithubRepo[]>('/user/repos?sort=pushed&per_page=100');
  }

  /**
   * Fetches the file tree for a given repository branch.
   * @param owner The repository owner's login.
   * @param repo The repository name.
   * @param branch The branch name or SHA.
   */
  public async getTree(owner: string, repo: string, branch: string): Promise<GithubTree> {
    return this.request<GithubTree>(`/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`);
  }

  /**
   * Fetches the content of a specific file in a repository.
   * @param owner The repository owner's login.
   * @param repo The repository name.
   * @param path The path to the file.
   */
  public async getContent(owner: string, repo: string, path: string): Promise<GithubFile> {
    return this.request<GithubFile>(`/repos/${owner}/${repo}/contents/${path}`);
  }

  /**
   * Fetches the commit history for a specific file path.
   * @param owner The repository owner's login.
   * @param repo The repository name.
   * @param path The path to the file.
   */
  public async getCommits(owner: string, repo: string, path: string): Promise<GithubCommit[]> {
    return this.request<GithubCommit[]>(`/repos/${owner}/${repo}/commits?path=${encodeURIComponent(path)}`);
  }

  /**
   * Creates or updates a file in a repository.
   * @param owner The repository owner's login.
   * @param repo The repository name.
   * @param path The path to the file.
   * @param message The commit message.
   * @param content The new file content.
   * @param sha The blob SHA of the file being replaced.
   */
  public async updateContent(
    owner: string,
    repo: string,
    path: string,
    message: string,
    content: string,
    sha: string
  ): Promise<{ content: GithubFile; commit: GithubCommit }> {
    // Correctly handle UTF-8 strings for btoa
    const encodedContent = btoa(unescape(encodeURIComponent(content)));

    return this.request(`/repos/${owner}/${repo}/contents/${path}`, {
      method: 'PUT',
      body: JSON.stringify({
        message,
        content: encodedContent,
        sha,
      }),
    });
  }
}
