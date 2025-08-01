import React, { useState } from 'react';
import type { CodeSnippet } from '../types';
import { Modal } from './Modal';
import { SyntaxHighlighter } from './SyntaxHighlighter';

type Tech = 'ajax' | 'xhr' | 'fetch';

const snippets: { [key in Tech]: CodeSnippet[] } = {
    ajax: [
        {
            title: 'jQuery GET Request',
            description: 'A simple GET request using the widely-used jQuery library. Requires jQuery to be included in your project.',
            code: `$.ajax({
    url: '/api/data',
    method: 'GET',
    success: function(response) {
        console.log('Success:', response);
        $('#result').html(JSON.stringify(response, null, 2));
    },
    error: function(xhr, status, error) {
        console.error('Error:', error);
    }
});`
        },
        {
            title: 'Vanilla JS GET',
            description: 'A standard GET request using the native XMLHttpRequest object. Compatible with all browsers.',
            code: `const xhr = new XMLHttpRequest();
xhr.open('GET', '/api/data', true);
xhr.onload = function () {
    if (xhr.status >= 200 && xhr.status < 400) {
        const data = JSON.parse(xhr.responseText);
        console.log('Success:', data);
        document.getElementById('result').textContent = JSON.stringify(data, null, 2);
    } else {
        console.error('Server error');
    }
};
xhr.onerror = function () {
    console.error('Connection error');
};
xhr.send();`
        },
        {
            title: 'POST Form Data',
            description: 'Send form data to a server using a POST request with XMLHttpRequest.',
            code: `const xhr = new XMLHttpRequest();
const formData = new FormData();
formData.append('username', 'testuser');
formData.append('email', 'test@example.com');

xhr.open('POST', '/api/users', true);
xhr.onload = function () {
    if (xhr.status === 201) { // 201 Created
        console.log('User created:', JSON.parse(xhr.responseText));
    } else {
        console.error('Failed to create user:', xhr.statusText);
    }
};
xhr.send(formData);`
        }
    ],
    xhr: [
        {
            title: 'POST JSON Data',
            description: 'Send a JSON payload to an endpoint using a POST request.',
            code: `const xhr = new XMLHttpRequest();
const data = JSON.stringify({
  title: 'New Post',
  body: 'This is the content of the post.'
});

xhr.open('POST', '/api/posts', true);
xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
xhr.onload = function() {
    if (this.status === 200) {
        console.log('Response:', JSON.parse(this.responseText));
    }
};
xhr.send(data);`
        },
        {
            title: 'Request with Progress Events',
            description: 'Track the progress of a download (e.g., a large file or image).',
            code: `const xhr = new XMLHttpRequest();
xhr.open('GET', '/api/large-file', true);
xhr.responseType = 'blob';

xhr.onprogress = function(event) {
    if (event.lengthComputable) {
        const percentComplete = (event.loaded / event.total) * 100;
        console.log(percentComplete + '% downloaded');
        document.getElementById('progress-bar').style.width = percentComplete + '%';
    }
};

xhr.onload = function() {
    if (this.status === 200) {
        const blob = this.response;
        // ... process the blob ...
    }
};

xhr.send();`
        },
        {
            title: 'Request with Custom Headers',
            description: 'Send custom headers, such as an authorization token, with your request.',
            code: `const xhr = new XMLHttpRequest();
xhr.open('GET', '/api/protected-data', true);
xhr.setRequestHeader('Authorization', 'Bearer YOUR_JWT_TOKEN_HERE');
xhr.setRequestHeader('X-Custom-Header', 'MyValue');

xhr.onload = function() {
    if (this.status === 200) {
        console.log(JSON.parse(this.responseText));
    } else {
        console.log('Access denied or error.');
    }
};

xhr.send();`
        }
    ],
    fetch: [
        {
            title: 'Simple GET Request',
            description: 'A basic GET request using the modern Fetch API with promise-based handling.',
            code: `fetch('/api/data')
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  })
  .then(data => {
    console.log('Success:', data);
    document.getElementById('result').textContent = JSON.stringify(data, null, 2);
  })
  .catch(error => {
    console.error('Fetch error:', error);
  });`
        },
        {
            title: 'POST with Async/Await',
            description: 'Send JSON data using a POST request with modern async/await syntax for cleaner code.',
            code: `async function postData(url = '', data = {}) {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Status: ' + response.status);
    return await response.json();
  } catch (error) {
    console.error('Error:', error);
  }
}

postData('/api/users', { name: 'New User' })
  .then(data => {
    console.log(data);
  });`
        },
        {
            title: 'Fetch from Server-Side Language',
            description: 'Fetch data from a server-side script (e.g., PHP, Python) that returns a JSON array.',
            code: `async function getUsers() {
    try {
        const response = await fetch('/api/get_users.php'); // or /api/get_users.py
        const users = await response.json();

        const userList = document.getElementById('user-list');
        userList.innerHTML = ''; // Clear existing list

        users.forEach(user => {
            const li = document.createElement('li');
            li.textContent = \`\${user.name} (\${user.email})\`;
            userList.appendChild(li);
        });
    } catch (error) {
        console.error('Failed to fetch users:', error);
    }
}

getUsers();`
        }
    ]
};

interface CodeSnippetModalProps {
    isOpen: boolean;
    technology: Tech | null;
    onClose: () => void;
    onInject: (code: string) => void;
}

export const CodeSnippetModal: React.FC<CodeSnippetModalProps> = ({ isOpen, technology, onClose, onInject }) => {
    if (!isOpen || !technology) return null;

    const currentSnippets = snippets[technology];

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Inject ${technology.toUpperCase()} Snippet`}>
            <div className="space-y-6">
                {currentSnippets.map((snippet, index) => (
                    <div key={index} className="bg-primary p-4 rounded-lg">
                        <h4 className="font-bold text-lg text-accent">{snippet.title}</h4>
                        <p className="text-xs text-dim-text mb-2">{snippet.description}</p>
                        <SyntaxHighlighter code={snippet.code} />
                        <div className="text-right mt-2">
                            <button 
                                onClick={() => onInject(snippet.code)}
                                className="text-sm bg-accent text-black font-semibold py-1 px-4 rounded-md hover:opacity-80 transition-colors"
                            >
                                Inject
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </Modal>
    );
};
