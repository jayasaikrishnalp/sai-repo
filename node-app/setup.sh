#!/bin/bash

# This script sets up the directory structure and files for the Docker Labs project
# It creates directories and files only if they don't already exist

echo "Setting up Docker Labs project structure..."

# Create main project directory and navigate into it
mkdir -p docker-labs
cd docker-labs

# Create necessary directories
echo "Creating directory structure..."
mkdir -p src/components
mkdir -p src/services
mkdir -p src/config
mkdir -p public
mkdir -p node-app
mkdir -p ttyd-app

# Create package.json if it doesn't exist
if [ ! -f package.json ]; then
    echo "Creating package.json..."
    cat > package.json << 'EOF'
{
  "name": "docker-labs",
  "version": "1.0.0",
  "description": "Interactive Docker Learning Platform",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "build": "react-scripts build",
    "dev": "react-scripts start"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "express": "^4.18.2",
    "dockerode": "^4.0.2",
    "cors": "^2.8.5",
    "lucide-react": "^0.263.1",
    "@radix-ui/react-alert-dialog": "^1.0.0"
  }
}
EOF
fi

# Create docker-compose.yml if it doesn't exist
if [ ! -f docker-compose.yml ]; then
    echo "Creating docker-compose.yml..."
    cat > docker-compose.yml << 'EOF'
version: "3.8"
services:
  node-app:
    build:
      context: ./node-app
    ports:
      - "3000:3000"
    depends_on:
      - ttyd-app
    environment:
      - DOCKER_HOST=tcp://ttyd-app:2375
    networks:
      - lab-network

  ttyd-app:
    build:
      context: ./ttyd-app
    ports:
      - "7681:7681"
      - "2375:2375"
    privileged: true
    networks:
      - lab-network

networks:
  lab-network:
    driver: bridge
EOF
fi

# Create node-app Dockerfile
if [ ! -f node-app/Dockerfile ]; then
    echo "Creating node-app Dockerfile..."
    cat > node-app/Dockerfile << 'EOF'
FROM node:16-alpine

RUN apk add --no-cache python3 make g++

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
EOF
fi

# Create ttyd-app Dockerfile
if [ ! -f ttyd-app/Dockerfile ]; then
    echo "Creating ttyd-app Dockerfile..."
    cat > ttyd-app/Dockerfile << 'EOF'
FROM ubuntu:20.04

RUN apt-get update && apt-get install -y \
    curl \
    wget \
    docker.io \
    && rm -rf /var/lib/apt/lists/*

RUN wget https://github.com/tsl0922/ttyd/releases/download/1.6.3/ttyd.x86_64 \
    && chmod +x ttyd.x86_64 \
    && mv ttyd.x86_64 /usr/local/bin/ttyd

EXPOSE 7681 2375

CMD ["ttyd", "-p", "7681", "bash"]
EOF
fi

# Create server.js
if [ ! -f server.js ]; then
    echo "Creating server.js..."
    cat > server.js << 'EOF'
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
EOF
fi

# Create src/config/labs-config.json
if [ ! -f src/config/labs-config.json ]; then
    echo "Creating labs configuration..."
    cat > src/config/labs-config.json << 'EOF'
{
  "labs": [
    {
      "id": "lab1",
      "title": "Getting Started with Docker",
      "description": "Learn the basics of Docker by running your first container",
      "difficulty": "beginner",
      "estimatedTime": "30 minutes",
      "prerequisites": [],
      "tasks": [
        {
          "id": "task1",
          "title": "Pull Hello World Image",
          "description": "Download the hello-world image from Docker Hub",
          "command": "docker pull hello-world",
          "validation": {
            "method": "regex",
            "expected": "hello-world\\s+latest"
          }
        }
      ]
    }
  ]
}
EOF
fi

# Create public/index.html
if [ ! -f public/index.html ]; then
    echo "Creating index.html..."
    cat > public/index.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Docker Interactive Labs</title>
    <script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
    <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body>
    <div id="root"></div>
    <script src="/static/js/main.js"></script>
</body>
</html>
EOF
fi

# Create .gitignore
if [ ! -f .gitignore ]; then
    echo "Creating .gitignore..."
    cat > .gitignore << 'EOF'
node_modules/
dist/
build/
.env
.DS_Store
*.log
EOF
fi

# Set up npm if package.json exists
if [ -f package.json ]; then
    echo "Installing npm dependencies..."
    npm install
fi

echo "Setup completed successfully!"
echo "To start the application:"
echo "1. Run 'docker-compose build'"
echo "2. Run 'docker-compose up'"
echo "The application will be available at http://localhost:3000"
