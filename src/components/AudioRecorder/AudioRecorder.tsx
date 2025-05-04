import React, { useCallback, useState } from 'react';
import { FileAudioIcon, MicIcon, StopCircleIcon, PlayCircleIcon, CheckIcon } from 'lucide-react';
import { useReactMediaRecorder } from 'react-media-recorder';
import { toast } from 'sonner';

import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/ui';
import { cloneVoice, blobUrlToFile, triggerVoicesRefetch } from '@/services/audio/voice';

interface AudioRecorderProps {
  onRecordingComplete?: (blobUrl: string) => void;
  onError?: (error: string) => void;
  maxFileSizeMB?: number;
  fullName?: string;
  email?: string;
}

const AudioRecorder = ({
  onRecordingComplete,
  onError,
  maxFileSizeMB = 10, // Default max file size of 10MB
  fullName,
  email
}: AudioRecorderProps): React.ReactElement => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedAudioUrl, setUploadedAudioUrl] = useState<string | null>(null);
  const [voiceName, setVoiceName] = useState('');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  const {
    status,
    startRecording,
    stopRecording,
    mediaBlobUrl,
    clearBlobUrl,
    error,
  } = useReactMediaRecorder({
    audio: true,
    // Specify audio format and quality options
    mediaRecorderOptions: {
      mimeType: 'audio/wav',
      audioBitsPerSecond: 128000 // 128 kbps
    },
    onStop: (blobUrl) => {
      onRecordingComplete?.(blobUrl);
    },
    ...(({
      onError: (err: unknown) => {
        console.error('Recording error:', err);
        // Convert Error objects to string to match the expected onError prop type
        const errorMessage = err instanceof Error ? err.message : String(err);
        onError?.(errorMessage);
      }
    } as any))
  });

  const handlePlayback = useCallback(() => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  const handleAudioEnded = useCallback(() => {
    setIsPlaying(false);
  }, []);

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);

      // Validate file type
      if (!file.type.startsWith('audio/')) {
        throw new Error('Please upload an audio file');
      }

      // Validate file size
      const fileSizeMB = file.size / (1024 * 1024);
      if (fileSizeMB > maxFileSizeMB) {
        throw new Error(`File size must be less than ${maxFileSizeMB}MB`);
      }

      // Create object URL for the file
      const url = URL.createObjectURL(file);

      // Optional: Validate that it's a playable audio file
      await new Promise((resolve, reject) => {
        const audio = new Audio(url);
        audio.onloadedmetadata = resolve;
        audio.onerror = () => reject(new Error('Invalid audio file'));
      });

      // Clear any existing recording
      clearBlobUrl();

      // Set the uploaded audio URL
      setUploadedAudioUrl(url);
      onRecordingComplete?.(url);
    } catch (error) {
      if (error instanceof Error) {
        onError?.(error.message);
      } else {
        onError?.('An error occurred while uploading the file');
      }
      // Clean up the object URL in case of error
      if (event.target.value) {
        event.target.value = '';
      }
    } finally {
      setIsUploading(false);
    }
  }, [clearBlobUrl, onRecordingComplete, onError, maxFileSizeMB]);

  const handleSubmit = async () => {
    if (!currentAudioUrl) {
      toast.error('Please record or upload an audio file first');
      return;
    }

    if (!voiceName.trim()) {
      toast.error('Please enter a name for your voice');
      return;
    }

    try {
      setIsSubmitting(true);
      // Determine the appropriate file extension based on the recording format
      let fileExtension = '.wav'; // Default to .wav since we're using audio/wav in mediaRecorderOptions

      // If it's an uploaded file, try to preserve its original extension
      if (uploadedAudioUrl && currentAudioUrl === uploadedAudioUrl) {
        // Try to get the file extension from the audio element
        const audioElement = audioRef.current;
        if (audioElement && audioElement.src) {
          const mimeType = audioElement.canPlayType('audio/wav') ? 'audio/wav' :
                          audioElement.canPlayType('audio/mpeg') ? 'audio/mpeg' :
                          audioElement.canPlayType('audio/ogg') ? 'audio/ogg' : 'audio/wav';

          fileExtension = mimeType === 'audio/wav' ? '.wav' :
                         mimeType === 'audio/mpeg' ? '.mp3' :
                         mimeType === 'audio/ogg' ? '.ogg' : '.wav';
        }
      }

      const audioFile = await blobUrlToFile(currentAudioUrl, `${voiceName.trim()}${fileExtension}`);

      // Additional validation before API call
      if (audioFile.size === 0) {
        throw new Error('Audio file is empty. Please record or upload a valid audio file.');
      }

      // Call the voice cloning API
      const result = await cloneVoice(audioFile, voiceName.trim(), gender, undefined, fullName, email);

      // Store the voice ID in localStorage for later use
      localStorage.setItem('clonedVoiceId', result.id);
      localStorage.setItem('clonedVoiceName', result.display_name);

      // Trigger a refetch of the voices list to include the newly cloned voice
      triggerVoicesRefetch();

      toast.success('Voice cloned successfully!');

      // Reset the form state
      clearBlobUrl();
      setUploadedAudioUrl(null);
      setVoiceName('');
      setGender('male');
    } catch (error) {
      console.error('Voice cloning failed:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to clone voice');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Cleanup function for object URLs
  React.useEffect(() => {
    return () => {
      if (uploadedAudioUrl) {
        URL.revokeObjectURL(uploadedAudioUrl);
      }
    };
  }, [uploadedAudioUrl]);

  // Check if MediaRecorder is supported
  const [isMediaRecorderSupported, setIsMediaRecorderSupported] = React.useState(true);

  React.useEffect(() => {
    // Check if MediaRecorder is supported in this browser
    if (typeof window !== 'undefined' && !window.MediaRecorder) {
      console.error('MediaRecorder API is not supported in this browser');
      setIsMediaRecorderSupported(false);
      toast.error('Your browser does not support audio recording. Please try a different browser.');
    }
  }, []);

  // Log status changes for debugging
  React.useEffect(() => {
    if (error) {
      toast.error(`Recording error: ${error}`);
    }
  }, [status, error]);

  const isRecording = status === 'recording';
  const hasAudio = mediaBlobUrl != null || uploadedAudioUrl != null;
  const currentAudioUrl = uploadedAudioUrl || mediaBlobUrl;

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Record or Upload Audio Sample
        </CardTitle>
        <CardDescription>
          {status === 'recording' ? 'Recording in progress...' :
           isUploading ? 'Processing upload...' :
           hasAudio ? 'Audio ready - click to play' :
           'Click the microphone to start recording a voice sample, or upload an audio file.'}
        </CardDescription>
      </CardHeader>
      {!isMediaRecorderSupported ? (
        <CardContent>
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative">
            <strong className="font-bold">Browser not supported: </strong>
            <span className="block sm:inline">
              Your browser does not support audio recording. Please use the file upload option instead or try a different browser.
            </span>
          </div>
        </CardContent>
      ) : (
        <CardContent className="grid grid-cols-2 gap-[1rem]">
          <div className="rounded-sm border-[1px] border-dashed border-gray-200 grid place-items-center p-[2rem] relative">
            <Button
              onClick={isRecording ? stopRecording : startRecording}
              className={`size-12 transition-transform duration-200 rounded-full focus-ring-2 cursor-pointer ${
                isRecording ? 'animate-pulse bg-red-500 hover:bg-red-600' : ''
              }`}
              disabled={status === 'acquiring_media'}
            >
              {status === 'acquiring_media' ? (
                <span className="animate-spin">⏳</span>
              ) : isRecording ? (
                <StopCircleIcon />
              ) : (
                <MicIcon />
              )}
            </Button>
            {isRecording && (
              <div className="absolute top-1 right-1 bg-red-500 text-white text-xs px-2 py-1 rounded-full animate-pulse">
                Recording...
              </div>
            )}
          </div>
          <div className="rounded-sm border-[1px] border-dashed border-gray-200 grid place-items-center p-[2rem] relative">
            <input
              type="file"
              accept="audio/*"
              onChange={handleFileUpload}
              id="audio-upload"
              disabled={isUploading || isRecording}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              aria-label="Upload audio file"
            />
            <Button
              className={`size-12 transition-transform duration-200 rounded-full focus-ring-2 ${
                (isUploading || isRecording) ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              disabled={isUploading || isRecording}
              type="button"
              aria-hidden="true"
            >
              <FileAudioIcon />
            </Button>
          </div>
        </CardContent>
      )}

      {error && (
        <CardContent className="mt-4">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        </CardContent>
      )}

      {hasAudio && currentAudioUrl && (
        <CardContent className="mt-4">
          <div className="flex justify-center items-center gap-4">
            <Button
              onClick={handlePlayback}
              className="flex items-center gap-2"
            >
              {isPlaying ? <StopCircleIcon size={20} /> : <PlayCircleIcon size={20} />}
              {isPlaying ? 'Stop' : 'Play'} Audio
            </Button>
            <audio
              ref={audioRef}
              src={currentAudioUrl}
              onEnded={handleAudioEnded}
              onError={(e) => {
                console.error('Audio element error:', e);
              }}
              className="hidden"
            />
          </div>
        </CardContent>
      )}

      {hasAudio && currentAudioUrl && (
        <CardContent className="mt-4 grid gap-4">
          <div className="grid gap-2">
            <label htmlFor="voice-name" className="text-sm font-medium">
              Voice Name
            </label>
            <Input
              id="voice-name"
              placeholder="Enter a name for your voice"
              value={voiceName}
              onChange={(e) => setVoiceName(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <div className="grid gap-2">
            <label htmlFor="voice-gender" className="text-sm font-medium">
              Voice Gender
            </label>
            <Select
              value={gender}
              onValueChange={(value) => setGender(value as 'male' | 'female')}
              disabled={isSubmitting}
            >
              <SelectTrigger id="voice-gender">
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !voiceName.trim()}
            className="w-full mt-2"
          >
            {isSubmitting ? (
              <>
                <span className="mr-2 animate-spin">⏳</span>
                Cloning Voice...
              </>
            ) : (
              <>
                <CheckIcon className="mr-2" size={16} />
                Clone Voice
              </>
            )}
          </Button>
        </CardContent>
      )}
    </Card>
  );
};

export default AudioRecorder;
