const express = require('express');
const path = require('path');
const Docker = require('dockerode');
const cors = require('cors');

const app = express();
const docker = new Docker({ host: 'ttyd-app', port: 2375 });

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Lab definitions with detailed instructions and validations
const labs = {
  'lab1': {
    id: 'lab1',
    title: 'Introduction to Docker',
    description: 'Learn the basics of Docker by running your first container',
    objectives: [
      'Understand what Docker containers are',
      'Learn basic Docker commands',
      'Run your first container'
    ],
    tasks: [
      {
        id: 'pull-image',
        title: 'Pull the Hello World Image',
        description: 'Start by downloading the official hello-world image from Docker Hub',
        command: 'docker pull hello-world',
        explanation: 'Docker Pull downloads container images from Docker Hub, the official repository for Docker images.',
        hints: [
          'Make sure you have internet connectivity',
          'The hello-world image is very small and downloads quickly',
          'You can verify downloaded images with docker images'
        ],
        validation: async () => {
          try {
            const images = await docker.listImages();
            return {
              passed: images.some(img => img.RepoTags && img.RepoTags.includes('hello-world:latest')),
              message: 'Checking if hello-world image is downloaded'
            };
          } catch (error) {
            console.error('Validation error:', error);
            return { passed: false, message: 'Error checking Docker images' };
          }
        }
      },
      {
        id: 'run-container',
        title: 'Run Your First Container',
        description: 'Now run the hello-world container to verify everything works',
        command: 'docker run hello-world',
        explanation: 'Docker Run creates and starts a new container from an image. The hello-world container will display a welcome message and exit.',
        hints: [
          'The container will exit after displaying the message - this is normal',
          'You can view all containers (including stopped ones) with docker ps -a'
        ],
        validation: async () => {
          try {
            const containers = await docker.listContainers({ all: true });
            return {
              passed: containers.some(container => container.Image.includes('hello-world')),
              message: 'Checking if hello-world container was run'
            };
          } catch (error) {
            console.error('Validation error:', error);
            return { passed: false, message: 'Error checking Docker containers' };
          }
        }
      }
    ]
  },
  'lab2': {
    id: 'lab2',
    title: 'Working with Nginx',
    description: 'Deploy a web server using the Nginx Docker image',
    objectives: [
      'Learn to run services in containers',
      'Understand port mapping',
      'Access containerized web services'
    ],
    tasks: [
      {
        id: 'pull-nginx',
        title: 'Pull the Nginx Image',
        description: 'Download the official Nginx web server image',
        command: 'docker pull nginx',
        explanation: 'Nginx is a popular web server that we can run in a container.',
        hints: [
          'The Nginx image is larger than hello-world and may take longer to download',
          'You can track the download progress in the terminal'
        ],
        validation: async () => {
          try {
            const images = await docker.listImages();
            return {
              passed: images.some(img => img.RepoTags && img.RepoTags.includes('nginx:latest')),
              message: 'Checking if Nginx image is downloaded'
            };
          } catch (error) {
            console.error('Validation error:', error);
            return { passed: false, message: 'Error checking Docker images' };
          }
        }
      },
      {
        id: 'run-nginx',
        title: 'Run Nginx Container',
        description: 'Start an Nginx container and map it to port 8080',
        command: 'docker run -d -p 8080:80 nginx',
        explanation: 'We run Nginx in detached mode (-d) and map port 8080 on your host to port 80 in the container.',
        hints: [
          'The -d flag runs the container in the background',
          '-p 8080:80 maps port 8080 on your host to port 80 in the container',
          'You can access the Nginx welcome page at http://localhost:8080'
        ],
        validation: async () => {
          try {
            const containers = await docker.listContainers();
            const nginxRunning = containers.some(container => 
              container.Image.includes('nginx') && 
              container.Ports.some(port => port.PublicPort === 8080)
            );
            return {
              passed: nginxRunning,
              message: 'Checking if Nginx container is running on port 8080'
            };
          } catch (error) {
            console.error('Validation error:', error);
            return { passed: false, message: 'Error checking Docker containers' };
          }
        }
      }
    ]
  }
};

// Routes

// Get terminal URL
app.get('/get-terminal', (req, res) => {
  const terminalUrl = `http://${req.hostname}:7681`;
  res.json({ url: terminalUrl });
});

// Get all labs
app.get('/labs', (req, res) => {
  const labsList = Object.values(labs).map(lab => ({
    id: lab.id,
    title: lab.title,
    description: lab.description,
    objectives: lab.objectives
  }));
  res.json(labsList);
});

// Get specific lab
app.get('/labs/:labId', (req, res) => {
  const lab = labs[req.params.labId];
  if (!lab) {
    return res.status(404).json({ error: 'Lab not found' });
  }
  res.json(lab);
});

// Validate lab tasks
app.post('/labs/:labId/validate', async (req, res) => {
  const lab = labs[req.params.labId];
  if (!lab) {
    return res.status(404).json({ error: 'Lab not found' });
  }

  try {
    const results = await Promise.all(lab.tasks.map(async (task) => {
      const validationResult = await task.validation();
      return {
        taskId: task.id,
        title: task.title,
        ...validationResult
      };
    }));

    res.json({
      labId: lab.id,
      passed: results.every(r => r.passed),
      tasks: results
    });
  } catch (error) {
    console.error('Lab validation error:', error);
    res.status(500).json({ 
      error: 'Validation failed',
      message: error.message 
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: err.message 
  });
});

// Start server
const PORT = 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
  console.log('Docker integration enabled - connected to ttyd-app:2375');
});
