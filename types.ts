
export type VoiceName = 'Kore' | 'Puck' | 'Zephyr' | 'Charon' | 'Fenrir';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  audioUrl?: string;
  timestamp: Date;
  isProcessing?: boolean;
}

export interface VoiceOption {
  id: VoiceName;
  name: string;
  description: string;
}
