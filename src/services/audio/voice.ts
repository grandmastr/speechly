import api from '@/lib/api';

// Interface for the voice cloning API response
interface VoiceCloneResponse {
  display_name: string;
  gender: 'male' | 'female';
  locale: string;
  id: string;
  models: {
    languages: Record<string, unknown>[];
    name: string;
  }[];
  type: string;
  avatar_image: string;
}

// Interface for text-to-speech request options
export interface TextToSpeechOptions {
  audio_format?: 'wav' | 'mp3' | 'ogg' | 'aac';
  language?: string;
  model?: 'simba-base' | 'simba-english' | 'simba-multilingual' | 'simba-turbo';
  options?: {
    loudness_normalization?: boolean;
    text_normalization?: boolean;
  };
}

// Interface for text-to-speech response
export interface TextToSpeechResponse {
  audio_data: string; // Base64-encoded audio data
  audio_format: 'wav' | 'mp3' | 'ogg' | 'aac';
  billable_characters_count: number;
  speech_marks?: {
    chunks?: Array<{
      end?: number;
      end_time?: number;
      start?: number;
      start_time?: number;
      type?: string;
      value?: string;
    }>;
    end?: number;
    end_time?: number;
    start?: number;
    start_time?: number;
    type?: string;
    value?: string;
  };
}

// Interface for a voice in the voice list response
export interface Voice {
  display_name: string;
  gender: 'male' | 'female';
  locale: string;
  id: string;
  models: {
    languages: {
      locale: string;
    }[];
    name: string;
  }[];
  type: string;
  avatar_image: string;
  preview_audio?: string;
  tags?: string[];
}

/**
 * Clones a voice using the Speechify API
 * @param audioFile - The audio file containing the voice sample
 * @param name - The name for the cloned voice
 * @param gender - The gender of the voice ('male' or 'female')
 * @param avatarFile - Optional avatar image file
 * @returns Promise with the voice cloning response
 */
