import React from 'react';
import { useImmer } from 'use-immer';
import { ControlPanel, FAB, SpeechlyReadButton } from '@/components';
import { Selection, SpeechlyProps } from './types';
import { setApiKey } from '@/lib/api';

const Speechly = ({ apiKey, fullName, email }: SpeechlyProps): React.ReactNode => {
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

  const handleReadText = async (text: string) => {
    // Get the selected voice ID from localStorage
    const voiceId = localStorage.getItem('clonedVoiceId');

    if (voiceId) {
      try {
        // Import dynamically to avoid circular dependencies
        const { speakText } = await import('@/services/audio/voice');
        await speakText(text, voiceId);
      } catch (error) {
        console.error('Error reading selected text:', error);
      }
    } else {
      console.warn('No voice selected. Please select a voice in the control panel.');
    }

    // Clear the selection
    window.getSelection()?.removeAllRanges();
    setSelection(draft => {
      draft.text = '';
      draft.position = null;
    });
  };

  // Set the API key when the component mounts or when the apiKey prop changes
  React.useEffect(() => {
    setApiKey(apiKey);
  }, [apiKey]);

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
      <ControlPanel isOpen={isOpen} onOpenChange={() => setIsOpen(!isOpen)} fullName={fullName} email={email} />
      <SpeechlyReadButton
        position={selection.position}
        onRead={handleReadText}
        selectedText={selection.text} />
    </main>
  );
};

export default Speechly;
