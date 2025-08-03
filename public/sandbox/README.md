# Live Web Dev Sandbox with Gemini AI & GitHub Integration

This is a powerful, browser-based development environment that combines the creative power of the Google Gemini AI with the version control capabilities of GitHub. It allows you to generate, edit, and manage full web projects using natural language, and then commit your work directly to a repository.

## Key Features

-   **AI-Powered Development**: Instruct the Gemini agent to create files, write HTML, style with CSS/TailwindCSS, and add JavaScript functionality.
-   **Full GitHub Integration**: Connect your GitHub account, load repositories, browse branches, and commit & push changes directly from the app.
-   **Simulated WebContainer Terminal**: An AI-powered terminal that understands common shell commands (`ls`, `cd`, `cat`, `node server.js`) to orchestrate project changes.
-   **Live Preview & Editing**: See your changes reflected instantly. Drag-and-drop components or click on elements to edit them directly.
-   **`/innovate` Project Factory**: A built-in project templating system that the AI can use to bootstrap new Node.js, React, or other projects on command.
-   **Complete File Management**: A familiar file explorer with support for creating files/folders, uploading (including ZIP archives), and downloading your entire project.

---

## First Run & Quick Start

Get up and running in minutes.

1.  **Connect to GitHub (Recommended)**:
    *   Go to the "GitHub" panel on the left.
    *   Enter a [GitHub Personal Access Token (PAT)](https://github.com/settings/tokens?type=beta) with `repo` scope. **Your token is stored securely in your browser's local storage and is never exposed.**
    *   Click "Connect".

2.  **Load a Project**:
    *   **From GitHub**: Select a repository and a branch from the dropdowns and click "Load Repo".
    *   **Start Fresh**: Use the default project structure that's loaded on first use.
    *   **Upload**: Drag a ZIP file of your project onto the file explorer.

3.  **Interact with the AI Agent**:
    *   Use the "Inference" chat panel at the top. Type a command like:
        > "Create a button with the text 'Click Me' and style it with a blue background using TailwindCSS."
    *   The agent will reply, explain its work, and show you the proposed code changes. Click **"Apply to Editor"** to accept them.

4.  **Edit Manually**:
    *   Click on any file in the "File Explorer" to open it in the "Editor".
    *   Use the "Refine" input above the editor to ask the AI to modify only the active file.

5.  **Commit Your Work**:
    *   Once connected to GitHub, the "Source Control" section will show all your changes.
    *   Write a commit message (e.g., "feat: Add new call-to-action button").
    *   Click **"Commit & Push"**. Your changes are now live on GitHub!

---

## Feature Deep Dive

### The AI Agent (Inference Panel)

The Inference panel is your primary interface to the AI. Be specific and give one instruction at a time for best results.

-   **Create Elements**: `Create a header with an h1 that says "Welcome".`
-   **Style Elements**: `Use TailwindCSS to make the button have a shadow and scale up on hover.`
-   **Add Functionality**: `In /script.js, add a click event listener to the button with id "submit-btn".`
-   **Manage Files**: `Create a new file named /components/card.js.`
-   **Use Templates**: `Using the innovate manifest, create a new Node.js Express project in a directory called /my-api.`

### The Simulated Terminal (WebContainer)

The "Terminal" tab provides a command-line interface, but it's important to understand how it works:

**It is an AI-powered simulation, not a real WebContainer.**

-   **How it works**: When you type a command like `node server.js`, the command is sent to the Gemini agent. The agent reads the contents of `server.js`, understands what a Node.js server would do, and returns a *simulated* output. If you use `mkdir /new-dir`, the agent will return file system changes that the application then applies to the File Explorer.
-   **What it's for**: It's an incredibly powerful tool for AI-driven orchestration. The agent can use it to simulate `npm install` by reading `package.json`, or to "run" a script and report the outcome.
-   **Limitations**: It does **not** actually execute code, run a live server, or access the network. It's a high-level simulation for managing project structure and getting feedback on what *would* happen if the code were run in a real environment.

### The `/innovate` Project Factory

The `/innovate` directory is a built-in template registry. The AI is aware of this directory and its `manifest.json` file. This allows you to issue high-level commands for bootstrapping entire projects.

-   **Example**: `Create a new React app in /my-dashboard.`
-   **How it works**:
    1.  The AI reads `/innovate/manifest.json` to find the "React" template.
    2.  It sees the template source is at `/innovate/containers/react-vanilla/`.
    3.  It copies all files from that directory into your new `/my-dashboard/` directory.

You can extend this by adding your own templates to the `/innovate/containers/` directory and updating the `manifest.json`.

---

## How to Administer, Maintain, and Distribute this Application

You asked how to manage and distribute this application as a development instrument. Here's the breakdown:

**This application *is* the development instrument.** It's a fully client-side static web application.

1.  **Sourcing & Maintenance**:
    *   The "source" is the GitHub repository containing these files.
    *   To "maintain" the application, you simply make changes to the code (e.g., updating React components, improving Gemini prompts in `geminiService.ts`) and commit them to your repository.

2.  **Administration**:
    *   Administration is done through standard Git and GitHub workflows (branches, pull requests, etc.).
    *   The primary configuration you must administer is the **API Key**. The `GoogleGenAI` client is initialized with `process.env.API_KEY`. When you deploy the application, you must set this as an environment variable in your hosting provider's settings.

3.  **Distribution (Deployment)**:
    *   Since this is a static application (HTML, CSS, JS), you can distribute it by deploying it to any modern web hosting platform.
    *   **Recommended Platforms**: [Vercel](https://vercel.com/), [Netlify](https://www.netlify.com/), [GitHub Pages](https://pages.github.com/).
    *   **Deployment Steps (Example with Vercel)**:
        1.  Fork this repository to your own GitHub account.
        2.  Go to [vercel.com](https://vercel.com/) and create a new project, linking it to your forked repository.
        3.  In the Vercel project settings, go to "Environment Variables" and add a variable named `API_KEY` with your Google AI Studio API key as the value.
        4.  Deploy. Vercel will build and host your application at a public URL.

Anyone with the URL can now use your version of the Live Dev Sandbox.
