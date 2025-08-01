async function handleCliCommand(command) {
    const args = command.trim().split(/\s+/);
    const primaryCommand = args[0].toLowerCase();

    let url;
    let options = {};

    if (primaryCommand.startsWith('openai-tool')) {
        // --- Route to the Python/OpenAI Backend ---
        url = '/api/python-openai'; // Your Python server's endpoint
        options = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ command: command })
        };

    } else if (primaryCommand.startsWith('ts-service')) {
        // --- Route to the TypeScript/Node.js Backend ---
        url = '/api/typescript-service'; // Your Node.js server's endpoint
        options = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ command: command })
        };
        
    } else {
        // --- Default Route to the PHP Backend ---
        const encodedCommand = encodeURIComponent(command);
        const encodedDir = encodeURIComponent(this.currentDirectory);
        url = `index.php?command=${encodedCommand}&cd=${encodedDir}`;
        options = { method: 'GET' };
    }

    // The rest of the fetch logic remains the same...
    try {
        const response = await fetch(url, options);
        // ... process and display the response in the terminal
    } catch (error) {
        // ... handle errors
    }
}