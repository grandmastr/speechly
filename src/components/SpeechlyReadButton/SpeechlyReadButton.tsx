import React from 'react';
import { FloatingPortal } from '@floating-ui/react';
import { Volume2Icon, LoaderIcon, PauseIcon, SquareIcon, PlayIcon } from 'lucide-react';

interface SpeechlyReadButtonProps {
  position: { x: number; y: number } | null;
  onRead: (text: string) => void;
  onPause?: () => void;
  onResume?: () => void;
  onStop?: () => void;
  selectedText: string;
  isLoading?: boolean;
  isPlaying?: boolean;
  isPaused?: boolean;
}

const SpeechlyReadButton = ({
  position,
  onRead,
  onPause,
  onResume,
  onStop,
  selectedText,
  isLoading = false,
  isPlaying = false,
  isPaused = false,
}: SpeechlyReadButtonProps): React.ReactNode => {
  if (!(position && selectedText)) return null;

  // Calculate position for the button
  // Position it 10px above the selection
  const buttonStyle: React.CSSProperties = {
    position: 'fixed',
    left: `${position.x}px`,
    top: `${position.y - 40}px`, // Position above the selection
    transform: 'translateX(-50%)', // Center horizontally
    cursor: 'pointer', // Add cursor pointer
  };

  return (
    <FloatingPortal>
      <div
        style={buttonStyle}
        className="z-50 shadow-md rounded-md overflow-hidden"
      >
        {isLoading || isPlaying || isPaused ? (
          <div className="flex items-center bg-black text-white px-3 py-2 text-sm font-medium">
            {isLoading && <LoaderIcon size={16} className="animate-spin mr-2" />}
            <span className="mr-3">
              {isLoading ? 'Reading...' : isPaused ? 'Paused' : 'Playing...'}
            </span>

            {isPaused && onResume ? (
              <button
                onClick={onResume}
                className="p-1 hover:bg-gray-800 rounded-md transition-colors mr-1"
                title="Play"
              >
                <PlayIcon size={16} />
              </button>
            ) : onPause && !isPaused && (
              <button
                onClick={onPause}
                className="p-1 hover:bg-gray-800 rounded-md transition-colors mr-1"
                title="Pause"
              >
                <PauseIcon size={16} />
              </button>
            )}

            {onStop && (
              <button
                onClick={onStop}
                className="p-1 hover:bg-gray-800 rounded-md transition-colors"
                title="Stop"
              >
                <SquareIcon size={16} />
              </button>
            )}
          </div>
        ) : (
          <button
            onClick={() => onRead(selectedText)}
            className="flex items-center gap-2 bg-black text-white px-3 py-2 text-sm font-medium hover:bg-gray-800 transition-colors cursor-pointer"
          >
            <Volume2Icon size={16} />
            <span>Read Selection</span>
          </button>
        )}
      </div>
    </FloatingPortal>
  );
};

export default SpeechlyReadButton;
