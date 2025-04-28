import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';

import {
  Card,
  CardContent,
  CardTitle,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/ui';
import { getVoices, Voice } from '@/services/audio/voice';

const VoiceSelector = (): React.ReactElement => {
  const [voices, setVoices] = useState<Voice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchVoices = async () => {
      try {
        setIsLoading(true);
        const fetchedVoices = await getVoices();

        // Filter voices according to criteria
        const personalVoices = fetchedVoices.filter(voice => voice.type === "personal");
        const otherVoices = fetchedVoices.filter(voice => voice.type !== "personal").slice(0, 5);

        // Combine the filtered voices: personal voices first, then top 5 other voices
        const filteredVoices = [...personalVoices, ...otherVoices];

        setVoices(filteredVoices);

        // If there's a voice ID in localStorage, select it
        const savedVoiceId = localStorage.getItem('clonedVoiceId');
        if (savedVoiceId && fetchedVoices.some(voice => voice.id === savedVoiceId)) {
          setSelectedVoice(savedVoiceId);
        }
      } catch (error) {
        console.error('Failed to fetch voices:', error);
        toast.error('Failed to load voices. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchVoices();
  }, []);

  return (
    <Card>
      <CardTitle>
        Voice Selection
      </CardTitle>
      <CardContent className={'flex'}>
        <Select
          value={selectedVoice}
          onValueChange={setSelectedVoice}
          disabled={isLoading || voices.length === 0}
        >
          <SelectTrigger className={'w-full'}>
            <SelectValue placeholder={isLoading ? 'Loading voices...' : 'Pick a voice'} />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Voices</SelectLabel>
              {voices.map((voice) => (
                <SelectItem key={voice.id} value={voice.id}>
                  {voice.display_name} ({voice.gender})
                </SelectItem>
              ))}
              {voices.length === 0 && !isLoading && (
                <SelectItem value="no-voices" disabled>
                  No voices available
                </SelectItem>
              )}
            </SelectGroup>
          </SelectContent>
        </Select>
      </CardContent>
    </Card>
  );
};

export default VoiceSelector;