export const cloneVoice = async (
  audioFile: File,
  name: string,
  gender: 'male' | 'female',
  avatarFile?: File,
  fullName?: string,
  email?: string
): Promise<VoiceCloneResponse> => {
  try {
    // Validate the audio file
    // Check if the audioFile has the required properties of a File object
    if (!audioFile || typeof audioFile !== 'object' || !('name' in audioFile) || !('type' in audioFile) || !('size' in audioFile)) {
      throw new Error('Invalid audio file: not a File object');
    }

    if (audioFile.size === 0) {
      throw new Error('Invalid audio file: file is empty');
    }

    // Create a new FormData object
    const formData = new FormData();

    // Add text fields first
    formData.append('name', name);
    formData.append('gender', gender);

    // Create consent object with user details
    const consentData = {
      fullName: fullName || "Israel Akintunde",
      email: email || "israelakintunde005@gmail.com"
    };
    formData.append('consent', JSON.stringify(consentData));

    // Use the original file directly without re-encoding
    // This preserves the original audio format and metadata
    const processedFile = audioFile;

    // Add the processed audio file to the FormData
    // Ensure the file has a proper extension that matches its MIME type
    let fileName = processedFile.name;
    const fileType = processedFile.type;

    // Ensure the file has the correct extension based on its MIME type
    if (fileType === 'audio/wav' && !fileName.endsWith('.wav')) {
      fileName = fileName.split('.')[0] + '.wav';
    } else if (fileType === 'audio/mpeg' && !fileName.endsWith('.mp3')) {
      fileName = fileName.split('.')[0] + '.mp3';
    } else if (fileType === 'audio/ogg' && !fileName.endsWith('.ogg')) {
      fileName = fileName.split('.')[0] + '.ogg';
    } else if (fileType === 'audio/m4a' && !fileName.endsWith('.m4a')) {
      fileName = fileName.split('.')[0] + '.m4a';
    } else if (fileType === 'audio/flac' && !fileName.endsWith('.flac')) {
      fileName = fileName.split('.')[0] + '.flac';
    }

    // Add the file to the FormData with the corrected filename
    formData.append('sample', processedFile, fileName);

    // Add avatar if provided
    if (avatarFile) {
      formData.append('avatar', avatarFile, avatarFile.name);
    }

    // Make the API call with explicit content type
    const response = await api.post<VoiceCloneResponse>('/v1/voices', formData, {
      headers: {
        // Let axios set the Content-Type header with the correct boundary
        'Content-Type': undefined
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error cloning voice:', error);
    throw error;
  }
};

/**
 * Converts a blob URL to a File object
 * @param blobUrl - The blob URL to convert
 * @param filename - The filename to use for the File
 * @returns Promise with the File object
 */
export const blobUrlToFile = async (blobUrl: string, filename: string): Promise<File> => {
  try {
    // For blob URLs, try to fetch the actual blob first (this preserves MIME type)
    if (blobUrl.startsWith('blob:')) {
      try {
        // First attempt: Try to fetch the blob directly, which preserves the MIME type
        const response = await fetch(blobUrl);
        const blob = await response.blob();

        // Create a file from the blob, preserving the original MIME type
        return new File([blob], filename, {
          type: blob.type,
          lastModified: Date.now()
        });
      } catch (fetchError) {
        console.warn('Failed to fetch blob directly, falling back to XMLHttpRequest:', fetchError);
      }

      // Fallback: Use XMLHttpRequest to get the blob as ArrayBuffer
      const xhr = new XMLHttpRequest();
      xhr.open('GET', blobUrl, true);
      xhr.responseType = 'arraybuffer';

      const arrayBuffer = await new Promise<ArrayBuffer>((resolve, reject) => {
        xhr.onload = () => {
          if (xhr.status === 200) {
            resolve(xhr.response);
          } else {
            reject(new Error(`Failed to fetch blob URL: ${xhr.status} ${xhr.statusText}`));
          }
        };
        xhr.onerror = () => reject(new Error('Network error while fetching blob URL'));
        xhr.send();
      });

      // Try to determine the MIME type from the filename extension
      let mimeType = 'audio/mpeg'; // Default to audio/mpeg if we can't determine

      if (filename.endsWith('.wav')) {
        mimeType = 'audio/wav';
      } else if (filename.endsWith('.ogg')) {
        mimeType = 'audio/ogg';
      } else if (filename.endsWith('.m4a')) {
        mimeType = 'audio/m4a';
      } else if (filename.endsWith('.flac')) {
        mimeType = 'audio/flac';
      }

      // Convert ArrayBuffer to Blob with the determined MIME type
      const blob = new Blob([arrayBuffer], { type: mimeType });

      // Create a new File object from the blob with the determined MIME type
      const file = new File([blob], filename, {
        type: mimeType,
        lastModified: Date.now()
      });

      return file;
    } else {
      throw new Error(`Invalid blob URL: ${blobUrl}`);
    }
  } catch (error) {
    console.error('Error converting blob URL to file:', error);
    throw error;
  }
};

/**
 * Fetches the list of voices from the Speechify API
 * @returns Promise with the list of voices
 */
// Event to notify when voices should be refetched
export const voicesRefetchEvent = new EventTarget();

export const getVoices = async (): Promise<Voice[]> => {
  try {
    const response = await api.get<Voice[]>('/v1/voices');
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Function to trigger a refetch of voices
export const triggerVoicesRefetch = (): void => {
  voicesRefetchEvent.dispatchEvent(new Event('refetch'));
};

/**
 * Converts text to speech using the Speechify API
 * @param input - The text to convert to speech
 * @param voice_id - The ID of the voice to use
 * @param options - Optional parameters for the text-to-speech conversion
 * @returns Promise with the text-to-speech response
 */
export const textToSpeech = async (
  input: string,
  voice_id: string,
  options?: TextToSpeechOptions
): Promise<TextToSpeechResponse> => {
  try {
    if (!input || !input.trim()) {
      throw new Error('Input text cannot be empty');
    }

    if (!voice_id || !voice_id.trim()) {
      throw new Error('Voice ID cannot be empty');
    }

    // Prepare request payload
    const payload = {
      input,
      voice_id,
      ...options
    };

    // Make the API call
    const response = await api.post<TextToSpeechResponse>('/v1/audio/speech', payload);

    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Plays audio data from a text-to-speech response
 * @param audioData - Base64-encoded audio data
 * @param audioFormat - Format of the audio data (wav, mp3, ogg, aac)
 * @returns Promise that resolves when audio playback starts
 */
export const playTextToSpeechAudio = async (
  audioData: string,
  audioFormat: 'wav' | 'mp3' | 'ogg' | 'aac' = 'wav'
): Promise<HTMLAudioElement> => {
  try {
    // Map audio format to MIME type
    const mimeTypeMap: Record<string, string> = {
      'wav': 'audio/wav',
      'mp3': 'audio/mpeg',
      'ogg': 'audio/ogg',
      'aac': 'audio/aac'
    };

    const mimeType = mimeTypeMap[audioFormat] || 'audio/wav';

    // Create a blob URL from the base64-encoded audio data
    const blob = await fetch(`data:${mimeType};base64,${audioData}`).then(res => res.blob());
    const blobUrl = URL.createObjectURL(blob);

    // Create and play audio element
    const audio = new Audio(blobUrl);

    // Clean up blob URL when audio is done playing
    audio.onended = () => {
      URL.revokeObjectURL(blobUrl);
    };
    await audio.play();

    return audio;
  } catch (error) {
    console.error('Error playing audio:', error);
    throw error;
  }
};

/**
 * Converts text to speech and plays the audio
 * @param input - The text to convert to speech
 * @param voice_id - The ID of the voice to use
 * @param options - Optional parameters for the text-to-speech conversion
 * @returns Promise with the audio element and the full TTS response
 */
export const speakText = async (
  input: string,
  voice_id: string,
  options?: TextToSpeechOptions
): Promise<{ audio: HTMLAudioElement; response: TextToSpeechResponse }> => {
  try {
    // Convert text to speech
    const ttsResponse = await textToSpeech(input, voice_id, options);

    // Play the audio
    const audio = await playTextToSpeechAudio(ttsResponse.audio_data, ttsResponse.audio_format);

    return {
      audio,
      response: ttsResponse
    };
  } catch (error) {
    console.error('Error speaking text:', error);
    throw error;
  }
};
