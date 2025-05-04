import React from 'react';
import { FloatingPortal } from '@floating-ui/react';
import { Volume2Icon } from 'lucide-react';

interface SpeechlyReadButtonProps {
  position: { x: number; y: number } | null;
  onRead: (text: string) => void;
  selectedText: string;
}

const SpeechlyReadButton = ({
  position,
  onRead,
  selectedText,
}: SpeechlyReadButtonProps): React.ReactNode => {
  if (!(position && selectedText)) return null;

  // Calculate position for the button
  // Position it 10px above the selection
  const buttonStyle: React.CSSProperties = {
    position: 'fixed',
    left: `${position.x}px`,
    top: `${position.y - 40}px`, // Position above the selection
    transform: 'translateX(-50%)', // Center horizontally
  };

  return (
    <FloatingPortal>
      <div
        style={buttonStyle}
        className="z-50 shadow-md rounded-md overflow-hidden"
      >
        <button
          onClick={() => onRead(selectedText)}
          className="flex items-center gap-2 bg-black text-white px-3 py-2 text-sm font-medium hover:bg-gray-800 transition-colors"
        >
          <Volume2Icon size={16} />
          <span>Read Selection</span>
        </button>
      </div>
    </FloatingPortal>
  );
};

export default SpeechlyReadButton;
