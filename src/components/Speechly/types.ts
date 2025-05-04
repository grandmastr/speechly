export interface Selection {
  text: string;
  position: {
    x: number;
    y: number;
  } | null;
}

export interface SpeechlyProps {
  apiKey: string;
  fullName?: string;
  email?: string;
}
