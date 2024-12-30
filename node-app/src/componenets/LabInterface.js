import React, { useState, useEffect, useRef } from 'react';
import { Terminal, CheckCircle, AlertCircle, ChevronDown, ChevronRight } from 'lucide-react';

const LabInterface = () => {
  const [labs, setLabs] = useState([]);
  const [selectedLab, setSelectedLab] = useState(null);
  const [terminalVisible, setTerminalVisible] = useState(true);
  const [validationResults, setValidationResults] = useState({});
  const terminalRef = useRef(null);

  useEffect(() => {
    // Load labs data
    fetch('/labs')
      .then(res => res.json())
      .then(data => setLabs(data))
      .catch(err => console.error('Error loading labs:', err));
  }, []);

  const LabContent = ({ lab }) => {
    const [expanded, setExpanded] = useState(false);
    
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 mb-4">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h2 className="text-2xl font-semibold flex items-center gap-2">
              {lab.title}
              {validationResults[lab.id]?.completed && (
                <CheckCircle className="text-green-500" size={20} />
              )}
            </h2>
            <p className="text-gray-600 mt-1">{lab.description}</p>
            <div className="flex gap-4 mt-2">
              <span className="text-sm text-gray-500">
                Difficulty: {lab.difficulty}
              </span>
              <span className="text-sm text-gray-500">
                Duration: {lab.estimatedTime}
              </span>
            </div>
          </div>
          <button 
            onClick={() => setExpanded(!expanded)}
            className="text-blue-500 hover:text-blue-700"
          >
            {expanded ? <ChevronDown size={24} /> : <ChevronRight size={24} />}
          </button>
        </div>

        {expanded && (
          <div className="mt-6">
            {/* Instructions Section */}
            <div className="mb-6">
              <h3 className="font-semibold text-lg mb-2">Instructions</h3>
              <div className="space-y-4">
                {lab.tasks.map((task, index) => (
                  <TaskCard 
                    key={task.id} 
                    task={task} 
                    index={index}
                    validation={validationResults[task.id]}
                    onRunCommand={(command) => {
                      if (terminalRef.current) {
                        terminalRef.current.sendCommand(command);
                      }
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const TaskCard = ({ task, index, validation, onRunCommand }) => {
    return (
      <div className="border rounded-lg p-4 bg-gray-50">
        <div className="flex items-center gap-2">
          <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">
            {index + 1}
          </span>
          <h4 className="font-medium">{task.title}</h4>
          {validation?.passed && <CheckCircle className="text-green-500" size={16} />}
        </div>
        
        <p className="mt-2 text-gray-600">{task.description}</p>
        
        {/* Command Section */}
        <div className="mt-3 bg-gray-900 rounded-md p-3 relative">
          <code className="text-gray-200 font-mono">{task.command}</code>
          <button 
            className="absolute right-2 top-2 bg-blue-500 text-white px-2 py-1 rounded text-sm"
            onClick={() => onRunCommand(task.command)}
          >
            Run
          </button>
        </div>

        {/* Explanation and Hints */}
        <div className="mt-3 text-sm">
          <p className="text-gray-700">{task.explanation}</p>
          {task.hints && (
            <div className="mt-2 bg-yellow-50 border-l-4 border-yellow-400 p-3">
              <strong className="text-yellow-800">Hints:</strong>
              <ul className="mt-1 list-disc list-inside text-yellow-700">
                {task.hints.map((hint, i) => (
                  <li key={i}>{hint}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    );
  };

  const TerminalComponent = ({ visible }) => {
    if (!visible) return null;

    return (
      <div className="fixed bottom-0 right-0 w-1/2 h-1/2 bg-gray-900 rounded-tl-lg shadow-xl">
        <div className="flex justify-between items-center bg-gray-800 p-2 rounded-tl-lg">
          <h3 className="text-white font-medium">Terminal</h3>
          <button 
            onClick={() => setTerminalVisible(false)}
            className="text-gray-400 hover:text-white"
          >
            Minimize
          </button>
        </div>
        <iframe
          ref={terminalRef}
          src={`http://${window.location.hostname}:7681`}
          className="w-full h-full border-none"
          title="Terminal"
        />
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 pb-64">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Docker Interactive Labs</h1>
            <p className="text-gray-600 mt-2">Learn Docker hands-on with interactive exercises</p>
          </div>
          {!terminalVisible && (
            <button
              onClick={() => setTerminalVisible(true)}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
            >
              <Terminal size={20} />
              Open Terminal
            </button>
          )}
        </div>
      </div>

      {/* Labs List */}
      <div className="max-w-4xl mx-auto space-y-6">
        {labs.map(lab => (
          <LabContent key={lab.id} lab={lab} />
        ))}
      </div>

      {/* Terminal */}
      <TerminalComponent visible={terminalVisible} />
    </div>
  );
};

export default LabInterface;
