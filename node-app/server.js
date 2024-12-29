const express = require('express');
const path = require('path');
const app = express();

// Serve the HTML file
app.use(express.static(path.join(__dirname, 'public')));

// API to get the ttyd terminal URL
app.get('/get-terminal', (req, res) => {
  const terminalUrl = `http://localhost:7681`; // ttyd app URL
  res.json({ url: terminalUrl });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Node app running on http://localhost:${PORT}`);
});
