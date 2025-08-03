import React from 'react';
import { LayoutIcon } from './Icons';

export interface LayoutTemplateData {
  id: string;
  name: string;
  description: string;
  html: string;
  css: string;
}

const layouts: LayoutTemplateData[] = [
    {
        id: 'holy-grail',
        name: 'Holy Grail',
        description: 'Classic 3-column responsive layout with a header and footer.',
        html: `
<header class="header">Header</header>
<div class="container">
  <main class="main-content">
    <h2>Main Content</h2>
    <p>This is the main area for content. It will adapt to different screen sizes.</p>
  </main>
  <aside class="sidebar-left">Left Sidebar</aside>
  <aside class="sidebar-right">Right Sidebar</aside>
</div>
<footer class="footer">Footer</footer>`,
        css: `
body, html {
  margin: 0;
  padding: 0;
  height: 100%;
  font-family: sans-serif;
  color: #333;
}

body {
  display: flex;
  flex-direction: column;
}

.header, .footer {
  background: #2c3e50;
  color: white;
  padding: 1rem;
  text-align: center;
  flex-shrink: 0;
}

.container {
  display: grid;
  grid-template-areas:
    "left main right";
  grid-template-columns: 1fr 2.5fr 1fr;
  gap: 1rem;
  padding: 1rem;
  flex-grow: 1;
  background: #ecf0f1;
}

.main-content {
  grid-area: main;
  background: white;
  padding: 1rem;
  border-radius: 4px;
}

.sidebar-left {
  grid-area: left;
  background: #bdc3c7;
  padding: 1rem;
  border-radius: 4px;
}

.sidebar-right {
  grid-area: right;
  background: #bdc3c7;
  padding: 1rem;
  border-radius: 4px;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .container {
    grid-template-areas:
      "main"
      "left"
      "right";
    grid-template-columns: 1fr;
  }
}
`
    },
    {
        id: 'dashboard-shell',
        name: 'Dashboard Shell',
        description: 'A common application layout with a fixed sidebar and main content area.',
        html: `
<div class="dashboard-container">
  <aside class="dashboard-sidebar">
    <h2>Dashboard</h2>
    <nav>
      <ul>
        <li><a href="#">Home</a></li>
        <li><a href="#">Analytics</a></li>
        <li><a href="#">Settings</a></li>
      </ul>
    </nav>
  </aside>
  <main class="dashboard-main">
    <h1>Welcome, User!</h1>
    <div class="content-card">Your dashboard content here.</div>
  </main>
</div>`,
        css: `
html, body {
  margin: 0;
  padding: 0;
  height: 100%;
  font-family: sans-serif;
  background-color: #f4f7f6;
}
.dashboard-container {
  display: flex;
  height: 100%;
}
.dashboard-sidebar {
  width: 240px;
  background-color: #1a222e;
  color: #fff;
  padding: 1.5rem;
  flex-shrink: 0;
}
.dashboard-sidebar h2 {
  margin-top: 0;
}
.dashboard-sidebar nav ul {
  list-style: none;
  padding: 0;
}
.dashboard-sidebar nav li {
  margin-bottom: 1rem;
}
.dashboard-sidebar nav a {
  color: #aeb9c6;
  text-decoration: none;
  transition: color 0.2s;
}
.dashboard-sidebar nav a:hover {
  color: #fff;
}
.dashboard-main {
  flex-grow: 1;
  padding: 2rem;
  overflow-y: auto;
  color: #333;
}
.content-card {
  margin-top: 2rem;
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}
@media (max-width: 768px) {
    .dashboard-container {
        flex-direction: column;
    }
    .dashboard-sidebar {
        width: 100%;
        height: auto;
    }
}
`
    },
];


const LayoutPreview: React.FC<{ layout: LayoutTemplateData }> = ({ layout }) => {
    // This is a simplified visual representation.
    const getPreviewStructure = () => {
        switch(layout.id) {
            case 'holy-grail':
                return (
                    <div className="flex flex-col w-full h-full bg-gray-200">
                        <div className="h-2 bg-gray-500 flex-shrink-0"></div>
                        <div className="flex-grow flex gap-1 p-1">
                            <div className="w-3 bg-gray-400"></div>
                            <div className="flex-grow bg-gray-100"></div>
                            <div className="w-3 bg-gray-400"></div>
                        </div>
                        <div className="h-2 bg-gray-500 flex-shrink-0"></div>
                    </div>
                );
            case 'dashboard-shell':
                return (
                    <div className="flex w-full h-full bg-gray-200">
                        <div className="w-4 bg-gray-600"></div>
                        <div className="flex-grow bg-gray-100 p-1"></div>
                    </div>
                );
            default:
                return <LayoutIcon className="w-8 h-8 text-gray-400" />
        }
    }
    return getPreviewStructure();
};

interface LayoutTemplatesProps {
    onLayoutSelect: (layout: LayoutTemplateData) => void;
}

const LayoutTemplates: React.FC<LayoutTemplatesProps> = ({ onLayoutSelect }) => {
    return (
        <div className="grid grid-cols-2 gap-2">
            {layouts.map(layout => (
                 <div
                    key={layout.id}
                    onClick={() => onLayoutSelect(layout)}
                    className="flex flex-col items-center p-2 bg-black/20 hover:bg-black/40 rounded-md cursor-pointer transition-all duration-200 border border-transparent hover:border-[var(--neon-green)]"
                    title={`Apply ${layout.name} layout`}
                >
                    <div className="h-16 w-full bg-black/20 rounded-sm mb-2 overflow-hidden border border-gray-600">
                        <LayoutPreview layout={layout} />
                    </div>
                    <p className="text-xs text-center text-gray-300 font-semibold">{layout.name}</p>
                    <p className="text-[10px] text-center text-gray-400 mt-1 hidden lg:block">{layout.description}</p>
                </div>
            ))}
        </div>
    );
};

export default LayoutTemplates;
