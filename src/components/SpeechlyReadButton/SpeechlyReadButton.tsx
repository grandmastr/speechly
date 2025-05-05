import React from 'react';
import { FloatingPortal } from '@floating-ui/react';
import { Volume2Icon, LoaderIcon } from 'lucide-react';

interface SpeechlyReadButtonProps {
  position: { x: number; y: number } | null;
  onRead: (text: string) => void;
  selectedText: string;
  isLoading?: boolean;
}

const SpeechlyReadButton = ({
  position,
  onRead,
  selectedText,
  isLoading = false,
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
        <button
          onClick={() => onRead(selectedText)}
          disabled={isLoading}
          className="flex items-center gap-2 bg-black text-white px-3 py-2 text-sm font-medium hover:bg-gray-800 transition-colors cursor-pointer"
        >
          {isLoading ? (
            <LoaderIcon size={16} className="animate-spin" />
          ) : (
            <Volume2Icon size={16} />
          )}
          <span>{isLoading ? 'Reading...' : 'Read Selection'}</span>
        </button>
      </div>
    </FloatingPortal>
  );
};

export default SpeechlyReadButton;
