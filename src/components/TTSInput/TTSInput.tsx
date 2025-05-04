import React, { useState } from 'react';
import { Volume2Icon } from 'lucide-react';
import { toast } from 'sonner';

import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Textarea,
} from '@/ui';
import { speakText } from '@/services/audio/voice';

const TTSInput = (): React.ReactElement => {
  const [text, setText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
  };

  const handleReadAll = async () => {
    if (!text.trim()) {
      toast.error('Please enter some text to read');
      return;
    }

    // Get the selected voice ID from localStorage
    const voiceId = localStorage.getItem('clonedVoiceId');

    if (!voiceId) {
      toast.error('Please select a voice first');
      return;
    }

    setIsLoading(true);

    try {
      await speakText(text, voiceId);
      toast.success('Text is being read aloud');
    } catch (error) {
      console.error('Error reading text:', error);
      toast.error('Failed to read text. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Direct TTS Input
        </CardTitle>
      </CardHeader>
      <CardContent className={'grid gap-[1rem]'}>
        <Textarea
          value={text}
          onChange={handleTextChange}
          placeholder="Enter text to be read aloud..."
        />
        <Button
          size={'lg'}
          className={'text-[0.75rem]'}
          onClick={handleReadAll}
          disabled={isLoading || !text.trim()}
        >
          <Volume2Icon size={16} />
          {isLoading ? 'Reading...' : 'Read All'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default TTSInput;
