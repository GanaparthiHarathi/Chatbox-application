
import React from 'react';
import { VoiceName } from '../types';
import { VOICE_OPTIONS, LANGUAGES } from '../constants';

interface VoiceSelectorProps {
  selectedVoice: VoiceName;
  onVoiceChange: (voice: VoiceName) => void;
  selectedLanguage: string;
  onLanguageChange: (lang: string) => void;
}

const VoiceSelector: React.FC<VoiceSelectorProps> = ({
  selectedVoice,
  onVoiceChange,
  selectedLanguage,
  onLanguageChange,
}) => {
  return (
    <div className="flex flex-col gap-4 p-4 bg-white rounded-xl shadow-sm border border-slate-200 h-full">
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">Target Language</label>
        <select
          value={selectedLanguage}
          onChange={(e) => onLanguageChange(e.target.value)}
          className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:ring-blue-500 focus:border-blue-500 block"
        >
          {LANGUAGES.map((lang) => (
            <option key={lang.code} value={lang.name}>
              {lang.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">Character Voice</label>
        <div className="grid grid-cols-1 gap-2">
          {VOICE_OPTIONS.map((voice) => (
            <button
              key={voice.id}
              onClick={() => onVoiceChange(voice.id)}
              className={`p-3 text-left rounded-lg border transition-all ${
                selectedVoice === voice.id
                  ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-100'
                  : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
              }`}
            >
              <div className="font-medium text-slate-900">{voice.name}</div>
              <div className="text-xs text-slate-500">{voice.description}</div>
            </button>
          ))}
        </div>
      </div>
      
      <div className="mt-auto pt-4 border-t border-slate-100">
        <p className="text-[10px] text-slate-400 leading-tight">
          Powered by Gemini 2.5 TTS. Audio is generated in real-time using PCM-16 decoding.
        </p>
      </div>
    </div>
  );
};

export default VoiceSelector;
