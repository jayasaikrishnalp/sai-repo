import React, { useState, useEffect } from 'react';
import { Terminal, Check, X, RefreshCw, ChevronDown, ChevronRight, ExternalLink } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

const LabsInterface = () => {
  const [labs, setLabs] = useState([
    {
      id: 'lab1',
      title: 'Getting Started with Docker',
      description: 'Learn the basics of Docker by running your first container',
      status: 'not-started',
      tasks: [
        {
          id: 'pull-image',
          title: 'Pull the Hello World Image',
          description: 'We\'ll start by pulling the official hello-world image from Docker Hub.',
          command: 'docker pull hello-world',
          explanation: 'This command downloads the hello-world image to your local machine. Docker images are the building blocks for containers.',
          hints: [
            'Make sure Docker daemon is running',
            'Check your internet connection if the pull is slow',
            'You can verify the image exists with: docker images'
          ],
          validation: 'Wait for the image to download completely. You should see a success message.'
        },
        {
          id: 'run-container',
          title: 'Run Your First Container',
          description: 'Now let\'s run a container from the hello-world image.',
          command: 'docker run hello-world',
          explanation: 'This command creates and starts a new container from the hello-world image. The container will print a welcome message and then exit.',
          hints: [
            'The container will exit after displaying the message - this is normal',
            'You can view all containers (including stopped ones) with: docker ps -a'
          ],
          validation: 'You should see a welcome message explaining how Docker works.'
        }
      ]
    },
    {
      id: 'lab2',
      title: 'Working with Nginx',
      description: 'Deploy a web server using the Nginx Docker image',
      status: 'not-started',
      tasks: [
        {
          id: 'pull-nginx',
          title: 'Pull the Nginx Image',
          description: 'Pull the official Nginx web server image.',
          command: 'docker pull nginx',
          explanation: 'Nginx is a popular web server that we can easily run in a container.',
          hints: [
            'The download might take a minute as the image is larger than hello-world',
            'You can specify a version with nginx:version if needed'
          ],
          validation: 'The nginx image should appear in your local images list.'
        },
        {
          id: 'run-nginx',
          title: 'Run Nginx Container',
          description: 'Start an Nginx container and expose it to port 8080.',
          command: 'docker run -d -p 8080:80 nginx',
          explanation: 'This runs Nginx in detached mode (-d) and maps port 8080 on your host to port 80 in the container.',
          hints: [
            'Make sure port 8080 is not already in use',
            'Use docker ps to verify the container is running',
            'Visit http://localhost:8080 in your browser'
          ],
          validation: 'You should be able to see the Nginx welcome page in your browser.'
        }
      ]
    }
  ]);

  const [selectedLab, setSelectedLab] = useState(null);
  const [terminalUrl, setTerminalUrl] = useState('');
  const [validationResults, setValidationResults] = useState({});

  useEffect(() => {
    // Fetch terminal URL on component mount
    fetch('/get-terminal')
      .then(res => res.json())
      .then(data => setTerminalUrl(data.url))
      .catch(error => console.error('Error fetching terminal URL:', error));
  }, []);

  const validateLab = async (labId) => {
    try {
      const response = await fetch(`/labs/${labId}/validate`, {
        method: 'POST'
      });
      const results = await response.json();
      setValidationResults(prev => ({
        ...prev,
        [labId]: results
      }));
      
      // Update lab status based on results
      setLabs(prevLabs => 
        prevLabs.map(lab => 
          lab.id === labId 
            ? { ...lab, status: results.passed ? 'completed' : 'in-progress' }
            : lab
        )
      );
    } catch (error) {
      console.error('Validation error:', error);
    }
  };

  const LabTask = ({ task, labId }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const result = validationResults[labId]?.tasks?.find(t => t.taskId === task.id);

    return (
      <div className="border rounded-lg p-4 mb-4 bg-white shadow-sm">
        <div 
          className="flex items-center justify-between cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center gap-2">
            {result?.passed ? (
              <Check className="text-green-500" size={20} />
            ) : (
              <div className="w-5 h-5 rounded-full border border-gray-300" />
            )}
            <h3 className="text-lg font-medium">{task.title}</h3>
          </div>
          {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
        </div>
        
        {isExpanded && (
          <div className="mt-4 space-y-4">
            <p className="text-gray-600">{task.description}</p>
            
            <div className="bg-gray-50 p-3 rounded-md font-mono text-sm">
              {task.command}
              <button 
                className="ml-2 text-blue-500 hover:text-blue-600"
                onClick={() => navigator.clipboard.writeText(task.command)}
              >
                Copy
              </button>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-md">
              <h4 className="font-medium text-blue-800 mb-2">Understanding the Command</h4>
              <p className="text-blue-700">{task.explanation}</p>
            </div>
            
            {task.hints && task.hints.length > 0 && (
              <div className="bg-yellow-50 p-4 rounded-md">
                <h4 className="font-medium text-yellow-800 mb-2">Helpful Hints</h4>
                <ul className="list-disc pl-5 text-yellow-700 space-y-1">
                  {task.hints.map((hint, index) => (
                    <li key={index}>{hint}</li>
                  ))}
                </ul>
              </div>
            )}
            
            <div className="bg-gray-50 p-4 rounded-md">
              <h4 className="font-medium mb-2">Validation</h4>
              <p>{task.validation}</p>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Docker Labs</h1>
          <button
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            onClick={() => window.open(terminalUrl, '_blank')}
          >
            <Terminal size={20} />
            Open Terminal
            <ExternalLink size={16} />
          </button>
        </div>

        <div className="space-y-6">
          {labs.map(lab => (
            <div key={lab.id} className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-800">{lab.title}</h2>
                    <p className="text-gray-600 mt-1">{lab.description}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    {lab.status === 'completed' ? (
                      <Alert className="bg-green-50 text-green-800 border-green-200">
                        <Check className="text-green-500" size={20} />
                        <AlertTitle>Completed!</AlertTitle>
                      </Alert>
                    ) : (
                      <button
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600"
                        onClick={() => validateLab(lab.id)}
                      >
                        <RefreshCw size={16} />
                        Validate Progress
                      </button>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  {lab.tasks.map(task => (
                    <LabTask 
                      key={task.id} 
                      task={task} 
                      labId={lab.id}
                    />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LabsInterface;
