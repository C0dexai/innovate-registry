# Installation Instructions

Follow these steps to set up and run the Gemini AI IDE application on your machine. This guide uses `npm` (Node Package Manager).

## Prerequisites

Before you begin, ensure you have the following installed and configured:

1.  **[Node.js](https://nodejs.org/)**: You need Node.js (version 18.x or newer) and its package manager, `npm`. You can download it from the official website.
2.  **A Modern Web Browser**: Such as Google Chrome, Firefox, or Microsoft Edge.
3.  **A Google Gemini API Key**: The application requires a Gemini API key to function.
    -   You can get a free key from **[Google AI Studio](https://aistudio.google.com/app/apikey)**.
4.  **A GitHub Personal Access Token**: To allow the IDE to interact with your repository.
    -   Go to **GitHub Settings > Developer settings > Personal access tokens (classic)**.
    -   Generate a new token with the `repo` scope. **Treat this token like a password!**

## 1. Download and Extract the Project

-   Download the project files as a ZIP archive.
-   Extract the contents of the ZIP file to a folder on your computer (e.g., `C:\Projects\gemini-ide`).

## 2. Configure Environment Variables

-   In the root of the project folder you extracted, create a new file named `.env`.
-   Open the `.env` file and add the following lines, replacing the placeholder values with your actual keys and repository information:

    ```env
    # Your Google Gemini API Key
    API_KEY=AIzaSy...

    # Your GitHub Personal Access Token (the one you just created)
    GITHUB_TOKEN=ghp_...

    # The GitHub repository you want to work with, in 'owner/repo' format
    GITHUB_REPO=your-github-username/your-repo-name
    ```
- **Important**: This application uses a simple mechanism to load these variables. For this to work, you must restart the application (step 4) every time you change the `.env` file.

## 3. Open a Terminal & Install Dependencies

-   Open your command-line terminal (e.g., Command Prompt, PowerShell, Terminal).
-   Navigate into the project folder.
    ```bash
    cd path\to\your\project\gemini-ide
    ```
-   Run the following command to install the necessary packages:
    ```bash
    npm install
    ```

## 4. Run the Application

-   Once the installation is complete, run this command to start the local web server:
    ```bash
    npm start
    ```
-   The server will start, and you should see a message like: `Accepting connections at http://localhost:3000`
-   Open your web browser and navigate to **`http://localhost:3000`**. The application should load and connect to your repository.

You are now ready to use the Gemini AI IDE!

## Troubleshooting

-   **`'npm' is not recognized...`**: This error means that Node.js is either not installed or its location is not in your system's PATH environment variable. Please install or reinstall Node.js.
-   **Repository Connection Error**: If the app shows an error screen on startup, double-check your `.env` file. Ensure `GITHUB_TOKEN` and `GITHUB_REPO` are correct and that the token has the necessary permissions. Remember to restart the `npm start` command after any change to the `.env` file.
-   **Port 3000 is already in use**: You can change the port by editing the `start` script in the `package.json` file. For example, change `"serve -l 3000 ."` to `"serve -l 3001 ."`.
