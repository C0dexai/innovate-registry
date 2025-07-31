# Innovate Template Registry 🚀

This repo provides a suite of development templates for rapid container orchestration or local setup.
All templates run standalone—use Docker, or just run locally.

## 📦 Templates

| Template                | Dockerized | Standalone/Vanilla | Quick Start                       |
|-------------------------|:----------:|:------------------:|-----------------------------------|
| Node.js + Express       | 🐳 Yes     | 🧑‍💻 Yes           | `docker build ...` or `npm start` |
| React SPA               | 🐳 Yes     | 🧑‍💻 Yes           | `docker build ...` or `npm start` |
| Python Flask API        | 🐳 Yes     | 🧑‍💻 Yes           | `docker build ...` or `python app.py` |
| PHP Apache              | 🐳 Yes     | 🧑‍💻 Yes           | `docker build ...` or drop into Apache/PHP server |
| Fullstack MERN          | 🐳 Yes     | 🧑‍💻 Yes           | `docker-compose up` or run node/react separately |
| Vanilla TypeScript      | No         | 🧑‍💻 Yes           | `npm install && npm start`        |
| Vite + TypeScript SPA   | No         | 🧑‍💻 Yes           | `npm install && npm run dev`      |

## 🚀 Usage

**To use Docker:**
```bash
docker build -t my-container ./containers/node-express
docker run -p 3000:3000 my-container

cd containers/vanilla-ts
npm install
npm start

📚 About
Each template is ready for:

Rapid orchestration

DevOps or local development

Future AI-powered extensions

Drop issues or PRs for improvements.
Brought to you by @C0dexai and the AI Family. 🦾
