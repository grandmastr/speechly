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
  avatarFile?: File
): Promise<VoiceCloneResponse> => {
  try {
    // Validate the audio file
    if (!(audioFile instanceof File)) {
      throw new Error('Invalid audio file: not a File object');
    }

    if (audioFile.size === 0) {
      throw new Error('Invalid audio file: file is empty');
    }

    console.log('Cloning voice with file details:', {
      name: audioFile.name,
      size: audioFile.size,
      type: audioFile.type,
      lastModified: new Date(audioFile.lastModified).toISOString()
    });

    // Create a new FormData object
    const formData = new FormData();

    // Add text fields first
    formData.append('name', name);
    formData.append('gender', gender);

    // Create consent object with user details
    const consentData = {
      fullName: "Israel Akintunde",
      email: "israelakintunde005@gmail.com"
    };
    formData.append('consent', JSON.stringify(consentData));

    // Use the original file directly without re-encoding
    // This preserves the original audio format and metadata
    const processedFile = audioFile;

    console.log('Processed file details:', {
      name: processedFile.name,
      size: processedFile.size,
      type: processedFile.type
    });

    // Add the processed audio file to the FormData
    // Ensure the file has a proper extension that matches its MIME type
    let fileName = processedFile.name;
    const fileType = processedFile.type;

    // Log detailed information about the file
    console.log('Audio file details before sending:', {
      name: fileName,
      type: fileType,
      size: processedFile.size,
      lastModified: new Date(processedFile.lastModified).toISOString()
    });

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

    console.log('Making API call to clone voice...');

    // Log the FormData entries
    console.log('FormData entries:');
    for (const pair of formData.entries()) {
      const [key, value] = pair;
      if (value instanceof File) {
        console.log(`${key}: File(name=${value.name}, type=${value.type}, size=${value.size})`);
      } else {
        console.log(`${key}: ${value}`);
      }
    }

    // Make the API call with explicit content type
    const response = await api.post<VoiceCloneResponse>('/v1/voices', formData, {
      headers: {
        // Let axios set the Content-Type header with the correct boundary
        'Content-Type': undefined
      }
    });

    console.log('Voice cloning successful:', response.data);
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
    console.log('Converting blob URL to file:', blobUrl);

    // For blob URLs, try to fetch the actual blob first (this preserves MIME type)
    if (blobUrl.startsWith('blob:')) {
      try {
        // First attempt: Try to fetch the blob directly, which preserves the MIME type
        const response = await fetch(blobUrl);
        const blob = await response.blob();

        console.log('Successfully fetched blob with MIME type:', blob.type);

        // Create a file from the blob, preserving the original MIME type
        const file = new File([blob], filename, {
          type: blob.type,
          lastModified: Date.now()
        });

        console.log('Created file from blob:', {
          name: file.name,
          type: file.type,
          size: file.size
        });

        return file;
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

      console.log('Blob details:', {
        type: blob.type,
        size: blob.size,
        parts: blob.size > 0 ? 'Has content' : 'Empty blob'
      });

      // Create a new File object from the blob with the determined MIME type
      const file = new File([blob], filename, {
        type: mimeType,
        lastModified: Date.now()
      });

      // Verify the file has content
      console.log('Created file:', {
        name: file.name,
        type: file.type,
        size: file.size,
        lastModified: new Date(file.lastModified).toISOString()
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
export const getVoices = async (): Promise<Voice[]> => {
  try {
    console.log('Fetching voices from API...');

    const response = await api.get<Voice[]>('/v1/voices');

    console.log(`Fetched ${response.data.length} voices from API`);
    return response.data;
  } catch (error) {
    console.error('Error fetching voices:', error);
    throw error;
  }
};
