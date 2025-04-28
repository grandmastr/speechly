import React from 'react';
import { useImmer } from 'use-immer';
import { ControlPanel, FAB, SpeechlyReadButton } from '@/components';
import { Selection } from './types';

const Speechly = (): React.ReactNode => {
  const [isOpen, setIsOpen] = React.useState<boolean>(false);
  const [selection, setSelection] = useImmer<Selection>({
    text: '',
    position: null,
  });

  const handleTextSelection = React.useCallback(() => {
    const selection = window.getSelection();
    const selectedText: string = selection?.toString().trim() || '';

    if (selectedText && selection?.rangeCount) {
      const range: Range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();

      setSelection(draft => {
        draft.text = selectedText;
        draft.position = {
          x: rect.left + rect.width / 2,
          y: rect.top,
        };
      });
    } else {
      setSelection(draft => {
        draft.text = '';
        draft.position = null;
      });
    }
  }, [setSelection]);

  const handleReadText = (text: string) => {
    console.log(text);
    setIsOpen(true);

    window.getSelection()?.removeAllRanges();
    setSelection(draft => {
      draft.text = '';
      draft.position = null;
    });
  };

  React.useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    document.addEventListener('selectionchange', handleTextSelection,
      { signal });
    return () => controller.abort();
  }, [handleTextSelection]);

  return (
    <main>
      <FAB isOpen={isOpen} onClick={() => setIsOpen(!isOpen)} />
      <ControlPanel isOpen={isOpen} onOpenChange={() => setIsOpen(!isOpen)} />
      <SpeechlyReadButton
        position={selection.position}
        onRead={handleReadText}
        selectedText={selection.text} />
    </main>
  );
};

export default Speechly;
