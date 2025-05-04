import React, { useCallback, useEffect, useState } from 'react';
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
import { getVoices, Voice, voicesRefetchEvent } from '@/services/audio/voice';

// Cache expiration time in milliseconds (24 hours)
const CACHE_EXPIRATION = 24 * 60 * 60 * 1000;

// Cache key for voices in localStorage
const VOICES_CACHE_KEY = 'cachedVoices';
const VOICES_CACHE_TIMESTAMP_KEY = 'cachedVoicesTimestamp';

const VoiceSelector = (): React.ReactElement => {
  const [voices, setVoices] = useState<Voice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Define fetchVoices as a callback so we can reuse it
  const fetchVoices = useCallback(async (forceRefresh = false) => {
    try {
      setIsLoading(true);

      const cachedVoicesJson = localStorage.getItem(VOICES_CACHE_KEY);
      const cachedTimestampStr = localStorage.getItem(
        VOICES_CACHE_TIMESTAMP_KEY);
      const cachedTimestamp = cachedTimestampStr ? parseInt(cachedTimestampStr,
        10) : 0;
      const cacheIsValid = !forceRefresh &&
        cachedVoicesJson &&
        Date.now() - cachedTimestamp < CACHE_EXPIRATION;

      let fetchedVoices: Voice[];

      if (cacheIsValid) {
        // Use cached voices
        fetchedVoices = JSON.parse(cachedVoicesJson);
      } else {
        // Fetch fresh voices from API
        fetchedVoices = await getVoices();

        // Cache the fetched voices
        localStorage.setItem(VOICES_CACHE_KEY, JSON.stringify(fetchedVoices));
        localStorage.setItem(VOICES_CACHE_TIMESTAMP_KEY, Date.now().toString());
      }

      // Filter voices according to criteria
      const personalVoices = fetchedVoices.filter(
        voice => voice.type === 'personal');
      const otherVoices = fetchedVoices.filter(
        voice => voice.type !== 'personal').slice(0, 5);

      // Combine the filtered voices: personal voices first, then top 5 other voices
      const filteredVoices = [...personalVoices, ...otherVoices];

      setVoices(filteredVoices);

      // If there's a voice ID in localStorage, select it
      const savedVoiceId = localStorage.getItem('clonedVoiceId');
      if (savedVoiceId &&
        fetchedVoices.some(voice => voice.id === savedVoiceId)) {
        setSelectedVoice(savedVoiceId);
      }
    } catch (error) {
      console.error('Failed to fetch voices:', error);
      toast.error('Failed to load voices. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch voices on component mount, but use cache if available
  useEffect(() => {
    fetchVoices(false);
  }, [fetchVoices]);

  // Listen for refetch events
  useEffect(() => {
    const handleRefetch = () => {
      fetchVoices(true); // Force refresh when explicitly requested
    };

    // Add event listener
    voicesRefetchEvent.addEventListener('refetch', handleRefetch);

    // Clean up event listener on component unmount
    return () => {
      voicesRefetchEvent.removeEventListener('refetch', handleRefetch);
    };
  }, [fetchVoices]);

  // Save selected voice to localStorage when it changes
  React.useEffect(() => {
    if (selectedVoice) {
      localStorage.setItem('clonedVoiceId', selectedVoice);
    }
  }, [selectedVoice]);

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
            <SelectValue
              placeholder={isLoading ? 'Loading voices...' : 'Pick a voice'} />
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
