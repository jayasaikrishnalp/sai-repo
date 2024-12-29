const express = require('express');
const path = require('path');
const app = express();

// Serve the HTML file
app.use(express.static(path.join(__dirname, 'public')));

// API to get the ttyd terminal URL
app.get('/get-terminal', (req, res) => {
  const terminalUrl = `http://${req.hostname}:7681`; // Dynamically use the request's hostname
  res.json({ url: terminalUrl });
});

// Use environment variable or default to 3000
const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0'; // Bind to all network interfaces

app.listen(PORT, HOST, () => {
  console.log(`Node app running on http://${HOST}:${PORT}`);
});
