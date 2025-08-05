import express from 'express';
import bodyParser from 'body-parser';
import fs from 'fs';
import dotenv from 'dotenv';
import chokidar from 'chokidar';
import { parser } from 'php-parser';
import path from 'path';
import { spawn } from 'child_process';

dotenv.config();
const app = express();
app.use(bodyParser.json());

let config = { commands: {}, allow: [], deny: [] };

function loadPhpConfig() {
    const phpCode = fs.readFileSync('./console.config.php', 'utf-8');
    const engine = new parser({ parser: { extractDoc: true }, ast: { withPositions: true } });
    const ast = engine.parseCode(phpCode);

    ast.children.forEach((node: any) => {
        if (node.kind === 'assign' && node.left?.name === 'commands') config.commands = node.right;
        if (node.kind === 'assign' && node.left?.name === 'allow') config.allow = node.right;
        if (node.kind === 'assign' && node.left?.name === 'deny') config.deny = node.right;
    });

    console.log('Config synced from PHP');
}
loadPhpConfig();

chokidar.watch('./console.config.php').on('change', () => {
    console.log('Config changed – reloading...');
    loadPhpConfig();
});

function matchCommand(command: string, patterns: any[]): boolean {
    return patterns.some(p => new RegExp(p.replace('*', '.*')).test(command));
}

app.post('/shell', (req, res) => {
    const { command, cwd } = req.body;

    if (config.allow.length && !matchCommand(command, config.allow)) {
        return res.status(403).json({ error: 'Command not allowed.' });
    }
    if (config.deny.length && matchCommand(command, config.deny)) {
        return res.status(403).json({ error: 'Command denied.' });
    }

    const proc = spawn(command, { cwd, shell: true });
    let output = '';
    let error = '';

    proc.stdout.on('data', data => (output += data.toString()));
    proc.stderr.on('data', data => (error += data.toString()));
    proc.on('close', () => res.json({ output, error }));
});

app.listen(process.env.NODE_PORT, () => {
    console.log(`AJENTIC NEXUS TypeScript server running on http://localhost:${process.env.NODE_PORT}`);
});
