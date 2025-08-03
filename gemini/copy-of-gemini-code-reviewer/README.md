# Gemini AI IDE (GitHub Edition)

An interactive, AI-powered IDE that leverages the Google Gemini API to browse, edit, review, and orchestrate code directly within a GitHub repository. This application is a standalone, browser-based environment featuring a family of specialized AI agents, a Gemini CLI for power users, and a robust set of tools for modern web development.

## ✨ Features

- **Direct GitHub Integration**: Connects directly to your GitHub repository. Browse, edit, and commit files without cloning the repo locally.
- **AI-Powered Code Review**: Get instant, detailed feedback on your code's quality, performance, and adherence to best practices using a specialized Gemini agent.
- **One-Click Suggestions**: Apply AI-suggested code changes directly to your files with a single click.
- **Monaco-Powered Editor**: A professional-grade editor with syntax highlighting, IntelliSense, and a built-in diff viewer.
- **Integrated Source Control**: View diffs for changed files and commit them directly to your repository with a commit message, all from within the IDE.
- **Gemini CLI & Chat**: Interact with AI through a powerful CLI or a conversational chat interface.
- **Multi-Agent AI Family**: Interact with a diverse family of AI agents, each with a unique role, persona, and set of tools. You can chat with them, give them tasks, and even edit their system prompts.
- **Session Persistence**: Your agents, chat histories, and open files are saved in your browser's IndexedDB to maintain your workspace between sessions.

## 🚀 Technologies Used

- **React**: For building the user interface.
- **TypeScript**: For type safety and robust code.
- **Tailwind CSS**: For rapid, utility-first styling.
- **Google Gemini API (`@google/genai`)**: The core AI engine for code analysis, chat, and agent-based tasks.
- **GitHub REST API**: For all repository interactions.
- **Monaco Editor**: For a best-in-class code editing experience.

## ⚙️ Setup and Installation

For detailed setup instructions, please refer to the [INSTRUCTIONS.md](INSTRUCTIONS.md) file.

## 💻 Usage

1.  **Run the application** by following the steps in [INSTRUCTIONS.md](INSTRUCTIONS.md). This now requires setting up environment variables.
2.  **Browse Code**: Use the File Explorer to navigate your GitHub repository's file tree and open files for editing.
3.  **Edit & Commit**: Make changes in the editor. The "Source Control" panel will show your changes. Write a commit message and click "Commit" to save your work back to GitHub.
4.  **Get a Review**: With a file open, click the **"✨ Review Code"** button to have the AI analyze it. Feedback appears in the "AI Review" tab.
5.  **Use the CLI**: Open the **Gemini CLI** tab to run commands like `/review`, `/save`, `/gen`, and more. Type `/help` for a full list of commands.

## ⚠️ Security Notice

This application requires environment variables for API keys and tokens. These should be managed securely and never be exposed in client-side code or public repositories. Follow the instructions carefully to ensure your keys remain safe.
