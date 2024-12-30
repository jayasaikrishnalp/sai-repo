const express = require('express');
const path = require('path');
const Docker = require('dockerode');
const cors = require('cors');

const app = express();
const docker = new Docker({ host: 'ttyd-app', port: 2375 });

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Import lab configurations
const labsConfig = require('./src/config/labs-config.json');

// Import validation service
const validationService = require('./src/services/ValidationService');

// Routes will be added here
app.get('/get-terminal', (req, res) => {
    const terminalUrl = `http://${req.hostname}:7681`;
    res.json({ url: terminalUrl });
});

app.get('/labs', (req, res) => {
    res.json(labsConfig);
});

app.get('/labs/:labId', (req, res) => {
    const lab = labsConfig.labs.find(l => l.id === req.params.labId);
    if (!lab) return res.status(404).json({ error: 'Lab not found' });
    res.json(lab);
});

app.post('/labs/:labId/validate', async (req, res) => {
    try {
        const result = await validationService.validateCommand(
            req.params.labId,
            req.body.taskId,
            req.body.command
        );
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const PORT = 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
});
