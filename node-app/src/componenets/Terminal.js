import React, { useEffect, useRef } from 'react';
import { Maximize2, Minimize2, Terminal as TerminalIcon } from 'lucide-react';

const Terminal = ({ 
  isVisible, 
  onToggle, 
  onCommandExecute 
}) => {
  const iframeRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    // Handle messages from the terminal iframe
    const handleMessage = (event) => {
      if (event.data && event.data.type === 'terminal-command') {
        onCommandExecute(event.data.command);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onCommandExecute]);

  const toggleFullscreen = () => {
    if (iframeRef.current) {
      if (!isFullscreen) {
        if (iframeRef.current.requestFullscreen) {
          iframeRef.current.requestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        }
      }
      setIsFullscreen(!isFullscreen);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="bg-gray-900 rounded-lg overflow-hidden shadow-lg">
      <div className="flex justify-between items-center bg-gray-800 p-3">
        <div className="flex items-center gap-2">
          <TerminalIcon className="text-gray-400" size={16} />
          <h2 className="text-white font-medium">Interactive Terminal</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleFullscreen}
            className="text-gray-400 hover:text-white p-1"
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          >
            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
          <button
            onClick={onToggle}
            className="text-gray-400 hover:text-white p-1"
            title="Minimize Terminal"
          >
            <Minimize2 size={16} />
          </button>
        </div>
      </div>
      <div className={`transition-all duration-200 ${isFullscreen ? 'h-screen' : 'h-96'}`}>
        <iframe
          ref={iframeRef}
          src={`http://${window.location.hostname}:7681`}
          className="w-full h-full border-0 bg-black"
          title="Terminal"
        />
      </div>
    </div>
  );
};

export default Terminal;
