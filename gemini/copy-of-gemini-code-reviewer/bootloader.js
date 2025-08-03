// bootloader.js
const fs = require('fs');
const path = require('path');

module.exports = (req, res) => {
  try {
    const envPath = path.resolve(process.cwd(), '.env');
    const indexPath = path.resolve(process.cwd(), 'index.html');

    let envContent = '';
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
    }

    const envVars = envContent.split('\n').reduce((acc, line) => {
      const [key, ...valueParts] = line.split('=');
      if (key && !key.startsWith('#')) {
        acc[key.trim()] = valueParts.join('=').trim();
      }
      return acc;
    }, {});
    
    let html = fs.readFileSync(indexPath, 'utf8');

    const envScript = `
      <script>
        window.process = {
          env: ${JSON.stringify(envVars, null, 2)}
        };
      </script>
    `;

    html = html.replace('</head>', `${envScript}\n</head>`);

    res.setHeader('Content-Type', 'text/html');
    res.end(html);
  } catch (error) {
    console.error('Bootloader error:', error);
    res.statusCode = 500;
    res.end('<h1>Server Error</h1><p>Could not process request.</p>');
  }
};
