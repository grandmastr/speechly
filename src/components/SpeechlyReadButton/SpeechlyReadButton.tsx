import React from 'react';
import {
  autoUpdate,
  flip,
  FloatingPortal,
  offset,
  shift,
  useFloating,
} from '@floating-ui/react';

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
  const { refs, floatingStyles } = useFloating({
    placement: 'top',
    middleware: [offset(10), flip(), shift()],
    whileElementsMounted: autoUpdate,
    ...(position && {
      elements: {
        reference: {
          getBoundingClientRect: () => ({
            width: 0,
            height: 0,
            x: position.x,
            y: position.y,
            right: position.x,
            bottom: position.y,
            left: position.x,
          }),
        } as Element,
      },
    }),
  });

  if (!(position && selectedText)) return null;

  return (
    <FloatingPortal>
      <div ref={refs.setFloating} style={floatingStyles} className={'bg-[red]'}>
        <button onClick={() => onRead(selectedText)}>
          Read Selection
        </button>
      </div>
    </FloatingPortal>
  );
};

export default SpeechlyReadButton;
