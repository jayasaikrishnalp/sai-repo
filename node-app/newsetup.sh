#!/bin/bash

# Create project structure
mkdir -p node-app/public node-app/src/components node-app/src/services node-app/src/config

# Create necessary files
touch node-app/.dockerignore node-app/.gitignore

# Create .dockerignore content
echo "node_modules
npm-debug.log" > node-app/.dockerignore

# Create .gitignore content
echo "node_modules/
npm-debug.log
.DS_Store" > node-app/.gitignore

# Copy files to appropriate locations
echo "Copying package.json..."
cp package.json node-app/

echo "Copying Dockerfile..."
cp Dockerfile node-app/

echo "Setup complete!"
echo "Now run: cd node-app && npm install"
echo "Then: docker-compose up --build"
