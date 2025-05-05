export interface Selection {
  text: string;
  position: {
    x: number;
    y: number;
  } | null;
  isLoading?: boolean;
}

export interface SpeechlyProps {
  apiKey: string;
  fullName?: string;
  email?: string;
}
