async function handleCliCommand(command) {
    const url = '/execute'; // The route defined in your Python/Flask app

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                command: command,
                currentDirectory: this.currentDirectory
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (result.error) {
            this.term.writeln(`\r\n\x1b[31m${result.error}\x1b[0m`);
        } else if (result.output) {
            // Handle 'cd' logic if your Python script returns a special string
            // Otherwise, just print the output
            const formattedOutput = result.output.replace(/\n/g, '\r\n');
            this.term.write(formattedOutput);
        }

    } catch (error) {
        this.term.writeln(`\r\n\x1b[31mError: ${error.message}\x1b[0m`);
    } finally {
        this.term.prompt();
    }
}